import { PROGRESS_KEY,SESSION_KEY,emptyProgress,readProgress,filterQuestions,buildSession,recordAnswer } from './core.js';
import {createExamController} from './exams.js';

const TOPICS={fundamentos:'Fundamentos',modelagem:'Modelagem conceitual',chaves:'Chaves e relações',normalizacao:'Normalização',postgresql:'PostgreSQL e DDL',transacoes:'Transações e ACID',consultas:'SELECT e filtros',agregacao:'Agregação e grupos',juncoes:'Junções (JOIN)',subconsultas:'Subconsultas',conjuntos:'Operadores de conjunto',desempenho:'Views e desempenho'};
const LEVELS={facil:'Fácil',medio:'Médio',dificil:'Difícil'};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store={getItem:key=>window.localStorage.getItem(key),setItem:(key,value)=>window.localStorage.setItem(key,value),removeItem:key=>window.localStorage.removeItem(key)};
const main=document.querySelector('#main');
const exams=createExamController(main,{esc,syntax,head,empty,save,store,navigate,toast,rerender:()=>render()});
let bank=[],byId=new Map(),progress=readProgress(store),session=null,choice=null,reviewTab='erros',libraryPage=0;
let config={level:'todos',topic:'todos',mode:'todos',count:10};
let library={level:'todos',topic:'todos',search:''};
let toastTimer;
function save(key,value){try{store.setItem(key,JSON.stringify(value));return true;}catch{document.querySelector('#storage-notice').hidden=false;return false;}}
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2400);}
function navigate(route){if(location.hash==='#'+route)render();else location.hash=route;}
function day(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function stats(){const answered=Object.keys(progress.answers).length;const mastered=Object.values(progress.answers).filter(v=>v.correct).length;return {answered,mastered,errors:answered-mastered,rate:progress.total?Math.round(progress.correct/progress.total*100):0,coverage:Math.round(answered/bank.length*100)};}
function badge(q){return `<span class="badge ${q.level}">${LEVELS[q.level]}</span>`;}
function selectTopics(selected){return `<option value="todos">Todos os assuntos</option>`+Object.entries(TOPICS).map(([key,label])=>`<option value="${key}" ${key===selected?'selected':''}>${label}</option>`).join('');}
function selectLevels(selected){return `<option value="todos">Todos os níveis</option>`+Object.entries(LEVELS).map(([key,label])=>`<option value="${key}" ${key===selected?'selected':''}>${label}</option>`).join('');}
function head(eyebrow,title,subtitle){return `<section class="page-head"><p class="eyebrow muted">${eyebrow}</p><h1>${title}</h1><p>${subtitle}</p></section>`;}
function empty(title,text,link='treinar',label='Começar um treino'){return `<div class="empty paper"><span class="empty-icon" aria-hidden="true">◇</span><h2>${title}</h2><p>${text}</p><a class="button" href="#${link}">${label}</a></div>`;}
function loadSession(){
 try{const v=JSON.parse(store.getItem(SESSION_KEY));
  if(!v||!Array.isArray(v.ids)||!v.ids.length||v.ids.some(id=>!byId.has(id))||new Set(v.ids).size!==v.ids.length||!Number.isInteger(v.index)||v.index<0||v.index>=v.ids.length||!v.responses||typeof v.responses!=='object'||Array.isArray(v.responses))return null;
  for(const [id,r] of Object.entries(v.responses))if(!v.ids.includes(id)||!r||!Number.isInteger(r.selected)||r.selected<0||r.selected>4||typeof r.confirmed!=='boolean')return null;
  return v;
 }catch{return null;}
}
function home(){
 const s=stats(),count=level=>bank.filter(q=>q.level===level).length;
 return `<section class="welcome"><div><p class="eyebrow muted">SEU ESPAÇO DE ESTUDO</p><h1>Um conceito por vez.</h1><p class="muted">Pratique, entenda seus erros e chegue mais preparado.</p></div><span class="date-pill"><i class="dot"></i>500 questões comentadas</span></section>
 <section class="hero"><div><p class="eyebrow">DA TEORIA À CONSULTA</p><h2>Seu próximo acerto<br>começa aqui.</h2><p>${s.answered?`Você já explorou ${s.answered} ${s.answered===1?'questão':'questões'}. Continue no seu ritmo.`:'De modelagem a SQL. Treine com questões no estilo dos seus exercícios.'}</p><button class="button lime" data-action="quick">Treinar agora <span aria-hidden="true">↗</span></button></div><div class="progress-ring" style="--p:${s.coverage}" aria-label="${s.coverage}% das questões estudadas"><div><strong>${s.coverage}%</strong><small>do banco explorado</small></div></div></section>
 <section class="stat-grid" aria-label="Seu progresso"><div class="stat"><small>Questões estudadas</small><strong>${s.answered}<small style="display:inline"> / 500</small></strong><span class="mini">${500-s.answered} para descobrir</span></div><div class="stat"><small>Taxa de acerto</small><strong>${s.rate}%</strong><span class="mini">${progress.total} tentativas</span></div><div class="stat"><small>Para revisar</small><strong>${s.errors}</strong><a class="mini" href="#revisar">Transforme erros em acertos ↗</a></div></section>
 ${session&&!session.finished?`<div class="resume"><div><b>Seu treino está esperando</b><span class="muted">Questão ${session.index+1} de ${session.ids.length}. Continue de onde parou.</span></div><a class="text-link" href="#questao">Continuar →</a></div>`:''}
 <div class="section-title"><h2>Escolha seu ritmo</h2><a class="text-link" href="#treinar">Personalizar treino ↗</a></div>
 <section class="level-grid" aria-label="Níveis de dificuldade">${[['facil','easy','↗','Construa sua base'],['medio','medium','≋','Conecte os conceitos'],['dificil','hard','✧','Desafie seu raciocínio']].map(([key,cls,icon,caption])=>`<button class="level-card ${cls}" data-level-start="${key}"><span class="level-symbol" aria-hidden="true">${icon}</span><h3>${LEVELS[key]}</h3><p>${caption}</p><div class="card-foot"><span>${count(key)} questões</span><span aria-hidden="true">↗</span></div></button>`).join('')}</section>
 <div class="home-lower"><section><div class="section-title"><h2>Estude por assunto</h2></div><div class="topic-list">${Object.entries(TOPICS).map(([key,label],i)=>`<button class="topic-item" data-topic-start="${key}"><span class="topic-n">${String(i+1).padStart(2,'0')}</span><span class="name">${label}</span><span class="count">${bank.filter(q=>q.topic===key).length}</span></button>`).join('')}</div></section>
 <aside><div class="section-title"><h2>Leve para o próximo treino</h2></div><div class="tip"><span class="eyebrow">LEMBRETE DO DIA</span><h3 style="margin-top:12px">WHERE filtra linhas.<br>HAVING filtra grupos.</h3><p>O filtro muda de lugar quando você precisa trabalhar com o resultado de uma agregação.</p><code>GROUP BY bairro<br>HAVING COUNT(*) &gt; 10</code><br><a class="text-link" href="#resumo">Revisar o essencial ↗</a></div><p class="inline-note">Seu progresso é salvo neste navegador. Sem conta, sem pressa. No seu ritmo.</p></aside></div>`;
}
function setup(){
 const pool=filterQuestions(bank,config,progress),actual=Math.min(config.count,pool.length);
 return head('UM TREINO DO SEU JEITO','Vamos praticar?','Escolha o que estudar. Cada resposta vem com uma explicação.')+
 `<div class="setup-grid"><section class="paper"><fieldset class="field"><legend>Nível de dificuldade</legend><div class="segments">${[['todos','Misturar níveis'],...Object.entries(LEVELS)].map(([v,l])=>`<button class="segment" data-config="level" data-value="${v}" aria-pressed="${config.level===v}">${l}</button>`).join('')}</div></fieldset>
 <div class="field"><label for="topic-select">Assunto</label><select id="topic-select">${selectTopics(config.topic)}</select></div>
 <fieldset class="field"><legend>Quais questões?</legend><div class="segments">${[['todos','Todas'],['novas','Não respondidas'],['erros','Meus erros'],['favoritos','Favoritas']].map(([v,l])=>`<button class="segment" data-config="mode" data-value="${v}" aria-pressed="${config.mode===v}">${l}</button>`).join('')}</div></fieldset>
 <fieldset class="field"><legend>Questões nesta sessão</legend><div class="segments">${[10,20,50].map(v=>`<button class="segment" data-config="count" data-value="${v}" aria-pressed="${config.count===v}">${v} questões</button>`).join('')}</div></fieldset>
 <div class="session-preview"><strong>${actual}</strong> <span>questões no seu treino</span><p>${pool.length} disponíveis com os filtros escolhidos.${actual<config.count&&actual>0?' Vamos usar todas as disponíveis.':''}</p></div>
 ${!actual?'<p class="inline-note" style="margin-bottom:16px">Nenhuma questão com esses filtros. Experimente outro assunto ou escolha “Todas”.</p>':''}
 <button class="button full" data-action="start" ${!actual?'disabled':''}>Começar treino <span aria-hidden="true">→</span></button>
 </section><aside><div class="paper"><p class="eyebrow muted">COMO FUNCIONA</p><ul class="hint-list"><li><b>01. Pense antes de marcar</b>Leia o enunciado, os dados e o SQL.</li><li><b>02. Confirme sua resposta</b>Veja o gabarito e entenda o raciocínio.</li><li><b>03. Volte aos seus erros</b>O que precisa de atenção fica salvo para revisão.</li></ul><p class="inline-note">Não há limite de tempo. Você pode sair e continuar a sessão depois.</p></div></aside></div>`;
}
function syntax(sql){return esc(sql).replace(/(&#39;.*?&#39;)|\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|LEFT|RIGHT|FULL|OUTER|INNER|JOIN|ON|AS|COUNT|SUM|AVG|MAX|MIN|DISTINCT|NOT|EXISTS|IN|IS|NULLS|NULL|LAST|FIRST|UNION|ALL|INTERSECT|EXCEPT|AND|OR|LIKE|BETWEEN|ASC|DESC|LIMIT|OFFSET|CASE|WHEN|THEN|ELSE|END|COALESCE)\b/g,(m,lit)=>`<span class="${lit?'lit':'kw'}">${m}</span>`);}
function dataTables(q){return q.tables.map(t=>`<div class="dataset"><b>${esc(t.name)}</b><div class="table-scroll" tabindex="0" role="region" aria-label="Tabela ${esc(t.name)}"><table><caption class="skip">Dados de ${esc(t.name)}</caption><thead><tr>${t.columns.map(c=>`<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(row=>`<tr>${row.map(v=>`<td>${v===null?'<span class="muted">NULL</span>':esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`).join('');}
function questionCard(q,response=null,readonly=false){
 const confirmed=!!response?.confirmed,selected=confirmed?response.selected:choice,correct=confirmed&&response.selected===q.answer;
 return `<article class="question-card"><div class="tags">${badge(q)}<span class="tiny">${TOPICS[q.topic]}</span><span class="tiny" style="margin-left:auto">${q.id.toUpperCase()}</span></div>
 <h2>${esc(q.prompt)}</h2>${dataTables(q)}${q.sql?`<pre class="sql" tabindex="0" aria-label="Consulta SQL"><code>${syntax(q.sql)}</code></pre>`:''}
 <div class="options" role="group" aria-label="Alternativas">${q.options.map((opt,i)=>`<button class="answer-option ${selected===i?'selected':''} ${confirmed&&i===q.answer?'correct':''} ${confirmed&&selected===i&&i!==q.answer?'incorrect':''}" data-option="${i}" aria-pressed="${selected===i}" ${confirmed||readonly?'disabled':''}><span class="letter">${'ABCDE'[i]}</span><span class="answer-text">${esc(opt)}</span>${confirmed&&i===q.answer?'<span class="tiny" aria-label="Resposta correta">✓</span>':''}</button>`).join('')}</div>
 ${confirmed?`<section class="feedback ${!correct?'wrong':''}" role="status"><h3>${correct?'✓ Boa! Você acertou.':'Vamos entender essa?'}</h3><p><b>Alternativa ${'ABCDE'[q.answer]}.</b> ${esc(q.explanation)}</p><p class="source">Base de estudo: ${esc(q.source)} · Questão autoral${q.family!=='conceito'?' · Resultado SQL verificado':''}.</p></section>`:''}</article>`;
}
function quiz(){
 if(!session){return empty('Nenhum treino em andamento','Monte uma sessão e comece com um assunto que você quer dominar.');}
 if(session.finished){navigate('resultado');return '';}
 const q=byId.get(session.ids[session.index]),r=session.responses[q.id];choice=r?.selected??null;
 return `<div class="question-shell"><div class="quiz-top"><a class="icon-button" href="#inicio" aria-label="Pausar treino e voltar">‹</a><div class="quiz-info"><b>Questão ${session.index+1} <span class="muted">de ${session.ids.length}</span></b><div class="track" role="progressbar" aria-label="Progresso do treino" aria-valuenow="${session.index}" aria-valuemin="0" aria-valuemax="${session.ids.length}"><div style="width:${session.index/session.ids.length*100}%"></div></div><span class="tiny">Sem pressa. O aprendizado vem primeiro.</span></div><button class="icon-button ${progress.favorites.includes(q.id)?'active':''}" data-favorite="${q.id}" aria-label="${progress.favorites.includes(q.id)?'Remover dos favoritos':'Salvar nos favoritos'}" aria-pressed="${progress.favorites.includes(q.id)}">☆</button></div>
 ${questionCard(q,r)}<div class="quiz-actions"><span class="tiny">${r?.confirmed?'Leia a explicação antes de seguir.':'Escolha uma alternativa para confirmar.'}</span>${r?.confirmed?`<button class="button" data-action="next">${session.index===session.ids.length-1?'Ver resultado':'Próxima questão'} <span aria-hidden="true">→</span></button>`:`<button class="button" data-action="confirm" ${choice===null?'disabled':''}>Confirmar resposta</button>`}</div></div>`;
}
function start(pool=filterQuestions(bank,config,progress),count=config.count){
 const selected=buildSession(pool,count);if(!selected.length){toast('Nenhuma questão disponível. Ajuste os filtros.');return;}
 session={version:1,ids:selected.map(q=>q.id),index:0,responses:{},finished:false};choice=null;save(SESSION_KEY,session);navigate('questao');
}
function confirm(){
 if(!session||choice===null||session.finished)return;
 const q=byId.get(session.ids[session.index]);if(session.responses[q.id]?.confirmed)return;
 const correct=choice===q.answer;
 session.responses[q.id]={selected:choice,confirmed:true};
 progress=recordAnswer(progress,q.id,correct,day());save(PROGRESS_KEY,progress);save(SESSION_KEY,session);
 const y=window.scrollY;main.innerHTML=quiz();window.scrollTo(0,y);document.querySelector('.feedback')?.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function preview(q){const a=progress.answers[q.id];return `<button class="question-preview" data-open="${q.id}"><div class="tags">${badge(q)}<span class="tiny">${TOPICS[q.topic]}</span></div><p>${q.sql?`Interprete uma consulta de ${TOPICS[q.topic].toLowerCase()} com dados de exemplo.`:esc(q.prompt)}</p><div class="bottom"><span>${q.id.toUpperCase()} · ${a?(a.correct?'✓ Acertou na última tentativa':'↺ Para revisar'):'Ainda não respondida'}</span><span aria-hidden="true">↗</span></div></button>`;}
function libraryView(){
 const pool=filterQuestions(bank,library,progress),pages=Math.max(1,Math.ceil(pool.length/20));libraryPage=Math.min(libraryPage,pages-1);
 return head('EXPLORE NO SEU RITMO','Banco de questões','500 formas de praticar. Encontre um assunto ou uma dúvida específica.')+
 `<div class="filter-bar"><input id="search" type="search" aria-label="Buscar questões" placeholder="Buscar conceito, comando SQL, palavra…" value="${esc(library.search)}"><select id="library-level" aria-label="Filtrar por dificuldade">${selectLevels(library.level)}</select><select id="library-topic" aria-label="Filtrar por assunto">${selectTopics(library.topic)}</select></div><p class="library-summary">${pool.length} ${pool.length===1?'questão encontrada':'questões encontradas'}</p>
 ${pool.length?`<div class="question-list">${pool.slice(libraryPage*20,(libraryPage+1)*20).map(preview).join('')}</div><div class="pager"><button class="button secondary" data-page="-1" ${!libraryPage?'disabled':''}>Anterior</button><span>${libraryPage+1} / ${pages}</span><button class="button secondary" data-page="1" ${libraryPage===pages-1?'disabled':''}>Próxima</button></div>`:empty('Nada por aqui com esses filtros','Tente outro termo ou escolha todos os níveis e assuntos.','biblioteca','Voltar à busca')}`;
}
function review(){
 const pool=filterQuestions(bank,{mode:reviewTab},progress),s=stats();
 return head('ERRO TAMBÉM É APRENDIZADO','Uma segunda chance.','Revise os pontos que pedem atenção e guarde suas questões favoritas.')+
 `<div class="review-tabs segments"><button class="segment" data-review="erros" aria-pressed="${reviewTab==='erros'}">Meus erros (${s.errors})</button><button class="segment" data-review="favoritos" aria-pressed="${reviewTab==='favoritos'}">Favoritas (${progress.favorites.length})</button></div>`+
 (pool.length?`<div class="resume"><div><b>${pool.length} questões para ${reviewTab==='erros'?'revisitar':'praticar'}</b><span class="muted">Uma nova tentativa pode mudar tudo.</span></div><button class="button" data-action="review-start">Revisar 10 →</button></div><div class="question-list">${pool.slice(0,50).map(preview).join('')}</div>${pool.length>50?'<p class="inline-note">Mostrando as primeiras 50. O treino sorteia entre todas as questões desta seleção.</p>':''}`:empty(reviewTab==='erros'?'Tudo em dia por aqui.':'Guarde o que importa.',reviewTab==='erros'?'Você ainda não tem erros para revisar. Faça um treino; as questões que precisar rever aparecerão aqui.':'Toque na estrela durante um treino para salvar uma questão e voltar a ela depois.'))+
 `<div class="danger-zone"><p>O progresso pertence a este navegador. Limpar os dados do site apaga seu histórico.</p><button data-action="reset">Apagar progresso</button></div>`;
}
function result(){
 if(!session||!session.finished)return empty('Seu resultado vem depois do treino','Responda uma sessão para ver como foi.');
 const correct=session.ids.filter(id=>session.responses[id]?.selected===byId.get(id).answer).length,rate=Math.round(correct/session.ids.length*100);
 return `<section class="result"><p class="eyebrow">MAIS UM PASSO DADO</p><h1>${rate>=80?'Conhecimento em dia.':rate>=50?'Você está avançando.':'Cada erro ensina algo.'}</h1><p class="muted">${rate>=80?'Continue praticando para consolidar o que aprendeu.':'Leia as explicações e dê outra chance aos conceitos.'}</p><div class="result-circle"><strong>${rate}%</strong><small>${correct} de ${session.ids.length} acertos</small></div><div class="result-actions"><button class="button" data-action="quick">Novo treino →</button><a class="button secondary" href="#revisar">Revisar meus erros</a></div><div class="result-answers">${session.ids.map((id,i)=>{const q=byId.get(id),ok=session.responses[id].selected===q.answer;return `<div class="result-row"><span class="status ${!ok?'wrong':''}" aria-label="${ok?'Acertou':'Errou'}">${ok?'✓':'↺'}</span><p><b>${String(i+1).padStart(2,'0')}.</b> ${TOPICS[q.topic]}<br><span class="tiny">${id.toUpperCase()} · ${LEVELS[q.level]}</span></p><button data-detail="${id}">Explicação ↗</button></div>`;}).join('')}</div></section>`;
}
function summary(){
 const cards=[
 ['01','Do dado ao banco','Banco é a coleção de dados; SGBD é o software que gerencia essa coleção. Esquema é estrutura. Instância é o estado dos dados em um momento.','Catálogo guarda metadados. DBA administra acesso, desempenho, backup e recuperação.'],
 ['02','Conceitual, lógico e físico','Conceitual: negócio, entidades e relações. Lógico: tabelas, colunas e chaves. Físico: implementação no SGBD, tipos concretos, índices e armazenamento.','Endereço pode ser composto; telefones podem ser multivalorados; idade calculada é derivada.'],
 ['03','Chaves e relacionamentos','PK identifica e não aceita NULL. Candidata identifica minimamente; alternativas são as não escolhidas. FK mantém o vínculo referencial.','1:N: FK no lado N. N:N: tabela associativa. Vários telefones: tabela própria com FK do aluno.'],
 ['04','Normalização','1FN: sem grupos repetitivos. 2FN: sem dependência parcial de atributo não primo em chave candidata. 3FN, na abordagem básica: evita dependências transitivas inadequadas.','O objetivo é reduzir redundância e anomalias. Desnormalizar pode ajudar leituras, mas exige medição e cuidado com as cópias.'],
 ['05','DDL e DML','CREATE, ALTER, DROP definem estrutura. INSERT, UPDATE, DELETE modificam linhas. Texto usa aspas simples; aspas duplas delimitam identificadores.','ALTER TABLE professor ADD COLUMN email VARCHAR(80);','UPDATE funcionario\nSET salario = salario * 1.10\nWHERE sexo = \'F\';'],
 ['06','Filtros que você vai usar','LIKE \'A%\': começa com A. _ representa um caractere; % representa qualquer continuação. IN testa lista. BETWEEN inclui limites. Ausência de valor se testa com IS NULL.','WHERE filtra linhas. ORDER BY ordena. Uma expressão calculada no SELECT não altera a tabela.'],
 ['07','Agregação sem confusão','COUNT(*) conta linhas; COUNT(coluna) ignora NULL; SUM soma; AVG calcula média; MIN e MAX encontram extremos.','WHERE, GROUP BY, HAVING, ORDER BY: essa é a ordem escrita. HAVING filtra os grupos.','SELECT bairro, COUNT(*)\nFROM aluno\nGROUP BY bairro\nHAVING COUNT(*) > 10;'],
 ['08','Quem fica no JOIN?','INNER: apenas correspondências. LEFT: preserva esquerda. RIGHT: preserva direita. FULL: preserva os dois lados. CROSS: combina tudo com tudo.','A RIGHT JOIN B mantém B. No LEFT, a linha sem par recebe NULL do lado direito. COUNT(chave_direita) ajuda a contar zero nesses casos.'],
 ['09','Consultas dentro de consultas','IN testa participação no resultado interno. EXISTS testa existência. NOT EXISTS ajuda a buscar ausência de vínculo. Correlacionada usa valores da linha externa.','Cuidado: NOT IN com NULL na lista pode resultar em desconhecido. Uma subconsulta escalar deve retornar no máximo uma linha e uma coluna.'],
 ['10','Operações de conjunto','UNION reúne e remove duplicatas; UNION ALL mantém. INTERSECT retorna comuns; EXCEPT retorna primeiro menos segundo.','Mesma quantidade de colunas e tipos compatíveis por posição. OR e UNION podem diferir na preservação de duplicatas.'],
 ['11','ACID e transações','Atomicidade: tudo ou nada. Consistência: validade. Isolamento: interferência concorrente. Durabilidade: permanência após confirmar.','BEGIN inicia; COMMIT confirma; ROLLBACK desfaz; SAVEPOINT permite marcar um ponto de reversão parcial.'],
 ['12','Views e desempenho','View comum guarda a definição de uma consulta. Materializada armazena o resultado e precisa de atualização. Índices podem acelerar pesquisas, mas custam espaço e escrita.','Meça antes de otimizar: plano, tempo, volume, filtros, estatísticas. EXPLAIN ANALYZE também executa a instrução.']
 ];
 return head('O ESSENCIAL, SEM COMPLICAÇÃO','Uma revisão de bolso.','Volte a estes lembretes antes de treinar um novo assunto.')+`<div class="summary-grid">${cards.map(([n,title,p1,p2,sql])=>`<article class="summary-card"><span class="eyebrow muted">${n}</span><h2>${title}</h2><p>${esc(p1)}</p><p>${esc(p2)}</p>${sql?`<pre class="sql"><code>${syntax(sql)}</code></pre>`:''}</article>`).join('')}</div><div class="source-note"><b>Sobre o conteúdo</b><p>Questões autorais inspiradas nos exercícios e nos sete materiais do curso: Sistema de banco de dados; Modelagem conceitual; Modelagem lógica e física; Criação e manipulação no PostgreSQL; Consultas com uma tabela; Consultas com várias tabelas; Praticando Banco de Dados.</p><p>100 questões conceituais e 400 situações de SQL com dados variados em 40 famílias. Fácil: 180 · Médio: 200 · Difícil: 120. Não é um gabarito oficial. Os PDFs originais não são publicados aqui.</p></div>`;
}
function detail(id){const q=byId.get(id);if(!q)return empty('Questão não encontrada','Abra uma questão do banco para continuar.','biblioteca','Ver questões');const r=session?.responses[id];return `<div class="question-shell"><a class="back-link" href="#resultado">‹ Voltar ao resultado</a>${questionCard(q,r,true)}</div>`;}
function render(){
 if(!bank.length)return;
 const route=(location.hash.slice(1)||'inicio').split('/')[0];
 document.querySelectorAll('[data-nav]').forEach(a=>{const current=a.dataset.nav===route||(route==='questao'&&a.dataset.nav==='treinar');if(current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 const pages={inicio:home,treinar:setup,biblioteca:libraryView,revisar:review,resumo:summary,questao:quiz,resultado:result};
 main.innerHTML=route==='simulados'?exams.render():route==='explicacao'?detail(location.hash.split('/')[1]):(pages[route]||home)();
 document.title=`${({inicio:'Seu espaço de estudo',treinar:'Montar treino',biblioteca:'500 questões',revisar:'Revisar',resumo:'Resumo',questao:'Treino',resultado:'Resultado',explicacao:'Explicação',simulados:'Simulados SM1 e SM2'})[route]||'Banco de Dados'} · BD em dia`;
}
main.addEventListener('click',event=>{
 const target=event.target.closest('button,a');if(!target)return;
 if(target.dataset.levelStart){config={...config,level:target.dataset.levelStart,mode:'todos',topic:'todos'};navigate('treinar');}
 if(target.dataset.topicStart){config={...config,topic:target.dataset.topicStart,level:'todos',mode:'todos'};navigate('treinar');}
 if(target.dataset.config){config[target.dataset.config]=target.dataset.config==='count'?Number(target.dataset.value):target.dataset.value;render();}
 if(target.dataset.option!==undefined){
  if(!session)return;const id=session.ids[session.index];if(session.responses[id]?.confirmed)return;
  choice=Number(target.dataset.option);session.responses[id]={selected:choice,confirmed:false};save(SESSION_KEY,session);
  document.querySelectorAll('[data-option]').forEach(b=>{const selected=Number(b.dataset.option)===choice;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
  const confirmButton=document.querySelector('[data-action=confirm]');if(confirmButton)confirmButton.disabled=false;
 }
 if(target.dataset.favorite){
  const id=target.dataset.favorite,has=progress.favorites.includes(id);progress.favorites=has?progress.favorites.filter(v=>v!==id):[...progress.favorites,id];save(PROGRESS_KEY,progress);target.classList.toggle('active',!has);target.setAttribute('aria-pressed',String(!has));target.setAttribute('aria-label',has?'Salvar nos favoritos':'Remover dos favoritos');toast(has?'Questão removida dos favoritos.':'Questão salva para revisar.');
 }
 if(target.dataset.open){start([byId.get(target.dataset.open)],1);}
 if(target.dataset.detail){navigate('explicacao/'+target.dataset.detail);}
 if(target.dataset.page){libraryPage+=Number(target.dataset.page);render();window.scrollTo(0,0);}
 if(target.dataset.review){reviewTab=target.dataset.review;render();}
 switch(target.dataset.action){
  case 'quick':config={level:'todos',topic:'todos',mode:'todos',count:10};start();break;
  case 'start':start();break;
  case 'confirm':confirm();break;
  case 'next':
   if(!session||!session.responses[session.ids[session.index]]?.confirmed)break;
   if(session.index===session.ids.length-1){session.finished=true;save(SESSION_KEY,session);navigate('resultado');}
   else{session.index++;choice=null;save(SESSION_KEY,session);render();window.scrollTo(0,0);}
   break;
  case 'review-start':start(filterQuestions(bank,{mode:reviewTab},progress),10);break;
  case 'reset':
   if(window.confirm('Apagar o histórico, os favoritos e a sessão deste navegador?')){progress=emptyProgress();session=null;save(PROGRESS_KEY,progress);save(SESSION_KEY,null);render();toast('Seu progresso foi apagado.');}
   break;
 }
});
main.addEventListener('change',e=>{if(e.target.id==='topic-select'){config.topic=e.target.value;render();}if(e.target.id==='library-level'||e.target.id==='library-topic'){library[e.target.id==='library-level'?'level':'topic']=e.target.value;libraryPage=0;render();}});
let searchTimer;main.addEventListener('input',e=>{if(e.target.id==='search'){const value=e.target.value;clearTimeout(searchTimer);searchTimer=setTimeout(()=>{library.search=value;libraryPage=0;render();const input=document.querySelector('#search');input?.focus();},180);}});
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);main.focus({preventScroll:true});});
const theme=document.querySelector('#theme');
function applyTheme(dark){document.body.classList.toggle('dark',dark);theme.setAttribute('aria-label',dark?'Ativar tema claro':'Ativar tema escuro');}
try{applyTheme(store.getItem('bd-rev-theme')==='dark');}catch{}
theme.addEventListener('click',()=>{const dark=!document.body.classList.contains('dark');applyTheme(dark);try{store.setItem('bd-rev-theme',dark?'dark':'light');}catch{}});
try{
 const response=await fetch('/questions.json');if(!response.ok)throw Error('Falha HTTP');bank=await response.json();if(!Array.isArray(bank)||bank.length!==500)throw Error('Banco incompleto');byId=new Map(bank.map(q=>[q.id,q]));session=loadSession();render();
}catch{main.innerHTML=empty('Não foi possível carregar as questões','Verifique a conexão e recarregue a página. Seu progresso salvo continua neste navegador.','inicio','Tentar novamente');main.querySelector('a').addEventListener('click',()=>location.reload());}
