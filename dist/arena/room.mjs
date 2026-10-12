import { DuelPeer } from './peer.mjs';
import * as accounts from '../supabase-account.mjs?v=zehn-rooms-1';

export const normalizeRoomCode = code => String(code).replace(/[\s-]/g,'').toUpperCase();
export class DuelRoom {
  constructor(onMessage,onState,{api=accounts,Peer=DuelPeer,pollMs=1200,timeoutMs=90000}={}) {
    Object.assign(this,{onMessage,onState,api,Peer,pollMs,timeoutMs});
    this.generation=0; this.id=null; this.peer=null; this.timer=null; this.deadline=null;
  }
  begin(host) {
    this.close(); const token=this.generation;
    this.hosting=host; this.accepted=false; this.ready=false;
    this.peer=new this.Peer(message=>{if(token===this.generation)this.onMessage(message);},state=>{
      if(token!==this.generation)return;
      if(state==='ready'){this.ready=true;clearTimeout(this.timer);clearTimeout(this.deadline);}
      if(state==='failed'&&!this.ready){this.fail(token,new Error('connection-timeout'));return;}
      this.onState(state);
    });
    this.deadline=setTimeout(()=>this.fail(token,new Error('connection-timeout')),this.timeoutMs);
    return token;
  }
  async keep(room,token) {
    if(token!==this.generation){await this.api.closeRoom(room.id).catch(()=>{});return false;}
    this.id=room.id; return true;
  }
  async host() {
    const token=this.begin(true),peer=this.peer;
    try {
      const offer=await peer.host(); if(token!==this.generation)return null;
      const room=await this.api.createRoom(offer); if(!await this.keep(room,token))return null;
      this.schedule(token);return room.code;
    } catch(error){if(token===this.generation)this.close();throw error;}
  }
  async join(code) {
    code=normalizeRoomCode(code);if(!/^[0-9A-F]{8}$/.test(code))throw new Error('room-not-found');
    const token=this.begin(false),peer=this.peer;
    try {
      const room=await this.api.joinRoom(code); if(!await this.keep(room,token))return;
      const answer=await peer.join(room.offer);if(token!==this.generation)return;
      await this.api.answerRoom(room.id,answer);if(token===this.generation)this.schedule(token);
    } catch(error){if(token===this.generation)this.close();throw error;}
  }
  schedule(token) { if(token===this.generation&&!this.ready)this.timer=setTimeout(()=>void this.check(token),this.pollMs); }
  async check(token) {
    if(token!==this.generation||this.ready)return;
    try {
      const peer=this.peer,result=await this.api.roomStatus(this.id);
      if(token!==this.generation||this.ready)return;
      if(this.hosting&&result.answer&&!this.accepted){this.accepted=true;await peer.accept(result.answer);}
      this.schedule(token);
    } catch(error){this.fail(token,error);}
  }
  fail(token,error) {if(token!==this.generation||this.ready)return;this.close();this.onState('failed',error);}
  send(value) {this.peer?.send(value);}
  close() {
    this.generation++; clearTimeout(this.timer);clearTimeout(this.deadline);this.peer?.close();this.peer=null;
    const id=this.id;this.id=null;if(id)void this.api.closeRoom(id).catch(()=>{});
  }
}
