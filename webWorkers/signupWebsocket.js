const ws=new WebSocket('ws://127.0.0.1:3000/signup');

ws.onopen=()=>{
  console.log('websoclet opened !');
}

ws.onclose=()=>{
  console.log('websocket closed');
  
}

ws.onmessage=(e)=>{
  self.postMessage(JSON.parse(e.data));
}

self.onmessage=(e)=>{
  console.dir(e.data);
  ws.send(JSON.stringify(e.data));
}