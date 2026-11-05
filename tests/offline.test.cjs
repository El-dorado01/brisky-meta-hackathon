const {test}=require('node:test'),assert=require('node:assert/strict');
const {createServer}=require('../apps/demo/server.cjs');
test('offline judge walkthrough needs no credentials and clearly labels scripted outputs',async()=>{
 const server=createServer({DEMO_OFFLINE:'true'});
 const host=await new Promise(resolve=>server.listen(0,'127.0.0.1',()=>resolve('http://127.0.0.1:'+server.address().port)));
 try{
  const response=await fetch(host+'/api/state'),state=await response.json(),cookie=response.headers.get('set-cookie').split(';')[0];
  assert.equal(state.offline,true);assert.equal(state.configured,false);assert.equal(state.voiceEnabled,false);
  const post=async(route,body)=>{const r=await fetch(host+route,{method:'POST',headers:{'Content-Type':'application/json',Origin:host,Cookie:cookie},body:JSON.stringify(body)});return {status:r.status,data:await r.json()};};
  const match=await post('/api/chat',{text:'Find the kitchen dancing moment'});
  assert.equal(match.status,200);assert.match(match.data.answer,/SCRIPTED OFFLINE SAMPLE/);assert.equal(match.data.citations[0].id,'e1');assert.equal(match.data.model,null);
  assert.equal((await post('/api/studio',{format:'brief',goal:'test'})).status,503);
  await post('/api/shortlist',{ids:['e1']});
  for(const format of ['brief','storyline']){const result=await post('/api/studio',{format,goal:'test'});assert.equal(result.status,200);assert.equal(result.data.model,null);assert.match(result.data.document.summary,/No AI inference/);assert.deepEqual(result.data.document.sections[0].evidenceIds,['e1']);}
  const unknown=await post('/api/chat',{text:'Which clip proves these people are my relatives?'});assert.equal(unknown.data.citations.length,0);assert.match(unknown.data.answer,/do not establish/);
  assert.equal((await post('/api/voice/live-ticket',{})).status,503);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
