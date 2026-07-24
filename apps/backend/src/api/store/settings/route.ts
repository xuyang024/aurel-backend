import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { SETTINGS_MODULE } from "../../../modules/settings";
import SettingsModuleService from "../../../modules/settings/service";

// Public store settings consumed by the storefront.
// SECURITY: only ever expose non-secret fields here — never the payment/email keys.
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(SETTINGS_MODULE) as unknown as SettingsModuleService;
  const [row] = await service.listStoreSettings({}, { take: 1 });
  const settings = row
    ? {
        contact_email: row.contact_email ?? "",
        social_instagram: row.social_instagram ?? "",
        social_tiktok: row.social_tiktok ?? "",
        social_pinterest: row.social_pinterest ?? "",
        stripe_publishable_key: row.stripe_publishable_key ?? "",
        legal_entity_name: row.legal_entity_name ?? "",
        legal_jurisdiction: row.legal_jurisdiction ?? "",
      }
    : null;
  res.json({ settings });
};
