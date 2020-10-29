// https://tools.ietf.org/html/rfc4566 page 9

export type SDPBase = {
    /**
     * The "v=" field gives the version of the Session Description Protocol.  
     * This memo defines version 0.  There is no minor version number.
     */
    version: string,
    sessionOrigin: string | SessionOriginParams,
    
    /**
     * The "s=" field is the textual session name.  There MUST be one and  
     * only one "s=" field per session description.  The "s=" field MUST NOT  
     * be empty and SHOULD contain ISO 10646 characters (but see also the  
     * "a=charset" attribute).  If a session has no meaningful name, the  
     * value "s= " SHOULD be used (i.e., a single space as the session  
     * name).
     */
    sessionName: string,
    info?: string,
    descriptionURI?: string,
    email?: string,
    phoneNumber?: string,
    connectionData?: string | SessionConnectionData,
    bandwidthInfo?: (string | SessionBandwidth)[],
    timezone?: string,
    encryptionKey?: string,
    sessionAttribute?: string[],
};

export const sdpBaseToProtocol: {
    [f in keyof Required<SDPBase>]: string | {
        attr: string,
        toString: (singleValue: Required<SDPBase>[f] extends any[] ? Required<SDPBase>[f][0] : Required<SDPBase>[f]) => string,
    }
} = {
    version: {
        attr: 'v',
        toString: x => x,
    },
    sessionOrigin: {
        attr: 'o',
        toString: x => typeof x === 'string' ? x : sessionOriginToString(x),
    },
    sessionName: 's',
    info: 'i',
    descriptionURI: 'u',
    email: 'e',
    phoneNumber: 'p',
    connectionData: {
        attr: 'c',
        toString: x => typeof x === 'string' ? x : sessionConnectionDataToString(x),
    },
    bandwidthInfo: {
        attr: 'b',
        toString: x => typeof x === 'string' ? x : sessionBandwidthToString(x),
    },
    timezone: 'z',
    encryptionKey: 'k',
    sessionAttribute: 'a',
};

export type SDPTime = {
    activeTime: string | SessionTiming,
    timesRepeat?: (string | SessionRepeatTiming)[],
};

export const sdpTimeToProtocol: {
    [f in keyof Required<SDPTime>]: string | {
        attr: string,
        toString: (singleValue: Required<SDPTime>[f] extends any[] ? Required<SDPTime>[f][0] : Required<SDPTime>[f]) => string,
    }
} = {
    activeTime: {
        attr: 't',
        toString: x => typeof x === 'string' ? x : sessionTimingToString(x),
    },
    timesRepeat: {
        attr: 'r',
        toString: x => typeof x === 'string' ? x : sessionRepeatTimingToString(x),
    },
};

export type SDPMedia = {
    mediaNameAndTransport: string | SessionMediaDescParams,
    mediaTitle?: string,
    mediaConnectionData?: string | SessionConnectionData,
    mediaBandwidth?: (string|SessionBandwidth)[],
    mediaEncryptionKey?: string,
    mediaAttribute?: string,
};

export const sdpMediaToProtocol: {
    [f in keyof Required<SDPMedia>]: string | {
        attr: string,
        toString: (singleValue: Required<SDPMedia>[f] extends any[] ? Required<SDPMedia>[f][0] : Required<SDPMedia>[f]) => string,
    }
} = {
    mediaNameAndTransport: {
        attr: 'm',
        toString: x => typeof x === 'string' ? x : sessionMediaDescToString(x),
    },
    mediaTitle: 'i',
    mediaConnectionData: 'c',
    mediaBandwidth: 'b',
    mediaEncryptionKey: 'k',
    mediaAttribute: 'a',
};

