import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
DO $$
DECLARE r RECORD;
BEGIN
  -- Add "custom" option to all hero-height enums (root + localized/versioned variants).
  FOR r IN
    SELECT n.nspname AS schema_name, t.typname AS type_name
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname LIKE 'enum%hero%design_hero_height'
  LOOP
    EXECUTE format(
      'ALTER TYPE %I.%I ADD VALUE IF NOT EXISTS ''custom'';',
      r.schema_name,
      r.type_name
    );
  END LOOP;

  -- Backfill new spacing model on all block tables that still use design_spacing.
  FOR r IN
    SELECT DISTINCT table_schema, table_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name = 'design_spacing'
      AND (table_name LIKE 'pages_blocks_%' OR table_name LIKE '_pages_v_blocks_%')
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I
        ADD COLUMN IF NOT EXISTS design_padding text DEFAULT ''none'',
        ADD COLUMN IF NOT EXISTS design_custom_padding varchar,
        ADD COLUMN IF NOT EXISTS design_margin text DEFAULT ''none'',
        ADD COLUMN IF NOT EXISTS design_custom_margin varchar;',
      r.table_schema,
      r.table_name
    );
  END LOOP;

  -- Hero blocks gain an optional custom height string.
  FOR r IN
    SELECT DISTINCT table_schema, table_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name = 'design_hero_height'
      AND (table_name LIKE 'pages_blocks_hero%' OR table_name LIKE '_pages_v_blocks_hero%')
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I ADD COLUMN IF NOT EXISTS design_custom_hero_height varchar;',
      r.table_schema,
      r.table_name
    );
  END LOOP;
END $$;

ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "theme_link_color" varchar;
ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "theme_icon_color" varchar;
ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "theme_cta_bg_color" varchar;
ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "theme_cta_text_color" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT DISTINCT table_schema, table_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name = 'design_padding'
      AND (table_name LIKE 'pages_blocks_%' OR table_name LIKE '_pages_v_blocks_%')
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I
        DROP COLUMN IF EXISTS design_padding,
        DROP COLUMN IF EXISTS design_custom_padding,
        DROP COLUMN IF EXISTS design_margin,
        DROP COLUMN IF EXISTS design_custom_margin;',
      r.table_schema,
      r.table_name
    );
  END LOOP;

  FOR r IN
    SELECT DISTINCT table_schema, table_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name = 'design_custom_hero_height'
      AND (table_name LIKE 'pages_blocks_hero%' OR table_name LIKE '_pages_v_blocks_hero%')
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I DROP COLUMN IF EXISTS design_custom_hero_height;',
      r.table_schema,
      r.table_name
    );
  END LOOP;
END $$;

ALTER TABLE "header" DROP COLUMN IF EXISTS "theme_link_color";
ALTER TABLE "header" DROP COLUMN IF EXISTS "theme_icon_color";
ALTER TABLE "header" DROP COLUMN IF EXISTS "theme_cta_bg_color";
ALTER TABLE "header" DROP COLUMN IF EXISTS "theme_cta_text_color";
  `)
}
