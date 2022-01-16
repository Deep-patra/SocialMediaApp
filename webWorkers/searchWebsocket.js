"use strict";
const ws=new WebSocket('ws://127.0.0.1:3000/search');

ws.onopen=()=>{
  console.log('search socket is open');
}

ws.onclose=()=>{
  console.log('search socket is closed');
}

ws.onerror=()=>{
    console.log('error in the search websocket')
  }
self.onmessage=(e)=>{
  //console.log();
  try{
  ws.send(JSON.stringify(e.data));
  }
  catch(error){
    console.log(error);
  }
}

ws.onmessage=(e)=>{
  self.postMessage(JSON.parse(e.data));
}