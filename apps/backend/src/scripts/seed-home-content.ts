import { MedusaContainer } from "@medusajs/framework";
import { CONTENT_MODULE } from "../modules/content";
import ContentModuleService from "../modules/content/service";

/**
 * Seeds the editable homepage content with the storefront's default copy,
 * so the admin form opens pre-populated. Run once:
 *   npx medusa exec ./src/scripts/seed-home-content.ts
 */
export default async function seedHomeContent({
  container,
}: {
  container: MedusaContainer;
}) {
  const service: ContentModuleService = container.resolve(CONTENT_MODULE);

  const defaults: Record<string, unknown> = {
    hero_eyebrow: "Recycled 14k gold · Lab-grown stones",
    hero_title: "Fine jewelry,\nfor everyday.",
    hero_subtitle:
      "Solid gold and gold vermeil designed to be worn — in the shower, at the gym, to dinner. Nickel-free, responsibly made, and priced without the markup.",
    hero_cta_primary_label: "Shop all jewelry",
    hero_cta_primary_href: "/collections/all",
    hero_cta_secondary_label: "Best sellers",
    hero_cta_secondary_href: "/collections/necklaces",
    hero_badge_eyebrow: "Transparent pricing",
    hero_badge_title: "Real gold, honest markup",
    story_eyebrow: "Our promise",
    story_title: "Jewelry you can actually live in.",
    story_body:
      "We believe good jewelry shouldn’t sit in a box for special occasions — or cost a fortune. So we make solid gold and thick-plated vermeil pieces that stand up to real life, and we tell you exactly what they’re made of and what they cost to make.",
    story_cta_label: "Learn more about us →",
    story_pillars: [
      { title: "Recycled gold", body: "Our gold is reclaimed, not newly mined." },
      { title: "Lab-grown stones", body: "Same sparkle, a third of the price, no conflict." },
      { title: "Made to be kept", body: "Free cleaning, resizing and lifetime care." },
    ],
    bestsellers_title: "Best sellers",
    newin_title: "New in necklaces",
  };

  const [existing] = await service.listHomeContents({}, { take: 1 });
  if (existing) {
    await service.updateHomeContents({ id: existing.id, ...defaults });
  } else {
    await service.createHomeContents(defaults);
  }
}
