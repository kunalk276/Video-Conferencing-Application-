import React, { useRef, useState, useEffect } from "react";
import './VideoCall.css';
import { v4 as uuidv4 } from "uuid";
import ChatBox from './ChatBox';
import { faThumbtack } from "@fortawesome/free-solid-svg-icons";
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

  const cameraVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  const remoteVideosRef = useRef({});
  const socketRef = useRef();
  const peersRef = useRef({});
  const streamRef = useRef({ camera: null, screen: null });

  const [userId] = useState(localStorage.getItem("userId"));
  const [username] = useState(localStorage.getItem("username"));

  const [roomId, setRoomId] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState([]);
const [isScreenSharing, setIsScreenSharing] = useState(false);

const [pinnedUserId, setPinnedUserId] = useState(null);

  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [meetingId, setMeetingId] = useState(null);
const [presenterName, setPresenterName] = useState(null);



useEffect(() => {
  const wrappers = document.querySelectorAll(".remote-wrapper");

  wrappers.forEach((wrapper) => {
    const userId = wrapper.dataset.userid;
    const isPinned = userId === pinnedUserId;

    if (isPinned) {
      wrapper.classList.add("pinned");
      wrapper.style.display = "inline-block";
      wrapper.classList.remove("fade-out");
    } else {
      wrapper.classList.remove("pinned");

      if (pinnedUserId) {

        wrapper.classList.add("fade-out");
        setTimeout(() => {
          wrapper.style.display = "none";
        }, 300);
      } else {

        wrapper.classList.remove("fade-out");
        wrapper.style.display = "inline-block";
      }
    }
  });
}, [pinnedUserId]);



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

      socketRef.current.onopen = () => {
        setTimeout(() => {
          startLocalStream().then(() => {
            sendSignal({ type: "join", roomId, sender: userId });
          });
        }, 300); // Let DOM render refs
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
            await peersRef.current[data.sender]?.setRemoteDescription(new RTCSessionDescription(data.sdp));
            break;
          case "ice-candidate":
            await peersRef.current[data.sender]?.addIceCandidate(new RTCIceCandidate(data.candidate));
            break;
          case "user-left":
            const leftId = data.sender;
            const video = remoteVideosRef.current[leftId];
            if (video && video.parentNode) {
              video.remove();
            }
            delete remoteVideosRef.current[leftId];
            setParticipants((prev) => prev.filter((id) => id !== leftId));
            peersRef.current[leftId]?.close();
            delete peersRef.current[leftId];
            break;

            case "start-screen-share":
              const { presenterName } = data;

              console.log("Presenter started screen sharing:", presenterName);

              break;
        }
      };
    } catch (err) {
      alert("Join room failed");
      console.error(err);
    }
  };

  const startLocalStream = async () => {
    const camera = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    streamRef.current.camera = camera;

    if (cameraVideoRef.current) cameraVideoRef.current.srcObject = camera;

    Object.values(peersRef.current).forEach((peer) => {
      camera.getTracks().forEach((track) => peer.addTrack(track, camera));
    });
  };

const startScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      setIsScreenSharing(true); // ✅ SET TRUE

      // Replace video track in peer connections
      Object.values(peersRef.current).forEach((peer) => {
        const sender = peer.getSenders().find(s => s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      });

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = screenStream;
      }

 sendSignal({
      type: "start-screen-share",
      sender: userId,
      presenterName: username,
    });

      screenTrack.onended = () => {
        stopScreenShare();
      };

    } catch (err) {
      console.error("Screen share error:", err);
      alert("Screen sharing failed or canceled.");
    }
  };

  const stopScreenShare = async () => {
    setIsScreenSharing(false); // ✅ SET FALSE

    const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const newTrack = webcamStream.getVideoTracks()[0];
    streamRef.current = webcamStream;

    Object.values(peersRef.current).forEach((peer) => {
      const sender = peer.getSenders().find(s => s.track?.kind === 'video');
      if (sender) {
        sender.replaceTrack(newTrack);
      }
    });

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = webcamStream;
    }

    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
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
        if (container) {
          const wrapper = document.createElement("div");
          wrapper.className = "remote-wrapper";
          wrapper.dataset.userid = targetId;

          const pinBtn = document.createElement("button");
          pinBtn.className = "pin-button";
          pinBtn.innerHTML = '<i class="fas fa-thumbtack"></i>';
          pinBtn.onclick = () => {
            setPinnedUserId((prev) => (prev === targetId ? null : targetId));
          };

          // 🆕 Add presenter label
          const presenterLabel = document.createElement("div");
          presenterLabel.className = "presenter-name-label";
          presenterLabel.innerText = `Presenter: ${username}`; // Replace username with actual sender name if you have it

          wrapper.appendChild(pinBtn);
          wrapper.appendChild(videoEl);
          wrapper.appendChild(presenterLabel);
          container.appendChild(wrapper);
        }
      }

      setParticipants((prev) => [...new Set([...prev, targetId])]);
    };



    // Add tracks if available
    if (streamRef.current?.camera) {
      streamRef.current.camera.getTracks().forEach((track) => peer.addTrack(track, streamRef.current.camera));
    }
    if (streamRef.current?.screen) {
      streamRef.current.screen.getTracks().forEach((track) => peer.addTrack(track, streamRef.current.screen));
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
    socketRef.current?.send(JSON.stringify({ ...data, roomId }));
  };

  const toggleVideo = () => {
    const track = streamRef.current?.camera?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setVideoEnabled(track.enabled);
    }
  };

  const toggleAudio = () => {
    const track = streamRef.current?.camera?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setAudioEnabled(track.enabled);
    }
  };

  const leaveMeeting = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      sendSignal({ type: "user-left", sender: userId });
    }

    ["camera", "screen"].forEach((type) => {
      streamRef.current?.[type]?.getTracks().forEach((t) => t.stop());
    });
    streamRef.current = { camera: null, screen: null };

    Object.values(peersRef.current).forEach((peer) => peer.close());
    peersRef.current = {};

    Object.values(remoteVideosRef.current).forEach((videoEl) => {
      if (videoEl?.parentNode) videoEl.remove();
    });
    remoteVideosRef.current = {};
    document.getElementById("remote-container").innerHTML = "";

    socketRef.current?.close();
    setJoined(false);
    setParticipants([]);
  };

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

  return (
    <div className="video-container">
      {!joined ? (
        <div className="join-section">
          <button onClick={handleCreateRoom}>➕ Create Room</button>
          {createdRoomId && <p>🆔 Room ID: {createdRoomId}</p>}
          <input
            type="text"
            placeholder="🔑 Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button onClick={handleJoinRoom}>🚪 Join Room</button>
        </div>
      ) : (
        <div className="conference-section">
          <div className="main-video-area">
            <h4><FontAwesomeIcon icon={faUserCircle} /> Camera View</h4>
            <video ref={cameraVideoRef} autoPlay muted playsInline className="camera-video" />

           {isScreenSharing && (
             <div className="screen-video-wrapper">
               <video
                 ref={screenVideoRef}
                 autoPlay
                 muted
                 playsInline
                 className={`screen-video ${!isScreenSharing ? 'fade-out' : ''}`}
               />
               <div className="presenter-overlay">Presenter: {username}</div>
             </div>
           )}



            <div id="remote-container" className="remote-videos-container" />

            <div className="video-controls">
              <button onClick={toggleVideo}>
                <FontAwesomeIcon icon={videoEnabled ? faVideo : faVideoSlash} />
              </button>
              <button onClick={toggleAudio}>
                <FontAwesomeIcon icon={audioEnabled ? faMicrophone : faMicrophoneSlash} />
              </button>
              <button onClick={startScreenShare} title={isScreenSharing ? "Stop Screen Share" : "Start Screen Share"}>
                <FontAwesomeIcon icon={faDesktop} spin={!isScreenSharing} />
              </button>



              <button onClick={leaveMeeting} className="leave-button">
                <FontAwesomeIcon icon={faDoorOpen} />
              </button>
            </div>
          </div>
          <div className="chat-section">
            <h3><FontAwesomeIcon icon={faComments} /> Chat</h3>
            {meetingId && userId && username && (
              <ChatBox meetingId={meetingId} senderId={userId} senderName={username} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
