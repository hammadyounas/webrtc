import React, { useCallback, useEffect } from 'react'
import { withSocket } from './webSocket'
// import io from 'socket.io-client'

// const socket  =  io( '/webrtcPeer')

function App({ socket }) {
  const localVideoRef = React.createRef();
  const remoteVideoRef = React.createRef();
  const [candidates, setCandidates] = React.useState([])
  let textref = React.useRef(null);
  const [textValue, setTextValue] = React.useState('')
  let pc = null;

  useEffect(() => {
    socket.on(`offerOrAnswer`, (sdp) => {
      textref.value = JSON.stringify(sdp)
      pc.setRemoteDescription(new RTCSessionDescription(sdp))

    });

    socket.on(`candidate`, (candidate) => {
      pc.addIceCandidate(new RTCIceCandidate(candidate))
      // setCandidates([...candidates, candidate])
      // this.textref.value = JSON.stringify(sdp)
    });
    return () => {
      socket.off(`offerOrAnswer`);
    };
  }, []);

  const sendToPeer = (messageType, payload) => {
    socket.emit(messageType, {
      socketID: socket.id,
      payload
    })
  }

  useEffect(() => {
    // const pc_config = null
    const pc_config = {
      "iceServers": [
        {
          urls: 'stun:stun.l.google.com:19302'
        }
      ]
    }
    pc = new RTCPeerConnection(pc_config)

    pc.onicecandidate = (e) => {
      // if(e.candidate) console.log(JSON.stringify(e.candidate))
      sendToPeer('candidate', e.candidate)
    }

    pc.oniceconnectionstatechange = (e) => {
      console.log(e)
    }
    pc.ontrack = (e) => {
      remoteVideoRef.current.srcObject = e.streams[0]
    }

    navigator.mediaDevices
      .getUserMedia({
        video: true, audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      })
      .then(stream => {
        localVideoRef.current.srcObject = stream;
        pc.addStream(stream)
      })
      .catch(console.log);
  }, [])

  const createOffer = () => {
    console.log("offer")
    pc.createOffer({ offerToReceiveVideo: 1 }).then(sdp => {
      console.log(JSON.stringify(sdp));
      pc.setLocalDescription(sdp)
      sendToPeer('offerOrAnswer', sdp)
    }, e => { });
  }

  const setRemoteDescription = () => {
    console.log("textref", textref)
    const desc = JSON.parse(textref.value);
    console.log("desc", desc);
    pc.setRemoteDescription(new RTCSessionDescription(desc))
  }

  const createAnswer = () => {
    console.log("Answer");
    pc.createAnswer({ offerToReceiveVideo: 1 }).then(sdp => {
      console.log(JSON.stringify(sdp));
      pc.setLocalDescription(sdp)
      sendToPeer('offerOrAnswer', sdp)
    }, e => { })
  }

  const addCandidate = () => {
    // const candidate = JSON.parse(textref.value)

    // pc.addIceCandidate(new RTCIceCandidate(candidate))

    candidates.forEach(candidate => {
      pc.addIceCandidate(new RTCIceCandidate(candidate))
    })
    // if(candidate) pc.addIceCandidate(new RTCIceCandidate(candidate));
  }
  // const [constraints,setConstraints] = React.useState( {video: true})
  // const constraints = {video: true}  

  // const success = (stream) =>{
  //   localVideoRef.current.srcObject = stream
  // }

  // const failure = (e) =>{
  //   console.log("e",e);
  // }
  // navigator.getUserMedia(constraints,success,failure)
  // const constraints = {video: true}  
  return (
    <div >
      <video
        style={{ width: "240px", height: "240px", margin: "5px", backgroundColor: 'black' }}
        ref={localVideoRef}
        autoPlay
        muted={true}
      ></video>
      <video
        style={{ width: "240px", height: "240px", margin: "5px", backgroundColor: 'black' }}
        ref={remoteVideoRef}
        autoPlay
      ></video>
      <br />
      <button onClick={createOffer}>offer</button>
      <button onClick={createAnswer}>Answer</button>
      <br />
      <textarea ref={ref => { textref = ref }} />
      <br />
      <button onClick={setRemoteDescription}>Set Remote Desc</button>
      <button onClick={addCandidate}>Add candidate</button>
    </div>
  );
}

export default withSocket(App);
