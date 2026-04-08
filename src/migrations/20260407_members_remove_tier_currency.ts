import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "members" DROP COLUMN IF EXISTS "tier";
    ALTER TABLE "members" DROP COLUMN IF EXISTS "currency";
    ALTER TABLE "members" ALTER COLUMN "preferred_locale" SET DEFAULT 'es';
    DROP TYPE IF EXISTS "public"."enum_members_tier";
    DROP TYPE IF EXISTS "public"."enum_members_currency";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_members_tier" AS ENUM('free', 'premium');
    CREATE TYPE "public"."enum_members_currency" AS ENUM('USD', 'EUR', 'GBP', 'COP');
    ALTER TABLE "members" ADD COLUMN "tier" "enum_members_tier" DEFAULT 'free';
    ALTER TABLE "members" ADD COLUMN "currency" "enum_members_currency" DEFAULT 'USD' NOT NULL;
    ALTER TABLE "members" ALTER COLUMN "preferred_locale" SET DEFAULT 'en';
  `)
}
