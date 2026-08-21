import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
const expected=['painting','music','dance','swordsmanship','spellcraft','cooking','martial','classics','farmwork','childcare','kitchenhelp','woodwork','loomwork','masonry','clinichelp','innhelp','sewing','copying','ferryhelp','merchanthelp','accounting','tutoring'];
const fail=message=>{throw new Error(message);};
const exists=relative=>fs.existsSync(path.resolve(root,relative.replace(/^\.\.\//,'')));

for(const id of expected){
  const spec=manifest.schedules?.[id]||fail(`manifest schedule missing: ${id}`);
  if(spec.existingHeroFrames?.length!==3)fail(`${id}: hero frames must be 3`);
  if(spec.npc?.length!==3)fail(`${id}: npc frames must be 3`);
  for(const key of ['success-a','success-b','fail-a','fail-b'])if(spec.patterns?.[key]?.length!==3)fail(`${id}/${key}: pattern frames must be 3`);
  for(const hero of spec.existingHeroFrames){
    if(!hero.includes('assets/characters/seonhwa/schedule-actions/')||!/-pixel-[123]\.png$/.test(hero))fail(`${id}: forbidden hero frame ${hero}`);
    if(!exists(hero))fail(`${id}: missing hero frame ${hero}`);
  }
  const layerFiles=[spec.backgroundOverlay,...spec.npc,...Object.values(spec.patterns).flat()];
  for(const file of layerFiles)if(!fs.existsSync(path.join(root,'assets','schedule-layers',id,file)))fail(`${id}: missing layer ${file}`);
}

const app=fs.readFileSync(path.join(root,'src','app.js'),'utf8');
if(!app.includes("for(let frame=0;frame<3;frame+=1)"))fail('common renderer does not enforce 1→2→3');
if(!app.includes("has('qaSchedules')"))fail('QA unlock query mode missing');
if(app.includes('playKitchenhelpScene'))fail('legacy kitchen-only renderer still present');
console.log(`PASS: ${expected.length} locked schedules, manifest paths, 3-frame variants, common renderer, QA unlock mode`);
