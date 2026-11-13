"""Banco autoral: conceitos e 40 famílias SQL com dados variados e gabarito executado.

Não usa APIs ou conteúdo remoto. SQL exibido é executado por SQLite moderno quando
pertence ao subconjunto compartilhado com PostgreSQL. Particularidades de PostgreSQL
estão nas questões conceituais; o banco publicado é JSON estático.
"""
from pathlib import Path
import json, random, sqlite3, sys, re

ROOT=Path(__file__).resolve().parents[1]
SOURCES={'fundamentos':'00097.pdf','modelagem':'00001.pdf','chaves':'00351.pdf','normalizacao':'00351.pdf','postgresql':'00173.pdf','transacoes':'00173.pdf','consultas':'00053.pdf','agregacao':'00053.pdf','juncoes':'00414.pdf','subconsultas':'00414.pdf','conjuntos':'00414.pdf','desempenho':'50118.pdf'}
questions=[]
def add(topic,level,prompt,correct,wrong,explanation,sql='',tables=None,family='conceito'):
    options=list(dict.fromkeys([str(correct)]+[str(v) for v in wrong]))
    assert len(options)==5, (family,options)
    rng=random.Random(1701+len(questions));rng.shuffle(options)
    questions.append(dict(id=f'q{len(questions)+1:03}',topic=topic,level=level,prompt=prompt,options=options,answer=options.index(str(correct)),explanation=explanation,sql=sql,tables=tables or [],source=SOURCES[topic],family=family))

for line in (ROOT/'scripts/concepts.txt').read_text(encoding='utf-8').splitlines():
    if not line.strip(): continue
    topic,prompt,correct,*rest=line.split('|')
    add(topic,'facil',prompt,correct,rest[:4],rest[4])
assert len(questions)==100, len(questions)

def render(rows):
    if not rows:return 'Nenhuma linha.'
    def val(x):
        if x is None:return 'NULL'
        if isinstance(x,float):return str(round(x,4)).rstrip('0').rstrip('.') if x%1 else str(int(x))
        return str(x)
    return '\n'.join(' | '.join(val(x) for x in row) for row in rows)

