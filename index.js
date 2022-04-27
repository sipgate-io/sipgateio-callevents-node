const express = require('express');

const PORT = 8080;
const BASE_URL = '[YOUR_SERVERS_ADDRESS]';

function handleNewCall(request, response) {
	const { from: caller, to: calleeNumber } = request.body;

	console.log(`New call from ${caller} to ${calleeNumber} is ringing...`);

	response.set('Content-Type', 'application/xml');
	response.send(`<Response onAnswer="${BASE_URL}/on-answer" onHangup="${BASE_URL}/on-hangup" />`);
}

function handleOnAnswer(request, response) {
	const { from: caller, to: callee } = request.body;
	console.log(`${callee} answered call from ${caller}`);
	response.end();
}

function handleOnHangup(request, response) {
	console.log(`The call has been hung up`);
	response.end();
}

const app = express();
app.use(express.urlencoded({ extended: true }));

app.post('/new-call', handleNewCall);
app.post('/on-answer', handleOnAnswer);
app.post('/on-hangup', handleOnHangup);

app.listen(PORT, () => {
	console.log(`Server listening on: http://localhost:${PORT}`);
});
