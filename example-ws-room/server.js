const http = require('http');
const url = require('url');
const express = require('express');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const { Namespace } = require('./ws-room');

const rooms = new Namespace('demo');

// websocket client entrypoint
const ws_server = new WebSocket.Server({
	noServer: true,
});

ws_server.on('connection', (client, req) => {
	const params = url.parse(req.url).searchParams;
	console.log('request params:', params);
	// find room
	const uid = uuidv4();
	rooms.join('default', uid, client);
	rooms.in('default').broadcast(
		uid,
		{
			event: 'clients',
			data: rooms.in('default').allClients(),
		},
		true
	);
	client.on('message', (payload) => {
		const { event, data } = JSON.parse(payload);
		console.log('event:', event);
		console.log('data', data);
		if (event === 'message') {
			const { roomId } = data;
			rooms.join(
				roomId,
				uid,
				client,
				(uid) =>
					rooms
						.in('default')
						.broadcast(uid, `${uid} has leaved room default`, true),
				(uid) =>
					rooms
						.in('default')
						.broadcast(uid, `${uid} has joined room default`, true)
			);
			rooms.in(roomId).broadcast(uid, data, true);
		} else if (event === 'update') {
			const { new_roomId } = data;
			rooms.join(new_roomId, uid, client);
			// update room users
			client.send(
				JSON.stringify({
					event: 'clients',
					data: rooms.in(new_roomId).allClients(),
				})
			);
		}
	});
	client.on('close', (code, reason) => {
		console.log('close', code, reason);
		rooms.leave('default', uid);
		rooms.in('default').broadcast(
			uid,
			{
				event: 'clients',
				data: rooms.in('default').allClients(),
			},
			true
		);
	});
});

const app = express();
const server = http.createServer(app);

server.on('upgrade', function upgrade(request, socket, head) {
	// access control
	// authentication
	const headers = request.headers;
	ws_server.handleUpgrade(request, socket, head, function done(ws) {
		ws_server.emit('connection', ws, request);
	});
});

server.listen(9966, () => {
	console.log('listening on port 9966');
});
