import { Client } from "./client";
import { Server } from "./server";

async function runClient() {
    const client = new Client();
    await client.connect('127.0.0.1', 9922, 'http://localhost:9922/pre_connect');

    client.send('hello world');
    client.send('my time is ' + new Date);

    console.log('client local', client._conn.localDescription);
    console.log('client remote', client._conn.remoteDescription);
}

async function runServer() {
    const server = new Server();
    await server.listen(9922, '/pre_connect');

    console.log(new Date, 'server listening on:', server._server.address(), 'for POST /pre_connect');

    const connection = await server.accept();
    const dc = await connection.waitForChannel('sendChannel');

    dc.addEventListener('message', ev => {
        console.log(new Date, 'server recieved:', ev.data);
    });

    console.log('server local', connection._conn.localDescription);
    console.log('server remote', connection._conn.remoteDescription);
}

(async function run() {
    Promise.all([
        runClient(),
        runServer(),
    ])
})();