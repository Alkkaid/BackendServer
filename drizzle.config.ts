import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
    schema: './src/db/schema.ts',
    out: './src/db/drizzle',
    dbCredentials: {
        url: "postgres://root:grnPxjp137IZq9urjBg4fyD5WywZsP0jh4Zdbqbe3XGqrVaZVo5nu7GCa3cJctSQ@177.242.132.170:5432/innovatec",
    },
    dialect: "postgresql",
    // driver: 'pg',
    verbose: true,
    strict: true
} satisfies Config;
