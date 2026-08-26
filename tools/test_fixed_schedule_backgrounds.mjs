import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css=readFileSync(new URL('../src/schedule.css',import.meta.url),'utf8');
assert.match(css,/\.phone\.playing:not\(\.vacation-playing\) \.activity-stage\.pm3-phase-scene \.stage-map\{animation:none!important;transform:none!important;will-change:auto!important\}/,'일정·이벤트 배경은 고정되어야 합니다.');
assert.doesNotMatch(css,/@keyframes pm3-ken-burns/,'일정 배경에 켄번즈 이동을 남기면 안 됩니다.');
assert.match(css,/@keyframes pm3-scene-enter\{0%\{opacity:\.4\}100%\{opacity:1\}\}/,'장면 전환은 위치 이동 없는 페이드여야 합니다.');
assert.match(css,/animation:vacation-child-camera 10\.5s/,'별도 바캉스 연출은 유지해야 합니다.');
console.log('PASS: 일정·이벤트 배경 고정, 페이드 전환, 바캉스 예외 유지');
