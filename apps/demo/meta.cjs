const {randomUUID}=require('crypto');
const {ConfigService}=require('@nestjs/config');
const {AiUsageLedger}=require('../../build/event-components/api/modules/pipeline/ai-usage-ledger');
const {readMetaVoiceStream}=require('../../build/event-components/api/modules/conversation/meta-voice-stream');
const ALLOWED=new Set(['muse-wonder-1.0','muse-spark-1.3','muse-spark-1.2']);
function configuration(env=process.env){
 if(env.DEMO_ENGINE_MODE&&env.DEMO_ENGINE_MODE!=='fixtures')throw Error('This runner only supports the declared synthetic fixture mode.');
 for(const name of ['AI_PROVIDER','EMBEDDING_PROVIDER','TRANSCRIPTION_PROVIDER'])if(env[name]&&!['meta','none','ai'].includes(env[name]))throw Error('Non-Meta runtime configuration rejected: '+name);
 const model=env.DEMO_CHAT_MODEL||'muse-wonder-1.0';if(!ALLOWED.has(model))throw Error('Unsupported Meta model');
 if(env.META_VOICE_MODEL&&!ALLOWED.has(env.META_VOICE_MODEL))throw Error('Unsupported voice model');
 return {model,key:env.META_API_KEY||'',voice:env.DEMO_VOICE_ENABLED==='true'};
}
async function complete(system,messages,stage='event_fixture_reply',fetcher=fetch,env=process.env){
 const config=configuration(env);if(!config.key)throw Error('Add META_API_KEY to .env to make a live Meta request. No model response has been simulated.');
 const ledger=new AiUsageLedger(new ConfigService(env)),attempt=ledger.reserve('meta',config.model,stage,randomUUID()),start=Date.now();let usage,settled=false,answer='',finish='';
 try{
  const response=await fetcher('https://api.meta.ai/v1/chat/completions',{method:'POST',redirect:'error',headers:{Authorization:'Bearer '+config.key,'Content-Type':'application/json'},body:JSON.stringify({model:config.model,store:false,stream:true,stream_options:{include_usage:true},max_completion_tokens:1800,reasoning_effort:'minimal',messages:[{role:'system',content:system},...(messages.length?messages:[{role:'user',content:'Answer the latest request in the supplied input/context, following its JSON output contract.'}])]}),signal:AbortSignal.timeout(60000)});
  if(!response.ok){await response.body?.cancel();throw Error('Meta request HTTP '+response.status);}
  await readMetaVoiceStream(response.body,value=>{if(value.usage)usage=value.usage;const choice=value.choices?.[0];if(choice?.finish_reason)finish=choice.finish_reason;if(typeof choice?.delta?.content==='string'){answer+=choice.delta.content;if(answer.length>30000)throw Error('Response exceeds bound');}},new AbortController().signal);
  if(finish!=='stop'||!answer.trim())throw Error('Meta response was incomplete');ledger.settle(attempt,'success',Date.now()-start,usage?.prompt_tokens,usage?.completion_tokens);settled=true;
  return {text:answer,model:config.model,elapsedMs:Date.now()-start};
 }catch(error){if(!settled)ledger.settle(attempt,'error',Date.now()-start,usage?.prompt_tokens,usage?.completion_tokens);throw error;}
}
module.exports={configuration,complete};
