// Deliberately scripted fixture walkthrough. No model calls or original footage.
const fixtures=require('./fixtures.json');
async function chat(state,text){
 if(typeof text!=='string'||!text.trim()||text.length>4000)throw Error('Enter a request of up to 4000 characters.');
 const query=text.toLowerCase();let citations=[];
 if(/kitchen|danc/.test(query))citations=[fixtures[0]];
 else if(/lecture|diagram|explanation/.test(query))citations=[fixtures[1]];
 else if(/garden|tree|plant/.test(query))citations=[fixtures[2]];
 let answer=citations.length?citations.map(e=>e.description+(e.transcript?' Sample transcript: '+e.transcript:'')).join('\n'):
  /identity|uncle|sister|who|name|relationship|relative/.test(query)?'These synthetic observations do not establish anyone\'s identity or family relationship.':
  'Try "Find the kitchen dancing moment", "Find the lecture explanation", or "Find the garden memory". This offline walkthrough uses scripted fixture matching, not AI.';
 answer='[SCRIPTED OFFLINE SAMPLE]\n'+answer;
 const saved=citations.length>0;if(saved){state.saved.push({query:text,answer,citations});if(state.saved.length>30)state.saved.shift();}
 return {answer,citations,saved,mode:'offline-scripted-sample',model:null};
}
async function studio(state,format,goal){
 if(!['brief','storyline'].includes(format)||typeof goal!=='string'||goal.length>2000)throw Error('Choose a brief or storyline and a goal up to 2000 characters.');
 const evidence=fixtures.filter(e=>state.shortlist.includes(e.id));if(!evidence.length)throw Error('Shortlist at least one synthetic source first.');
 const document={title:'Scripted sample '+format,summary:'Offline template using authored synthetic observations. No AI inference or real media processing occurred.',
  sections:evidence.map((e,i)=>({heading:(format==='storyline'?'Sample beat '+(i+1)+': ':'')+e.title,body:e.description+(e.transcript?'\nSample transcript: '+e.transcript:''),evidenceIds:[e.id]})),
  suggestions:['These independent fixtures do not establish a shared timeline. This is a scripted workflow demonstration, not model output.']};
 state.documents.push(document);if(state.documents.length>30)state.documents.shift();return {document,mode:'offline-scripted-sample',model:null};
}
module.exports={chat,studio};
