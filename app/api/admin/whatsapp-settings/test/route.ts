import { NextResponse } from "next/server";
import { requireAdminMutation } from "@/lib/admin-api";
import {
  verifyWhatsAppCapabilities,
  sendWhatsAppNotification,
  type WhatsAppSettings
} from "@/lib/whatsapp-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TestWhatsAppPayload = Partial<WhatsAppSettings> & {
  sendTestMessage?: boolean;
};

export async function POST(request: Request) {
  const denied = await requireAdminMutation(request);
  if (denied) return denied;

  try {
    const body = (await request.json().catch(() => ({}))) as TestWhatsAppPayload;

    // 1. Verify capability against architectural specs and endpoints
    const verification = await verifyWhatsAppCapabilities(body);

    // 2. If user specifically requested a test notification and capability supports outbound
    let dispatchResult: unknown = null;
    if (body.sendTestMessage && verification.supportsOutbound) {
      dispatchResult = await sendWhatsAppNotification(
        `🔔 [Test Alert] Usman Iqbal Portfolio: WhatsApp visitor notification test at ${new Date().toUTCString()}.`
      );
    }

    return NextResponse.json({
      ok: verification.verified,
      verification,
      dispatchResult
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "WhatsApp verification failed."
      },
      { status: 500 }
    );
  }
}
