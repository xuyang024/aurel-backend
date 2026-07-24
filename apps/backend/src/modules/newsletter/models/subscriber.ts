import { model } from "@medusajs/framework/utils";

// Newsletter subscribers collected from the storefront.
export const Subscriber = model.define("newsletter_subscriber", {
  id: model.id().primaryKey(),
  email: model.text().searchable(),
  source: model.text().nullable(), // e.g. "footer", "homepage"
  status: model.enum(["subscribed", "unsubscribed"]).default("subscribed"),
});
