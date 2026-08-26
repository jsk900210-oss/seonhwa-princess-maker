import fs from 'node:fs';
import assert from 'node:assert/strict';

const css=fs.readFileSync(new URL('../src/schedule.css',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
assert.match(css,/motion-resting\.rest-tea img\{[\s\S]*?object-fit:contain!important;object-position:center bottom!important;transform:none!important;clip-path:none!important/,'차 마시기 원화 전체가 표시되어야 합니다.');
assert.match(css,/motion-resting\.rest-tea\{width:146px!important;height:146px!important;bottom:3%!important;padding:0!important\}/,'차 마시기 선화가 일반 일정 크기보다 작아지면 안 됩니다.');
assert.match(css,/@media\(max-width:430px\)[\s\S]*?motion-resting\.rest-tea\{width:132px!important;height:132px!important;bottom:3%!important\}/,'모바일 차 마시기도 공통 선화 크기를 유지해야 합니다.');
assert.ok(app.includes("stageCharacter.className = `stage-character pixel-sprite ${presentation.motion}${restActivity==='tea'?' rest-tea':''}`"),'차 마시기 시작 프레임부터 전용 크기를 적용해야 합니다.');
assert.ok(app.includes("const restActivity=action.id==='rest'?(index%14<7?'tea':'sleep'):null"),'휴식 페이즈는 전반 차·후반 잠 순서를 고정해야 합니다.');
assert.ok(app.includes("action.id==='rest'&&![0,7].includes(index%14)"),'차와 잠은 페이즈마다 각각 한 번만 전체 루프를 재생해야 합니다.');
console.log('PASS: 차 마시기 머리·머리장식 모바일 안전 여백');