export type SessionOriginParams = {
    /**
     * the user's login on the originating host, or it is "-"  
     * if the originating host does not support the concept of user IDs.  
     * The <username> MUST NOT contain spaces
     */
    "username": string,

    /**
     * numeric string such that the tuple of <username>,  
     * <sess-id>, <nettype>, <addrtype>, and <unicast-address> forms a  
     * globally unique identifier for the session.  The method of  
     * <sess-id> allocation is up to the creating tool, but it has been  
     * suggested that a Network Time Protocol (NTP) format timestamp be  
     * used to ensure uniqueness [13].
     */
    "sess-id": string,

    /**
     * version number for this session description.  Its  
     * usage is up to the creating tool, so long as <sess-version> is  
     * increased when a modification is made to the session data.  Again,  
     * it is RECOMMENDED that an NTP format timestamp is used.
     */
    "sess-version": string,

    /**
     * text string giving the type of network.  Initially  
     * "IN" is defined to have the meaning "Internet", but other values  
     * MAY be registered in the future (see Section 8).
     */
    "nettype": 'IN',

    /**
     * text string giving the type of the address that  
     * follows.  Initially "IP4" and "IP6" are defined, but other values  
     * MAY be registered in the future (see Section 8).
     */
    "addrtype": 'IP4' | 'IP6',

    /**
     * is the address of the machine from which the  
     * session was created.  For an address type of IP4, this is either  
     * the fully qualified domain name of the machine or the dotted-  
     * decimal representation of the IP version 4 address of the machine.  
     * For an address type of IP6, this is either the fully qualified  
     * domain name of the machine or the compressed textual  
     * representation of the IP version 6 address of the machine.  For  
     * both IP4 and IP6, the fully qualified domain name is the form that  
     * SHOULD be given unless this is unavailable, in which case the  
     * globally unique address MAY be substituted.  A local IP address  
     * MUST NOT be used in any context where the SDP description might  
     * leave the scope in which the address is meaningful (for example, a  
     * local address MUST NOT be included in an application-level  
     * referral that might leave the scope).
     */
    "unicast-address": string,
};

export const basicSessionOriginObj = (params: {
    addrtype: 'IP4' | 'IP6',
    address: string,
}): SessionOriginParams => ({
    username: '-',
    "sess-id": Math.floor(Math.random() * 999999).toString(),
    "sess-version": '2',
    nettype: 'IN',
    "unicast-address": params.address,
    addrtype: params.addrtype,
});

export const sessionOriginSortParams = (params: SessionOriginParams): SessionOriginParams => ({
    username: params["username"],
    "sess-id": params["sess-id"],
    "sess-version": params["sess-version"],
    nettype: params["nettype"],
    addrtype: params["addrtype"],
    "unicast-address": params["unicast-address"],
});

export const sessionOriginToString = (params: SessionOriginParams) => {
    return Object.values(sessionOriginSortParams(params)).join(' ');
};

export type SessionConnectionData = {
    "nettype": 'IN',
    "addrtype": 'IP4' | 'IP6',
    "connection-address": string,
};

export const sessionConnectionDataSortParams = (params: SessionConnectionData): SessionConnectionData => ({
    "nettype": params["nettype"],
    "addrtype": params["addrtype"],
    "connection-address": params["connection-address"],
});

export const sessionConnectionDataToString = (params: SessionConnectionData) => {
    return Object.values(sessionConnectionDataSortParams(params)).join(' ');
};

export type SessionBandwidth = {
    /** 
     * `CT` If the bandwidth of a session or media in a session is different  
     *  from the bandwidth implicit from the scope, a "b=CT:..." line  
     *  SHOULD be supplied for the session giving the proposed upper limit  
     *  to the bandwidth used (the "conference total" bandwidth).  The  
     *  primary purpose of this is to give an approximate idea as to  
     *  whether two or more sessions can coexist simultaneously.  When  
     *  using the CT modifier with RTP, if several RTP sessions are part  
     *  of the conference, the conference total refers to total bandwidth  
     *  of all RTP sessions.  
     *  
     *  `AS` The bandwidth is interpreted to be application specific (it will  
     *  be the application's concept of maximum bandwidth).  Normally,  
     *  this will coincide with what is set on the application's "maximum  
     *  bandwidth" control if applicable.  For RTP-based applications, AS  
     *  gives the RTP "session bandwidth" as defined in Section 6.2 of  
     *  [19].  
     *   
     * Note that CT gives a total bandwidth figure for all the media at all  
     * sites.  AS gives a bandwidth figure for a single media at a single  
     * site, although there may be many sites sending simultaneously.  
     */
    "bwtype": 'CT' | 'AS',
    /** interpreted as kilobits per second by default */
    "bandwidth": string| number,
};

