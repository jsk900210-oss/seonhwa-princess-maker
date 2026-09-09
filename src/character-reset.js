// Temporary blank renderer while the protagonist art is rebuilt.
// Stored game progress and prologue assets are deliberately untouched.
// Vacation, ending and holiday art (including their NPCs) was reset by request.
(()=>{
  const blank='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  const removed=value=>/assets\/(?:events\/(?:vacation|holidays)|endings)\/|assets\/characters\/(?:seonhwa|dialogue-fullbody\/seonhwa)\/|\/hero-actions\/|seonhwa-(?:gesture|age\d.*photoreal)/i.test(String(value));
  const approvedHome=value=>/assets\/characters\/seonhwa\/home\/age-(?:09-12|13-15|16-17|18-plus)\/seonhwa-home-age(?:09-12-(?:transparent-v1|skin-v[23])|13-15-skin-v[23]|(?:13-15|16-17|18-plus)-review-v4)\.png(?:[?#]|$)/.test(String(value));
  const clean=value=>approvedHome(value)?value:removed(value)?blank:value;
  const descriptor=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
  Object.defineProperty(HTMLImageElement.prototype,'src',{...descriptor,set(value){descriptor.set.call(this,clean(value));}});
  const setAttribute=Element.prototype.setAttribute;
  Element.prototype.setAttribute=function(name,value){return setAttribute.call(this,name,this instanceof HTMLImageElement&&name.toLowerCase()==='src'?clean(value):value);};
  const html=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
  Object.defineProperty(Element.prototype,'innerHTML',{...html,set(value){
    html.set.call(this,String(value).replace(/\bsrc=(['"])(.*?)\1/g,(all,q,src)=>`src=${q}${clean(src)}${q}`).replace(/url\(([^)]*)\)/g,(all,url)=>removed(url)?'none':all));
  }});
  window.SeonhwaCharacterReset=Object.freeze({blank,removed});
})();
