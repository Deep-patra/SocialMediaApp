"use strict";
const ws=new WebSocket('ws://127.0.0.1:3000/friends/video-chat');

ws.onopen=()=>{
  console.log('video chat websocket is open');
}

ws.onclose=()=>{
  console.log('video chat websocket is now close');
}

ws.onmessage=(e)=>{
  self.postMessage(JSON.parse(e.data));
}

self.onmessage=(e)=>{
  console.log(e.data);
}