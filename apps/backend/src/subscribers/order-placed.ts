import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { SETTINGS_MODULE } from "../modules/settings";

// Sends an order confirmation email when an order is placed.
// With the local provider this logs the notification; with SendGrid (or another
// configured provider) it delivers a real email. The `template` is the provider
// template id — set your SendGrid dynamic template id here when you wire it up.
export default async function orderPlacedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const notificationService = container.resolve(Modules.NOTIFICATION);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const {
    data: [order],
  } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "currency_code",
      "total",
      "items.title",
      "items.product_title",
      "items.quantity",
    ],
    filters: { id: event.data.id },
  });

  if (!order?.email) return;

  // Template id is admin-editable (Store Settings) with an env override.
  let template = process.env.SENDGRID_ORDER_TEMPLATE || "order-placed";
  try {
    const settings: any = container.resolve(SETTINGS_MODULE);
    const [row] = await settings.listStoreSettings({}, { take: 1 });
    if (!process.env.SENDGRID_ORDER_TEMPLATE && row?.sendgrid_order_template) {
      template = row.sendgrid_order_template;
    }
  } catch {
    /* keep default */
  }

  await notificationService.createNotifications({
    to: order.email,
    channel: "email",
    template,
    data: { order },
  });
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
