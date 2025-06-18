// import React, { useEffect, useRef, useState } from "react";
// import { v4 as uuidv4 } from "uuid";

// const VideoCall = () => {
//   const localVideoRef = useRef();
//   const remoteVideoRef = useRef();
//   const peerRef = useRef();
//   const socketRef = useRef();
//   const [roomId] = useState("room1");
//   const [userId] = useState(uuidv4());

//   useEffect(() => {
//     // Connect WebSocket
//     socketRef.current = new WebSocket("ws://localhost:8080/signal");

//     socketRef.current.onmessage = async (message) => {
//       const data = JSON.parse(message.data);

//       switch (data.type) {
//         case "offer":
//           await handleOffer(data);
//           break;
//         case "answer":
//           await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
//           break;
//         case "ice-candidate":
//           await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
//           break;
//         default:
//           break;
//       }
//     };

//     startLocalStream();

//     return () => socketRef.current?.close();
//   }, []);

//   const startLocalStream = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//     localVideoRef.current.srcObject = stream;

//     // Setup PeerConnection
//     setupPeer(stream);
//   };

//   const setupPeer = (stream) => {
//     const config = {
//       iceServers: [
//         { urls: "stun:stun.l.google.com:19302" } // Add TURN servers if needed
//       ],
//     };

//     peerRef.current = new RTCPeerConnection(config);

//     // Send ICE candidates to peer
//     peerRef.current.onicecandidate = (e) => {
//       if (e.candidate) {
//         sendSignal({
//           type: "ice-candidate",
//           candidate: e.candidate,
//           target: roomId,
//           sender: userId,
//         });
//       }
//     };

//     // Show remote stream
//     peerRef.current.ontrack = (e) => {
//       remoteVideoRef.current.srcObject = e.streams[0];
//     };

//     // Add local tracks
//     stream.getTracks().forEach((track) => {
//       peerRef.current.addTrack(track, stream);
//     });

//     // Create offer
//     peerRef.current.onnegotiationneeded = async () => {
//       const offer = await peerRef.current.createOffer();
//       await peerRef.current.setLocalDescription(offer);

//       sendSignal({
//         type: "offer",
//         sdp: offer,
//         target: roomId,
//         sender: userId,
//       });
//     };
//   };

//   const handleOffer = async (data) => {
//     if (!peerRef.current) {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//       localVideoRef.current.srcObject = stream;
//       setupPeer(stream);
//     }

//     await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
//     const answer = await peerRef.current.createAnswer();
//     await peerRef.current.setLocalDescription(answer);

//     sendSignal({
//       type: "answer",
//       sdp: answer,
//       target: data.sender,
//       sender: userId,
//     });
//   };

//   const sendSignal = (data) => {
//     socketRef.current.send(JSON.stringify(data));
//   };

//   return (
//     <div className="video-call">
//       <video ref={localVideoRef} autoPlay muted playsInline style={{ width: "300px" }} />
//       <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "300px" }} />
//     </div>
//   );
// };


import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import './VideoCall.css';
import ChatBox from './ChatBox';

const BASE_URL = "https://video-conferencing-application-gmsl.onrender.com";

