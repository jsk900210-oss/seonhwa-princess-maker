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
console.log('PASS: 목공소 톱질·망치질 실제 1→2→3 프레임');
