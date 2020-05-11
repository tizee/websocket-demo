// many-to-many relationship
// query one client in room in O(1)
class WSRoom {
	constructor(...props) {
		const { roomId, leaveCallback = (e) => e, joinCallback = (e) => e } = props;
		this.roomId = roomId;
		this.clients = new Map();
		this.joinCallback = joinCallback;
		this.leaveCallback = leaveCallback;
	}

	has(uid) {
		return this.clients.has(uid);
	}

	// add or update a client by its id
	add(key, client) {
		this.clients.set(key, client);
		this.joinCallback(key);
	}

	// remove one client from current room
	leave(key) {
		this.clients.delete(key);
		this.leaveCallback(key);
	}

	// broadcast to all clients in room
	// include: true then include sender otherwise exclude sender
	broadcast(key, msg, include = true) {
		console.log('in broadcast');
		this.clients.forEach((ws, id) => {
			if (id !== key) {
				ws.send(JSON.stringify(msg));
			}
		});
		if (include) {
			if (this.clients.has(key)) {
				this.clients.get(key).send(JSON.stringify(msg));
			}
		}
	}

	allClients() {
		return [...this.clients.keys()];
	}
}

module.exports = WSRoom;
