const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');

const server = new WebSocket.Server(
	{
		port: 9966,
	},
	() => {
		console.log(`Running websocket on port 9966`);
	}
);

server.on('error', (err) => {
	console.error(err);
});

/*
	Constant	Value	Description
	CONNECTING	0	The connection is not yet open.
	OPEN	1	The connection is open and ready to communicate.
	CLOSING	2	The connection is in the process of closing.
	CLOSED	3	The connection is closed.
 */

// https://github.com/websockets/ws/blob/master/doc/ws.md

const anonymous_names = ['阿杰', '墙哥', '彬彬', 'Van', '你👴', '👶来啦'];

const clients = new Map();

// broadcast excluding sender itself
function broadcastMessage(type, uid, username, message, isInclude = false) {
	console.log('in broadCastMessage');
	// client which triggers
	console.log(`[Server]: broadCastMessage ${type} ${uid} ${username}`);
	let trigger_client = clients.get(uid).ws;
	clients.forEach((record, id) => {
		let ws_client = record.ws;
		if (id !== uid && ws_client.readyState === WebSocket.OPEN) {
			ws_client.send(
				JSON.stringify({
					uid: uid,
					type: type,
					username: username,
					message: message,
				})
			);
		}
	});
	if (isInclude) {
		trigger_client.send(
			JSON.stringify({
				uid: uid,
				type: type,
				username: username,
				message: message,
			})
		);
	}
}

function initUI(uid, username) {
	console.log('in initUI');
	let ws = clients.get(uid).ws;
	if (ws.readyState === WebSocket.OPEN) {
		ws.send(
			JSON.stringify({
				type: 'init_ui',
				username: username,
				message: '',
			})
		);
	}
}

server.on('connection', (ws, req) => {
	console.log(`Connection Http request ${req}`);
	const client_uuid = uuidv4();
	const default_name = `${anonymous_names.shift()}`;
	let username = default_name;
	clients.set(client_uuid, { username, ws });

	// init default username
	initUI(client_uuid, username);
	// join notification
	broadcastMessage(
		'notification',
		client_uuid,
		username,
		`${username} join the chat room`,
		true
	);
	ws.on('message', (data) => {
		console.log(`[Server] recived message from ${client_uuid}`);
		// broadcast
		console.log(`data:${data}`);
		if (data.indexOf('/update_username') === 0) {
			console.log('updateUsername event');
			let old_name = username;
			let new_name = data.split(' ')[1];
			username = new_name;
			clients.get(client_uuid).username = new_name;
			// rename notification
			broadcastMessage(
				'notification',
				client_uuid,
				username,
				`${old_name} has renamed to ${new_name}`,
				true
			);
		} else {
			// broadcast message to all connected clients
			broadcastMessage(
				'message',
				client_uuid,
				username,
				`${new Date().toLocaleDateString()} ${data}`,
				true
			);
		}
	});
	ws.on('close', (code, reason) => {
		console.log(
			`[Client]: websocket closed with code ${code} and reason: ${reason}`
		);
		broadcastMessage(
			'notification',
			client_uuid,
			username,
			`${username} has disconnected.`
		);
		if (anonymous_names.indexOf(default_name) < 0) {
			anonymous_names.push(default_name);
		}
		clients.delete(client_uuid);
	});
});
