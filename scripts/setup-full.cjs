#!/usr/bin/env node
// Fetch a declared external dependency; never vendor it into this event repository.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const manifest=require('../docs/full-engine.json');
const target=path.join(root,'.engine');
const args=process.argv.slice(2).filter(v=>v!=='--');
if(args.includes('--help')){console.log('Usage: npm run setup:full [-- --check]\nClones the separately declared original engine at the pinned commit into ignored .engine. No dependency install, model download, Docker startup or paid inference. Follow docs/FULL-SETUP.md for credentials and startup.');process.exit(0);}
if(args.some(v=>v!=='--check'))throw Error('Unknown option; use --help');
function git(argv,cwd=root,capture=false){const r=spawnSync('git',argv,{cwd,encoding:'utf8',stdio:capture?'pipe':'inherit',windowsHide:true});if(r.error||r.status!==0)throw Error('Git operation failed. Check Git/network access; existing directories are never overwritten.');return(r.stdout||'').trim();}
try{
 if(!fs.existsSync(target)){
  if(args.includes('--check'))throw Error('Run npm run setup:full first.');
  git(['clone','--no-checkout',manifest.repository,target]);
  git(['checkout','--detach',manifest.commit],target);
 }
 if(git(['rev-parse','HEAD'],target,true)!==manifest.commit)throw Error('Existing .engine is at another revision; preserve it and choose a fresh checkout.');
 if(git(['remote','get-url','origin'],target,true)!==manifest.repository)throw Error('Unexpected engine remote.');
 for(const file of ['apps/api/src/common/meta-only-profile.ts','services/meta-embeddings/serve.py','docs/meta-only-runtime.md'])if(!fs.existsSync(path.join(target,file)))throw Error('Pinned engine lacks the required Meta-only integration.');
 console.log('Pinned full engine verified. Next: docs/FULL-SETUP.md. This does not start servers or validate your credentials.');
}catch(error){console.error(error.message);process.exitCode=1;}
