const express = require('express');

require("dotenv").config();

const WEBHOOK_PORT = process.env.WEBHOOK_PORT;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

function handleNewCall(request, response) {
	const { from: caller, to: calleeNumber } = request.body;

	console.log(`New call from ${caller} to ${calleeNumber} is ringing...`);

	response.set('Content-Type', 'application/xml');
	response.send(`<Response onAnswer="${WEBHOOK_URL}/on-answer" onHangup="${WEBHOOK_URL}/on-hangup" />`);
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

app.listen(WEBHOOK_PORT, () => {
	console.log(`Server listening on: http://localhost:${WEBHOOK_PORT}`);
});
