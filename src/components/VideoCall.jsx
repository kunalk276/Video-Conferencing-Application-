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
  const [meetingId, setMeetingId] = useState(null); // 🔑 For chat

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

      if (!response.ok) throw new Error("Failed to create meeting");

      const meeting = await response.json();
      setRoomId(meeting.meetingCode);
      setCreatedRoomId(meeting.meetingCode);
      setMeetingId(meeting.id);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room. Try again.");
    }
  };

  const handleJoinRoom = async () => {
    if (!roomId) return alert("Please enter a room ID");

    try {
      // ✅ Resolve meetingId from roomId (meetingCode)
      const res = await fetch(`${BASE_URL}/meetings/code/${roomId}`);
      if (!res.ok) throw new Error("Invalid Room ID");
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
            createOffer(data.sender);
            break;
          case "offer":
            await handleOffer(data);
            break;
          case "answer":
            await peersRef.current[data.sender].setRemoteDescription(new RTCSessionDescription(data.sdp));
            break;
          case "ice-candidate":
            await peersRef.current[data.sender]?.addIceCandidate(new RTCIceCandidate(data.candidate));
            break;
        }
      };
    } catch (err) {
      console.error("Join Error:", err);
      alert("Failed to join room.");
    }
  };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Media error:", err);
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

    streamRef.current.getTracks().forEach((track) => peer.addTrack(track, streamRef.current));

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

  const leaveMeeting = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    Object.values(peersRef.current).forEach(p => p.close());
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
      <img
        src="https://img.freepik.com/premium-vector/facetime-app-icon-video-audio-chatting-platform_277909-629.jpg?w=900"
        alt="Logo"
        className="logo"
      />
      <h2>📹 Video Conferencing</h2>

      {!joined && (
        <>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <button onClick={handleCreateRoom} className="join-button">➕ Create Room</button>
            {createdRoomId && (
              <p className="room-id-text">
                <span>🆔 Room ID: </span><strong>{createdRoomId}</strong>
              </p>
            )}
          </div>

          <div className="join-room" style={{ textAlign: "center" }}>
            <input
              type="text"
              placeholder="🔑 Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="room-id-input"
            />
            <button onClick={handleJoinRoom} className="join-button">🚪 Join Room</button>
          </div>
        </>
      )}

      {joined && (
        <>
          <div className="participant-count">
            <p>🏠 <strong>Room:</strong> {roomId}</p>
            <p>👤 <strong>Your ID:</strong> {userId}</p>
            <p>👥 <strong>Participants:</strong> {participants.length + 1}</p>
          </div>

          <div className="local-video-container">
            <h4>🎥 Your Video</h4>
            <video ref={localVideoRef} autoPlay muted playsInline className="local-video" />
          </div>

          <div id="remote-container" className="remote-videos-container" />

          <div className="video-controls">
            <button onClick={toggleVideo}>
              {videoEnabled ? "📷 Turn Off Video" : "📷 Turn On Video"}
            </button>
            <button onClick={toggleAudio}>
              {audioEnabled ? "🔊 Mute Mic" : "🔇 Unmute Mic"}
            </button>
            <button onClick={leaveMeeting} className="leave-button">
              ❌ Leave
            </button>
          </div>

          <div style={{ marginTop: '40px' }}>
            <h3 style={{ textAlign: "center" }}>💬 Meeting Chat</h3>
            {roomId && <ChatBox meetingId={roomId} senderId={userId} />}
          </div>
        </>
      )}
    </div>
  );

};

export default VideoCall;
