import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
} from "@medusajs/framework/utils";
import { createShippingOptionsWorkflow } from "@medusajs/medusa/core-flows";

/**
 * Adds US delivery (the initial seed only created a Europe zone).
 * Creates a US service zone in a fulfillment set linked to the stock location,
 * plus Standard (free) and Express shipping options.
 * Run once:  npx medusa exec ./src/scripts/seed-us-shipping.ts
 */
export default async function seedUsShipping({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillment = container.resolve(ModuleRegistrationName.FULFILLMENT);

  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
  });
  const stockLocation = locations[0];

  const { data: profiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = profiles[0];

  logger.info("Creating US fulfillment set + service zone...");
  const fulfillmentSet = await fulfillment.createFulfillmentSets({
    name: "US Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "United States",
        geo_zones: [{ country_code: "us", type: "country" }],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
  });

  const zoneId = fulfillmentSet.service_zones[0].id;

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping (5-7 days)",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: zoneId,
        shipping_profile_id: shippingProfile.id,
        type: { label: "Standard", description: "Free insured shipping.", code: "standard" },
        prices: [
          { currency_code: "usd", amount: 0 },
          { currency_code: "eur", amount: 0 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
      {
        name: "Express Shipping (2-3 days)",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: zoneId,
        shipping_profile_id: shippingProfile.id,
        type: { label: "Express", description: "2-3 business days.", code: "express" },
        prices: [
          { currency_code: "usd", amount: 13 },
          { currency_code: "eur", amount: 13 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  });

  logger.info("US shipping options created.");
}
