import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260722123955 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "store_settings" add column if not exists "legal_entity_name" text null, add column if not exists "legal_jurisdiction" text null, add column if not exists "email_from" text null, add column if not exists "sendgrid_order_template" text null, add column if not exists "sendgrid_welcome_template" text null, add column if not exists "stripe_secret_key" text null, add column if not exists "stripe_webhook_secret" text null, add column if not exists "sendgrid_api_key" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "store_settings" drop column if exists "legal_entity_name", drop column if exists "legal_jurisdiction", drop column if exists "email_from", drop column if exists "sendgrid_order_template", drop column if exists "sendgrid_welcome_template", drop column if exists "stripe_secret_key", drop column if exists "stripe_webhook_secret", drop column if exists "sendgrid_api_key";`);
  }

}
