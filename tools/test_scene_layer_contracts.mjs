import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../src/index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const schedule=readFileSync(new URL('../src/schedule.css',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

const outside=html.indexOf('class="background home-outside"');
const weather=html.indexOf('class="home-weather"');
const room=html.indexOf('class="home-room-foreground"');
assert.ok(outside>=0&&outside<weather&&weather<room,'home layers must be outside → weather → room/frame');
assert.match(css,/\.home-outside\{z-index:0/,'outside layer must be behind weather');
assert.match(css,/\.home-weather\{position:absolute;z-index:1/,'weather must be between outside and room');
assert.match(css,/\.home-room-foreground\{position:absolute;z-index:2/,'room/frame must be in front');
for(const layer of ['home-outside','home-weather','home-room-foreground'])assert.ok(css.includes(`.phone.playing>.${layer}`),`${layer} must be hidden during schedules`);
for(const mode of ['market-playing','vacation-playing'])for(const layer of ['home-outside','home-weather','home-room-foreground'])assert.ok(css.includes(`.phone.${mode}>.${layer}`),`${layer} must be hidden during ${mode}`);
assert.match(schedule,/action-holiday-seollal\{inset:0!important;[^}]*overflow:hidden!important\}/,'Seollal stage must fill the phone without an extra border');
assert.match(schedule,/\.sehwa-eight-entrant-scene \.sehwa-ensemble-base\{[^}]*opacity:1/,'the hall, floor and desks must remain a static base frame');
assert.match(schedule,/\.sehwa-eight-entrant-scene \.sehwa-ensemble-motion-patch\{[\s\S]*mask-image:[^;]+[\s\S]*animation:sehwa-eight-local-painting/,'only feathered regions around the eight painters may change pose');
assert.match(schedule,/animation:sehwa-brush-10fps 1s steps\(1,end\) 5 both/,'solo brush motion must run at 10fps for five seconds');
assert.doesNotMatch(schedule,/\.sehwa-hero\.is-brush-sheet\{[^}]*transform:/,'brush-sheet motion must not shake the whole character/table layer');
assert.match(app,/class="sehwa-ensemble-base"[^>]+drawing-1-v2/,'the approved stable base frame must be rendered');
assert.match(app,/\[2,3\]\.map\(\(frame,index\)=>`<img class="sehwa-ensemble-motion-patch"/,'only two localized motion patches may be composited above the base');
console.log('PASS: home layer order, schedule isolation, Seollal border and motion contracts');
