import React, { useEffect } from 'react'

function App() {
  const localVideoRef = React.createRef();
  const remoteVideoRef = React.createRef();
  let textref = React.useRef(null);
  const [textValue,setTextValue] = React.useState('')
  let pc = null;

  useEffect(() => {
    const pc_config = null
     pc = new RTCPeerConnection(pc_config)

    pc.onicecandidate = (e) =>{
      if(e.candidate) console.log(JSON.stringify(e.candidate))
    }

    pc.oniceconnectionstatechange = (e) =>{
      console.log(e)
    }
    pc.ontrack = (e) =>{
      remoteVideoRef.current.srcObject = e.streams[0]
    }

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(stream =>{ 
        localVideoRef.current.srcObject = stream;
        pc.addStream(stream)
      })
      .catch(console.log);
  }, [])

  const createOffer = () =>{
    console.log("offer")
    pc.createOffer({offerToReceiveVideo:1}).then(sdp =>{
      console.log(JSON.stringify(sdp));
      pc.setLocalDescription(sdp)
    },e => {});
  }

  const setRemoteDescription = () =>{
    console.log("textref",textref)
    const desc = JSON.parse(textref.value);
    console.log("desc",desc);
    pc.setRemoteDescription(new RTCSessionDescription(desc))
  }

  const createAnswer = () =>{
    console.log("Answer");
    pc.createAnswer({offerToReceiveVideo:1}).then(sdp =>{
      console.log(JSON.stringify(sdp));
      pc.setLocalDescription(sdp)
    },e => {})
  }

  const addCandidate = () =>{
    const candidate = JSON.parse(textref.value)
    console.log("Adding candidate:", candidate);

    pc.addIceCandidate(new RTCIceCandidate(candidate))

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
      style={{width:"240px",height:"240px",margin:"5px",backgroundColor:'black'}}
        ref={localVideoRef}
        autoPlay
      ></video>
         <video
      style={{width:"240px",height:"240px",margin:"5px",backgroundColor:'black'}}
        ref={remoteVideoRef}
        autoPlay
      ></video>
      <br/>
      <button onClick={createOffer}>offer</button>
      <button onClick={createAnswer}>Answer</button>
      <br/>
      <textarea ref={ref =>{textref=ref}}/>
      <br/>
      <button onClick={setRemoteDescription}>Set Remote Desc</button>
      <button onClick={addCandidate}>Add candidate</button>
    </div>
  );
}

export default App;
