(function(root){
  'use strict';
  const regions=Object.freeze([
    {id:'east-forest',name:'동쪽 숲',difficulty:160,treasure:100,enemy:'숲의 산짐승',chest:[4,0],monster:[3,3]},
    {id:'west-desert',name:'서쪽 벌판',difficulty:240,treasure:150,enemy:'벌판의 도적',chest:[0,0],monster:[1,2]},
    {id:'south-lake',name:'남쪽 호수',difficulty:330,treasure:210,enemy:'호수의 물귀신',chest:[4,1],monster:[3,2]},
    {id:'north-glacier',name:'북쪽 설원',difficulty:450,treasure:290,enemy:'설원의 요수',chest:[2,0],monster:[2,2]}
  ]);
  const num=value=>Math.max(0,Number(value)||0);
  function combat(state,region,gear={sword:0,magic:0},roll=Math.random()){
    const sword=num(state.strength)+num(state.combatSkill)+num(state.combatAttack)+num(gear.sword);
    const magic=num(state.magic)+num(state.magicSkill)+num(state.magicAttack)+num(gear.magic);
    const style=magic>sword?'magic':'sword',power=Math.max(sword,magic);
    const defense=num(style==='magic'?state.magicDefense:state.combatDefense);
    const chance=Math.max(.1,Math.min(.95,.45+(power+defense*.3-region.difficulty)/600-num(state.stress)/250));
    const won=roll<chance;
    return {won,style,chance,money:won?Math.round(region.treasure*.6):0,change:won?{[style==='magic'?'magicReputation':'combatReputation']:3}:{health:-3,stress:3}};
  }
  function remember(state,region,result){
    if(!state.exploration||typeof state.exploration!=='object')state.exploration={regions:{},visitedEvents:[]};
    if(!state.exploration.regions||typeof state.exploration.regions!=='object')state.exploration.regions={};
    const prior=state.exploration.regions[region.id]||{};
    state.exploration.regions[region.id]={visits:num(prior.visits)+1,victories:num(prior.victories)+(result.won?1:0),chests:num(prior.chests)+(result.chest?1:0),earnings:num(prior.earnings)+num(result.money),lastDate:result.date};
  }
  root.SeonhwaExploration=Object.freeze({regions,combat,remember});
})(globalThis);
