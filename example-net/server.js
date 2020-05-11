// vanilla websocket based on Nodejs net module
const greeting = Buffer.from('Server: Hello world  you stupid coder!?\n');
const goodbye = Buffer.from('Server: Goodbye boi! :)\n');
const net = require('net');
const server = net
	.createServer((socket) => {
		socket.on('data', (data) => {
			console.log(`Receving data:${data}`);
		});
		socket.write(greeting.toString('utf8'));
		socket.end(goodbye.toString('utf8'));
	})
	.on('error', (err) => {
		console.err(err);
	});

const PORT = 9966;

server.listen(PORT, () => {
	console.log(`Websocket server listening on port ${PORT}`);
});
