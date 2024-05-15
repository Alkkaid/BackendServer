import {
    timestamp,
    pgTable,
    text,
    primaryKey,
    integer,
    uuid,
    serial,
    boolean,
    numeric,
    real,
} from "drizzle-orm/pg-core"
import type { AdapterAccount } from "next-auth/adapters"

export const users = pgTable("user", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name"),
    email: text("email").notNull(),
    password: text("password"),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
})

export const accounts = pgTable(
    "account",
    {
        userId: uuid("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccount["type"]>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    })
)

export const users_devices = pgTable("users_devices", {
    id_relation: serial("id_relation").primaryKey().notNull(),
    id_device: uuid("id_device").notNull().references(() => devices.id_device, { onDelete: "cascade" }),
    userId: uuid("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
})

export const devices = pgTable("device", {
    id_device: uuid("id_device").defaultRandom().primaryKey(),
    name: text("name"),
    code: text("code").notNull(),
    isCodeUsed: boolean("isCodeUsed").default(false),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }),
});

export const devicesConnections = pgTable("deviceConnection", {
    id_dc: serial("id_dc").primaryKey(),
    ip: text("ip").notNull(),
    mac: text("mac").notNull(),
    name: text("name"),
    os: text("os"),
    brand: text("brand"),
    id_device: uuid("id_device").notNull().references(() => devices.id_device, {onDelete: "cascade"}),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }),
});

export const ports = pgTable("port", {
    id_port: serial("id_port").primaryKey(),
    portName: text("portName").notNull(),
    portNumber: integer("portNumber").notNull(),
    portType: text("portType").notNull(),
    id_dc: serial("id_dc").notNull()
    .references(() => devicesConnections.id_dc, {onDelete: "cascade"}),
});

export const pings = pgTable("ping", {
    idPing: uuid("idPing").primaryKey().defaultRandom(),
    date: timestamp("date", {precision: 3, withTimezone: true}).defaultNow(),
    status: boolean("status"),
    packets_lost: real("packetsLost").default(0),
    latency: real("latency").default(0),
    jitter: real("jitter").default(0),
    // id_dc: serial("idDc").notNull().references(() => devicesConnections.id_dc, {onDelete: 'cascade'}),
})
