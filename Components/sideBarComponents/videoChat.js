import React from "react";
import ReactDOM from "react-dom";
import propType from "prop-types";
import className from "classnames";

export default class VideoChat extends React.Component{
  constructor(props){
    super(props);
    this.userVideo=React.createRef();
    this.friendVideo=React.createRef();
    this.worker=null;
    this.localStream=null;
    this.myPeerConnection=null;
    this.constraints={audio:true,video:true};
}
  
  
  state={
    online:false,
    videoStart:false,
    videoStop:true,
    acceptCall:false,
    videoLoading:false,
    sdp:null
  }
  
  
  //function to establish a web-rtc connection
  startVideoChat=(e)=>{
    console.log('start video chat');
    this.worker.postMessage({
      Action:'Video-Chat-Request',
      friend:this.props.friend
    });
  }
  
  
  //method to stop the call
  stopVideoChat=(e)=>{
    console.log('stop video chat called');
    this.closeVideoCall();
    this.worker.postMessage({Action:'Hang-Up'});
  }
  
  //method to acccept the incoming call
  acceptCall=(e)=>{
    this.setState({acceptCall:true});
    console.log('accept call methos called');
    this.handleVideoOfferMsg(this.state.sdp);
  }
  
  //method to create a peer connection
  createPeerConnection=()=>{
    this.myPeerConnection=new RTCPeerConnection({
      iceServers:[
        {urls:'stun:stun.stunprotocol.org:3478'},
        {urls:'stun:stun.I.google.com:19302'},
        {urls:'stun:stun1.I.google.19302'},
        {urls:'stun:stun2.I.google.com:19302'}
        ]
    });
    
    //all the event handlers related to rtc conmection
    this.myPeerConnection.onicecandidate=this.handleICECandidateEvent;
    this.myPeerConnection.ontrack=this.handleTrackEvent;
    this.myPeerConnection.onnegotiationneeded=this.handleNegotiationNeeded;
    this.myPeerConnection.onremovetrack=this.handleRemoveTrackEvent;
  }
  
  //method to handle negotiation 
  handleNegotiationNeeded=(e)=>{
    this.myPeerConnection.createOffer()
    .then((offer)=>{
      return this.myPeerConnection.setLocalDescription(offer);
    })
    .then(()=>{
      this.worker.postMessage({
        Action:'Video-Chat-Offer',
        username:this.props.username,
        friendName:this.props.friend.username,
        sdp:this.myPeerConnection.localDescription
      });
    })
  }
  
  
  //method to handle ice Candidate Event
  handleICECandidateEvent=(e)=>{
    if(e.candidate){
      this.worker.postMessage({
        Action:'Ice-Candidate',
        username:this.props.username,
        friendName:this.props.friend.username,
        candidate:e.candidate
      });
    }
  }
  
  
  //method to add ICE candidate to the Peer Object
  handleNewICECandidate=(msg)=>{
    if(msg.candidate){
      const candidate=new RTCIceCandidate(msg.candidate);
      this.myPeerConnection.addIceCandidate(candidate)
      .catch(error=>{
        console.log(error);
      });
    }
  }
  
  //method to handle video offer msg
  handleVideoOfferMsg=(msg)=>{
  //creating a peer conmction
    this.createPeerConnection();
    let desc=new RTCSessionDescription(msg.sdp);
    this.myPeerConnection.setRemoteDescription(desc).then(()=>{
      return navigator.mediaDevices.getUserMedia(this.constraints);
    })
    //adding stream from navigator to the local stream
    .then((stream)=>{
      this.localStream=stream;
      this.setState({videoStart:true});
      this.userVideo.current.srcObject=this.localStream;
      
      //playing the friend video when the meta data is loaded
      this.userVideo.current.onloadedmetadata=()=>{
        this.userVideo.current.play();
      }
      
      this.localStream.getTracks().forEach(track=>{
        this.myPeerConnection.addTrack(track,this.localStream);
      });
    })
    .then(()=>{
      return this.myPeerConnection.createAnswer();
    })
    .then((answer)=>{
      return this.myPeerConnection.setLocalDescription(answer);
    })
    .then(()=>{
     console.log(this.myPeerConnection.localDescription);
     
      //sending local description to the server
      this.worker.postMessage({
        Action:'Video-Chat-Answer',
        username:this.props.username,
        friendName:this.props.friend.username,
        sdp:this.myPeerConnection.localDescription
      });
    })
    .catch(error=>{
      console.log(error);
    });
  }
  
