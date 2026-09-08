(function(root){
  'use strict';
  const parse=value=>value instanceof Date?new Date(value):new Date(`${value}T00:00:00`);
  const iso=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  function period(value){
    const date=parse(value);
    if(!Number.isFinite(date.getTime()))throw new Error('Invalid schedule date');
    const day=date.getDate(),slot=day<=10?0:day<=20?1:2;
    const last=slot<2?(slot+1)*10:new Date(date.getFullYear(),date.getMonth()+1,0).getDate();
    return {slot,label:['초순','중순','하순'][slot],days:last-day+1,key:`${date.getFullYear()}-${date.getMonth()+1}-${slot}`,ordinal:(date.getFullYear()*12+date.getMonth())*3+slot};
  }
  function expand(ids,start){
    const date=parse(start),days=[];
    ids.forEach((id,block)=>{
      const info=period(date);
      for(let day=0;day<info.days;day++){
        days.push({id,date:iso(date),block,day,length:info.days,label:info.label});
        date.setDate(date.getDate()+1);
      }
    });
    return days;
  }
  root.SeonhwaCalendar=Object.freeze({period,expand});
})(globalThis);
