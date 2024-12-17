import {Server} from 'socket.io'
import cors from 'cors';
import http from "http"; // Correct import for http
import express from "express"; // Import express
import {router} from "../routes/app.routes";
import {expressAuthMiddleware} from "../middleware/express.auth.middleware";

const app = express(); // Create Express app
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors({
    origin: "*",
    methods: "*",
    allowedHeaders: "*",
    credentials: false,
}));
app.use(expressAuthMiddleware)
app.use(router)

app.all('*', (req, res) => {
    res.status(404).send('URL not found')
})

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
    connectTimeout: 2 * 60 * 60,
    /* options */
})

export {
    io,
    httpServer
}