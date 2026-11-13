import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildExam, gradeExam, readExam, EXAM_KEY } from '../public/exams-core.js';
const bank=JSON.parse(readFileSync(new URL('../public/exams.json',import.meta.url),'utf8'));
test('60 questões no nível dos dois simulados, três variações de cada uma das 20 bases',()=>{
 assert.equal(bank.length,60);assert.equal(new Set(bank.map(q=>q.id)).size,60);
 assert.equal(new Set(bank.map(q=>q.prompt+'|'+q.sql)).size,60);
 const bases=new Set(bank.map(q=>q.base));assert.equal(bases.size,20);
 for(const base of bases)assert.equal(bank.filter(q=>q.base===base).length,3);
 for(const q of bank){assert.ok(['sm1','sm2'].includes(q.group));assert.equal(q.options.length,5);assert.equal(new Set(q.options).size,5);assert.ok(q.answer>=0&&q.answer<5);assert.ok(q.explanation.length>30);}
});
test('SM1 e SM2 sorteiam dez questões, uma de cada base, sem alterar o banco',()=>{
 for(const group of ['sm1','sm2','misto']){const exam=buildExam(bank,group,()=>0.4);assert.equal(exam.ids.length,10);assert.equal(new Set(exam.ids.map(id=>bank.find(q=>q.id===id).base)).size,10);if(group!=='misto')assert.ok(exam.ids.every(id=>bank.find(q=>q.id===id).group===group));}
});
test('correção conta erros e questões em branco sem confundir a alternativa zero',()=>{
 const e=buildExam(bank,'sm1',()=>0.4),q=bank.find(q=>q.id===e.ids[0]);e.answers[q.id]=q.answer;
 const r=gradeExam(e,bank);assert.equal(r.correct,1);assert.equal(r.blank,9);assert.equal(r.wrong,0);assert.equal(r.percent,10);
});
test('restaura simulado, rejeita ids inválidos e armazenamento bloqueado',()=>{
 const e=buildExam(bank,'sm2',()=>0.4);assert.deepEqual(readExam({getItem:key=>key===EXAM_KEY?JSON.stringify(e):null},bank),e);
 assert.equal(readExam({getItem:()=>'{bad'},bank),null);e.ids[0]='outro';assert.equal(readExam({getItem:()=>JSON.stringify(e)},bank),null);
 assert.equal(readExam({getItem:()=>{throw Error('blocked')}},bank),null);
});
