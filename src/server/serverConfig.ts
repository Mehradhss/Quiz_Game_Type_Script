import {Server, Socket} from 'socket.io'
import cors from 'cors';
import http from "http"; // Correct import for http
import express from "express"; // Import express

const app = express(); // Create Express app

app.use(cors({
    origin: "*",
    methods: "*",
    allowedHeaders: "*",
    credentials: false,
}));

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: "*",
        allowedHeaders: "*",
        credentials: false,
    },
    connectionStateRecovery: {
        // the backup duration of the sessions and the packets
        maxDisconnectionDuration: 24 * 60 * 60 * 1000,
        // whether to skip middlewares upon successful recovery
        skipMiddlewares: true,
    },
    connectTimeout: 2 * 60 * 60 * 1000,
    /* options */
})

export {
    io,
    httpServer
}