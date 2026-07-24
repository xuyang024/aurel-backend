import { model } from "@medusajs/framework/utils";

/**
 * Editable homepage content (single row / singleton).
 * Text fields map 1:1 to the storefront Hero + BrandStory sections.
 * Image fields hold URLs produced by the file (S3) module.
 */
export const HomeContent = model.define("home_content", {
  id: model.id().primaryKey(),

  // Hero
  hero_eyebrow: model.text().nullable(),
  hero_title: model.text().nullable(),
  hero_subtitle: model.text().nullable(),
  hero_cta_primary_label: model.text().nullable(),
  hero_cta_primary_href: model.text().nullable(),
  hero_cta_secondary_label: model.text().nullable(),
  hero_cta_secondary_href: model.text().nullable(),
  hero_image_url: model.text().nullable(),
  hero_badge_eyebrow: model.text().nullable(),
  hero_badge_title: model.text().nullable(),

  // Brand story
  story_eyebrow: model.text().nullable(),
  story_title: model.text().nullable(),
  story_body: model.text().nullable(),
  story_image_url: model.text().nullable(),
  story_cta_label: model.text().nullable(),
  // [{ title, body }] — the three promise pillars
  story_pillars: model.json().nullable(),

  // Featured section headings
  bestsellers_title: model.text().nullable(),
  newin_title: model.text().nullable(),
});
