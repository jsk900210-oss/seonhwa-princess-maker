import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const snippet=app.slice(app.indexOf('const baseSpritePaths='),app.indexOf('const guardianDefs='));
const context=vm.createContext({game:{age:11}});
vm.runInContext(snippet,context);
for(const age of [9,10,11,12,13,14,15]){
  const asset=vm.runInContext(`baseSpriteForAge(${age})`,context);
  assert.match(asset,/black-hair-v10/);
  assert.ok(fs.existsSync(new URL(`../src/${asset}`,import.meta.url)));
}
assert.match(vm.runInContext('baseSpriteForAge()',context),/age09/);
console.log('PASS: age 9–15 black-hair mapping, age 11 saved-state default, assets exist');
