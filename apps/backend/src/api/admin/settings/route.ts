import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { SETTINGS_MODULE } from "../../../modules/settings";
import SettingsModuleService from "../../../modules/settings/service";

// Secret fields: never returned in full — only a "is it set" flag. On save, a
// blank value means "keep the existing secret" (so re-saving other fields, or
// editing without re-typing the key, doesn't wipe it).
const SECRET_FIELDS = [
  "stripe_secret_key",
  "stripe_webhook_secret",
  "sendgrid_api_key",
  "s3_access_key_id",
  "s3_secret_access_key",
] as const;

const PUBLIC_FIELDS = [
  "contact_email",
  "social_instagram",
  "social_tiktok",
  "social_pinterest",
  "stripe_publishable_key",
  "legal_entity_name",
  "legal_jurisdiction",
  "email_from",
  "sendgrid_order_template",
  "sendgrid_welcome_template",
  "s3_bucket",
  "s3_region",
  "s3_endpoint",
  "s3_file_url",
] as const;

type Row = Record<string, string | null>;

function integrations(row: any) {
  const has = (f: string) => Boolean(process.env[envName(f)] || row?.[f]);
  return {
    stripe_configured: has("stripe_secret_key"),
    stripe_webhook_configured: has("stripe_webhook_secret"),
    email_provider:
      process.env.SENDGRID_API_KEY || row?.sendgrid_api_key
        ? "sendgrid"
        : "local (console log)",
    email_from: process.env.EMAIL_FROM || row?.email_from || "hello@aurel.co",
    image_storage: process.env.S3_BUCKET || row?.s3_bucket ? "S3 / R2" : "local (ephemeral)",
    site_url: process.env.NEXT_PUBLIC_SITE_URL || "(storefront env)",
  };
}
function envName(field: string) {
  // map DB field → the env var that also controls it (env takes precedence at boot)
  switch (field) {
    case "stripe_secret_key":
      return "STRIPE_API_KEY";
    case "stripe_webhook_secret":
      return "STRIPE_WEBHOOK_SECRET";
    case "sendgrid_api_key":
      return "SENDGRID_API_KEY";
    case "s3_access_key_id":
      return "S3_ACCESS_KEY_ID";
    case "s3_secret_access_key":
      return "S3_SECRET_ACCESS_KEY";
    default:
      return "__none__";
  }
}

// Build the client-facing view: public fields as-is, secrets replaced by a flag.
function present(row: any) {
  const out: Record<string, unknown> = {};
  for (const f of PUBLIC_FIELDS) out[f] = row?.[f] ?? "";
  for (const f of SECRET_FIELDS) out[`${f}_set`] = Boolean(row?.[f]);
  return out;
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(SETTINGS_MODULE) as unknown as SettingsModuleService;
  const [row] = await service.listStoreSettings({}, { take: 1 });
  res.json({ settings: present(row), integrations: integrations(row) });
};

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(SETTINGS_MODULE) as unknown as SettingsModuleService;
  const body = (req.body ?? {}) as Record<string, unknown>;
  const [existing] = await service.listStoreSettings({}, { take: 1 });

  const data: Record<string, unknown> = {};
  // Public fields: always set to whatever was sent (empty string allowed).
  for (const f of PUBLIC_FIELDS) {
    if (f in body) data[f] = body[f];
  }
  // Secret fields: only overwrite when a non-empty value is provided.
  for (const f of SECRET_FIELDS) {
    const v = body[f];
    if (typeof v === "string" && v.trim() !== "") data[f] = v.trim();
  }

  const saved = existing
    ? await service.updateStoreSettings({ id: existing.id, ...data })
    : await service.createStoreSettings(data);

  res.json({
    settings: present(saved),
    integrations: integrations(saved),
  });
};
