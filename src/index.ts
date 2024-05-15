// Require the framework and instantiate it

// ESM
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify'
import fastifyCors from '@fastify/cors'
import 'dotenv/config'
import fastifyIO from 'fastify-socket.io'

import { Server } from 'socket.io'
import http from 'http';
import { db } from './db'
import { devices, devicesConnections, pings } from './db/schema'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import createPostgresSubscriber from 'pg-listen'

const PORT = process.env.port || 3001;
const HOST = process.env.host || "0.0.0.0";
const CORS_ORIGIN = process.env.host || "http://localhost:3001";
const CONNECTION_STRING_DATABASE = process.env.connectionString || "postgres://root:grnPxjp137IZq9urjBg4fyD5WywZsP0jh4Zdbqbe3XGqrVaZVo5nu7GCa3cJctSQ@177.242.132.170:5432/innovatec";


const subscriber = createPostgresSubscriber({
    connectionString: CONNECTION_STRING_DATABASE,
})

async function connect() {
    await subscriber.connect()
    await subscriber.listenTo('ping_update')
}

const buildServer = async () => {
    const fastify = Fastify({
        logger: true,
        // logger: {
        //     transport: {
        //         target: "pino-pretty"
        //     }
        // }
    })
    await fastify.register(fastifyCors, {
        origin: CORS_ORIGIN,
    })


    await fastify.register(fastifyIO, {
        allowEIO3: true,
        cors: {
            origin: ["https://netdefender.cloud", 'http://localhost:3000', 'http://localhost:3001', CORS_ORIGIN]
        }
    });


    // @ts-ignore
    fastify.io.on('connection', (io: any) => {
        subscriber.notifications.on("ping_update", (payload: any) => {
            io.emit("latestPing", payload);
            console.log(payload);
        });
        console.log("client connected");


        io.on("disconnect", () => {
            console.log("disconnect");

        })
    })

    fastify.get("/healthcheck", () => {
        return {
            status: "ok",
            port: PORT,
        }
    })


    return fastify;
}
const pingRoutes = async (fastify: FastifyInstance) => {
    fastify.post("/create", async (request: FastifyRequest<{ Body: InferSelectModel<typeof pings> }>, reply: FastifyReply) => {
        const newPing = request.body;

        const newUUID = await db.insert(pings).values({
            status: newPing.status,
            latency: newPing.latency,
            jitter: newPing.jitter,
            packets_lost: newPing.packets_lost,
            // id_dc: newPing.id_dc,
        }).returning({
            uuid: pings.idPing,
        });

        return reply.code(201).send(newUUID.at(0)?.uuid);
    });

    fastify.get("/getAll", async (request: FastifyRequest, reply: FastifyReply) => {
        const xd = await db.select().from(pings);


        return reply.send(xd);
    })
}

const deviceConnectionRoutes = async (fastify: FastifyInstance) => {
    fastify.post("/create", async (request: FastifyRequest<{Body: InferInsertModel<typeof devicesConnections>}>, reply: FastifyReply) => {
        const requestBody = request.body;
        const deviceConnection = await db.insert(devicesConnections).values({
            id_device: requestBody.id_device,
            ip: requestBody.ip,
            mac: requestBody.mac,
            os: requestBody.os,
            name: requestBody.name,
            brand: requestBody.brand,
        }).returning({
                id_dc: devicesConnections.id_dc,
            })


        // return reply.code(201).send(deviceConnection)
        return reply.code(201).send(deviceConnection.at(0))
    })

    fastify.get("/getAll", async (request: FastifyRequest, reply: FastifyReply) => {
        const xd = await db.select().from(devicesConnections);


        return reply.send(xd);
    })

}

const deviceRoutes = async (fastify: FastifyInstance) => {
    function getRandomInt(min: number, max: number) {
        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);
        return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
    }

    const randomCharacters: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    const getCode = () => {
        let code: string = "";

        for (let i = 0; i < 10; i++) {
            code += randomCharacters[getRandomInt(0, randomCharacters.length)];
        }

        return code;
    }

    fastify.post('/create', async (request: FastifyRequest<{ Body: InferInsertModel<typeof devices> }>, reply: FastifyReply) => {
        const device = await db.insert(devices).values({
            code: getCode()
        }).returning({
                uuid: devices.id_device,
                code: devices.code,
            })

        return reply.code(201).send(device.at(0))
    })

    fastify.get("/getAll", async (request: FastifyRequest, reply: FastifyReply) => {
        const xd = await db.select().from(devices);


        return reply.send(xd);
    })

}
async function main() {
    const app = await buildServer();
    app.register(pingRoutes, { prefix: "/v1/ping" })
    app.register(deviceConnectionRoutes, { prefix: "/v1/deviceConnection" })
    app.register(deviceRoutes, { prefix: "/v1/device" })

    try {
        app.listen({
            host: HOST,
            port: PORT as number,
        });
        console.log(`Server at http://${HOST}:${PORT}`);
    } catch (err) {
        console.error(err);
    }
}
connect();
main();
