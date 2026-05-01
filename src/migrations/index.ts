import * as migration_20260325_184724 from './20260325_184724';
import * as migration_20260325_213756 from './20260325_213756';
import * as migration_20260407_members_remove_tier_currency from './20260407_members_remove_tier_currency';
import * as migration_20260501_181700_spacing_padding_backfill from './20260501_181700_spacing_padding_backfill';

export const migrations = [
  {
    up: migration_20260325_184724.up,
    down: migration_20260325_184724.down,
    name: '20260325_184724',
  },
  {
    up: migration_20260325_213756.up,
    down: migration_20260325_213756.down,
    name: '20260325_213756',
  },
  {
    up: migration_20260407_members_remove_tier_currency.up,
    down: migration_20260407_members_remove_tier_currency.down,
    name: '20260407_members_remove_tier_currency',
  },
  {
    up: migration_20260501_181700_spacing_padding_backfill.up,
    down: migration_20260501_181700_spacing_padding_backfill.down,
    name: '20260501_181700_spacing_padding_backfill',
  },
];
