// import { IJitsiTrack } from "./i-jitsi-track";



const confOptions = {
    openBridgeChannel: true
}
var IJitsiConference = (function() {
    var JitsiMeetJS;
    var JitsiConnection;
    var JitsiTrack;
    var conference;
    var isJoined;


    //생성자 정의
    function IJitsiConference(JitsiMeetJS_Input, JitsiConnection_Input) {
        JitsiMeetJS = JitsiMeetJS_Input;
        JitsiConnection = JitsiConnection_Input;
        JitsiTrack = null;
        conference = null;
        isJoined = false;
    }

    IJitsiConference.prototype = {
        init: function(JITSI_ROOM_NAME) {
            const room = JitsiConnection.initJitsiConference(JITSI_ROOM_NAME, confOptions);
            //  JitsiTrack = new IJitsiTrack( JitsiMeetJS,  JitsiConnection, room);
            //  initTracks();
            room.on(JitsiMeetJS.events.conference.TRACK_ADDED, this.onRemoteTrackAdd.bind(this));
            room.on(JitsiMeetJS.events.conference.TRACK_REMOVED, this.onRemoteTrackRemove.bind(this));
            room.on(
                JitsiMeetJS.events.conference.CONFERENCE_JOINED,
                this.onConferenceJoined.bind(this));
            room.on(JitsiMeetJS.events.conference.USER_JOINED, this.onUserJoined.bind(this));
            room.on(JitsiMeetJS.events.conference.USER_LEFT, this.onUserLeft.bind(this));
            room.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, track => {
                logThis(`${track.getType()} - ${track.isMuted()}`);
            });
            room.on(
                JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED,
                (userID, displayName) => logThis(`${userID} - ${displayName}`));
            room.on(
                JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED,
                (userID, audioLevel) => logThis(`${userID} - ${audioLevel}`));
            room.on(
                JitsiMeetJS.events.conference.PHONE_NUMBER_CHANGED,
                () => logThis(`${room.getPhoneNumber()} - ${room.getPhonePin()}`));

            // set video quality constraints
            room.setReceiverVideoConstraint(1080);
            room.setSenderVideoConstraint(1080);

            room.join()
            conference = room;


            JitsiTrack = new IJitsiTrack(JitsiMeetJS, JitsiConnection, room);
            this.initTracks();
            this.bindWindowUnloadHandlers();

            return room;
        },

        onWindowUnload: function() {
            if (localTracks) {
                for (let i = 0; i < localTracks.length; i++) {
                    localTracks[i].dispose();
                }
                conference.leave();
                JitsiConnection.disconnect();
            }
        },

        bindWindowUnloadHandlers: function() {
            $(window).bind('beforeunload', this.onWindowUnload.bind(this));
            $(window).bind('unload', this.onWindowUnload.bind(this));
        },

        initTracks: function() {
            localTracks = JitsiTrack.createLocalTrack();
        },

        onRemoteTrackAdd: function(track) {
            logThis('on remote track', { track });
            JitsiTrack.addRemoteTrack(track);
        },

        onRemoteTrackRemove: function(track) {
            logThis('on remote remove', { track });
            JitsiTrack.removeRemoteTrack(track);
        },

        onConferenceJoined: function(...args) {
            logThis('conference joined', { args });
            isJoined = true;
            //  JitsiTrack.addTracksToRoom()
        },

        onUserJoined: function(id) {
            console.log('user join', { id });
            JitsiTrack.initUserTracks(id);
        },

        onUserLeft: function(id) {
            console.log('user left', { id });
            JitsiTrack.removeUserTracks(id);
        }
    }

    return IJitsiConference;
}());