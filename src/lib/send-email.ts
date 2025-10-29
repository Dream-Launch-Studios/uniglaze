"use server";

import React from "react";
import { env } from "@/env";
import { render } from "@react-email/components";
import nodemailer from "nodemailer";
import DailyProgressEmail, { type EmailProps } from "@/emails/email-template";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

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

    // console.log("Rendering with React Email...");
    const html = await render(reactElement);

    if (!html || html.length < 100) {
      throw new Error("React Email produced empty/invalid HTML");
    }

    return await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      cc,
      subject,
      html,
      attachments: normalizedAttachments, // ✅ Buffer only now
    });
  } catch (error) {
    console.error("❌ React Email failed:", error);
    throw error;
  }
}
