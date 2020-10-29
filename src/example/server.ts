import { RTCPeerConnection } from 'wrtc';
import * as http from 'http';
import { promiseUnwrap } from 'morglod_mystd/lib/promise-unwrap';
import { PromiseQueue } from 'morglod_mystd/lib/promise-queue';

type Acceptor = (remote: RTCSessionDescription) => Promise<RTCSessionDescription>;

type UnwrapperChannelWaiter = {
    resolve: (x: RTCDataChannel) => void;
    reject: (reason?: any) => any;
    promise: Promise<RTCDataChannel>;
};

export class RemoteConnectionListener {
    _conn!: RTCPeerConnection;
    _dcs: RTCDataChannel[] = [];

    _channelWaiters: {
        [label: string]: UnwrapperChannelWaiter
    } = {};

    async listen(remoteSDPOffer: RTCSessionDescription) {
        let pc = this._conn = new RTCPeerConnection();
        pc.ondatachannel = ev => {
            this._dcs.push(ev.channel);

            if (ev.channel.label in this._channelWaiters) {
                this._channelWaiters[ev.channel.label].resolve(ev.channel);
                delete this._channelWaiters[ev.channel.label];
            }
        };

        await pc.setRemoteDescription(remoteSDPOffer);
        let localSDP = await pc.createAnswer();
        await pc.setLocalDescription(localSDP);

        return pc.localDescription!;
    }

    async waitForChannel(channelLabel: string) {
        const found = this._dcs.find(x => x.label === channelLabel);
        if (found) return found;

        const waiter = this._channelWaiters[channelLabel] = promiseUnwrap();
        return waiter.promise;
    }
}

export class Server {
    _server!: http.Server;

    async listen(
        httpControlPort: number,
        httpControlPath: string = '/pre_connect',
    ) {
        const server = this._server = http.createServer(async (req, res) => {
            if (req.url !== httpControlPath) return;
            if (req.method !== 'POST') return;

            const payload: RTCSessionDescription = await new Promise(rslv => {
                let data = '';

                req.on('data', chunk => {
                    data += chunk;
                })
                req.on('end', () => {
                    rslv(JSON.parse(data));
                });
            });

            const accept = await this._pendingPreConnects.pop();
            const response = await accept(payload);

            res.write(JSON.stringify(response));
            res.end();
        });

        return new Promise(rslv => {
            server.once('listening', () => {
                rslv();
            });
    
            server.listen(httpControlPort);  
        });
    }

    _pendingPreConnects = new PromiseQueue<Acceptor>();

    accept() {
        return new Promise<RemoteConnectionListener>(rslv => {
            this._pendingPreConnects.push(async remoteSDP => {
                const rcl = new RemoteConnectionListener();
                const localSDP = await rcl.listen(remoteSDP);
                rslv(rcl);
                return localSDP;
            });
        });
    }
}