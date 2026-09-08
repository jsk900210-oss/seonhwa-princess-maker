// Temporary blank renderer while the protagonist art is rebuilt.
// Stored game progress and NPC assets are deliberately untouched.
(()=>{
  const blank='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
  const removed=value=>/assets\/characters\/(?:seonhwa|dialogue-fullbody\/seonhwa)\/|\/hero-actions\/|holidays\/[^/]+\/seonhwa\/|seonhwa-(?:gesture|age\d.*photoreal)/i.test(String(value));
  const clean=value=>removed(value)?blank:value;
  const descriptor=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
  Object.defineProperty(HTMLImageElement.prototype,'src',{...descriptor,set(value){descriptor.set.call(this,clean(value));}});
  const setAttribute=Element.prototype.setAttribute;
  Element.prototype.setAttribute=function(name,value){return setAttribute.call(this,name,this instanceof HTMLImageElement&&name.toLowerCase()==='src'?clean(value):value);};
  const html=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
  Object.defineProperty(Element.prototype,'innerHTML',{...html,set(value){
    html.set.call(this,String(value).replace(/\bsrc=(['"])(.*?)\1/g,(all,q,src)=>`src=${q}${clean(src)}${q}`));
  }});
  window.SeonhwaCharacterReset=Object.freeze({blank,removed});
})();
