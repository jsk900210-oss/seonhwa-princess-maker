import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

assert.ok(
  app.includes("item=>item.type!=='outfit'&&!collectionCardIds.has(item.id)"),
  '소지품 전체 탭에서도 의상 카드를 제외해야 합니다.',
);
assert.ok(
  app.includes("game.items.some(item=>item.type==='outfit'&&item.id===id)"),
  '구매 처리 직전에 보유 의상 ID를 다시 확인해야 합니다.',
);
assert.ok(
  app.includes("const owned=new Set(game.items.filter(item=>typeof item==='object').map(item=>item.id))") && app.includes('owned.has(outfit.id)'),
  '한복점 목록은 이미 보유한 의상을 구매 불가 상태로 표시해야 합니다.',
);
assert.ok(
  app.includes("const owned=game.items.filter(item=>item&&item.type==='outfit')"),
  '구매한 의상은 옷장에서 계속 확인할 수 있어야 합니다.',
);

console.log('PASS: 소지품에서 의상 카드 제외');
console.log('PASS: 한복점 목록과 구매 처리에서 의상 중복 구매 차단');
console.log('PASS: 구매 의상은 옷장에서 유지');
