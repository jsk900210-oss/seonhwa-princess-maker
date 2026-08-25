import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const sharpEntry=path.join(process.env.USERPROFILE||'','.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs');
if(!fs.existsSync(sharpEntry))throw new Error(`Codex bundled sharp missing: ${sharpEntry}`);
const {default:sharp}=await import(pathToFileURL(sharpEntry));

const root=path.resolve(import.meta.dirname,'..');
const packs=path.join(root,'assets','schedule-layers-v2');
const frameKeys=new Set(['frames','heroFrames','npcFrames','failureHeroFrames','npcFailureFallFrames','existingHeroFrames']);
const sequences=[];

function collect(value,base){
  if(Array.isArray(value)){
    for(const child of value)collect(child,base);
    return;
  }
  if(!value||typeof value!=='object')return;
  for(const [key,child] of Object.entries(value)){
    if(frameKeys.has(key)&&Array.isArray(child)&&child.length>=2&&child.every(item=>typeof item==='string')){
      sequences.push(child.map(item=>path.resolve(base,item)));
    }else collect(child,base);
  }
}

for(const entry of fs.readdirSync(packs,{withFileTypes:true})){
  if(!entry.isDirectory())continue;
  const manifestPath=path.join(packs,entry.name,'manifest.json');
  if(!fs.existsSync(manifestPath))continue;
  collect(JSON.parse(fs.readFileSync(manifestPath,'utf8')),path.dirname(manifestPath));
}

for(const sequence of sequences){
  for(const file of sequence)if(!fs.existsSync(file))throw new Error(`활성 프레임 누락: ${file}`);
  const hashes=sequence.map(file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'));
  if(new Set(hashes).size===1)throw new Error(`정지 이미지로 구성된 활성 프레임: ${sequence.join(' | ')}`);
  for(const file of sequence){
    if(path.extname(file).toLowerCase()!=='.png')continue;
    const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    let touchesEdge=false;
    for(let x=0;x<info.width;x+=1)if(data[x*4+3]>20||data[((info.height-1)*info.width+x)*4+3]>20)touchesEdge=true;
    for(let y=0;y<info.height;y+=1)if(data[(y*info.width)*4+3]>20||data[(y*info.width+info.width-1)*4+3]>20)touchesEdge=true;
    if(touchesEdge)throw new Error(`활성 프레임이 투명 캔버스 가장자리에 닿음: ${file}`);
  }
}

console.log(`PASS: 활성 일정 ${sequences.length}개 프레임 묶음은 실제 서로 다른 이미지`);
