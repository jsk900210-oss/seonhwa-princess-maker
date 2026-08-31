import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const governance=JSON.parse(readFileSync(path.join(root,'assets','asset-governance.json'),'utf8'));
const shippingSource=['src/app.js','src/index.html','src/style.css','src/schedule.css']
  .map(file=>readFileSync(path.join(root,file),'utf8')).join('\n');
const ids=new Set();
for(const asset of governance.assets){
  assert.ok(asset.id&&!ids.has(asset.id),`duplicate asset id: ${asset.id}`);ids.add(asset.id);
  assert.ok(['approved','retired'].includes(asset.status),`invalid status: ${asset.id}`);
  assert.ok(asset.purpose||asset.reason,`asset needs purpose or reason: ${asset.id}`);
  assert.ok(existsSync(path.join(root,asset.path)),`tracked asset missing: ${asset.path}`);
  if(asset.status==='retired'){
    assert.ok(asset.replacedBy&&ids.has(asset.replacedBy),`retired asset needs an earlier approved replacement: ${asset.id}`);
    assert.ok(!shippingSource.includes(asset.path.replace(/^assets\//,'../assets/')),`retired asset is still referenced: ${asset.path}`);
  }
}
console.log(`PASS: ${governance.assets.filter(a=>a.status==='approved').length} approved and ${governance.assets.filter(a=>a.status==='retired').length} retired generated assets`);
