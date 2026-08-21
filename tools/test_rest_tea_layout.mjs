import fs from 'node:fs';
import assert from 'node:assert/strict';

const css=fs.readFileSync(new URL('../src/schedule.css',import.meta.url),'utf8');
assert.match(css,/motion-resting\.rest-tea img\{[\s\S]*?object-fit:contain!important;object-position:center bottom!important;transform:none!important;clip-path:none!important/,'차 마시기 원화 전체가 표시되어야 합니다.');
assert.match(css,/motion-resting\.rest-tea\{width:146px!important;height:146px!important;bottom:3%!important;padding:0!important\}/,'차 마시기 선화가 일반 일정 크기보다 작아지면 안 됩니다.');
assert.match(css,/@media\(max-width:430px\)[\s\S]*?motion-resting\.rest-tea\{width:132px!important;height:132px!important;bottom:3%!important\}/,'모바일 차 마시기도 공통 선화 크기를 유지해야 합니다.');
console.log('PASS: 차 마시기 머리·머리장식 모바일 안전 여백');
