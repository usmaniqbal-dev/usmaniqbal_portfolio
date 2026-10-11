import { NextResponse } from "next/server";
import { requireAdminMutation } from "@/lib/admin-api";
import { getEmailSettings } from "@/lib/email-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TestEmailPayload = {
  serviceId?: string;
  templateId?: string;
  publicKey?: string;
  senderEmail?: string;
  recipientEmail?: string;
  testMessage?: string;
};

export async function POST(request: Request) {
  const denied = await requireAdminMutation(request);
  if (denied) return denied;

  try {
    const body = (await request.json()) as TestEmailPayload;
    const current = await getEmailSettings();

    const serviceId = (body.serviceId ?? current.serviceId ?? "").trim();
    const templateId = (body.templateId ?? current.templateId ?? "").trim();
    const publicKey = (body.publicKey ?? current.publicKey ?? "").trim();
    const senderEmail = (body.senderEmail ?? current.senderEmail ?? "").trim() || "admin-test@nuraxtech.com";
    const recipientEmail = (body.recipientEmail ?? current.recipientEmail ?? "").trim() || "hello@nuraxtech.com";
    const testMessage = (body.testMessage ?? "This is a test email sent from the Admin Panel EmailJS Configuration.").trim();

    if (!serviceId) {
      return NextResponse.json({ ok: false, error: "Service ID is required." }, { status: 400 });
    }
    if (!templateId) {
      return NextResponse.json({ ok: false, error: "Template ID is required." }, { status: 400 });
    }
    if (!publicKey) {
      return NextResponse.json({ ok: false, error: "Public Key is required." }, { status: 400 });
    }

    // Comprehensive parameter mapping to ensure compatibility with various EmailJS template variables
    const templateParams: Record<string, string> = {
      name: "Admin Test",
      from_name: "Admin Test",
      sender_name: "Admin Test",
      user_name: "Admin Test",

      email: senderEmail,
      from_email: senderEmail,
      sender_email: senderEmail,
      reply_to: senderEmail,

      to_email: recipientEmail,
      recipient_email: recipientEmail,

      project_type: "Admin Configuration Test",
      project: "Admin Configuration Test",
      subject: "EmailJS Test from Admin Panel",

      message: testMessage,
      content: testMessage,
      time: new Date().toLocaleString()
    };

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.usmaniqbal.tech";

    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": siteUrl,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: templateParams
      })
    });

    const responseText = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          status: response.status,
          error: responseText || `EmailJS returned HTTP status ${response.status}`,
          details: {
            serviceId,
            templateId,
            status: response.status,
            rawResponse: responseText
          }
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      ok: true,
      status: response.status,
      message: "Test email sent successfully! Please check your inbox.",
      details: {
        serviceId,
        templateId,
        recipientEmail,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unexpected error sending test email.";
    return NextResponse.json(
      {
        ok: false,
        error: errorMsg
      },
      { status: 500 }
    );
  }
}
