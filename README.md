<img src="https://www.sipgatedesign.com/wp-content/uploads/wort-bildmarke_positiv_2x.jpg" alt="sipgate logo" title="sipgate" align="right" height="112" width="200"/>

# sipgate.io Node.js call events example
This example demonstrates how to receive and process webhooks from [sipgate.io](https://developer.sipgate.io/).

For further information regarding the push functionalities of sipgate.io please visit https://developer.sipgate.io/push-api/api-reference/

- [Prerequisites](#Prerequisites)
- [Enabling sipgate.io for your sipgate account](#Enabling-sipgateio-for-your-sipgate-account)
- [How sipgate.io webhooks work](#How-sipgateio-webhooks-work)
- [Configure webhooks for sipgate.io](#Configure-webhooks-for-sipgateio)
- [A word on security](#A-word-on-security)
- [Making your computer accessible from the internet](#Making-your-computer-accessible-from-the-internet)
- [Install dependencies:](#Install-dependencies)
- [Execution](#Execution)
- [How It Works](#How-It-Works)
- [Common Issues](#Common-Issues)
- [Related](#Related)
- [Contact Us](#Contact-Us)
- [License](#License)
- [External Libraries](#External-Libraries)


## Prerequisites
- Node.js >= 10.15.3


## Enabling sipgate.io for your sipgate account
In order to use sipgate.io, you need to book the corresponding package in your sipgate account. The most basic package is the free **sipgate.io S** package.

If you use [sipgate basic](https://app.sipgatebasic.de/feature-store) or [simquadrat](https://app.simquadrat.de/feature-store) you can book packages in your product's feature store.
If you are a _sipgate team_ user logged in with an admin account you can find the option under **Account Administration**&nbsp;>&nbsp;**Plans & Packages**.


## How sipgate.io webhooks work
### What is a webhook?
A webhook is a POST request that sipgate.io makes to a predefined URL when a certain event occurs.
These requests contain information about the event that occurred in `application/x-www-form-urlencoded` format.
You can find more information on this format in the pertinent documentation.

This is an example payload converted from `application/x-www-form-urlencoded` to JSON:
```json
{
  "event": "newCall",
  "direction": "in",
  "from": "492111234567",
  "to": "4915791234567",
  "callId":"12345678",
  "origCallId":"12345678",
  "user": [ "Alice" ],
  "xcid": "123abc456def789",
  "diversion": "1a2b3d4e5f"
}
```


### sipgate.io webhook events
sipgate.io offers webhooks for the following events:

- **newCall:** is triggered when a new incoming or outgoing call occurs 
- **onAnswer:** is triggered when a call is answered – either by a person or an automatic voicemail
- **onHangup:** is triggered when a call is hung up
- **dtmf:** is triggered when a user makes an entry of digits during a call

**Note:** Per default, sipgate.io only sends webhooks for **newCall** events.
To subscribe to other event types you can reply to the **newCall** event with an XML response.
This response includes the event types you would like to receive webhooks for as well as the respective URL they should be directed to.
You can find more information about the XML response here:
https://developer.sipgate.io/push-api/api-reference/#the-xml-response


## Configure webhooks for sipgate.io 
You can configure webhooks for sipgate.io as follows:

1. Navigate to [console.sipgate.com](https://console.sipgate.com/) and login with your sipgate account credentials.
2. Select the **Webhooks**&nbsp;>&nbsp;**URLs** tab in the left side menu
3. Click the gear icon of the **Incoming** or **Outgoing** entry
4. Fill in your webhook URL and click save. In this example we receive _newCall_ events on the route `/new-call`.\
  **Note:** your webhook URL has to be accessible from the internet. (See the section [Making your computer accessible from the internet](#making-your-computer-accessible-from-the-internet))\
  **Example:** Assuming your server's address was `example.localhost.run`, the address you'd need to set in the webhook console would be `https://example.localhost.run/new-call`.
5. In the **sources** section you can select what phonelines and groups should trigger webhooks.

## A word on security
Although sipgate.io can work with both HTTP and HTTPS connections, it is strongly discouraged to use plain HTTP as the webhooks contain sensitive information.
The service `localhost.run` also supports HTTPS, so for development you will be fine using that.
For production, it is important to note that sipgate.io does not accept self-signed SSL certificates.
If you need a certificate for your server, you can easily get one at _Let´s Encrypt_.

## Making your computer accessible from the internet
There are many possibilities to obtain an externally accessible address for your computer.
In this example we use the service [localhost.run](localhost.run) which sets up a reverse ssh tunnel that forwards traffic from a public URL to your localhost.
The following command creates a subdomain at localhost.run and sets up a tunnel between the public port 80 on their server and your localhost:8080:

```bash
$ ssh -R 80:localhost:8080 ssh.localhost.run
```
If you run this example on a server which can already be reached from the internet, you do not need the forwarding.
In that case, the webhook URL needs to be adjusted accordingly.


## Install dependencies:
Navigate to the project's root directory and run:
```bash
npm install
```


## Execution
Navigate to the project's root directory.

Run the application:
```bash
node index.js 
```


## How It Works
This example uses the _Express_ framework as a simple means to set up an HTTP server for handling webhook requests from sipgate.io.
The functions defined in the script are the callback functions that will be used by the server to handle incoming call events.

```javascript
function handleNewCall(request, response) {
	const { from: caller, to: calleeNumber } = request.body;

	console.log(`New call from ${caller} to ${calleeNumber} is ringing...`);

	response.set('Content-Type', 'application/xml');
	response.send(`<Response onAnswer="${BASE_URL}/on-answer" onHangup="${BASE_URL}/on-hangup" />`);
}
```

The first, `handleNewCall`, takes a request and a response object as arguments.
From the request body the two properties `from` and `to` are extracted and used to display a user-friendly message on the console.
Then the `Content-Type` header on the response is set to `application/xml` and an XML-formatted response is sent.
This response consists of a single `Response` tag containing two attributes, `onAnswer` and `onHangup`.
Each one is set to the URL that the corresponding events should be sent to.

```javascript
function handleOnAnswer(request, response) {
	const { from: caller, user: calleeName } = request.body;
	console.log(`${calleeName} answered call from ${caller}`);
	response.end();
}

function handleOnHangup(request, response) {
	console.log(`The call has been hung up`);
	response.end();
}
```

The other two functions work very similarly, but send only an empty response as that will be discarded by sipgate.io.

```javascript
const app = express();

app.use(express.urlencoded({ extended: true }));
```
Now, to actually handle incoming requests an _Express_ app is instantiated with `express()`.
Since the request data will be in `application/x-www-form-urlencoded` format, a middleware is registered on that instance to decode said data to a Javascript object.
The `extended` property is necessary to handle nested object structures.

```javascript
app.post('/new-call', handleNewCall);
app.post('/on-answer', handleOnAnswer);
app.post('/on-hangup', handleOnHangup);
```

In order to register the previously defined callback functions on the `app` instance, its `post` method is called with the desired route and the corresponding function.
For example, the address `https://your.server-address.com/new-call` will be mapped to the `handleNewCall` function.

```javascript
app.listen(PORT, () => {
	console.log(`Server listening on: http://localhost:${PORT}`);
});
```

Lastly, the server is started by calling the `listen` method on the `app` instance with the port that the application should be listening on and a callback function that is executed if the server is running successfully.
In this case it just prints a message to the console to tell the user where the server is listening.

## Common Issues

### web app displays "Feature sipgate.io not booked."
Possible reasons are:
- the sipgate.io feature is not booked for your account

See the section [Enabling sipgate.io for your sipgate account](#enabling-sipgateio-for-your-sipgate-account) for instruction on how to book sipgate.io


### "Error: listen EADDRINUSE: address already in use :::{port}"
Possible reasons are:
- another instance of the application is already running
- the specified port is in use by another application


### "Error: listen EACCES: permission denied 0.0.0.0:{port}"
Possible reasons are:
- you do not have permission to bind to the specified port.
  This usually occurs if you try to use port 80, 443 or another well-known port which can only be bound with superuser privileges


### Call happened but no webhook was received 
Possible reasons are:
- the configured webhook URL is incorrect
- the SSH tunnel was close in the background
- webhooks are not enabled for the phoneline that received the call


## Related
- [Express](https://expressjs.com/)


## Contact Us
Please let us know how we can improve this example.
If you have a specific feature request or found a bug, please use **Issues** or fork this repository and send a **pull request** with your improvements.


## License
This project is licensed under **The Unlicense** (see [LICENSE file](./LICENSE)).


## External Libraries
This code uses the following external libraries

- _Express_:
  - Licensed under the [MIT License](https://opensource.org/licenses/MIT)
  - Website: https://expressjs.com/


---

[sipgate.io](https://www.sipgate.io) | [@sipgateio](https://twitter.com/sipgateio) | [API-doc](https://api.sipgate.com/v2/doc)
