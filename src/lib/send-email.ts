"use server";

import React from "react";
import { env } from "@/env";
import { render } from "@react-email/components";
import { Resend } from "resend";
import DailyProgressEmail, { type EmailProps } from "@/emails/email-template";

const resend = new Resend(env.RESEND_API_KEY);

/** Resend accepts only a single address per `to`. Basic format check. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeToAddress(raw: string): string {
  const first = raw.split(",")[0]?.trim() ?? "";
  return first;
}

function isValidEmailFormat(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

type ClientAttachment = { filename: string; content: Blob | Buffer };

function getPlainTextContent(toClient: boolean, currentDate: string): string {
  const greeting = toClient ? "Dear Valued Client," : "Dear Team,";
  return `${greeting}

Please find attached the Daily Progress Report for ${currentDate}, along with the mail for your reference.

Best regards,
Uniglaze team`;
}

export async function sendEmail({
  to,
  cc,
  subject,
  emailProps,
  attachments,
}: {
  to: string;
  cc: string[];
  subject: string;
  emailProps: EmailProps;
  attachments: ClientAttachment[];
}) {
  // #region agent log
  fetch("http://127.0.0.1:7243/ingest/a29a5f74-0241-4040-b26d-3120f9f873db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "send-email.ts:sendEmail",
      message: "sendEmail called",
      data: { to: to ?? "(empty)", toLength: (to ?? "").length, hasResendKey: !!env.RESEND_API_KEY },
      timestamp: Date.now(),
      sessionId: "debug-session",
      hypothesisId: "H1",
    }),
  }).catch(() => {});
  // #endregion
  const toNormalized = normalizeToAddress(to ?? "");
  if (!toNormalized) {
    const err = new Error("Email cannot be sent: recipient (to) address is empty");
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/a29a5f74-0241-4040-b26d-3120f9f873db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "send-email.ts:sendEmail",
        message: "sendEmail rejected empty to",
        data: { to },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "H1",
      }),
    }).catch(() => {});
    // #endregion
    throw err;
  }
  if (!isValidEmailFormat(toNormalized)) {
    const err = new Error(
      `Email cannot be sent: invalid "to" format. Use a single address like email@example.com (got: ${JSON.stringify(toNormalized.slice(0, 80))})`,
    );
    throw err;
  }
  try {
    // normalize -> Buffer
    const normalizedAttachments = await Promise.all(
      attachments.map(async (att) => {
        if (att.content instanceof Blob) {
          const buffer = Buffer.from(await att.content.arrayBuffer());
          return { filename: att.filename, content: buffer };
        }
        return { filename: att.filename, content: att.content };
      }),
    );

    // Create the React element on the server side
    const reactElement = React.createElement(DailyProgressEmail, emailProps);

    const html = await render(reactElement);

    if (!html || html.length < 100) {
      console.error("❌ Generated HTML is too short:", html?.substring(0, 200));
      throw new Error("React Email produced empty/invalid HTML");
    }

    const currentDate = new Date().toLocaleDateString();
    const text = getPlainTextContent(emailProps.toClient, currentDate);

    console.log("📧 Sending email:", {
      to: toNormalized,
      cc,
      subject,
      htmlLength: html.length,
      textLength: text.length,
    });

    const result = await resend.emails.send({
      from: "vamsi@uniglaze.in",
      to: toNormalized,
      cc: cc.length > 0 ? cc : undefined,
      subject,
      html,
      text,
      attachments: normalizedAttachments.map((att) => ({
        filename: att.filename,
        content: att.content,
      })),
    });
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/a29a5f74-0241-4040-b26d-3120f9f873db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "send-email.ts:sendEmail",
        message: "Resend API result",
        data: { ok: !result.error, error: result.error ?? null, id: (result as { data?: { id?: string } })?.data?.id },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "H2",
      }),
    }).catch(() => {});
    // #endregion
    return result;
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/a29a5f74-0241-4040-b26d-3120f9f873db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "send-email.ts:sendEmail",
        message: "sendEmail threw",
        data: { errorMessage: error instanceof Error ? error.message : String(error) },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "H3",
      }),
    }).catch(() => {});
    // #endregion
    console.error("❌ Email sending failed:", error);
    throw error;
  }
}
