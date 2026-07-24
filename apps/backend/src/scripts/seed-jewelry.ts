import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * Seeds the AUREL demi-fine jewelry catalog (mirrors storefront/src/lib/products.ts).
 * Metal × Size/Length become Medusa options+variants; material/cert/care live in metadata.
 * Run once:  npx medusa exec ./src/scripts/seed-jewelry.ts
 */

type SizeKind = "ring" | "length" | null;

interface JewelryItem {
  handle: string;
  title: string;
  category: string;
  description: string;
  priceUsd: number; // major units (dollars)
  compareUsd?: number;
  metals: string[];
  sizeKind: SizeKind;
  sizes: string[];
  metadata: Record<string, unknown>;
}

const METAL_CODE: Record<string, string> = {
  "14k Yellow Gold": "YG",
  "14k White Gold": "WG",
  "14k Rose Gold": "RG",
  "18k Gold Vermeil": "VM",
  "Sterling Silver": "SS",
};

const RING_SIZES = ["4", "5", "6", "7", "8", "9"];
const LENGTHS = ['16"', '18"', '20"'];

const ITEMS: JewelryItem[] = [
  {
    handle: "aurora-pendant-necklace",
    title: "Aurora Pendant Necklace",
    category: "Necklaces",
    description:
      "The one you'll never take off. A brilliant-cut lab-grown diamond floats on a whisper-fine cable chain — refined enough for the office, easy enough for the gym.",
    priceUsd: 148,
    compareUsd: 180,
    metals: ["14k Yellow Gold", "14k White Gold", "14k Rose Gold"],
    sizeKind: "length",
    sizes: LENGTHS,
    metadata: {
      material: "14k solid gold",
      gemstone: "0.10ct lab-grown diamond · F / VS1",
      certificate: "IGI certified diamond",
      responsibly_sourced: "Recycled 14k gold",
      hypoallergenic: "true",
      water_resistant: "true",
      care: "Shower & workout safe; wipe with a soft cloth; store away from perfume.",
    },
  },
  {
    handle: "petite-huggie-hoops",
    title: "Petite Huggie Hoops",
    category: "Earrings",
    description:
      "Small enough to sleep in, substantial enough to notice. A secure hinged closure means they stay put from morning to midnight.",
    priceUsd: 88,
    metals: ["14k Yellow Gold", "14k White Gold", "14k Rose Gold"],
    sizeKind: null,
    sizes: [],
    metadata: {
      material: "14k solid gold",
      responsibly_sourced: "Recycled 14k gold",
      hypoallergenic: "true — nickel-free, safe for sensitive ears",
      water_resistant: "true",
      care: "Nickel-free; shower-safe solid gold; clean gently with a soft cloth.",
    },
  },
  {
    handle: "solene-signet-ring",
    title: "Solene Signet Ring",
    category: "Rings",
    description:
      "A smooth oval face waiting for your initials, a date, or nothing at all. Personalize it, or wear it clean.",
    priceUsd: 165,
    metals: ["14k Yellow Gold", "14k Rose Gold", "18k Gold Vermeil"],
    sizeKind: "ring",
    sizes: RING_SIZES,
    metadata: {
      material: "14k solid gold",
      responsibly_sourced: "Recycled 14k gold",
      hypoallergenic: "true",
      water_resistant: "true",
      engravable: "true — up to 3 characters, made to order & final sale",
      care: "Complimentary engraving; first resize within a year is free.",
    },
  },
  {
    handle: "linea-tennis-bracelet",
    title: "Linea Tennis Bracelet",
    category: "Bracelets",
    description:
      "The classic tennis bracelet, reimagined at an honest price with lab-grown diamonds and a double-lock clasp for peace of mind.",
    priceUsd: 240,
    compareUsd: 290,
    metals: ["14k White Gold", "14k Yellow Gold"],
    sizeKind: "length",
    sizes: ['6.5"', '7"'],
    metadata: {
      material: "14k solid gold",
      gemstone: "1.0ct total lab-grown diamonds",
      certificate: "IGI certified diamonds",
      responsibly_sourced: "Recycled 14k gold · lab-grown stones",
      hypoallergenic: "true",
      water_resistant: "false — remove before swimming",
      care: "Store in the pouch; free professional clean once a year.",
    },
  },
  {
    handle: "mira-stud-earrings",
    title: "Mira Diamond Studs",
    category: "Earrings",
    description:
      "A four-prong classic that catches light from every angle. Secure screw-backs mean they're safe to sleep and shower in.",
    priceUsd: 195,
    metals: ["14k White Gold", "14k Yellow Gold", "14k Rose Gold"],
    sizeKind: null,
    sizes: [],
    metadata: {
      material: "14k solid gold",
      gemstone: "0.25ct total lab-grown diamonds",
      certificate: "IGI certified diamonds",
      responsibly_sourced: "Recycled 14k gold · lab-grown stones",
      hypoallergenic: "true — nickel-free posts",
      water_resistant: "true",
      care: "Nickel-free posts; shower-safe; wipe to keep them sparkling.",
    },
  },
  {
    handle: "cove-chain-necklace",
    title: "Cove Chain Necklace",
    category: "Necklaces",
    description:
      "The anchor piece of any layered look — enough presence to wear alone, light enough to forget you have it on.",
    priceUsd: 128,
    metals: ["14k Yellow Gold", "18k Gold Vermeil", "Sterling Silver"],
    sizeKind: "length",
    sizes: LENGTHS,
    metadata: {
      material: "18k gold vermeil over 925 sterling silver",
      responsibly_sourced: "Recycled sterling base",
      hypoallergenic: "true",
      water_resistant: "false — protect the plating from water & perfume",
      care: "Vermeil: avoid water/sweat; store in pouch; polish with cloth.",
    },
  },
  {
    handle: "favor-stacking-ring",
    title: "Favor Stacking Ring",
    category: "Rings",
    description:
      "A slim, rounded band that plays well with others. Start with one, come back for three.",
    priceUsd: 68,
    metals: ["14k Yellow Gold", "14k White Gold", "14k Rose Gold"],
    sizeKind: "ring",
    sizes: RING_SIZES,
    metadata: {
      material: "14k solid gold",
      responsibly_sourced: "Recycled 14k gold",
      hypoallergenic: "true",
      water_resistant: "true",
      care: "Shower-safe solid gold; nickel-free; first resize within a year free.",
    },
  },
  {
    handle: "esme-birthstone-necklace",
    title: "Esme Birthstone Necklace",
    category: "Necklaces",
    description:
      "A dainty bezel-set birthstone that makes an easy, personal gift. Add an engraving on the back for the finishing touch.",
    priceUsd: 98,
    metals: ["14k Yellow Gold", "14k Rose Gold", "18k Gold Vermeil"],
    sizeKind: "length",
    sizes: LENGTHS,
    metadata: {
      material: "14k gold vermeil",
      gemstone: "Choose your birthstone",
      responsibly_sourced: "Recycled sterling base",
      hypoallergenic: "true",
      water_resistant: "false",
      engravable: "true — made to order & final sale",
      care: "Avoid water to protect the vermeil; comes gift-ready in a keepsake box.",
    },
  },
];

