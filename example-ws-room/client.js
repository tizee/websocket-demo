const ws = new WebSocket('ws://localhost:9966');
const room = document.querySelector('#room');
const roomInput = document.querySelector('#room-input');
const submitBtn = document.querySelector('#submit-btn', updateRoom);
const users = document.querySelector('#users');

// server works as a bridge to other client when we are developing a chat room like web app.
ws.onopen = function (e) {
	console.log('Client websocket established connection with server');
};
ws.onclose = function (e) {
	console.log('Client websocket closed');
};

ws.onmessage = function (payload) {
	console.log('client on message');
	const { event, data } = JSON.parse(payload.data);
	console.log(payload.data);
	if (event === 'clients') {
		updateUserList(data);
	}
};

// fetch
function updateUserList(list) {
	//clear
	users.innerHTML = '';
	list.forEach((el) => {
		let userSpan = document.createElement('p');
		userSpan.innerText = el;
		users.insertAdjacentElement('afterbegin', userSpan);
	});
}

function updateRoom(event) {
	event.preventDefault();
	const new_roomId = roomInput.value;
	ws.send(
		JSON.stringify({
			event: 'update',
			data: {
				new_roomId: new_roomId,
			},
		})
	);
	room.innerHTML = new_roomId;
}

const default_room = 'default';
room.innerHTML = default_room;

submitBtn.addEventListener('onClick', updateRoom);
