// Local stand-ins for the demo's socket (timesocket.io) and nebula (json-data.io) servers.
// Started by `yarn serve`. If another serve (or test run) already has the ports, that copy is reused.
import {createServer} from 'http';
import {Server} from 'socket.io';
import Gun from 'gun';

const SOCKET_PORT = 3131;
const GUN_PORT = 8181;

function listen(server, port, label) {
    return new Promise(resolve => {
        server.once('error', error => {
            if (error.code === 'EADDRINUSE') {
                console.log(`${label}: port ${port} already in use, reusing the running copy`);
                resolve(false);
                return;
            }
            throw error;
        });
        server.listen(port, () => {
            console.log(`${label} on http://localhost:${port}`);
            resolve(true);
        });
    });
}

const socketHttp = createServer();

if (await listen(socketHttp, SOCKET_PORT, 'socket.io (timecast)')) {
    const io = new Server(socketHttp, {cors: {origin: '*'}});
    setInterval(() => {
        io.emit('timecast', {stamp: new Date().toISOString()});
    }, 1000);
}

const gunHttp = createServer();

if (await listen(gunHttp, GUN_PORT, 'gun relay')) {
    Gun({web: gunHttp, file: 'dev/gun-data'});
}
