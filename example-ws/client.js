const ws = new WebSocket('ws://localhost:9966');

// server works as a bridge to other client when we are developing a chat room like web app.
ws.onopen = function (e) {
	console.log('Client websocket established connection with server');
};
ws.onclose = function (e) {
	console.log('Client websocket closed');
};

ws.onmessage = function (e) {
	const { type, username, message } = JSON.parse(e.data);
	updateChatUI(type, username, message);
};

const username_button = document.querySelector('#submit-username');
const msg_button = document.querySelector('#submit-message');

username_button.addEventListener('click', updateUsername);
msg_button.addEventListener('click', sendMessage);

function updateUsername() {
	console.log('in updateUsername');
	const username_input = document.querySelector('#username');
	const new_username = username_input.value;
	if (!new_username || new_username.length < 1) {
		return;
	}
	const name_elem = document.querySelector('#current-username');
	name_elem.innerHTML = new_username;
	username_input.value = '';
	ws.send(`/update_username ${new_username}`);
}

function sendMessage() {
	let message_elem = document.querySelector('#message');
	ws.send(message_elem.value);
	message_elem.value = '';
	message_elem.focus();
}

function updateChatUI(type, username, message) {
	console.log(`in UpdateChatUI: ${type} ${username} ${message}`);
	if (!type) return;
	if (type === 'init_ui') {
		const name_elem = document.querySelector('#current-username');
		name_elem.innerText = username;
		return;
	}
	const chat_list = document.querySelector('#msg-list');
	const msg_elem = document.createElement('h3');
	let type_label = '';
	if (type === 'notification') {
		type_label = 'Notification:';
	} else {
		type_label = username;
	}
	msg_elem.innerHTML = type_label + message;
	chat_list.appendChild(msg_elem);
}
