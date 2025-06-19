import React, { useEffect, useRef, useState } from "react";
import './VideoCall.css';
import { v4 as uuidv4 } from "uuid";
import ChatBox from './ChatBox';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
  faDesktop,
  faDoorOpen,
  faUser,
  faUsers,
  faComments,
  faUserCircle
} from '@fortawesome/free-solid-svg-icons';


const BASE_URL = "https://video-conferencing-application-gmsl.onrender.com";

const VideoCall = () => {
  const localVideoRef = useRef();
  const remoteVideosRef = useRef({});
  const socketRef = useRef();
  const peersRef = useRef({});
  const streamRef = useRef(null);

  const [userId] = useState(localStorage.getItem("userId"));
  const [username] = useState(localStorage.getItem("username"));

  const [roomId, setRoomId] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState([]);

  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [meetingId, setMeetingId] = useState(null);



  const handleCreateRoom = async () => {
    try {
      const meetingCode = uuidv4().slice(0, 8).toUpperCase();

      if (!userId) return alert("User not logged in");

      const response = await fetch(`${BASE_URL}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "My Video Meeting",
          meetingCode,
          startTime: new Date().toISOString(),
          hostId: Number(userId),
        }),
      });

      const meeting = await response.json();
      setRoomId(meeting.meetingCode);
      setCreatedRoomId(meeting.meetingCode);
      setMeetingId(meeting.id);
    } catch (e) {
      alert("Room creation failed");
    }
  };

  const handleJoinRoom = async () => {
    if (!roomId) return alert("Enter Room ID");

    try {
      const res = await fetch(`${BASE_URL}/meetings/code/${roomId}`);
      const meeting = await res.json();
      setMeetingId(meeting.id);
      setJoined(true);

      socketRef.current = new WebSocket(`${BASE_URL.replace("https", "wss")}/ws/signaling`);

      socketRef.current.onopen = async () => {
        await startLocalStream();
        sendSignal({ type: "join", roomId, sender: userId });
      };

      socketRef.current.onmessage = async (msg) => {
        const data = JSON.parse(msg.data);
        if (data.sender === userId) return;

        switch (data.type) {
          case "join":
            console.log("🔁 New user joined, sending offer to:", data.sender);
            createOffer(data.sender);
            break;

          case "offer":
            console.log("📨 Received offer from:", data.sender);
            await handleOffer(data);
            break;

          case "answer":
            console.log("📨 Received answer from:", data.sender);
            await peersRef.current[data.sender]?.setRemoteDescription(new RTCSessionDescription(data.sdp));
            break;

          case "ice-candidate":
            console.log("📨 Received ICE candidate from:", data.sender);
            await peersRef.current[data.sender]?.addIceCandidate(new RTCIceCandidate(data.candidate));
            break;

          case "user-left":
            console.log("👋 User left:", data.sender);
            const leftId = data.sender;

            const video = remoteVideosRef.current[leftId];
            if (video && video.parentNode) {
              video.classList.add("fade-out");
              setTimeout(() => {
                if (video.parentNode) {
                  video.parentNode.removeChild(video);
                }
              }, 500);
            }
            delete remoteVideosRef.current[leftId];

            setParticipants((prev) => prev.filter((id) => id !== leftId));

            if (peersRef.current[leftId]) {
              peersRef.current[leftId].close();
              delete peersRef.current[leftId];
            }
            break;

          default:
            console.warn("❓ Unknown message type:", data.type);
        }
      };
    } catch (err) {
      alert("Join room failed");
      console.error("Join error:", err);
    }
  };


  const startLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    streamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
  };

 const createPeer = (targetId) => {
   const peer = new RTCPeerConnection({
     iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
   });


   console.log(`🔧 Creating peer connection to: ${targetId}`);


   peer.onicecandidate = (e) => {
     if (e.candidate) {
       console.log(`🧊 Sending ICE candidate to: ${targetId}`);
       sendSignal({
         type: "ice-candidate",
         candidate: e.candidate,
         sender: userId,
         target: targetId,
       });
     }
   };


   peer.ontrack = (e) => {
     console.log(`🎥🔊 Received remote track from ${targetId}`);
     const stream = e.streams[0];
     let videoEl = remoteVideosRef.current[targetId];

     if (!videoEl) {
       videoEl = document.createElement("video");
       videoEl.autoplay = true;
       videoEl.playsInline = true;
       videoEl.width = 250;
       videoEl.controls = false;
       videoEl.srcObject = stream;

       remoteVideosRef.current[targetId] = videoEl;

       const container = document.getElementById("remote-container");
       if (container) container.appendChild(videoEl);
     }


     setParticipants((prev) => [...new Set([...prev, targetId])]);
   };


   if (streamRef.current) {
     streamRef.current.getTracks().forEach((track) => {
       console.log(`🔄 Adding local ${track.kind} track to peer for ${targetId}`);
       peer.addTrack(track, streamRef.current);
     });
   } else {
     console.warn("⚠️ streamRef.current is null when creating peer.");
   }

   peersRef.current[targetId] = peer;
   return peer;
 };

  const createOffer = async (targetId) => {
    const peer = createPeer(targetId);
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    sendSignal({ type: "offer", sdp: offer, sender: userId, target: targetId });
  };

  const handleOffer = async (data) => {
    const peer = createPeer(data.sender);
    await peer.setRemoteDescription(new RTCSessionDescription(data.sdp));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    sendSignal({ type: "answer", sdp: answer, sender: userId, target: data.sender });
  };

  const sendSignal = (data) => {
    socketRef.current.send(JSON.stringify({ ...data, roomId }));
  };

  const toggleVideo = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setVideoEnabled(track.enabled);
    }
  };

  const toggleAudio = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setAudioEnabled(track.enabled);
    }
  };

const startScreenShare = async () => {
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });

    const screenTrack = screenStream.getVideoTracks()[0];


    Object.values(peersRef.current).forEach((peer) => {
      const senders = peer.getSenders();
      const videoSender = senders.find(sender => sender.track?.kind === 'video');
      if (videoSender) {
        videoSender.replaceTrack(screenTrack);
      }
    });


    if (localVideoRef.current) {
      localVideoRef.current.srcObject = screenStream;
    }


    screenTrack.onended = async () => {
      const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const newVideoTrack = webcamStream.getVideoTracks()[0];
      streamRef.current = webcamStream;

      Object.values(peersRef.current).forEach((peer) => {
        const senders = peer.getSenders();
        const videoSender = senders.find(sender => sender.track?.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(newVideoTrack);
        }
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = webcamStream;
      }
    };

  } catch (err) {
    alert("Screen share failed or canceled");
    console.error("Screen share error:", err);
  }
};



  const leaveMeeting = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      sendSignal({ type: "user-left", sender: userId });
    }

    streamRef.current?.getTracks().forEach((t) => t.stop());
    Object.values(peersRef.current).forEach((p) => p.close());
    socketRef.current?.close();

    setJoined(false);
    setParticipants([]);
    peersRef.current = {};
    remoteVideosRef.current = {};
    streamRef.current = null;

    document.getElementById("remote-container").innerHTML = "";
  };




<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
/>

   return (
      <div className="video-container">
        <header className="header">
          <img
            src="https://img.freepik.com/premium-vector/facetime-app-icon-video-audio-chatting-platform_277909-629.jpg?w=900"
            alt="Logo"
            className="logo"
          />
          <h2>Video Conferencing</h2>
        </header>

        {!joined ? (
          <div className="join-section">
            <button onClick={handleCreateRoom} className="join-button">➕ Create Room</button>
            {createdRoomId && (
              <p className="room-id-text">
                🆔 Room ID: <strong>{createdRoomId}</strong>
              </p>
            )}
            <input
              type="text"
              placeholder="🔑 Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="room-id-input"
            />
            <button onClick={handleJoinRoom} className="join-button">🚪 Join Room</button>
          </div>
        ) : (
          <div className="conference-section">
            <div className="main-video-area">
              <div className="participant-count">
                <p><FontAwesomeIcon icon={faDoorOpen} /> Room: {roomId}</p>
{/*                 <p><FontAwesomeIcon icon={faUser} /> Your ID: {userId}</p> */}
                <p><FontAwesomeIcon icon={faUser} /> You: <strong>{username}</strong></p>

                <p><FontAwesomeIcon icon={faUsers} /> Participants: {participants.length + 1}</p>
              </div>

              <div className="local-video-container">
                <h4><FontAwesomeIcon icon={faUserCircle} /> Your Video</h4>
                <video ref={localVideoRef} autoPlay muted playsInline className="local-video" />
              </div>

              <div id="remote-container" className="remote-videos-container" />

              <div className="video-controls">
                <button
                  onClick={toggleVideo}
                  title={videoEnabled ? "Turn Off Video" : "Turn On Video"}
                >
                  <FontAwesomeIcon icon={videoEnabled ? faVideo : faVideoSlash} bounce />
                </button>

                <button
                  onClick={toggleAudio}
                  className="tooltip-btn"
                  data-tooltip={audioEnabled ? "Mute Microphone" : "Unmute Microphone"}
                >
                  <FontAwesomeIcon icon={audioEnabled ? faMicrophone : faMicrophoneSlash} />
                </button>

                <button onClick={startScreenShare} title="Share Screen">
                  <FontAwesomeIcon icon={faDesktop} spin />
                </button>

               <button
                 onClick={leaveMeeting}
                 title="Leave Meeting"
                 className="leave-button"
                 style={{ backgroundColor: "#e74c3c", color: "white" }}
               >
                 <FontAwesomeIcon icon={faDoorOpen} />
               </button>

              </div>
            </div>

            <div className="chat-section">
              <h3 className="chat-title">
                <FontAwesomeIcon icon={faComments} /> Meeting Chat
              </h3>
              {meetingId && userId && <ChatBox meetingId={meetingId} senderId={userId} />}
            </div>
          </div>
        )}
      </div>
    );
  };

export default VideoCall;