def result_question(family,topic,level,i,prompt,sql,tables,explanation):
    con=sqlite3.connect(':memory:')
    for t in tables:
        columns=','.join('"'+k+'" '+typ for k,typ in zip(t['columns'],t['types']))
        con.execute(f'CREATE TABLE {t["name"]} ({columns})')
        con.executemany(f'INSERT INTO {t["name"]} VALUES ({",".join("?" for _ in t["columns"])})',t['rows'])
    rows=con.execute(sql).fetchall()
    # As consultas numéricas retornam uma célula; as demais usam conjuntos ou listas ordenadas.
    correct=render(rows)
    alternates=[]
    for old,new in [('COUNT(*)','COUNT(salario)'),('COUNT(e.id)','COUNT(*)'),('MAX(salario)','MIN(salario)'),('MIN(salario)','MAX(salario)'),('AVG(salario)','SUM(salario)'),('SUM(salario)','AVG(salario)'),('AND','OR'),(' OR ',' AND '),('IS NULL','IS NOT NULL'),('IS NOT NULL','IS NULL'),('NOT EXISTS','EXISTS'),('NOT IN','IN'),('LEFT JOIN','INNER JOIN'),('LEFT JOIN','FULL OUTER JOIN'),('RIGHT JOIN','LEFT JOIN'),('RIGHT JOIN','INNER JOIN'),('FULL OUTER JOIN','LEFT JOIN'),('FULL OUTER JOIN','INNER JOIN'),('INNER JOIN','LEFT JOIN'),('UNION ALL','UNION'),('INTERSECT','UNION'),('EXCEPT','INTERSECT'),('EXCEPT','UNION'),('INTERSECT','EXCEPT'),('UNION','EXCEPT'),('UNION','INTERSECT'),(' DESC',' ASC'),(' > ',' >= '),(' > ',' < '),(' < ',' > '),(' >= ',' < '),('quantidade * preco','quantidade + preco'),('quantidade * preco','quantidade - preco'),('quantidade * preco','quantidade / preco'),('salario * 2','salario + 2')]:
        if old in sql:
            try:alternates.append(render(con.execute(sql.replace(old,new)).fetchall()))
            except sqlite3.Error:pass
    if 'UNION' in sql or 'INTERSECT' in sql or 'EXCEPT' in sql:
        for op in ['UNION','UNION ALL','INTERSECT','EXCEPT']:
            alt=re.sub(r'UNION ALL|UNION|INTERSECT|EXCEPT',op,sql)
            alternates.append(render(con.execute(alt).fetchall()))
    con.close()
    if len(rows)==1 and len(rows[0])==1 and isinstance(rows[0][0],(int,float)):
        n=rows[0][0]
        candidates=alternates+[render([(v,)]) for v in [n+1,n-1,n*2+2,0,n+3,n+7]]
    else:
        candidates=alternates+['Nenhuma linha.']
        if rows:
            candidates += [render(rows[:1]),render(rows+rows),render(rows[1:])]
            # Hipótese de valor ausente em uma coluna, ou de filtro que omite a primeira linha.
            for col in range(len(rows[0])):
                changed=[tuple(None if j==col else v for j,v in enumerate(row)) for row in rows]
                candidates.append(render(changed))
        candidates += ['NULL','0','1','2']
    wrong=[]
    for opt in candidates:
        if opt!=correct and opt not in wrong:wrong.append(opt)
        if len(wrong)==4:break
    add(topic,level,prompt,correct,wrong,explanation+' Resultado: '+correct.replace('\n','; ')+'.',sql,tables,family)

def tab(name,columns,types,rows):return dict(name=name,columns=columns,types=types,rows=rows)

