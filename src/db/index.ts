import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { drizzle,type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from './schema'

const pool = new Pool({
  connectionString: "postgres://root:grnPxjp137IZq9urjBg4fyD5WywZsP0jh4Zdbqbe3XGqrVaZVo5nu7GCa3cJctSQ@177.242.132.170:5432/innovatec",
});

export const db:NodePgDatabase<typeof schema> = drizzle(pool, {schema})

// or
// const pool = new Pool({
//   host: "127.0.0.1",
//   port: 5432,
//   user: "postgres",
//   password: "password",
//   database: "db_name",
// });

