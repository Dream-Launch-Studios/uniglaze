"use server";

import React from "react";
import { env } from "@/env";
import { render } from "@react-email/components";
import { Resend } from "resend";
import DailyProgressEmail, { type EmailProps } from "@/emails/email-template";

const resend = new Resend(env.RESEND_API_KEY);

type ClientAttachment = { filename: string; content: Blob | Buffer };

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
      throw new Error("React Email produced empty/invalid HTML");
    }

    return await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      cc: cc.length > 0 ? cc : undefined,
      subject,
      html,
      attachments: normalizedAttachments.map((att) => ({
        filename: att.filename,
        content: att.content,
      })),
    });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
}
