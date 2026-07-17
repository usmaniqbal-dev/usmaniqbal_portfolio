import { NextResponse } from "next/server";
import { requireAdminMutation, requireAdminSession } from "@/lib/admin-api";
import { activateTemplate, upsertTemplate } from "@/lib/builder-actions";
import { getSiteContent, saveSiteContent } from "@/lib/content-store";
import type { BuilderTemplate } from "@/types/site-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns every saved template for the Template Manager.
export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const content = await getSiteContent();
  return NextResponse.json(content.builder.templates);
}

// Creates, updates, deletes, duplicates, saves current design, or activates a template.
export async function POST(request: Request) {
  const denied = await requireAdminMutation(request);

  if (denied) {
    return denied;
  }

  const body = (await request.json()) as { action?: string; template?: BuilderTemplate; templateId?: string; name?: string };
  const content = await getSiteContent();

  if (body.action === "activate" && body.templateId) {
    return NextResponse.json(await saveSiteContent(activateTemplate(content, body.templateId)));
  }

  if (body.action === "delete" && body.templateId) {
    const template = content.builder.templates.find((item) => item.id === body.templateId);
    if (!template || template.isActive || template.isDefault) {
      return NextResponse.json({ message: "Active and default templates cannot be deleted." }, { status: 400 });
    }

    return NextResponse.json(await saveSiteContent({ ...content, builder: { ...content.builder, templates: content.builder.templates.filter((item) => item.id !== body.templateId) } }));
  }

  if (body.action === "save-current") {
    const activeTemplate = content.builder.templates.find((item) => item.isActive);
    const template: BuilderTemplate = {
      ...(activeTemplate || content.builder.templates[0]),
      id: crypto.randomUUID(),
      name: body.name || "Saved Template",
      isActive: false,
      isDefault: false,
      createdAt: new Date().toISOString(),
      createdBy: "admin"
    };
    return NextResponse.json(await saveSiteContent(upsertTemplate(content, template)));
  }

  if (!body.template) {
    return NextResponse.json({ message: "Template payload is required." }, { status: 400 });
  }

  const template = body.action === "duplicate" ? { ...body.template, id: crypto.randomUUID(), name: `${body.template.name} Copy`, isActive: false, isDefault: false } : body.template;
  return NextResponse.json(await saveSiteContent(upsertTemplate(content, template)));
}
