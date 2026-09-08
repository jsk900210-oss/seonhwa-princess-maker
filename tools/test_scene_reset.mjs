import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
class Element {
  setAttribute(name,value){this[name+'Attr']=value;}
  set innerHTML(value){this.markup=value;}
  get innerHTML(){return this.markup;}
}
class HTMLImageElement extends Element {
  set src(value){this.source=value;}
  get src(){return this.source;}
}
const context=vm.createContext({Element,HTMLImageElement,window:{}});
vm.runInContext(fs.readFileSync(new URL('../src/character-reset.js',import.meta.url),'utf8'),context);
const {blank,removed}=context.window.SeonhwaCharacterReset;
for(const path of ['events/vacation/x.webp','events/holidays/x.png','endings/x.webp']){
  const url='../assets/'+path;
  assert.ok(removed(url));
  const image=new HTMLImageElement();image.src=url;assert.equal(image.src,blank);
  image.setAttribute('src',url);assert.equal(image.srcAttr,blank);
  const container=new Element();container.innerHTML=`<img src="${url}"><div style="background:url('${url}')"></div>`;
  assert.ok(!container.innerHTML.includes(url));
}
const prologue='../assets/cinematics/prologue/p6-awaken.webp';
const image=new HTMLImageElement();image.src=prologue;assert.equal(image.src,prologue);
for(const path of ['events/vacation','events/holidays','endings'])assert.ok(!fs.existsSync(new URL('../assets/'+path,import.meta.url)));
assert.equal(fs.readdirSync(new URL('../assets/cinematics/prologue/',import.meta.url)).filter(name=>/\.(webp|png|jpg)$/.test(name)).length,10);
console.log('PASS: deleted directories, 10 prologue images preserved, image/markup requests cleared');
