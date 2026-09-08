(function(root){
  'use strict';
  const rules=Object.freeze({
    id:'pm2-classic-seonhwa-v1',
    calendar:Object.freeze({scheduleSlots:3,slotNames:['초순','중순','하순'],daysPerSlot:[10,10,10],startAge:9,endAge:19}),
    annualAllowance:Object.freeze({month:1,day:1,base:5000,trustMinimum:2500,trustMaximum:7500}),
    conditionThresholds:Object.freeze({tired:40,irritable:60,overworked:80,ill:95}),
    reputations:Object.freeze(['combatReputation','magicReputation','socialReputation']),
    moralStats:Object.freeze(['morality','sin','faith','housework']),
    combatStats:Object.freeze(['combatSkill','combatAttack','combatDefense','magicSkill','magicAttack','magicDefense']),
    contests:Object.freeze([
      Object.freeze({id:'martial-tournament',name:'무예 대회',primary:['combatReputation','combatSkill','combatAttack']}),
      Object.freeze({id:'royal-dance',name:'궁중 무용회',primary:['socialReputation','dignity','charm']}),
      Object.freeze({id:'sehwa-exhibition',name:'왕실 세화전',primary:['socialReputation','sensitivity','sense']}),
      Object.freeze({id:'royal-cookoff',name:'궁중 음식 경연',primary:['housework','sense','health']})
    ]),
    explorationRegions:Object.freeze([
      Object.freeze({id:'east-forest',name:'동쪽 숲',element:'wood'}),
      Object.freeze({id:'west-desert',name:'서쪽 벌판',element:'metal'}),
      Object.freeze({id:'south-lake',name:'남쪽 호수',element:'fire'}),
      Object.freeze({id:'north-glacier',name:'북쪽 설원',element:'water'})
    ]),
    endingAxes:Object.freeze(['career','socialStanding','marriage','guardianBond'])
  });
  const defaults=Object.freeze({
    rulesetId:rules.id,morality:50,sin:0,faith:0,housework:0,
    combatReputation:0,magicReputation:0,socialReputation:0,
    combatSkill:0,combatAttack:0,combatDefense:0,magicSkill:0,magicAttack:0,magicDefense:0,
    condition:'stable',illnessDays:0,delinquent:false,runaway:false,dietPolicy:'balanced',
    monthlySchedule:[],annualAllowanceYears:[],royalContacts:{},rivals:{},
    exploration:{regions:{},visitedEvents:[]},endingHistory:[]
  });
  function clone(value){return JSON.parse(JSON.stringify(value));}
  function number(value,fallback=0){return Number.isFinite(Number(value))?Number(value):fallback;}
  function clamp(value,min,max){return Math.max(min,Math.min(max,number(value,min)));}
  function conditionFor(stress){const value=clamp(stress,0,100);if(value>=95)return 'ill';if(value>=80)return 'overworked';if(value>=60)return 'irritable';if(value>=40)return 'tired';return 'stable';}
  function normalizeState(source={}){
    const state=Object.assign(clone(defaults),source||{});
    [...rules.reputations,...rules.moralStats,...rules.combatStats].forEach(key=>{state[key]=clamp(state[key],0,999);});
    state.illnessDays=Math.max(0,Math.floor(number(state.illnessDays)));
    state.condition=conditionFor(source.stress);
    state.monthlySchedule=Array.isArray(state.monthlySchedule)?state.monthlySchedule.slice(0,3):[];
    state.annualAllowanceYears=Array.isArray(state.annualAllowanceYears)?[...new Set(state.annualAllowanceYears.map(Number).filter(Number.isFinite))]:[];
    state.royalContacts=state.royalContacts&&typeof state.royalContacts==='object'?state.royalContacts:{};
    state.rivals=state.rivals&&typeof state.rivals==='object'?state.rivals:{};
    state.exploration=state.exploration&&typeof state.exploration==='object'?state.exploration:clone(defaults.exploration);
    state.endingHistory=Array.isArray(state.endingHistory)?state.endingHistory:[];
    state.rulesetId=rules.id;
    return state;
  }
  function allowanceForTrust(trust){return Math.round(2500+5000*(clamp(trust,0,100)/100));}
  // 선화 전용 균형값: 성공한 활동이 해당 기술과 명성에 실제로 남는다.
  function activityGrowth(action,outcome){
    if(!action||!['perfect','success','normal'].includes(outcome))return {};
    const amount=outcome==='perfect'?2:1;
    const paths={
      swordsmanship:['combatSkill','combatAttack','combatReputation'],
      martial:['combatSkill','combatDefense','combatReputation'],
      spellcraft:['magicSkill','magicAttack','magicReputation'],
      manners:['socialReputation','morality'],
      painting:['socialReputation'],music:['socialReputation'],dance:['socialReputation'],
      cooking:['housework'],kitchenhelp:['housework'],childcare:['housework','morality'],
      houseclean:['housework'],sewing:['housework'],classics:['morality','faith'],
      'holiday-seollal':['socialReputation'],'holiday-chuseok':['socialReputation']
    };
    return Object.fromEntries((paths[action.id]||[]).map(key=>[key,amount]));
  }
  function annualSupport(source,previousDate,nextDate){
    const paid=new Set(source.annualAllowanceYears||[]),records=[];
    const start=new Date(previousDate+'T00:00:00'),end=new Date(nextDate+'T00:00:00');
    if(!Number.isFinite(start.getTime())||!Number.isFinite(end.getTime())||end<=start)return records;
    for(let year=start.getFullYear();year<=end.getFullYear();year++){
      const due=new Date(year,0,1);
      if(due>start&&due<=end&&!paid.has(year)){
        records.push({year,amount:allowanceForTrust(source.fatherAffinity)});paid.add(year);
      }
    }
    return records;
  }
  root.PM2ClassicRules=Object.freeze({rules,defaults,normalizeState,conditionFor,allowanceForTrust,activityGrowth,annualSupport});
})(typeof window!=='undefined'?window:globalThis);
