export const PROGRESS_KEY='bd-rev-progress-v1';
export const SESSION_KEY='bd-rev-session-v1';
export const emptyProgress=()=>({version:1,total:0,correct:0,answers:{},favorites:[],days:[]});
const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function filterQuestions(bank,{level='todos',topic='todos',search='',mode='todos'}={},progress=emptyProgress()){
 const needle=normalize(search.trim());
 return bank.filter(q=>(level==='todos'||q.level===level)&&(topic==='todos'||q.topic===topic)&&(!needle||normalize([q.prompt,q.sql,q.explanation,q.id].join(' ')).includes(needle))&&(mode!=='erros'||progress.answers[q.id]?.correct===false)&&(mode!=='favoritos'||progress.favorites.includes(q.id))&&(mode!=='novas'||!progress.answers[q.id]));
}
export function buildSession(pool,count=10,rng=Math.random){
 const a=[...pool];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
 return a.slice(0,Math.max(0,Math.min(Number(count)||10,a.length)));
}
export function recordAnswer(progress,id,correct,day){
 const previous=progress.answers[id];
 return {...progress,total:progress.total+1,correct:progress.correct+(correct?1:0),answers:{...progress.answers,[id]:{correct,attempts:(previous?.attempts||0)+1,lastDay:day}},days:[...new Set([...progress.days,day])].sort()};
}
export function readProgress(storage){
 try{
  const v=JSON.parse(storage.getItem(PROGRESS_KEY));
  if(!v||v.version!==1||!Number.isInteger(v.total)||v.total<0||!Number.isInteger(v.correct)||v.correct<0||v.correct>v.total||!v.answers||Array.isArray(v.answers)||typeof v.answers!=='object'||!Array.isArray(v.favorites)||!Array.isArray(v.days))return emptyProgress();
  if(Object.values(v.answers).some(a=>!a||typeof a.correct!=='boolean'||!Number.isInteger(a.attempts)||a.attempts<1))return emptyProgress();
  return v;
 }catch{return emptyProgress();}
}