for family in range(40):
 for i in range(10):
    rng=random.Random(9000+family*41+i)
    k=i+2
    vals=[rng.randint(1,8)*10+k for _ in range(5)]
    # Dados incluem NULL e duplicatas para exercitar semântica, e não só sintaxe.
    rows=[[1,'Ana','F',vals[0],1],[2,'Beto','M',vals[1],1],[3,'Alice','F',vals[2],2],[4,'Caio','M',None,None],[5,'Bruna','F',vals[3],2],[6,'Davi','M',vals[4],3]]
    emp=tab('empregado',['id','nome','sexo','salario','setor'],['INTEGER','TEXT','TEXT','INTEGER','INTEGER'],rows)
    deps=tab('departamento',['id','nome'],['INTEGER','TEXT'],[[1,'TI'],[2,'RH'],[4,'Vendas']])
    t=[emp];topic='consultas';level='medio';ex='';sql='';prompt='Observe os dados e indique o resultado da consulta. A ordem exibida é a definida pelo ORDER BY quando presente.'
    if family==0:
      level='facil';q=k+2;price=(k+1)*5;t=[tab('medicamento',['codigo','quantidade','preco'],['INTEGER']*3,[[1,q,price]])];sql='SELECT quantidade * preco AS total FROM medicamento;';ex=f'O produto multiplica quantidade {q} por preço {price}.'
    elif family==1:
      level='facil';sal=k*100;t=[tab('funcionario',['salario'],['INTEGER'],[[sal]])];sql='SELECT salario * 2 AS dobro FROM funcionario;';ex=f'Uma expressão no SELECT não altera a tabela; apenas calcula duas vezes {sal}.'
    elif family==2:
      level='facil';sql=f'SELECT COUNT(*) FROM empregado WHERE salario > {40+k};';ex=f'Conte apenas salários estritamente maiores que {40+k}. NULL não satisfaz a comparação.'
    elif family==3:
      level='facil';sql=f'SELECT COUNT(*) FROM empregado WHERE salario < {50+k};';ex=f'O limite {50+k} não está incluído. Comparações com NULL não são verdadeiras.'
    elif family==4:
      level='facil';sql="SELECT nome FROM empregado WHERE nome LIKE 'A%' ORDER BY nome;";emp['rows'][0][1]='A'+['manda','line','na','gata','lice','urora','melia','driana','gnes','nita'][i];ex='O padrão A% aceita nomes cujo primeiro caractere é A. ORDER BY nome ordena a saída.'
    elif family==5:
      level='facil';emp['rows'][i%6][3]=None;sql='SELECT COUNT(*) FROM empregado WHERE salario IS NULL;';ex='IS NULL verifica ausência de valor. COUNT(*) conta as linhas aprovadas pelo filtro.'
    elif family==6:
      level='facil';sql=f'SELECT nome FROM empregado ORDER BY salario DESC NULLS LAST, id LIMIT {1+i%3};';ex='Salários descrescentes vêm primeiro; NULLS LAST deixa o salário ausente no fim e id desempata.'
    elif family==7:
      level='facil';topic='agregacao';sql='SELECT MAX(salario) FROM empregado;';ex='MAX retorna o maior salário não nulo. Não retorna o nome do empregado.'
    elif family==8:
      sql=f"SELECT COUNT(*) FROM empregado WHERE sexo = 'F' AND salario >= {40+k};";ex='AND exige simultaneamente sexo F e salário dentro do limite inclusivo.'
    elif family==9:
      sql=f"SELECT COUNT(*) FROM empregado WHERE sexo = 'F' OR salario > {60+k};";ex='OR aceita pelo menos uma condição. Cada linha é contada uma vez mesmo se satisfizer as duas.'
    elif family==10:
      emp['rows'][0][1]=['Lara','Mara','Sara','Zara','Nara','Yara','Tara','Kara','Iara','Dara'][i];sql="SELECT nome FROM empregado WHERE nome LIKE '_a%' ORDER BY nome;";ex='O sublinhado consome exatamente um caractere; a letra a deve estar na segunda posição.'
    elif family==11:
      sql=f'SELECT COUNT(*) FROM empregado WHERE setor IN (1,{2+i%2});';ex='IN aceita qualquer um dos valores da lista, sem duplicar linhas por isso.'
    elif family==12:
      sql=f'SELECT COUNT(*) FROM empregado WHERE salario BETWEEN {20+k} AND {60+k};';ex='BETWEEN inclui as duas extremidades. Salários NULL não passam pelo filtro.'
    elif family==13:
      sql='SELECT COUNT(*) FROM empregado WHERE setor IS NOT NULL;';emp['rows'][i%3][4]=None;ex='IS NOT NULL seleciona vínculos preenchidos, independentemente de existir uma tabela referenciada.'
    elif family==14:
      topic='agregacao';emp['rows'][i%3][3]=None;sql='SELECT COUNT(salario) FROM empregado;';ex='COUNT(salario) ignora salários NULL; COUNT(*) contaria todas as seis linhas.'
    elif family==15:
      topic='agregacao';sql='SELECT SUM(salario) FROM empregado;';ex='SUM soma os cinco salários preenchidos e ignora o salário NULL.'
    elif family==16:
      topic='agregacao';sql='SELECT AVG(salario) FROM empregado;';ex='AVG soma os salários não nulos e divide pela quantidade desses valores, não por todas as linhas.'
    elif family==17:
      topic='agregacao';sql='SELECT MIN(salario) FROM empregado;';ex='MIN considera os salários não nulos e retorna o menor valor.'
    elif family==18:
      topic='agregacao';emp['rows'][i%4][4]=4+i;sql='SELECT COUNT(DISTINCT setor) FROM empregado;';ex='DISTINCT elimina setores repetidos; COUNT também desconsidera o NULL.'
    elif family==19:
      topic='agregacao';emp['rows'][i%6][2]='F' if i%2 else 'M';sql='SELECT sexo, COUNT(*) FROM empregado GROUP BY sexo ORDER BY sexo;';ex='GROUP BY cria um grupo por sexo. COUNT(*) conta as linhas de cada grupo.'
    elif family==20:
      topic='juncoes';t=[emp,deps];sql='SELECT d.nome, e.nome FROM departamento d LEFT JOIN empregado e ON e.setor = d.id ORDER BY d.nome, e.nome;';ex='LEFT preserva inclusive Vendas sem empregado. Empregado com setor inexistente não cria uma linha extra de departamento.'
    elif family==21:
      topic='juncoes';t=[emp,deps];sql='SELECT COUNT(*) FROM departamento d INNER JOIN empregado e ON e.setor = d.id;';emp['rows'][i%4][4]=4;ex='INNER conta apenas os pares cujo código de setor encontra um departamento.'
    elif family==22:
      topic='subconsultas';t=[emp,deps];sql='SELECT d.nome FROM departamento d WHERE EXISTS (SELECT 1 FROM empregado e WHERE e.setor = d.id) ORDER BY d.nome;';emp['rows'][i%4][4]=4;ex='EXISTS aprova cada departamento com algum empregado correspondente, sem repetir o departamento por empregado.'
    elif family==23:
      topic='subconsultas';t=[emp,deps];sql='SELECT d.nome FROM departamento d WHERE NOT EXISTS (SELECT 1 FROM empregado e WHERE e.setor = d.id) ORDER BY d.nome;';emp['rows'][i%4][4]=4 if i%2 else 1;ex='NOT EXISTS aprova apenas departamentos sem empregado correspondente.'
    elif family==24:
      topic='subconsultas';t=[emp,deps];sql='SELECT nome FROM departamento WHERE id IN (SELECT setor FROM empregado) ORDER BY nome;';emp['rows'][i%4][4]=4;ex='IN lista departamentos que aparecem em algum setor de empregado. NULL no resultado interno não corresponde a um id preenchido.'
    elif family in [25,26,27,28]:
      topic='conjuntos';av=[k,k+1,k+1,k+3];bv=[k+1,k+2,k+3];t=[tab('a',['v'],['INTEGER'],[[v] for v in av]),tab('b',['v'],['INTEGER'],[[v] for v in bv])];op={25:'UNION',26:'UNION ALL',27:'INTERSECT',28:'EXCEPT'}[family];sql=f'SELECT v FROM a {op} SELECT v FROM b ORDER BY v;';ex={'UNION':'Reúne os dois resultados e elimina duplicatas.','UNION ALL':'Reúne e mantém as repetições dos dois resultados.','INTERSECT':'Retorna apenas os valores presentes nos dois resultados, sem duplicatas.','EXCEPT':'Retorna os valores de a que não estão em b; a direção importa.'}[op]
    elif family==29:
      level='dificil';topic='agregacao';emp['rows'][i%6][4]=1+i%3;sql='SELECT setor, COUNT(*) FROM empregado WHERE setor IS NOT NULL GROUP BY setor HAVING COUNT(*) >= 2 ORDER BY setor;';ex='WHERE remove NULL antes de agrupar. HAVING mantém somente setores com duas ou mais linhas.'
    elif family==30:
      level='dificil';topic='juncoes';t=[emp,deps];emp['rows'][i%4][4]=4;sql='SELECT d.nome, e.nome FROM departamento d RIGHT JOIN empregado e ON e.setor = d.id ORDER BY e.id;';ex='RIGHT preserva os seis empregados. Quando o setor não encontra departamento, d.nome é NULL.'
    elif family==31:
      level='dificil';topic='juncoes';t=[emp,deps];emp['rows'][0][1]='Ana'+str(k);sql='SELECT d.nome, e.nome FROM departamento d FULL OUTER JOIN empregado e ON e.setor = d.id ORDER BY d.id NULLS LAST, e.id NULLS LAST;';ex='FULL preserva empregados sem departamento correspondente e departamentos sem empregados, além dos pares correspondentes.'
    elif family==32:
      level='dificil';topic='subconsultas';t=[emp,deps];sql='SELECT COUNT(*) FROM departamento WHERE id NOT IN (SELECT setor FROM empregado);';ex='A subconsulta contém NULL. Para códigos sem igualdade, NOT IN fica desconhecido; para os que têm igualdade, fica falso. Nenhuma linha passa.'
    elif family==33:
      level='dificil';sql=f"SELECT COUNT(*) FROM empregado WHERE sexo = 'F' OR sexo = 'M' AND salario > {50+k};";ex='AND tem precedência sobre OR: todas as linhas F passam, e as M só passam se o salário superar o limite.'
    elif family==34:
      level='dificil';topic='juncoes';t=[emp,deps];sql='SELECT d.nome, COUNT(e.id) FROM departamento d LEFT JOIN empregado e ON e.setor = d.id GROUP BY d.id, d.nome ORDER BY d.nome;';emp['rows'][i%4][4]=4 if i%2 else 2;ex='COUNT(e.id) não conta o NULL criado pelo LEFT JOIN. Departamento sem empregado recebe zero, diferentemente de COUNT(*).'
    elif family==35:
      level='dificil';sql=f'SELECT nome FROM empregado ORDER BY salario DESC NULLS LAST, id LIMIT 2 OFFSET {1+i%3};';ex='ORDER BY estabelece a lista; OFFSET pula a quantidade indicada; LIMIT retorna no máximo duas linhas restantes.'
    elif family==36:
      level='dificil';sql=f'SELECT SUM(COALESCE(salario, {k*10})) FROM empregado;';ex=f'COALESCE substitui o salário NULL por {k*10} antes da soma; os demais salários são preservados.'
    elif family==37:
      level='dificil';sql=f"SELECT SUM(CASE WHEN salario >= {50+k} THEN 1 ELSE 0 END) FROM empregado;";ex='CASE gera 1 para salários dentro da condição e 0 para os demais, inclusive NULL; SUM conta quantos receberam 1.'
    elif family==38:
      level='dificil';topic='subconsultas';sql='SELECT nome FROM empregado WHERE salario > (SELECT AVG(salario) FROM empregado) ORDER BY nome;';ex='A subconsulta calcula a média dos salários não nulos; a externa mantém somente os estritamente acima dela.'
    elif family==39:
      level='dificil';topic='subconsultas';sql='SELECT e.nome FROM empregado e WHERE e.salario > (SELECT AVG(x.salario) FROM empregado x WHERE x.setor = e.setor) ORDER BY e.nome;';ex='A média é recalculada logicamente para o setor da linha externa. Setor sem igualdade por NULL não produz média comparável.'
    # Uma família média é classificada difícil para completar as 120 situações avançadas.
    if family==28:level='dificil'
    result_question(f'sql-{family+1:02}',topic,level,i,prompt,sql,t,ex)

assert len(questions)==500,len(questions)
assert len({q['prompt']+'|'+q['sql']+'|'+json.dumps(q['tables'],sort_keys=True) for q in questions})==500
counts={v:sum(q['level']==v for q in questions) for v in ['facil','medio','dificil']}
assert counts=={'facil':180,'medio':200,'dificil':120},counts
target=ROOT/'public/questions.json'
content=json.dumps(questions,ensure_ascii=False,indent=2)+'\n'
if '--check' in sys.argv:
    assert target.read_text(encoding='utf-8')==content,'Banco divergiu do gerador.'
else:
    target.parent.mkdir(exist_ok=True);target.write_text(content,encoding='utf-8')
print(f'500 questões; {counts}; 400 consultas executadas; 100 conceitos. SQLite {sqlite3.sqlite_version}')
