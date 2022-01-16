const ws=new WebSocket('ws://127.0.0.1:3000/main-socket');

ws.onopen=(e)=>{
  console.log('main websocket connected');
};

ws.onerror=(e)=>{
  console.log('an error has occured');
}

ws.onclose=(e)=>{
  console.log('websocket closed!');
}

self.addEventListener('message',(e)=>{
  console.log('data received:',e.data);
  ws.send(JSON.stringify({message:e.data}));
});

ws.onmessage=(e)=>{
  self.postMessage(JSON.parse(e.data));
}
