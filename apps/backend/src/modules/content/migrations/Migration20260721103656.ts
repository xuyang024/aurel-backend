import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260721103656 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "home_content" ("id" text not null, "hero_eyebrow" text null, "hero_title" text null, "hero_subtitle" text null, "hero_cta_primary_label" text null, "hero_cta_primary_href" text null, "hero_cta_secondary_label" text null, "hero_cta_secondary_href" text null, "hero_image_url" text null, "hero_badge_eyebrow" text null, "hero_badge_title" text null, "story_eyebrow" text null, "story_title" text null, "story_body" text null, "story_image_url" text null, "story_cta_label" text null, "story_pillars" jsonb null, "bestsellers_title" text null, "newin_title" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "home_content_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_home_content_deleted_at" ON "home_content" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "home_content" cascade;`);
  }

}
