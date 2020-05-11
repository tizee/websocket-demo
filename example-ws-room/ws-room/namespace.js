const Room = require('./room');
class WSNamespace {
	constructor(...props) {
		const { name } = props;
		this.name = name;
		this.rooms = new Map();
		this.clients = new Map();
	}

	add(roomId, leaveCallback, joinCallback) {
		if (!this.rooms.has(roomId)) {
			const room = new Room(roomId, leaveCallback, joinCallback);
			this.rooms.set(roomId, room);
		}
	}

	join(roomId, uid, client, leaveCallback, joinCallback) {
		if (!this.rooms.has(roomId)) {
			const room = new Room(roomId, leaveCallback, joinCallback);
			this.rooms.set(roomId, room);
			this.rooms.get(roomId).add(uid, client);
			this.clients.set(uid, new Set());
			this.clients.get(uid).add(roomId);
			return;
		}
		if (!this.rooms.get(roomId).has(uid)) {
			this.rooms.get(roomId).add(uid, client);
			if (!this.clients.has(uid)) {
				this.clients.set(uid, new Set());
			}
			this.clients.get(uid).add(roomId);
			return;
		}
	}

	leave(roomId, uid) {
		if (!this.rooms.has(roomId)) {
			return;
		}
		if (!this.rooms.get(roomId).has(uid)) {
			return;
		}
		this.rooms.get(roomId).leave(uid);
		this.clients.get(uid).delete(roomId);
	}

	in(roomId) {
		if (!this.rooms.has(roomId)) {
			return null;
		}
		return this.rooms.get(roomId);
	}
}
module.exports = WSNamespace;
