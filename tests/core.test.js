import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { filterQuestions, buildSession, recordAnswer, readProgress, emptyProgress } from '../public/core.js';

const bank=JSON.parse(readFileSync(new URL('../public/questions.json',import.meta.url),'utf8'));
test('500 questões completas e únicas, cinco alternativas e distribuição dos níveis',()=>{
 assert.equal(bank.length,500);
 assert.equal(new Set(bank.map(q=>q.id)).size,500);
 assert.equal(new Set(bank.map(q=>q.prompt+'|'+q.sql+'|'+JSON.stringify(q.tables))).size,500);
 const counts={facil:0,medio:0,dificil:0};
 for(const q of bank){
  counts[q.level]++; assert.equal(q.options.length,5);assert.equal(new Set(q.options).size,5);
  assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<5);assert.ok(q.explanation.length>25);assert.ok(q.topic&&q.source);
 }
 assert.deepEqual(counts,{facil:180,medio:200,dificil:120});
});
test('filtros combinam nível, tema e busca sem acentos',()=>{
 const all=filterQuestions(bank,{level:'dificil',topic:'juncoes',search:''});
 assert.ok(all.length);assert.ok(all.every(q=>q.level==='dificil'&&q.topic==='juncoes'));
 assert.ok(filterQuestions(bank,{search:'TRANSACAO'}).length);
 assert.equal(filterQuestions(bank,{search:'impossivel_93847'}).length,0);
});
test('sessão limitada, sem repetição, sem alterar banco',()=>{
 const ids=bank.map(q=>q.id);const a=buildSession(bank,20,()=>0.3);
 assert.equal(a.length,20);assert.equal(new Set(a.map(q=>q.id)).size,20);assert.deepEqual(bank.map(q=>q.id),ids);
 assert.equal(buildSession([],20).length,0);assert.equal(buildSession(bank.slice(0,3),20).length,3);
});
test('registra acerto/erro e revisão conserva histórico por questão',()=>{
 let p=emptyProgress();p=recordAnswer(p,'q001',false,'2026-11-13');
 assert.equal(p.answers.q001.correct,false);assert.equal(p.total,1);
 p=recordAnswer(p,'q001',true,'2026-11-13');
 assert.equal(p.answers.q001.correct,true);assert.equal(p.total,2);assert.equal(p.correct,1);assert.equal(p.answers.q001.attempts,2);
});
test('progresso inválido ou acesso bloqueado não derruba aplicação',()=>{
 for(const raw of ['{','null','[]','{"answers":null}','{"total":-3}']) assert.deepEqual(readProgress({getItem:()=>raw}),emptyProgress());
 assert.deepEqual(readProgress({getItem:()=>{throw Error('blocked')}}),emptyProgress());
});
test('distratores SQL representam resultados concretos, sem alternativas genéricas',()=>{
 for(const q of bank.filter(q=>q.family!=='conceito')){
  assert.ok(q.options.every(o=>!o.includes('Todas as linhas das tabelas')&&!o.includes('(duplicado)')&&!o.includes('Resultado de todas as combinações')),q.id);
 }
});
