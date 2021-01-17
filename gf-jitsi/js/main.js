console.log('here!!');
// import { IJitsiConference } from "./i-jitsi-conference";
// import { IJitsiTrack } from "./i-jitsi-track";

let JitsiMeet;
let JitsiConnection;
const JITSI_ROOM_NAME = 'gftest1';
const connectionOptions = {
    hosts: {
        domain: 'beta.meet.jit.si',
        muc: 'conference.beta.meet.jit.si' // FIXME: use XEP-0030
    },
    bosh: `https://beta.meet.jit.si/http-bind?room=${JITSI_ROOM_NAME}`,
    serviceUrl: `https://beta.meet.jit.si/http-bind?room=${JITSI_ROOM_NAME}`,
    // The name of client node advertised in XEP-0115 'c' stanza
    clientNode: 'http://beta.meet.jit.si/jitsimeet',
    openBridgeChannel: true,
    enableWelcomePage: true,
    id: 'gf',
    password: 'gf'
}

const onConnectionSuccess = () => {
    console.log('Jitsi Connection Success');
    $('#jitsi-room').show();
    const jitsiConf = new IJitsiConference(JitsiMeetJS, JitsiConnection);
    const room = jitsiConf.init(JITSI_ROOM_NAME);
    window.myConf = room;
    window.myJitsiMeetJS = JitsiMeetJS;
    window.myJitsiConnection = JitsiConnection;
}

const onConnectionFailed = () => {
    console.log('Jitsi connection failed');
}

const disconnect = () => {
    console.log('Jitsi disconnected');
}

const initJitsiComponent = () => {
    try {
        if (JitsiMeetJS) {
            JitsiMeet = JitsiMeetJS.init();
            JitsiConnection = new JitsiMeetJS.JitsiConnection(null, null, connectionOptions);
            JitsiConnection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionSuccess);
            JitsiConnection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, onConnectionFailed);
            JitsiConnection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, disconnect);
            JitsiConnection.connect();
        } else {
            console.log('Error loading jitsi lib');
        }
    } catch (error) {
        console.error(error);
    }
}

initJitsiComponent();
JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);