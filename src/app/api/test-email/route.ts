import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/send-email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { to, cc, subject, emailProps, attachments } = body;

    console.log("📧 Sending email with:", {
      to: to || "onboarding@resend.dev",
      cc: cc || ["vamsi@uniglaze.in"],
      subject: subject || "Test Email from Uniglaze",
    });

    const result = await sendEmail({
      to: to || "harshiltomar20@gmail.com",
      cc: cc || ["vamsi@uniglaze.in","harshiltomar20@gmail.com"],
      subject: subject || "Test Email from Harshil Tomar",
      emailProps: emailProps || { toClient: true, clientName: "Test Client" },
      attachments: attachments || [],
    });

    console.log("✅ Email sent result:", result);

    return NextResponse.json({ 
      success: true, 
      message: "Email sent successfully",
      result,
      sentTo: to || "onboarding@resend.dev",
      cc: cc || ["vamsi@uniglaze.in"],
    });
  } catch (error) {
    console.error("❌ Email test failed:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}