import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../src/index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const themes=['sensitivity','charm','sense','dignity'];

assert.match(html,/id="homeSehwaGallery"/);
assert.match(html,/id="homeSehwaArtwork"/);
assert.match(css,/\.home-sehwa-gallery/);
assert.match(app,/sehwaWins:\[\]/);
assert.match(app,/latestSehwaArtwork:null/);
assert.match(app,/game\.sehwaWins\.find\(record=>Number\(record\.year\)===year\)/);
assert.match(app,/holidayContestResult\.homeArtwork=awardSehwaArtwork/);
assert.match(app,/renderHomeSehwaArtwork\(\)/);

for(const theme of themes){
  const asset=new URL(`../assets/events/holidays/sehwa-contest/winning-artworks/${theme}-v1.png`,import.meta.url);
  assert.equal(fs.existsSync(asset),true,`${theme} artwork asset missing`);
  assert.ok(fs.statSync(asset).size>100_000,`${theme} artwork asset is unexpectedly small`);
  assert.match(app,new RegExp(`${theme}:\\{title:`));
  const childAsset=new URL(`../assets/events/holidays/sehwa-contest/winning-artworks/${theme}-child-v1.png`,import.meta.url);
  assert.equal(fs.existsSync(childAsset),true,`${theme} child artwork asset missing`);
  assert.ok(fs.statSync(childAsset).size>100_000,`${theme} child artwork asset is unexpectedly small`);
}
assert.match(app,/Number\(age\)<=12\?def\?\.childAsset:def\?\.asset/);
assert.match(app,/asset:sehwaArtworkAsset\(record\.theme,record\.age\)/);

console.log('Sehwa annual winner gallery contract: OK');
