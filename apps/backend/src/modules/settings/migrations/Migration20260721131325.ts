import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260721131325 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "store_settings" ("id" text not null, "contact_email" text null, "social_instagram" text null, "social_tiktok" text null, "social_pinterest" text null, "stripe_publishable_key" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "store_settings_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_store_settings_deleted_at" ON "store_settings" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "store_settings" cascade;`);
  }

}
