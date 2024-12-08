"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const io = new socket_io_1.Server(5001, {
    cors: {
        origin: '*',
    },
});
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.on('subscribe', (userId) => {
        console.log(`User ${userId} subscribed to notifications`);
        socket.join(userId);
    });
    socket.on('unsubscribe', (userId) => {
        console.log(`User ${userId} unsubscribed from notifications`);
        socket.leave(userId);
    });
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});
exports.default = io;
