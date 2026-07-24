import { defineRouteConfig } from "@medusajs/admin-sdk";
import { DocumentText } from "@medusajs/icons";
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { sdk } from "../../lib/sdk";

interface Pillar {
  title: string;
  body: string;
}
type Content = Record<string, string> & { story_pillars?: Pillar[] };

const TEXT_FIELDS: { key: string; area?: boolean }[] = [
  { key: "hero_eyebrow" },
  { key: "hero_title", area: true },
  { key: "hero_subtitle", area: true },
  { key: "hero_cta_primary_label" },
  { key: "hero_cta_primary_href" },
  { key: "hero_cta_secondary_label" },
  { key: "hero_cta_secondary_href" },
  { key: "hero_badge_eyebrow" },
  { key: "hero_badge_title" },
  { key: "story_eyebrow" },
  { key: "story_title" },
  { key: "story_body", area: true },
  { key: "story_cta_label" },
  { key: "bestsellers_title" },
  { key: "newin_title" },
];

const ContentPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<Content>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    sdk.client
      .fetch<{ content: Content | null }>("/admin/content")
      .then(({ content }) => setData(content ?? {}))
      .catch(() => toast.error(t("content.loadFailed")))
      .finally(() => setLoading(false));
  }, [t]);

  const set = (key: string, value: string) => setData((d) => ({ ...d, [key]: value }));

  const setPillar = (i: number, field: keyof Pillar, value: string) =>
    setData((d) => {
      const pillars = [...(d.story_pillars ?? [])];
      pillars[i] = { title: "", body: "", ...pillars[i], [field]: value };
      return { ...d, story_pillars: pillars };
    });

  const uploadImage = async (key: string, file: File) => {
    try {
      const res = (await sdk.admin.upload.create({ files: [file] })) as {
        files: { url: string }[];
      };
      const url = res.files?.[0]?.url;
      if (url) {
        set(key, url);
        toast.success(t("content.uploaded"));
      }
    } catch {
      toast.error(t("content.uploadFailed"));
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await sdk.client.fetch("/admin/content", { method: "POST", body: data });
      toast.success(t("content.saved"));
    } catch {
      toast.error(t("content.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="p-6">
        <Text>{t("content.loading")}</Text>
      </Container>
    );
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">{t("content.title")}</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            {t("content.description")}
          </Text>
        </div>
        <Button onClick={save} isLoading={saving}>
          {t("content.save")}
        </Button>
      </div>

      <div className="grid gap-4 px-6 py-6">
        {TEXT_FIELDS.map((f) => (
          <div key={f.key} className="flex flex-col gap-1">
            <Label size="small">{t(`content.fields.${f.key}`)}</Label>
            {f.area ? (
              <Textarea
                value={data[f.key] ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
                rows={f.key === "hero_title" ? 2 : 3}
              />
            ) : (
              <Input value={data[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
            )}
          </div>
        ))}
      </div>

      {/* Images */}
      <div className="grid gap-6 px-6 py-6 sm:grid-cols-2">
        {[
          { key: "hero_image_url", labelKey: "content.heroImage" },
          { key: "story_image_url", labelKey: "content.storyImage" },
        ].map((img) => (
          <div key={img.key} className="flex flex-col gap-2">
            <Label size="small">{t(img.labelKey)}</Label>
            {data[img.key] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data[img.key]}
                alt=""
                className="h-40 w-full rounded-lg object-cover"
              />
            ) : (
              <div className="bg-ui-bg-subtle flex h-40 w-full items-center justify-center rounded-lg">
                <Text className="text-ui-fg-muted" size="small">
                  {t("content.noImage")}
                </Text>
              </div>
            )}
            <div className="flex items-center gap-2">
              <label className="txt-compact-small text-ui-fg-interactive cursor-pointer">
                {t("content.upload")}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(img.key, file);
                  }}
                />
              </label>
              {data[img.key] && (
                <Button
                  variant="transparent"
                  size="small"
                  onClick={() => set(img.key, "")}
                >
                  {t("content.remove")}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Story pillars */}
      <div className="px-6 py-6">
        <Label size="small">{t("content.pillarsLabel")}</Label>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-2 rounded-lg border p-3">
              <Input
                placeholder={t("content.pillarTitle")}
                value={data.story_pillars?.[i]?.title ?? ""}
                onChange={(e) => setPillar(i, "title", e.target.value)}
              />
              <Textarea
                placeholder={t("content.pillarBody")}
                rows={2}
                value={data.story_pillars?.[i]?.body ?? ""}
                onChange={(e) => setPillar(i, "body", e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "content.nav.label",
  translationNs: "translation",
  icon: DocumentText,
});

export default ContentPage;
