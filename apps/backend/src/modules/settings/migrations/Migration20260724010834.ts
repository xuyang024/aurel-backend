import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260724010834 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "store_settings" add column if not exists "s3_bucket" text null, add column if not exists "s3_region" text null, add column if not exists "s3_endpoint" text null, add column if not exists "s3_file_url" text null, add column if not exists "s3_access_key_id" text null, add column if not exists "s3_secret_access_key" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "store_settings" drop column if exists "s3_bucket", drop column if exists "s3_region", drop column if exists "s3_endpoint", drop column if exists "s3_file_url", drop column if exists "s3_access_key_id", drop column if exists "s3_secret_access_key";`);
  }

}
