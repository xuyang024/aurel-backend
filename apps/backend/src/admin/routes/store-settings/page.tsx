import { defineRouteConfig } from "@medusajs/admin-sdk";
import { CogSixTooth } from "@medusajs/icons";
import { Badge, Button, Container, Heading, Input, Label, Text, toast } from "@medusajs/ui";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { sdk } from "../../lib/sdk";

type Settings = Record<string, string | boolean>;
interface Integrations {
  stripe_configured: boolean;
  stripe_webhook_configured: boolean;
  email_provider: string;
  email_from: string;
  image_storage: string;
  site_url: string;
}

// Public fields (immediate) grouped by section.
const SECTIONS: { title: string; fields: string[] }[] = [
  {
    title: "storefront",
    fields: [
      "contact_email",
      "social_instagram",
      "social_tiktok",
      "social_pinterest",
      "stripe_publishable_key",
    ],
  },
  { title: "legal", fields: ["legal_entity_name", "legal_jurisdiction"] },
  {
    title: "email",
    fields: ["email_from", "sendgrid_order_template", "sendgrid_welcome_template"],
  },
  {
    title: "images",
    fields: ["s3_bucket", "s3_region", "s3_endpoint", "s3_file_url"],
  },
];

// Secret fields (admin-only, restart required). GET returns `${f}_set` booleans.
const SECRETS: { title: string; fields: string[] }[] = [
  { title: "email", fields: ["sendgrid_api_key"] },
  { title: "payments", fields: ["stripe_secret_key", "stripe_webhook_secret"] },
  { title: "images", fields: ["s3_access_key_id", "s3_secret_access_key"] },
];

const StoreSettingsPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<Settings>({});
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [integrations, setIntegrations] = useState<Integrations | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    sdk.client
      .fetch<{ settings: Settings | null; integrations: Integrations }>("/admin/settings")
      .then(({ settings, integrations }) => {
        setData(settings ?? {});
        setIntegrations(integrations);
      })
      .catch(() => toast.error(t("storeSettings.saveFailed")))
      .finally(() => setLoading(false));
  }, [t]);

  const set = (k: string, v: string) => setData((d) => ({ ...d, [k]: v }));
  const setSecret = (k: string, v: string) => setSecrets((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      // Public fields + any secret the user actually typed (blank = keep existing).
      const body: Record<string, string> = {};
      for (const s of SECTIONS)
        for (const f of s.fields) body[f] = String(data[f] ?? "");
      for (const [k, v] of Object.entries(secrets)) if (v.trim()) body[k] = v.trim();

      const { settings, integrations } = await sdk.client.fetch<{
        settings: Settings;
        integrations: Integrations;
      }>("/admin/settings", { method: "POST", body });
      setData(settings);
      setSecrets({});
      setIntegrations(integrations);
      toast.success(t("storeSettings.saved"));
    } catch {
      toast.error(t("storeSettings.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="p-6">
        <Text>{t("storeSettings.loading")}</Text>
      </Container>
    );
  }

  const statusRow = (label: string, ok: boolean, value?: string) => (
    <div className="flex items-center justify-between py-2">
      <Text size="small">{label}</Text>
      <div className="flex items-center gap-2">
        {value && (
          <Text size="small" className="text-ui-fg-subtle">
            {value}
          </Text>
        )}
        <Badge color={ok ? "green" : "grey"} size="small">
          {ok
            ? t("storeSettings.integrations.configured")
            : t("storeSettings.integrations.missing")}
        </Badge>
      </div>
    </div>
  );

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">{t("storeSettings.title")}</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            {t("storeSettings.description")}
          </Text>
        </div>
        <Button onClick={save} isLoading={saving}>
          {t("storeSettings.save")}
        </Button>
      </div>

      {/* Public / immediate sections */}
      {SECTIONS.map((section) => (
        <div key={section.title} className="px-6 py-6">
          <Label size="small" weight="plus">
            {t(`storeSettings.sections.${section.title}`)}
          </Label>
          <div className="mt-3 grid gap-4">
            {section.fields.map((f) => (
              <div key={f} className="flex flex-col gap-1">
                <Label size="small" className="text-ui-fg-subtle">
                  {t(`storeSettings.fields.${f}`)}
                </Label>
                <Input
                  value={String(data[f] ?? "")}
                  onChange={(e) => set(f, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Secret sections — masked, restart required */}
      <div className="px-6 py-6">
        <Label size="small" weight="plus">
          {t("storeSettings.sections.secrets")}
        </Label>
        <div className="bg-ui-tag-orange-bg text-ui-tag-orange-text mt-2 rounded-lg px-3 py-2">
          <Text size="small">{t("storeSettings.secretsNotice")}</Text>
        </div>
        <div className="mt-3 grid gap-4">
          {SECRETS.flatMap((s) => s.fields).map((f) => {
            const isSet = Boolean(data[`${f}_set`]);
            return (
              <div key={f} className="flex flex-col gap-1">
                <Label size="small" className="text-ui-fg-subtle">
                  {t(`storeSettings.fields.${f}`)}
                </Label>
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={secrets[f] ?? ""}
                  placeholder={
                    isSet
                      ? t("storeSettings.secretSet")
                      : t("storeSettings.secretEmpty")
                  }
                  onChange={(e) => setSecret(f, e.target.value)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Integration status */}
      {integrations && (
        <div className="px-6 py-6">
          <Label size="small" weight="plus">
            {t("storeSettings.integrations.title")}
          </Label>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            {t("storeSettings.integrations.hint")}
          </Text>
          <div className="mt-3 divide-y rounded-lg border px-4">
            {statusRow(t("storeSettings.integrations.stripe"), integrations.stripe_configured)}
            {statusRow(
              t("storeSettings.integrations.stripeWebhook"),
              integrations.stripe_webhook_configured
            )}
            {statusRow(
              t("storeSettings.integrations.email"),
              integrations.email_provider.startsWith("sendgrid"),
              integrations.email_provider
            )}
            {statusRow(t("storeSettings.integrations.emailFrom"), true, integrations.email_from)}
            {statusRow(
              t("storeSettings.integrations.imageStorage"),
              integrations.image_storage.startsWith("S3"),
              integrations.image_storage
            )}
            {statusRow(
              t("storeSettings.integrations.siteUrl"),
              !integrations.site_url.startsWith("("),
              integrations.site_url
            )}
          </div>
        </div>
      )}
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "storeSettings.nav.label",
  translationNs: "translation",
  icon: CogSixTooth,
});

export default StoreSettingsPage;