export const sessionBandwidthSortParams = (params: SessionBandwidth): SessionBandwidth => ({
    bwtype: params.bwtype,
    bandwidth: params.bandwidth,
});

export const sessionBandwidthToString = (params: SessionBandwidth) => {
    return `${params.bwtype}:${params.bandwidth}`;
};

export const baseSessionBandwidth = (): SessionBandwidth => ({
    bwtype: 'AS',
    bandwidth: 30,
});

export type SessionTiming = {
    "start-time": string|number,
    "stop-time": string|number,
};

export const baseSessionTimeParams = (): SessionTiming => ({
    "start-time": 0,
    "stop-time": 0,
});

export const sessionTimingToString = (params: SessionTiming) => {
    return `${params["start-time"]} ${params["stop-time"]}`;
};

export type SessionRepeatTiming = {
    repeatInterval: string,
    activeDuration: string,
    offsetsFromStartTime: string,
};

export const sessionRepeatTimingToString = (params: SessionRepeatTiming) => {
    return `${params.repeatInterval} ${params.activeDuration} ${params.offsetsFromStartTime}`;
};

export type SessionMediaDescParams = {
    media: 'audio' | 'video' | 'text' | 'application' | 'message',
    /**  
     * port multicast:  
     *   
     * example: `49170/2`  
     *   
     * would specify that ports 49170 and 49171 form one RTP/RTCP pair  
     * and 49172 and 49173 form the second RTP/RTCP pair.  RTP/AVP is the  
     * transport protocol and 31 is the format (see below).  If non-  
     * contiguous ports are required, they must be signalled using a  
     * separate attribute (for example, "a=rtcp:" as defined in [22]).  
     */
    port: string,

    proto: 'udp' | 'RTP/AVP' | 'RTP/SAVP' | 'UDP/DTLS/SCTP',

    /** eg `webrtc-datachannel` */
    fmt: string,
};

export const sessionMediaDescToString = (params: SessionMediaDescParams) => {
    return `${params.media} ${params.port} ${params.proto} ${params.fmt}`;
};

export type SDPAttributes = Partial<{
    cat: string,
    keywds: string,
    tool: string,
    ptime: string,
    maxptime: string,
    /** <payload type> <encoding name>/<clock rate> [/<encoding parameters> */
    rtpmap: string,
    recvonly: boolean,
    sendrecv: boolean,
    sendonly: boolean,
    inactive: boolean,
    orient: string,
    /**
     * This specifies the type of the conference.  Suggested values  
     * are "broadcast", "meeting", "moderated", "test", and "H332".  
     * "recvonly" should be the default for "type:broadcast" sessions,  
     * "type:meeting" should imply "sendrecv", and "type:moderated"  
     * should indicate the use of a floor control tool and that the  
     * media tools are started so as to mute new sites joining the  
     * conference.  
     *   
     * Specifying the attribute "type:H332" indicates that this  
     * loosely coupled session is part of an H.332 session as defined  
     * in the ITU H.332 specification [26].  Media tools should be  
     * started "recvonly".  
     *   
     * Specifying the attribute "type:test" is suggested as a hint  
     * that, unless explicitly requested otherwise, receivers can  
     * safely avoid displaying this session description to users.  
     *   
     * The type attribute is a session-level attribute, and it is not  
     * dependent on charset.  
     */
    type: "broadcast" | "meeting" | "moderated" | "test" | "H332",
    charset: string,
    sdplang: string,
    lang: string,
    framerate: string,
    quality: string,
    fmtp: string,
}>;

export const sdpAttrToString = (attr: string, value: any) => {
    if (typeof value === 'boolean') return attr;
    return `${attr}:${value}`;
};