import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),sharp=require('C:/Users/jsk90/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const args=Object.fromEntries(process.argv.slice(2).map(value=>value.split(/=(.*)/s).slice(0,2)));
const outputRoot=path.resolve(import.meta.dirname,'../assets/cinematics/guardian/humanized/poses');
const moods=['neutral','happy','concerned','surprised'];

function backdrop(red,green,blue){
  const minimum=Math.min(red,green,blue),maximum=Math.max(red,green,blue);
  return minimum>=198&&maximum-minimum<=30;
}

for(const [type,input] of Object.entries(args)){
  const image=sharp(input).ensureAlpha();
  const metadata=await image.metadata();
  const width=Math.floor(metadata.width/2),height=Math.floor(metadata.height/2);
  for(let index=0;index<4;index++){
    const {data,info}=await image.clone().extract({left:(index%2)*width,top:Math.floor(index/2)*height,width,height}).raw().toBuffer({resolveWithObject:true});
    const visited=new Uint8Array(info.width*info.height),queue=new Int32Array(info.width*info.height);let head=0,tail=0;
    const enqueue=(x,y)=>{
      if(x<0||x>=info.width||y<0||y>=info.height)return;
      const point=y*info.width+x;if(visited[point])return;visited[point]=1;
      const offset=point*4;if(backdrop(data[offset],data[offset+1],data[offset+2]))queue[tail++]=point;
    };
    for(let x=0;x<info.width;x++){enqueue(x,0);enqueue(x,info.height-1);}
    for(let y=0;y<info.height;y++){enqueue(0,y);enqueue(info.width-1,y);}
    while(head<tail){
      const point=queue[head++],x=point%info.width,y=Math.floor(point/info.width),offset=point*4;data[offset+3]=0;
      enqueue(x-1,y);enqueue(x+1,y);enqueue(x,y-1);enqueue(x,y+1);
    }
    const target=path.join(outputRoot,`${type}-${moods[index]}-transparent-v2.png`);
    await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).png().toFile(target);
  }
}
