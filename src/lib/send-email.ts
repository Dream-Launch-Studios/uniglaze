"use server";

import React from "react";
import { env } from "@/env";
import { render } from "@react-email/components";
import { Resend } from "resend";
import DailyProgressEmail, { type EmailProps } from "@/emails/email-template";

const resend = new Resend(env.RESEND_API_KEY);

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
      to,
      cc,
      subject,
      htmlLength: html.length,
      textLength: text.length,
    });

    return await resend.emails.send({
      from: "vamsi@uniglaze.in",
      to,
      cc: cc.length > 0 ? cc : undefined,
      subject,
      html,
      text,
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
