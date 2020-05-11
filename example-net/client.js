const net = require('net');
const PORT = 9966;
const greeting = Buffer.from('Client: Hello you stupid server?!');
const goodbye = Buffer.from('Client: さようなら');
// net socket
const client = net.createConnection({ port: PORT }, () => {
	console.log('Client: Establish connection');
	client.write(greeting);
	client.write(goodbye);
});

client.on('data', (data) => {
	console.log(`Client recive:\n${data}`);
	console.log(`Client end`);
	client.end();
});

client.on('end', () => {
	console.log(`Client: recive FIN packet`);
});
