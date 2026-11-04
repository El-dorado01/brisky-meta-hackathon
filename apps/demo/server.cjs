require('reflect-metadata');
const http=require('http'),fs=require('fs'),path=require('path'),{randomBytes}=require('crypto');
const {configuration}=require('./meta.cjs'),{fixtures,chat,studio}=require('./core.cjs');
const {ConfigService}=require('@nestjs/config'),{WebSocketServer}=require('ws');
const {MetaLiveVoice}=require('../../build/event-components/api/modules/conversation/meta-live-voice');
const {MmsSpeechService}=require('../../build/event-components/api/modules/conversation/mms-speech.service');
function createServer(env=process.env){
 const config=configuration(env),sessions=new Map(),tickets=new Map(),connections=new Set(),mms=new MmsSpeechService(new ConfigService(env));
 const server=http.createServer(async(req,res)=>{
  const origin='http://'+req.headers.host;const url=new URL(req.url,origin);
  const reply=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));};
  try{
   if(!['localhost','127.0.0.1'].includes(url.hostname)||Number(url.port)!==server.address()?.port)return reply(403,{error:'Local demo host required'});
   if(req.headers.origin&&req.headers.origin!==origin)return reply(403,{error:'Origin rejected'});
   const sid=/\bbrisky_demo=([a-f0-9]{48})\b/.exec(req.headers.cookie||'')?.[1];let state=sid?sessions.get(sid):null;
   if(!state){if(sessions.size>=50)return reply(429,{error:'Demo session capacity reached. Restart the local runner.'});const id=randomBytes(24).toString('hex');state={id,history:[],saved:[],shortlist:[],documents:[],busy:false,voice:false};sessions.set(id,state);res.setHeader('Set-Cookie',`brisky_demo=${id}; HttpOnly; SameSite=Strict; Path=/`);}
   if(req.method==='GET'&&url.pathname==='/'){res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws://localhost:* ws://127.0.0.1:*; media-src 'self' blob:; img-src 'self' data:"});return res.end(fs.readFileSync(path.join(__dirname,'public/index.html')));}
   if(req.method==='GET'&&url.pathname==='/audio/brisky/live-microphone.js'){res.writeHead(200,{'Content-Type':'application/javascript'});return res.end(fs.readFileSync(path.resolve('apps/web/public/audio/brisky/live-microphone.js')));}
   if(req.method==='GET'&&url.pathname==='/live-voice.js'){res.writeHead(200,{'Content-Type':'application/javascript'});return res.end(fs.readFileSync(path.resolve('build/browser/live-voice.js')));}
   if(req.method==='GET'&&url.pathname==='/api/state')return reply(200,{mode:'synthetic-fixtures',configured:!!config.key,model:config.model,voiceEnabled:config.voice,fixtures,saved:state.saved,shortlist:state.shortlist,documents:state.documents});
   if(req.method!=='POST')return reply(404,{error:'Not found'});
   if(req.headers.origin!==origin||!req.headers['content-type']?.startsWith('application/json'))return reply(403,{error:'Same-origin JSON request required'});
   let data='';for await(const chunk of req){data+=chunk;if(Buffer.byteLength(data)>16000)return reply(413,{error:'Request too large'});}let body;try{body=JSON.parse(data);}catch{return reply(400,{error:'Invalid JSON'});}
   if(url.pathname==='/api/shortlist'){if(!Array.isArray(body.ids)||body.ids.length>fixtures.length||body.ids.some(id=>!fixtures.some(e=>e.id===id)))return reply(400,{error:'Invalid shortlist'});state.shortlist=[...new Set(body.ids)];return reply(200,{shortlist:state.shortlist});}
   if(url.pathname==='/api/voice/live-ticket'){
    if(!config.voice||!config.key)return reply(503,{error:'Enable DEMO_VOICE_ENABLED after setup:mms and configuring Meta credentials.'});
    if(state.voice)return reply(409,{error:'A call is already active.'});const token=randomBytes(24).toString('hex');for(const [key,item] of tickets)if(item.expires<Date.now())tickets.delete(key);if(tickets.size>=50)return reply(429,{error:'Too many pending voice tickets'});tickets.set(token,{state,origin,expires:Date.now()+30000});return reply(200,{url:`ws://${req.headers.host}/voice?ticket=${token}`,startupTimeoutMs:150000});
   }
   if(!['/api/chat','/api/studio'].includes(url.pathname))return reply(404,{error:'Not found'});
   if(state.busy)return reply(409,{error:'The previous request is still running.'});state.busy=true;
   try{return reply(200,url.pathname==='/api/chat'?await chat(state,body.text):await studio(state,body.format,body.goal));}finally{state.busy=false;}
  }catch(error){console.error('Demo request did not complete.');return reply(503,{error:/^(Add META_API_KEY|Meta request HTTP|Enter a request|Choose a brief|Shortlist at least|Meta response was incomplete)/.test(error.message)?error.message:'The request did not finish. Check the Meta access, budget and setup; no result was simulated.'});}
 });
 const sockets=new WebSocketServer({noServer:true,maxPayload:20000,perMessageDeflate:false});
 server.on('upgrade',(req,socket,head)=>{const url=new URL(req.url,'http://localhost'),token=url.searchParams.get('ticket'),ticket=tickets.get(token);tickets.delete(token);if(url.pathname!=='/voice'||!ticket||ticket.expires<Date.now()||req.headers.origin!==ticket.origin||!/\bbrisky_demo=([a-f0-9]{48})\b/.test(req.headers.cookie||'')||!req.headers.cookie.includes('brisky_demo='+ticket.state.id)||ticket.state.voice){socket.destroy();return;}sockets.handleUpgrade(req,socket,head,client=>{
  ticket.state.voice=true;connections.add(client);let bytes=0,count=0,windowStart=Date.now();const send=packet=>{if(client.readyState===1){if(client.bufferedAmount>1024*1024){voice.stop('Connection cannot keep up.');return;}client.send(JSON.stringify(packet));}};
  const voice=new MetaLiveVoice(new ConfigService(env),mms,packet=>{
   // The fixture runner performs the media tool server-side. No original engine or browser transcript UI.
   if(packet.type==='tool'){void chat(ticket.state,packet.query).then(result=>voice.result(packet.id,JSON.stringify(result))).catch(()=>{try{voice.result(packet.id,JSON.stringify({answer:'The fixture request did not finish. Please try again.'}));}catch{}});return;}send(packet);
  },error=>{ticket.state.voice=false;connections.delete(client);if(error)send({type:'error',message:error});client.close(error?1011:1000);});
  client.on('message',(data,binary)=>{try{if(binary)throw Error();if(Date.now()-windowStart>1000){count=0;windowStart=Date.now();}if(++count>40)throw Error();const packet=JSON.parse(data.toString());if(packet.type==='audio'&&Object.keys(packet).length===2&&typeof packet.data==='string'&&/^[A-Za-z0-9+/]+={0,2}$/.test(packet.data)){const audio=Buffer.from(packet.data,'base64');bytes+=audio.length;if(bytes>10*1024*1024)throw Error();voice.audio(audio);}else if(packet.type==='pause'&&Object.keys(packet).length===1)voice.pause();else throw Error();}catch{voice.stop('Voice input could not be processed. Please reconnect.');}});
  client.on('close',()=>voice.stop());client.on('error',()=>voice.stop());voice.start().then(()=>send({type:'ready'})).catch(()=>voice.stop('Voice could not start. Check Meta access, budget and local MMS setup.'));
 });});
 server.on('close',()=>{for(const client of connections)client.terminate();sockets.close();mms.onModuleDestroy();});return server;
}
if(require.main===module){const port=Number(process.env.DEMO_PORT||3100);if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid DEMO_PORT');const server=createServer();server.listen(port,'127.0.0.1',()=>console.log(`Brisky synthetic fixture runner: http://localhost:${port}. Meta models only; no private engine or background indexing.`));for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit()));}
module.exports={createServer};
