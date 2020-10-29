
export const iceCandidateStr = (params: {
    /** Containing a unique identifier that is the same for any candidates of the same type, share the same base (the address from which the ICE agent sent the candidate), and come from the same STUN server. This is used to help optimize ICE performance while prioritizing and correlating candidates that appear on multiple RTCIceTransport objects. */
    foundation: string,
    component: 'rtp'|'rtcp',
    protocol: 'tcp'|'udp',
    priority: number,
    address: string,
    port: number,
    type: 'host',
    /** user name */
    usernameFragment: string,
    tcptype?: 'passive',
    networkId: number,
    networkCost?: number,
}) => `a=candidate:${params.foundation} ${params.component === 'rtp' ? '1' : '2'} ${params.protocol} ${params.priority} ${params.address} ${params.port} typ ${params.type} ${params.tcptype ? `tcptype ${params.tcptype}` : ''} generation 0 ufrag ${params.usernameFragment} network-id ${params.networkId} ${params.networkCost ? `network-cost ${params.networkCost}` : ''}`;
