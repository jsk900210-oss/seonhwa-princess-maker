import fs from 'node:fs';
import assert from 'node:assert/strict';

const css=fs.readFileSync(new URL('../src/schedule.css',import.meta.url),'utf8');
assert.match(css,/motion-resting\.rest-tea img\{[\s\S]*?object-fit:contain;object-position:center center;transform:scale\(\.94\)!important;clip-path:none!important/,'차 마시기 원화 전체가 표시되어야 합니다.');
assert.match(css,/@media\(max-width:430px\)[\s\S]*?motion-resting\.rest-tea\{width:124px;height:124px;bottom:5%;padding:11px\}/,'모바일 차 마시기 안전 여백이 필요합니다.');
console.log('PASS: 차 마시기 머리·머리장식 모바일 안전 여백');
