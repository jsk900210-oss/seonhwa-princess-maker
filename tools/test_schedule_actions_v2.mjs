import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const dir=path.join(root,'assets/characters/seonhwa/schedule-actions/v2');
const files=fs.readdirSync(dir).filter(name=>name.endsWith('.png'));
assert.equal(files.length,82,'v2 일정 스프라이트는 82개여야 합니다.');
const sleep=[1,2,3].map(frame=>path.join(dir,`sleep-pixel-v2-${frame}.png`));
const hashes=sleep.map(file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'));
assert.equal(new Set(hashes).size,1,'잠자리 3컷은 각도·이불·베개·침구가 완전히 동일해야 합니다.');
for(const file of files){
  const png=fs.readFileSync(path.join(dir,file));
  assert.equal(png.readUInt32BE(16),320,`${file}: width`);
  assert.equal(png.readUInt32BE(20),320,`${file}: height`);
  assert.equal(png[25],6,`${file}: RGBA required`);
}
console.log('PASS: v2 82개 320×320 RGBA + 잠자리 3컷 침구/각도 완전 동일');
