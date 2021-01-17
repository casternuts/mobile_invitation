const logThis = (log, data) => {
    // console.log('POC : ', log, data);
}
var IJitsiTrack = (function() {
    var JitsiMeetJS;
    var JitsiConnection;
    var JitsiConference;
    var remoteTracks;
    var localTracks;

    //생성자 정의
    function IJitsiTrack(JitsiMeetJS_Input, JitsiConnection_Input, JitsiConference_Input) {
        JitsiMeetJS = JitsiMeetJS_Input;
        JitsiConnection = JitsiConnection_Input;
        JitsiConference = JitsiConference_Input;
        remoteTracks = {};
        localTracks = [];
    }

    IJitsiTrack.prototype = {
        createLocalTrack: function() {
            JitsiMeetJS.createLocalTracks({
                    devices: ['audio', 'video'],
                    facingMode: 'user'
                })
                .then((tracks) => {
                    this.localTracks = this.onLocalTracksInit(tracks);
                    return this.localTracks;
                })
                .catch(error => {
                    throw error;
                });
        },

        onLocalTracksInit: function(tracks) {
            this.localTracks = tracks;
            for (let i = 0; i < this.localTracks.length; i++) {
                this.localTracks[i].addEventListener(
                    JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
                    audioLevel => console.log(`Audio Level local: ${audioLevel}`));
                this.localTracks[i].addEventListener(
                    JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
                    () => console.log('local track muted'));
                this.localTracks[i].addEventListener(
                    JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
                    () => console.log('local track stoped'));
                this.localTracks[i].addEventListener(
                    JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
                    deviceId =>
                    console.log(
                        `track audio output device was changed to ${deviceId}`));
                if (this.localTracks[i].getType() === 'video') {
                    this.createVideoTrackUI(`localVideo${i}`);
                    // if($(`#localVideo${i}`).length < 1) {
                    //     $('#jitsi-video-tracks').append(`<video autoplay='1' id='localVideo${i}' style='width:180px; height: 300px; object-fit:cover; margin: 10px'/>`);
                    //     this.localTracks[i].attach($(`#localVideo${i}`)[0]);
                    // }
                    this.localTracks[i].attach($(`#localVideo${i}`)[0]);
                } else {
                    if ($(`#localAudio${i}`).length < 1) {
                        $('#jitsi-audio-tracks').append(
                            `<audio autoplay='1' muted='true' id='localAudio${i}' />`);
                        this.localTracks[i].attach($(`#localAudio${i}`)[0]);
                    }
                }
                if (JitsiConference.isJoined) {
                    JitsiConference.addTrack(this.localTracks[i]);
                }
            }
            return this.localTracks;
        },

        addRemoteTrack: function(track) {
            if (track.isLocal()) {
                return;
            }
            const participant = track.getParticipantId();

            if (!remoteTracks[participant]) {
                remoteTracks[participant] = [];
            }
            const idx = remoteTracks[participant].push(track);

            track.addEventListener(
                JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
                audioLevel => console.log(`Audio Level remote: ${audioLevel}`));
            track.addEventListener(
                JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
                () => console.log('remote track muted'));
            track.addEventListener(
                JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
                () => console.log('remote track stoped'));
            track.addEventListener(JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
                deviceId =>
                console.log(
                    `track audio output device was changed to ${deviceId}`));
            const id = participant + track.getType() + idx;
            if (track.getType() === 'video') {
                this.createVideoTrackUI(`${participant}video${idx}`);
            } else {
                if ($(`#${participant}audio${idx}`).length <= 0) {
                    $('#jitsi-audio-tracks').append(
                        `<audio autoplay='1' id='${participant}audio${idx}' />`);
                }
            }
            track.attach($(`#${id}`)[0]);
        },

        createVideoTrackUI: function(DOMId) {
            if ($(`#${DOMId}`).length <= 0) {
                $('#jitsi-video-tracks').append(
                    `<div id="video-container-${DOMId}" class="video-container" style="display:inline-block; vertical-align:middle;">
                        <video autoplay='1' id='${DOMId}' style='width:200px; height: 140px; object-fit:cover; margin: 10px; transform:rotateY(180deg)'></video>
                        <button class="microphone-btn" id='${DOMId}-microphone'>Mute</button>
                        <button class="camera-btn" id='${DOMId}-camera'>Camera</button>
                    </div>
                    `
                );
            }
        },

        removeRemoteTrack: function(track) {
            if (track.isLocal()) {
                return;
            }

            const participant = track.getParticipantId();
            if (remoteTracks[participant]) {
                delete remoteTracks[participant];
            }

            const idx = track.getId();
            track.removeEventListener(JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED, () => {});
            track.removeEventListener(JitsiMeetJS.events.track.TRACK_MUTE_CHANGED, () => {});
            track.removeEventListener(JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED, () => {});
            track.removeEventListener(JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED, () => {});
            if (track.getType() === 'video') {
                // $(`video[id^='${participant}video']`).remove();
                $(`div[id^='video-container-${participant}video']`).remove();
            } else {
                // $(`audio[id^='${participant}audio']`).remove();
                $(`audio[id^='${participant}audio']`).remove();
            }
            track.detach(track.containers[0]);
        },

        initUserTracks: function(userId) {
            remoteTracks[userId] = [];
        },

        removeUserTracks: function(userId) {
            console.log('user left');
            if (!remoteTracks[userId]) {
                return;
            }
            const tracks = remoteTracks[userId];

            for (let i = 0; i < tracks.length; i++) {
                tracks[i].detach($(`#${userId}${tracks[i].getType()}`));
            }
        },

        addTracksToRoom: function() {
            for (let i = 0; i < this.localTracks.length; i++) {
                JitsiConference.addTrack(this.localTracks[i]);
            }
        },
        onGetTrack: function() {
            console.log('onGetTrack', remoteTracks);
            return remoteTracks;
        }

    }

    return IJitsiTrack;
}());