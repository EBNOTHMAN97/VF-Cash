import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

function getPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  if (!globalForDb.__arenaNextJsPostgresqlPool) {
    globalForDb.__arenaNextJsPostgresqlPool = new Pool({
      connectionString: databaseUrl,
    });
  }

  return globalForDb.__arenaNextJsPostgresqlPool;
}

let _db: NodePgDatabase | undefined;

export function getDb(): NodePgDatabase {
  if (!_db) {
    _db = drizzle(getPool());
  }
  return _db;
}

export const db = new Proxy({} as NodePgDatabase, {
  get(_target, prop, receiver) {
    const realDb = getDb();
    const value = Reflect.get(realDb, prop, receiver);
    if (typeof value === "function") {
      return value.bind(realDb);
    }
    return value;
  },
});
