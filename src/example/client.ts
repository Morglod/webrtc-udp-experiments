import { RTCPeerConnection, RTCIceCandidate } from 'wrtc';
import axios from 'axios';

const remoteControlPacketRequest = (httpControlURL: string, remoteSDPOffer: RTCSessionDescription): Promise<RTCSessionDescription> => {
    return axios({
        method: 'POST',
        url: httpControlURL,
        data: JSON.stringify(remoteSDPOffer)
    }).then(x => x.data);
};

export class Client {
    _conn!: RTCPeerConnection;
    _dc!: RTCDataChannel;

    async connect(
        address: string,
        port: number,
        httpControlURL: string,
    ) {
        if (this._conn) throw new Error('already connected');

        const pc = this._conn = new RTCPeerConnection();
        const dc = this._dc = pc.createDataChannel('sendChannel');


        // const candidateStr = iceCandidateStr({
        //     foundation: Math.floor(Math.random() * 999999999).toString().substr(0, '932508327'.length), // '932508327',
        //     component: 'rtp',
        //     protocol: 'udp',
        //     address: address,
        //     port: port,
        //     type: 'host',
        //     networkId: 1,
        //     priority: 1,
        //     usernameFragment: 'pmj5'
        // });

        // console.log(candidateStr);

        // const cond = new RTCIceCandidate({
        //     candidate: candidateStr
        // });

        // await pc.addIceCandidate(cond);

        let localSDP = await pc.createOffer();
        await pc.setLocalDescription(localSDP);

        let remoteSDP = await remoteControlPacketRequest(httpControlURL, pc.localDescription!);
        
        return new Promise(async rslv => {
            await pc.setRemoteDescription(remoteSDP);
            dc.addEventListener('open', () => rslv());
        });
    }

    send(msg: string | Blob | ArrayBuffer | ArrayBufferView) {
        this._dc.send(msg as any);
    }

    close() {
        this._dc.close();
        this._conn.close();
    }
}