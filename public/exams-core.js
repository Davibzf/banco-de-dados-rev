import {buildSession} from './core.js';
export const EXAM_KEY='bd-rev-exam-v1';
export function buildExam(bank,group='misto',rng=Math.random){
 const pool=bank.filter(q=>group==='misto'||q.group===group),bases=[...new Set(pool.map(q=>q.base))];
 const selected=buildSession(bases,10,rng).map(base=>{const variants=pool.filter(q=>q.base===base);return variants[Math.floor(rng()*variants.length)].id;});
 return {version:1,group,ids:selected,index:0,answers:{},finished:false};
}
export function gradeExam(exam,bank){
 const map=new Map(bank.map(q=>[q.id,q]));let correct=0,blank=0;
 for(const id of exam.ids){if(!Number.isInteger(exam.answers[id]))blank++;else if(exam.answers[id]===map.get(id)?.answer)correct++;}
 return {correct,blank,wrong:exam.ids.length-correct-blank,percent:exam.ids.length?Math.round(correct/exam.ids.length*100):0};
}
export function readExam(storage,bank){
 try{const e=JSON.parse(storage.getItem(EXAM_KEY)),map=new Map(bank.map(q=>[q.id,q]));
  if(!e||e.version!==1||!['sm1','sm2','misto'].includes(e.group)||!Array.isArray(e.ids)||e.ids.length!==10||new Set(e.ids).size!==10||e.ids.some(id=>!map.has(id))||!Number.isInteger(e.index)||e.index<0||e.index>9||typeof e.finished!=='boolean'||!e.answers||typeof e.answers!=='object'||Array.isArray(e.answers))return null;
  if(Object.entries(e.answers).some(([id,v])=>!e.ids.includes(id)||!Number.isInteger(v)||v<0||v>4))return null;
  return e;
 }catch{return null;}
}
