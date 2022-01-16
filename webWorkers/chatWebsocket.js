"use strict";

const ws=new WebSocket('ws://127.0.0.1:3000/friends/chat');

ws.onopen=(e)=>{
  console.log('Chat websocket is open');
}

ws.onclose=()=>{
  console.log('websocket is closed');
}

ws.onmessage=(e)=>{
  self.postMessage(JSON.parse(e.data));
}

self.onmessage=(e)=>{
  console.log(e.data);
  ws.send(JSON.stringify(e.data));
}