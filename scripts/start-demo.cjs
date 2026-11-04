const fs=require('fs'),path=require('path'),{spawn}=require('child_process');const root=path.resolve(__dirname,'..');
if(!fs.existsSync(path.join(root,'build/event-components/api/modules/pipeline/space-conversation.js'))){require('./build-demo.cjs');}
const args=fs.existsSync(path.join(root,'.env'))?['--env-file=.env']:[];
const child=spawn(process.execPath,[...args,'apps/demo/server.cjs'],{cwd:root,stdio:'inherit',windowsHide:true});child.on('exit',code=>{process.exitCode=code??1;});
