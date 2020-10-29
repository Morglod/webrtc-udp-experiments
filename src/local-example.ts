import { RTCPeerConnection, RTCIceCandidate } from 'wrtc';
import { iceCandidateStr } from './utils';

function requestConnection(): Promise<RTCDataChannel> {
    let pc = new RTCPeerConnection();
    const dc = pc.createDataChannel('sendChannel');
    dc.addEventListener('*', (ename) => console.log('client dc:', ename));

    // const candidateStr = iceCandidateStr({
    //     foundation: '932508327',
    //     component: 'rtp',
    //     protocol: 'udp',
    //     address: '127.0.0.1',
    //     port: 6323,
    //     type: 'host',
    //     networkId: 1,
    //     priority: 1,
    //     usernameFragment: 'pmj5'
    // });
    // const cond = new RTCIceCandidate({
    //     sdpMLineIndex: 1,
    //     candidate: candidateStr
    // });

    // pc.addIceCandidate(cond);

    return new Promise(async rslv => {
        let localSDP = await pc.createOffer();
        await pc.setLocalDescription(localSDP);
        let remoteSDP = await handleRequest(pc.localDescription!);
        await pc.setRemoteDescription(remoteSDP);

        console.log('okok');
        dc.onopen = () => rslv(dc);
    });
}

async function handleRequest(remoteSDPOffer: RTCSessionDescription) {
    let pc = new RTCPeerConnection();
    pc.ondatachannel = ev => {
        console.log('on data channel')
        const channel = ev.channel;
        channel.addEventListener('*', (ename) => console.log('remote dc:', ename));
        channel.onmessage = ev2 => {
            console.log('remote', ev2.data);
        };
    };

    await pc.setRemoteDescription(remoteSDPOffer);
    let localSDP = await pc.createAnswer();
    await pc.setLocalDescription(localSDP);

    return pc.localDescription!;
}

async function test() {
    const dc = await requestConnection();
    console.log('send');
    dc.send('hello');
}

test();