function sizeLabel(kind: SizeKind): string {
  return kind === "ring" ? "Ring Size" : "Length";
}
function sizeCode(size: string): string {
  return size.replace(/"/g, "in").replace(/\./g, "_");
}

export default async function seedJewelry({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("Seeding AUREL jewelry catalog...");

  // Reuse existing infra created by the initial migration seed.
  const { data: channels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });
  const salesChannel =
    channels.find((c) => c.name === "Default Sales Channel") ?? channels[0];

  const { data: profiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = profiles[0];

  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
  });
  const stockLocation = locations[0];

  if (!salesChannel || !shippingProfile || !stockLocation) {
    throw new Error(
      "Missing sales channel / shipping profile / stock location. Run migrations first."
    );
  }

  // Categories (skip any that already exist).
  const categoryNames = ["Necklaces", "Earrings", "Rings", "Bracelets"];
  const { data: existingCats } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  });
  const toCreate = categoryNames.filter(
    (n) => !existingCats.some((c) => c.name === n)
  );
  let cats: any[] = existingCats;
  if (toCreate.length) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: toCreate.map((name) => ({ name, is_active: true })),
      },
    });
    cats = [...existingCats, ...result];
  }
  const catId = (name: string) => cats.find((c) => c.name === name)!.id;

  // Build product payloads.
  const products = ITEMS.map((item) => {
    const options =
      item.sizeKind === null
        ? [{ title: "Metal", values: item.metals }]
        : [
            { title: "Metal", values: item.metals },
            { title: sizeLabel(item.sizeKind), values: item.sizes },
          ];

    const skuBase = item.handle.toUpperCase().replace(/[^A-Z0-9]+/g, "-");
    const sizeVals = item.sizeKind === null ? [null] : item.sizes;

    const variants = item.metals.flatMap((metal) =>
      sizeVals.map((size) => {
        const mc = METAL_CODE[metal] ?? "XX";
        const sku = size
          ? `${skuBase}-${mc}-${sizeCode(size)}`
          : `${skuBase}-${mc}`;
        const options: Record<string, string> = { Metal: metal };
        if (size) options[sizeLabel(item.sizeKind)] = size;
        return {
          title: size ? `${metal} / ${size}` : metal,
          sku,
          manage_inventory: true,
          options,
          prices: [
            { amount: item.priceUsd, currency_code: "usd" },
            { amount: item.priceUsd, currency_code: "eur" },
          ],
        };
      })
    );

    return {
      title: item.title,
      handle: item.handle,
      description: item.description,
      status: ProductStatus.PUBLISHED,
      category_ids: [catId(item.category)],
      shipping_profile_id: shippingProfile.id,
      weight: 50,
      options,
      variants,
      metadata: item.metadata,
      sales_channels: [{ id: salesChannel.id }],
    };
  });

  await createProductsWorkflow(container).run({ input: { products } });
  logger.info(`Created ${products.length} jewelry products.`);

  // Set inventory for any items that don't yet have a level at our location.
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "location_levels.location_id"],
  });
  const missing = inventoryItems.filter(
    (i) =>
      !(i.location_levels ?? []).some(
        (l: any) => l?.location_id === stockLocation.id
      )
  );
  if (missing.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: missing.map((i) => ({
          location_id: stockLocation.id,
          inventory_item_id: i.id,
          stocked_quantity: 250,
        })),
      },
    });
  }
  logger.info(`Set inventory on ${missing.length} new variants. Jewelry seed complete.`);
}