const VideoCall = () => {
  const localVideoRef = useRef();
  const remoteVideosRef = useRef({});
  const socketRef = useRef();
  const peersRef = useRef({});
  const streamRef = useRef(null);

  const [userId] = useState(uuidv4());
  const [roomId, setRoomId] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState([]);

  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const handleCreateRoom = async () => {
    try {
      const meetingCode = uuidv4().slice(0, 8).toUpperCase();
      const hostId = localStorage.getItem("userId");

      if (!hostId) {
        alert("User not logged in");
        return;
      }

      const response = await fetch(`${BASE_URL}/meetings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "My Video Meeting",
          meetingCode,
          startTime: new Date().toISOString(),
          hostId: Number(hostId),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create meeting");
      }

      const meeting = await response.json();
      setRoomId(meeting.meetingCode);
      setCreatedRoomId(meeting.meetingCode);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room. Try again.");
    }
  };

  const handleJoinRoom = async () => {
    if (!roomId) {
      alert("Please enter a room ID");
      return;
    }

    setJoined(true);
    socketRef.current = new WebSocket("wss://video-conferencing-application-gmsl.onrender.com/ws/signaling");

    socketRef.current.onopen = async () => {
      await startLocalStream();
      sendSignal({ type: "join", roomId, sender: userId });
    };

    socketRef.current.onmessage = async (msg) => {
      const data = JSON.parse(msg.data);
      const sender = data.sender;
      if (sender === userId) return;

      switch (data.type) {
        case "join":
          createOffer(sender);
          break;
        case "offer":
          await handleOffer(data);
          break;
        case "answer":
          await peersRef.current[sender].setRemoteDescription(new RTCSessionDescription(data.sdp));
          break;
        case "ice-candidate":
          await peersRef.current[sender]?.addIceCandidate(new RTCIceCandidate(data.candidate));
          break;
        default:
          break;
      }
    };
  };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing media devices.", err);
      alert("Could not access camera or microphone.");
    }
  };

  const createPeer = (targetId) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal({ type: "ice-candidate", candidate: e.candidate, sender: userId, target: targetId });
      }
    };

    peer.ontrack = (e) => {
      if (!remoteVideosRef.current[targetId]) {
        const video = document.createElement("video");
        video.autoplay = true;
        video.playsInline = true;
        video.width = 250;
        video.srcObject = e.streams[0];
        remoteVideosRef.current[targetId] = video;
        document.getElementById("remote-container").appendChild(video);
        setParticipants((prev) => [...new Set([...prev, targetId])]);
      }
    };

    streamRef.current.getTracks().forEach((track) => {
      peer.addTrack(track, streamRef.current);
    });

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
    const videoTrack = streamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    const audioTrack = streamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
    }
  };

  const leaveMeeting = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    Object.values(peersRef.current).forEach(peer => peer.close());
    socketRef.current?.close();

    setJoined(false);
    setParticipants([]);
    peersRef.current = {};
    remoteVideosRef.current = {};
    streamRef.current = null;

    const container = document.getElementById("remote-container");
    if (container) container.innerHTML = "";
  };

  return (
    <div className="video-container">
      <img src="https://img.freepik.com/premium-vector/facetime-app-icon-video-audio-chatting-platform_277909-629.jpg?w=900" alt="Video Call Logo" className="logo" />
      <h2>Video Meeting</h2>

      {!joined && (
        <>
          <button onClick={handleCreateRoom}>Create Room</button>
          {createdRoomId && (
            <p className="room-id-text">
              Room ID: <strong>{createdRoomId}</strong>
            </p>
          )}

          <div className="join-room">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="room-id-input"
            />
            <button onClick={handleJoinRoom} className="join-button">
              Join Room
            </button>
          </div>
        </>
      )}

      {joined && (
        <>
          <p className="participant-count"><strong>Room:</strong> {roomId}</p>
          <p className="participant-count"><strong>Your ID:</strong> {userId}</p>
          <p className="participant-count"><strong>Participants:</strong> {participants.length + 1} (including you)</p>

          <div className="local-video-container">
            <h4>Local Video</h4>
            <video ref={localVideoRef} autoPlay muted playsInline className="local-video" />
          </div>

          <div id="remote-container" className="remote-videos-container" />

          <div className="video-controls">
            <button onClick={toggleVideo}>
              {videoEnabled ? "Turn Off Video" : "Turn On Video"}
            </button>
            <button onClick={toggleAudio}>
              {audioEnabled ? "Mute" : "Unmute"}
            </button>
            <button onClick={leaveMeeting} className="leave-button">
              Leave Meeting
            </button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h3>Meeting Chat</h3>
            <ChatBox meetingId={roomId} senderId={userId} />
          </div>
        </>
      )}
    </div>
  );
};

export default VideoCall;
