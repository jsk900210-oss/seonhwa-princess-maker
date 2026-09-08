(function(root){
  'use strict';
  const diets=Object.freeze({
    simple:{name:'소박한 밥상',cost:8,recovery:0,description:'하루 8냥 · 추가 회복 없음'},
    balanced:{name:'균형 잡힌 밥상',cost:15,recovery:1,description:'하루 15냥 · 체력 +1'},
    nourishing:{name:'보양 밥상',cost:28,recovery:2,description:'하루 28냥 · 체력 +2'}
  });
  function normalize(state){
    state.dietPolicy=Object.hasOwn(diets,state.dietPolicy)?state.dietPolicy:'balanced';
    state.illnessDays=Math.max(0,Math.min(3,Math.floor(Number(state.illnessDays)||0)));
  }
  function beginDay(state){
    normalize(state);
    if(state.illnessDays===0&&Number(state.stress)>=95)state.illnessDays=3;
    return state.illnessDays>0;
  }
  function settleDay(state,resting){
    normalize(state);
    const diet=diets[state.dietPolicy],money=Math.max(0,Number(state.money)||0);
    const affordable=money>=diet.cost,meal=affordable?diet:diets.simple;
    const cost=Math.min(money,meal.cost),fed=cost===meal.cost;
    state.money=money-cost;
    const beforeHealth=Number(state.health)||0,beforeStress=Number(state.stress)||0;
    state.health=Math.max(0,Math.min(999,beforeHealth+(fed?meal.recovery:-1)));
    state.stress=Math.max(0,Math.min(100,beforeStress+(fed?0:1)));
    const health=state.health-beforeHealth,stress=state.stress-beforeStress;
    if(resting&&state.illnessDays>0)state.illnessDays--;
    return {cost,change:{health,stress},meal:meal.name,shortfall:!affordable};
  }
  function treat(state){
    normalize(state);
    if(!state.illnessDays)return {ok:false,reason:'지금은 치료가 필요하지 않아요.'};
    if(state.money<150)return {ok:false,reason:'치료비 150냥이 부족해요. 집에서 쉬어도 회복할 수 있어요.'};
    state.money-=150;state.illnessDays=Math.max(0,state.illnessDays-2);
    state.stress=Math.max(0,state.stress-8);
    return {ok:true,cost:150};
  }
  root.SeonhwaCare=Object.freeze({diets,normalize,beginDay,settleDay,treat});
})(globalThis);
