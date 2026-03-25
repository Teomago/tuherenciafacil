import * as migration_20260325_184724 from './20260325_184724';
import * as migration_20260325_213756 from './20260325_213756';

export const migrations = [
  {
    up: migration_20260325_184724.up,
    down: migration_20260325_184724.down,
    name: '20260325_184724',
  },
  {
    up: migration_20260325_213756.up,
    down: migration_20260325_213756.down,
    name: '20260325_213756'
  },
];
