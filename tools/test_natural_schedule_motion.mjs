import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/schedule-layers-v2/woodwork/manifest.json'),'utf8'));
for(const [pattern,stem] of [['success-a','sawing'],['success-b','hammering']]){
  const spec=manifest.patterns[pattern];
  if(!spec.heroIncludesProp)throw new Error(`${pattern}: heroIncludesProp missing`);
  if(spec.heroFrames.length!==3)throw new Error(`${pattern}: not three frames`);
  const hashes=spec.heroFrames.map((file,index)=>{
    if(!file.endsWith(`${stem}-${index+1}.png`))throw new Error(`${pattern}: sequence is not 1→2→3`);
    const full=path.join(root,'assets/schedule-layers-v2/woodwork',file);
    if(!fs.existsSync(full))throw new Error(`${pattern}: missing ${file}`);
    return crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
  });
  if(new Set(hashes).size!==3)throw new Error(`${pattern}: duplicate static frames`);
}
const app=fs.readFileSync(path.join(root,'src/app.js'),'utf8');
if(!app.includes('patternSpec?.heroFrames?.length===3'))throw new Error('pattern-specific hero renderer missing');
const herbStartle='assets/characters/seonhwa/schedule-actions/herbs-startle-arms-up-v1.png';
if(!fs.existsSync(path.join(root,herbStartle)))throw new Error('약초 뽑기 손 번쩍 프레임 누락');
const herbPng=fs.readFileSync(path.join(root,herbStartle));
if(herbPng.readUInt32BE(16)!==320||herbPng.readUInt32BE(20)!==320||herbPng[25]!==6){
  throw new Error('약초 손 번쩍 프레임은 320×320 RGBA PNG여야 함');
}
const startleIndex=app.indexOf("actionId==='herbs'");
const fallLoopIndex=app.indexOf('for(const frame of order)',startleIndex);
if(startleIndex<0||fallLoopIndex<0||!app.slice(startleIndex,fallLoopIndex).includes('herbs-startle-arms-up-v1.png')){
  throw new Error('약초 손 번쩍 프레임이 넘어짐보다 먼저 재생되지 않음');
}
console.log('PASS: 목공소 실제 1→2→3 모션 + 약초 실패 손 번쩍 선행 프레임');
