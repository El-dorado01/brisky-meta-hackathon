const fixtures=require('./fixtures.json');
const {spaceConversationSystem,parseSpaceReply}=require('../../build/event-components/api/modules/pipeline/space-conversation');
const {studioSystem,parseStudioDocument}=require('../../build/event-components/api/modules/pipeline/studio-document');
const {isVoiceAcknowledgement}=require('../../build/event-components/api/modules/conversation/meta-voice-stream');
const {complete}=require('./meta.cjs');
function parseJSON(text){const clean=text.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'');return JSON.parse(clean);}
function context(state,text){return {phase:'answer',history:[...state.history,{role:'user',content:text}].slice(-16),evidence:fixtures,selectionNotes:[],searchStatus:'complete'};}
async function chat(state,text,generate=complete){
 if(typeof text!=='string'||!text.trim()||text.length>4000)throw Error('Enter a request of up to 4000 characters.');
 const input=context(state,text.trim()),result=await generate(spaceConversationSystem('answer')+' This is an explicitly synthetic indexed fixture catalogue, not a real connected Drive. Explain that distinction if asked. Do not claim to have watched a video or detected/recognised a face. Return no citation IDs for greetings, thanks or general conversation. Give plain spoken-friendly text in the JSON text field.\nContext JSON: '+JSON.stringify(input),[]);
 const parsed=parseSpaceReply(parseJSON(result.text),input);if(parsed.action!=='reply')throw Error('Expected grounded reply');const citations=isVoiceAcknowledgement(text)?[]:parsed.citedEvidenceIds.map(id=>fixtures.find(e=>e.id===id));
 // Save only media exchanges. Casual call/chat discussion remains ephemeral.
 const saved=citations.length>0;state.history.push({role:'user',content:text.trim()},{role:'assistant',content:parsed.text});while(state.history.length>16||JSON.stringify(state.history).length>24000)state.history.splice(0,2);if(saved){state.saved.push({query:text.trim(),answer:parsed.text,citations});if(state.saved.length>30)state.saved.shift();}
 return {answer:parsed.text,citations,saved,mode:'synthetic-fixtures',model:result.model};
}
async function studio(state,format,goal,generate=complete){
 if(!['brief','storyline'].includes(format)||typeof goal!=='string'||goal.length>2000)throw Error('Choose a brief or storyline and a goal up to 2000 characters.');
 const evidence=fixtures.filter(e=>state.shortlist.includes(e.id));if(!evidence.length)throw Error('Shortlist at least one synthetic source first.');const input={format,goal,evidence};
 const result=await generate(studioSystem()+' These are synthetic indexed fixture observations. They are not original footage.\nInput JSON: '+JSON.stringify(input),[],'event_fixture_studio');
 const document=parseStudioDocument(parseJSON(result.text),input);state.documents.push(document);return {document,mode:'synthetic-fixtures',model:result.model};
}
module.exports={fixtures,chat,studio,parseJSON};
