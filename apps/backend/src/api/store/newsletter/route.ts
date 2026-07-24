import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { NEWSLETTER_MODULE } from "../../../modules/newsletter";
import NewsletterModuleService from "../../../modules/newsletter/service";
import { SETTINGS_MODULE } from "../../../modules/settings";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Best-effort welcome email. Never blocks or fails the subscription.
async function sendWelcome(req: MedusaRequest, email: string) {
  try {
    const notification = req.scope.resolve(Modules.NOTIFICATION);
    let template = process.env.SENDGRID_WELCOME_TEMPLATE || "newsletter-welcome";
    if (!process.env.SENDGRID_WELCOME_TEMPLATE) {
      try {
        const settings: any = req.scope.resolve(SETTINGS_MODULE);
        const [row] = await settings.listStoreSettings({}, { take: 1 });
        if (row?.sendgrid_welcome_template) template = row.sendgrid_welcome_template;
      } catch {
        /* keep default */
      }
    }
    await notification.createNotifications({
      to: email,
      channel: "email",
      template,
      data: { email },
    });
  } catch {
    // provider not configured / send failed — subscription still succeeds
  }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const body = (req.body ?? {}) as { email?: string; source?: string };
  const email = (body.email ?? "").trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "A valid email is required." });
  }

  const service = req.scope.resolve(NEWSLETTER_MODULE) as unknown as NewsletterModuleService;

  // Idempotent: don't create duplicates; re-subscribe if previously opted out.
  const [existing] = await service.listSubscribers({ email }, { take: 1 });
  if (existing) {
    if (existing.status !== "subscribed") {
      await service.updateSubscribers({ id: existing.id, status: "subscribed" });
    }
    return res.json({ success: true, alreadySubscribed: true });
  }

  await service.createSubscribers({ email, source: body.source ?? "storefront" });
  await sendWelcome(req, email);
  res.json({ success: true, alreadySubscribed: false });
};
