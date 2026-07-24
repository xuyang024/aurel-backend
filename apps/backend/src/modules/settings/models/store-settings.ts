import { model } from "@medusajs/framework/utils";

/**
 * Store settings (single row / singleton), editable from the admin.
 *
 * Two kinds of fields:
 *  - Public/operational: served to the storefront, take effect immediately.
 *  - Secret (payment/email keys): served ONLY to the admin API (never the store
 *    API), read at server boot to configure the Stripe/notification modules.
 *    Changing a secret requires a server restart to take effect.
 */
export const StoreSettings = model.define("store_settings", {
  id: model.id().primaryKey(),

  // --- Public / operational (immediate) ---
  contact_email: model.text().nullable(),
  social_instagram: model.text().nullable(),
  social_tiktok: model.text().nullable(),
  social_pinterest: model.text().nullable(),
  // Stripe PUBLISHABLE key (pk_...) — public by design, safe to store/serve.
  stripe_publishable_key: model.text().nullable(),

  // Legal — filled into the Privacy/Terms pages.
  legal_entity_name: model.text().nullable(),
  legal_jurisdiction: model.text().nullable(),

  // Email routing (non-secret).
  email_from: model.text().nullable(),
  sendgrid_order_template: model.text().nullable(),
  sendgrid_welcome_template: model.text().nullable(),

  // Image storage (S3 / R2) — non-secret config. When s3_bucket is set (here or
  // via env) the S3 file provider is enabled at boot (restart required).
  s3_bucket: model.text().nullable(),
  s3_region: model.text().nullable(),
  s3_endpoint: model.text().nullable(), // R2 / non-AWS endpoint; blank for AWS S3
  s3_file_url: model.text().nullable(), // public base URL / CDN domain for images

  // --- Secret (admin-only, applied at boot, restart required) ---
  stripe_secret_key: model.text().nullable(),
  stripe_webhook_secret: model.text().nullable(),
  sendgrid_api_key: model.text().nullable(),
  s3_access_key_id: model.text().nullable(),
  s3_secret_access_key: model.text().nullable(),
});
