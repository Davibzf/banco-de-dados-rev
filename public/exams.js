import {examLessons} from './exam-lessons.js';
import {buildExam,gradeExam,readExam,EXAM_KEY} from './exams-core.js';

export function createExamController(main,{esc,syntax,head,empty,save,store,navigate,toast,rerender}){
 let bank=[],exam=null,loading=false,failed=false;
 const names={sm1:'SM1 · Conceitos',sm2:'SM2 · Consultas SQL',misto:'Misto · SM1 + SM2'};
 const persist=()=>save(EXAM_KEY,exam);
 const answered=()=>exam?Object.keys(exam.answers).length:0;
 function load(){
  loading=true;
  fetch('/exams.json').then(r=>{if(!r.ok)throw Error('HTTP');return r.json();}).then(data=>{
   if(!Array.isArray(data)||data.length!==60)throw Error('Banco incompleto');
   bank=data;exam=readExam(store,bank);loading=false;if(location.hash.startsWith('#simulados'))rerender();
  }).catch(()=>{failed=true;loading=false;if(location.hash.startsWith('#simulados'))rerender();});
 }
 function landing(){
  return head('MESMOS ASSUNTOS. MESMO NÍVEL.','Simulados das imagens.','Questões diretas, bem parecidas com as dos seus SM1 e SM2. Treine o raciocínio, não apenas a letra.')+
   `<section class="paper exam-intro"><span class="badge">60 questões focadas</span><h2>Um treino mais perto do seu simulado.</h2><p class="muted">São três variações de cada uma das 20 questões-base. Cada sessão tem 10 questões, uma por tema, com cinco alternativas.</p><div class="exam-features"><span>10 questões por sessão</span><span>Sem cronômetro</span><span>Correção no final</span></div></section>
   ${exam?`<div class="resume" style="margin-top:18px"><div><b>${exam.finished?'Seu último resultado':'Continue seu simulado'}</b><span class="muted">${names[exam.group]} · ${answered()} de 10 respondidas</span></div><a class="text-link" href="#simulados/${exam.finished?'resultado':'questoes'}">${exam.finished?'Ver correção':'Continuar'} →</a></div>`:''}
   <div class="section-title"><h2>Escolha o simulado</h2></div><div class="exam-sets">${[
    ['sm1','01','Conceitos e comandos','Adicionar coluna, UPDATE, entidade fraca, entidades e atributos, desnormalização, modelo relacional, bancos navegacionais, módulos do SGBD, desempenho e DML.'],
    ['sm2','02','Consultas em SQL','Multiplicação, LIKE, AVG, IN, RIGHT e LEFT JOIN, ordem do GROUP BY, subconsulta com IN, OR com UNION e interpretação de junção externa.'],
    ['misto','03','Um pouco dos dois','10 questões sorteadas entre os temas do SM1 e SM2, mantendo o nível das imagens e sem repetir um tema na mesma sessão.']
   ].map(([group,num,title,caption])=>`<article class="paper exam-set"><span class="eyebrow muted">${group==='misto'?'MISTO':'SIMULADO '+num}</span><h2>${title}</h2><p class="muted">${caption}</p><span class="tiny">${group==='misto'?'60':'30'} questões disponíveis · sessão de 10</span><button class="button full" data-exam-start="${group}">Começar ${group==='misto'?'misto':group.toUpperCase()} <span aria-hidden="true">→</span></button></article>`).join('')}</div>
   <div class="source-note"><b>Foco deste espaço</b><p>Baseado somente nos assuntos das questões SM1 e SM2 que você enviou. As variações mudam o contexto e as alternativas, preservando a dificuldade. Seu treino geral de 500 questões continua disponível na aba Treinar.</p><p>O resultado fica salvo neste navegador, separado do progresso do treino geral. As questões são adaptações de estudo, não um gabarito oficial.</p></div>`;
 }
 function body(q){return `<p class="eyebrow muted">${esc(q.title)}</p><h2>${esc(q.prompt)}</h2>${q.statements.length?`<ol class="exam-statements">${q.statements.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`:''}${q.sql?`<pre class="sql" tabindex="0" aria-label="Consulta SQL"><code>${syntax(q.sql)}</code></pre>`:''}`;}
 function lesson(q,open=false){
  const l=examLessons[q.base];
  if(!l)return '';
  return `<details class="exam-lesson" ${open?'open':''}><summary>Entenda o conteúdo <span aria-hidden="true">＋</span></summary><div class="exam-lesson-body"><h3>O conceito</h3><p>${esc(l.concept)}</p><h3>Exemplo na prática</h3><p>${esc(l.example)}</p>${l.sql?`<pre class="sql" tabindex="0" aria-label="Exemplo SQL explicado"><code>${syntax(l.sql)}</code></pre>`:''}<h3>Como raciocinar</h3><ol>${l.steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol><h3>Cuidado com a confusão</h3><p>${esc(l.mistake)}</p></div></details>`;
 }
 function quiz(){
  if(!exam)return empty('Escolha um simulado para começar','Você pode praticar conceitos do SM1, consultas do SM2 ou misturar os dois.','simulados','Ver simulados');
  if(exam.finished)return results();
  const q=bank.find(q=>q.id===exam.ids[exam.index]),selected=exam.answers[q.id];
  return `<div class="question-shell"><a class="back-link" href="#simulados">‹ Pausar e voltar aos simulados</a><div class="exam-toolbar"><span class="badge">${names[exam.group]}</span><span class="tiny">${answered()} de 10 respondidas</span></div><div class="exam-grid" role="group" aria-label="Questões do simulado">${exam.ids.map((id,i)=>`<button data-exam-index="${i}" class="${exam.index===i?'current':''} ${Number.isInteger(exam.answers[id])?'answered':''}" ${exam.index===i?'aria-current="step"':''} aria-label="Questão ${i+1}${Number.isInteger(exam.answers[id])?', respondida':', em branco'}">${i+1}</button>`).join('')}</div>
   <article class="question-card exam-question"><span class="tiny">Questão ${exam.index+1} de 10</span>${body(q)}<div class="options" role="group" aria-label="Alternativas">${q.options.map((option,i)=>`<button class="answer-option ${i===selected?'selected':''}" data-exam-option="${i}" aria-pressed="${i===selected}"><span class="letter">${'ABCDE'[i]}</span><span class="answer-text">${esc(option)}</span></button>`).join('')}</div><p class="inline-note">Você pode mudar a resposta antes de finalizar. A correção aparece somente no final. Se precisar de ajuda, abra a explicação abaixo.</p>${lesson(q)}</article>
   <div class="quiz-actions exam-actions"><button class="button secondary" data-exam-move="-1" ${exam.index===0?'disabled':''}>Anterior</button>${exam.index<9?'<button class="button" data-exam-move="1">Próxima →</button>':'<button class="button" data-exam-action="finish">Finalizar simulado</button>'}</div>${exam.index<9?'<button class="text-link" data-exam-action="finish">Finalizar simulado agora</button>':''}</div>`;
 }
 function results(){
  if(!exam?.finished)return empty('A correção aparece ao finalizar','Responda as questões e finalize quando estiver pronto.','simulados/questoes','Voltar ao simulado');
  const g=gradeExam(exam,bank);
  return `<section class="result"><p class="eyebrow">${names[exam.group]}</p><h1>Agora, entenda cada resposta.</h1><div class="result-circle"><strong>${g.percent}%</strong><small>${g.correct} de 10 acertos</small></div><div class="exam-score"><span><b>${g.correct}</b> ${g.correct===1?'acerto':'acertos'}</span><span><b>${g.wrong}</b> ${g.wrong===1?'erro':'erros'}</span><span><b>${g.blank}</b> em branco</span></div><div class="result-actions"><button class="button" data-exam-start="${exam.group}">Fazer outro simulado →</button><a class="button secondary" href="#simulados">Escolher outro tipo</a></div><div class="section-title"><h2>Gabarito comentado</h2></div><div class="exam-corrections">${exam.ids.map((id,i)=>{const q=bank.find(q=>q.id===id),selected=exam.answers[id],ok=selected===q.answer,blank=!Number.isInteger(selected);return `<details class="exam-correction"><summary><span class="exam-check ${ok?'ok':'wrong'}" aria-hidden="true">${ok?'✓':'↺'}</span><span><b>${i+1}. ${esc(q.title)}</b><small>${blank?'Em branco':ok?'Você acertou':`Você marcou ${'ABCDE'[selected]}`} · Correta: ${'ABCDE'[q.answer]}</small></span><span aria-hidden="true">⌄</span></summary><div class="exam-correction-body">${body(q)}<p><b>Resposta ${'ABCDE'[q.answer]}:</b> ${esc(q.options[q.answer])}</p>${!blank&&!ok?`<p class="muted"><b>Sua resposta:</b> ${esc(q.options[selected])}</p>`:''}<div class="feedback ${!ok?'wrong':''}"><p>${esc(q.explanation)}</p></div>${lesson(q,true)}</div></details>`;}).join('')}</div><p class="inline-note">Refazer ajuda a entender a regra. A posição da alternativa pode mudar entre as variações.</p></section>`;
 }
 main.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b||!location.hash.startsWith('#simulados'))return;
  if(b.hasAttribute('data-exam-retry')){failed=false;rerender();return;}
  if(b.dataset.examStart){exam=buildExam(bank,b.dataset.examStart);persist();navigate('simulados/questoes');}
  if(b.dataset.examIndex!==undefined&&exam&&!exam.finished){exam.index=Number(b.dataset.examIndex);persist();rerender();window.scrollTo(0,0);}
  if(b.dataset.examOption!==undefined&&exam&&!exam.finished){
   exam.answers[exam.ids[exam.index]]=Number(b.dataset.examOption);persist();
   document.querySelectorAll('[data-exam-option]').forEach(el=>{const yes=el===b;el.classList.toggle('selected',yes);el.setAttribute('aria-pressed',String(yes));});
   const toolbar=main.querySelector('.exam-toolbar .tiny');toolbar.textContent=`${answered()} de 10 respondidas`;
   const grid=main.querySelector(`[data-exam-index="${exam.index}"]`);grid.classList.add('answered');grid.setAttribute('aria-label',`Questão ${exam.index+1}, respondida`);
  }
  if(b.dataset.examMove&&exam&&!exam.finished){exam.index=Math.max(0,Math.min(9,exam.index+Number(b.dataset.examMove)));persist();rerender();window.scrollTo(0,0);}
  if(b.dataset.examAction==='finish'&&exam&&!exam.finished){const missing=10-answered();if(missing&&!window.confirm(`Há ${missing} ${missing===1?'questão em branco':'questões em branco'}. Finalizar e ver a correção?`))return;exam.finished=true;persist();navigate('simulados/resultado');}
 });
 return {render(){
  if(failed)return `<div class="empty paper"><h2>Não foi possível carregar os simulados.</h2><p>Verifique sua conexão e tente novamente.</p><button class="button" data-exam-retry>Recarregar</button></div>`;
  if(!bank.length){if(!loading)load();return '<div class="loading"><div class="loader"></div><p>Preparando seus simulados…</p></div>';}
  const sub=location.hash.split('/')[1];return sub==='questoes'?quiz():sub==='resultado'?results():landing();
 }};
}
