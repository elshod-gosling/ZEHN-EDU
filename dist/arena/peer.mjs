// Manual signaling, no room server. ICE without third-party servers is for a local network.
const encode=o=>btoa(JSON.stringify(o));
function decode(code){if(typeof code!=='string'||code.length>64000)throw Error('code');const o=JSON.parse(atob(code.trim()));if(!['offer','answer'].includes(o.type)||typeof o.sdp!=='string'||o.sdp.length>48000)throw Error('code');return o;}
async function gathered(pc){if(pc.iceGatheringState==='complete')return;await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{pc.removeEventListener('icegatheringstatechange',check);reject(Error('timeout'));},12000);function check(){if(pc.iceGatheringState==='complete'){clearTimeout(timer);pc.removeEventListener('icegatheringstatechange',check);resolve();}}pc.addEventListener('icegatheringstatechange',check);});}
export class DuelPeer{
 constructor(onMessage,onState){this.onMessage=onMessage;this.onState=onState;this.pc=null;this.channel=null;this.closed=false;}
 create(){this.close();this.closed=false;this.pc=new RTCPeerConnection({iceServers:[]});this.pc.onconnectionstatechange=()=>this.onState(this.pc?.connectionState||'closed');return this.pc;}
 wire(channel){this.channel=channel;channel.onopen=()=>this.onState('ready');channel.onclose=()=>{if(!this.closed)this.onState('disconnected');};channel.onmessage=e=>{if(typeof e.data!=='string'||e.data.length>20000)return;try{this.onMessage(JSON.parse(e.data));}catch{/* Drop malformed peer messages. */}};}
 async host(){const pc=this.create();this.wire(pc.createDataChannel('duel',{ordered:true}));await pc.setLocalDescription(await pc.createOffer());await gathered(pc);return encode(pc.localDescription.toJSON());}
 async join(code){const offer=decode(code);if(offer.type!=='offer')throw Error('code');const pc=this.create();pc.ondatachannel=e=>this.wire(e.channel);await pc.setRemoteDescription(offer);await pc.setLocalDescription(await pc.createAnswer());await gathered(pc);return encode(pc.localDescription.toJSON());}
 async accept(code){const answer=decode(code);if(answer.type!=='answer'||!this.pc)throw Error('code');await this.pc.setRemoteDescription(answer);}
 send(value){if(this.channel?.readyState==='open'&&this.channel.bufferedAmount<65536)this.channel.send(JSON.stringify(value));}
 close(){this.closed=true;if(this.channel){this.channel.onclose=null;this.channel.close();}if(this.pc){this.pc.onconnectionstatechange=null;this.pc.close();}this.channel=null;this.pc=null;}
}
