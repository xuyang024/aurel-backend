import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createPromotionsWorkflow } from "@medusajs/medusa/core-flows";

/**
 * Seeds a WELCOME10 promotion — 10% off the order.
 * Run once:  npx medusa exec ./src/scripts/seed-promotion.ts
 */
export default async function seedPromotion({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: existing } = await query.graph({
    entity: "promotion",
    fields: ["id", "code"],
    filters: { code: "WELCOME10" },
  });
  if (existing.length) {
    logger.info("WELCOME10 already exists — skipping.");
    return;
  }

  await createPromotionsWorkflow(container).run({
    input: {
      promotionsData: [
        {
          code: "WELCOME10",
          type: "standard",
          status: "active",
          application_method: {
            type: "percentage",
            target_type: "order",
            value: 10,
            currency_code: "usd",
          },
        },
      ],
    },
  });
  logger.info("Created WELCOME10 promotion (10% off order).");
}