  //method to handle video answer
  handleVideoAnswerMsg=(msg)=>{
    console.log(msg.desc);
    let desc=new RTCSessionDescription(msg.sdp);
    this.myPeerConnection.setRemoteDescription(desc);
  }
  
  
  //method to handle tracks 
  handleTrackEvent=(e)=>{
    console.log(e.streams[0]);
    this.friendVideo.current.srcObject=e.streams[0];
    this.friendVideo.current.onloadedmetadata=(e)=>{
      this.friendVideo.current.play();
    }
  }
  
  //method to handle remove track events
  handleRemoveTrackEvent=(e)=>{

    let streams=this.friendVideo.current.srcObject;
    let trackList=streams.getTracks();
    
    if(trackList.length==0){
      this.closeVideoCall();
    }
  }
  
  //method to close video call
  closeVideoCall=()=>{
    if(this.myPeerConnection){
      this.myPeerConnection.ontrack=null;
      this.myPeerConnection.onremovetrack=null;
      this.myPeerConnection.onicecandidate=null;
      this.myPeerConnection.onnegotiationneeded=null;
    }
    
    //checking src object of both the video elements
    if(this.userVideo.current.srcObject){
      this.userVideo.current.srcObject.getTracks().forEach(track=>{track.stop();});
    }
    else if(this.friendVideo.current.srcObject){
      this.friendVideo.current.srcObject.getTracks().forEach(track=>{track.stop();});
    }
    
    this.myPeerConnection.close();
  }
  
  componentDidMount(){
    this.worker=new Worker('./webWorkers/videoChatWebsocket.js');
    
    this.worker.onerror=()=>{
      console.log('error in video chat worker');
    }
    let callReceived=false;
    if(this.props.callReceived.username==this.props.friend.username){
      callReceived=true;
    }
    
    //registering the user in the server
    this.worker.postMessage({
      Action:'Register',
      username:this.props.username,
      call_received:callReceived||false,
      friend:this.props.friend
    });
    
    this.worker.onmessage=(e)=>{
      let msg=e.data;
      
      if(msg.Action=='Video-Chat-Offer'){
        console.log('video-offer received');
        this.handleVideoOfferMsg(msg);
        this.setState({sdp:msg})
      }
      else if(msg.Action=='Video-Chat-Answer'){
        console.log('video-offer answer');
        this.handleVideoAnswerMsg(msg);
      }
      else if(msg.Action=='Ice-Candidate'){
        console.log('ice-candidate received',msg.candidate);
        this.handleNewICECandidate(msg);
      }
      else if(msg.Action=='Hang-Up'){
        console.log('User has Hanged up the call');
        this.closeVideoCall();
      }
      else if(msg.Action=='Status'){
        console.log('status of the friend',msg.status);
        this.setState({online:msg.status});
      }
    }
  }
  componentWillUnmount(){
    this.closeVideoCall();
    this.worker.terminate();
  }
  render(){
    return(
    <div className="video-chat">
      <div className="video-button">
      {this.state.callReceived?(
        <button onClick={this.startVideoChat}>Start Call</button>
        ):(
        <button onClick={this.acceptCall}>Accept Call</button>
        )}
        <button disabled={this.state.videoStop} onClick={this.stopVideoChat}>Hang-Up Call</button>
      </div>
      <div className="video-friend">
        {!this.state.acceptCall?(<div className="video-text"><p>Waiting for the User to accept Call!</p></div>):(
           this.state.videoLoading?(<div className="video-text"><p>Video is loading..</p></div>):(<video ref={this.friendVideo}></video>)
        )}
      </div>
      <div className="video-user">
        {this.state.videoStart?(
        <video ref={this.userVideo}></video>
        ):(<div><p>Press 'Start' to start the video Chat</p></div>)}
      </div>
    </div>
    )
  }
}