// Uma aula por assunto, compartilhada pelas três variações da questão.
export const examLessons = {
 'sm1-01': {
  concept: 'Uma tabela tem uma estrutura: nomes de colunas, tipos e restrições. ALTER TABLE modifica essa estrutura. ADD COLUMN acrescenta uma coluna; não cadastra uma nova linha. VARCHAR(n) representa texto de comprimento variável, com limite definido pelo tipo.',
  example: 'Uma biblioteca já possui a tabela LEITOR e passa a guardar o telefone de cada pessoa. É necessário criar o campo antes de preenchê-lo.',
  sql: 'ALTER TABLE LEITOR ADD COLUMN Telefone VARCHAR(20);',
  steps: ['Identifique o objeto que muda: uma tabela existente.', 'Use ALTER TABLE, informe a tabela e acrescente ADD COLUMN com nome e tipo da nova coluna.'],
  mistake: 'Confundir estrutura com conteúdo: INSERT cria registros e UPDATE altera valores. MODIFY, quando disponível no SGBD, modifica uma coluna existente; não é o comando para acrescentá-la.'
 },
 'sm1-02': {
  concept: 'UPDATE modifica valores de registros já existentes. SET informa quais colunas receberão novos valores. WHERE seleciona os registros afetados. A ordem escrita é UPDATE tabela SET atribuições WHERE condição.',
  example: 'Para corrigir o nome do leitor de código 7, a condição deve identificar esse leitor. Outros leitores permanecem com os nomes anteriores.',
  sql: "UPDATE LEITOR\nSET Nome = 'Marina', Cidade = 'Recife'\nWHERE Codigo = 7;",
  steps: ['Escolha a tabela e descreva em SET os novos valores, separando as atribuições por vírgulas.', 'Confira o filtro WHERE: sem ele, todos os registros da tabela são candidatos à atualização.'],
  mistake: 'WHERE não recebe a lista de novos valores; ele recebe a condição de seleção. SET também não filtra registros. Trocar essas funções ou a ordem das cláusulas torna a instrução incorreta.'
 },
 'sm1-03': {
  concept: 'Uma entidade fraca precisa da chave de uma entidade proprietária para ser identificada completamente. Um identificador parcial distingue seus elementos dentro de uma mesma proprietária, mas pode se repetir entre proprietárias diferentes.',
  example: 'O quarto 12 pode existir em vários hotéis. Se QUARTO é identificado por CodigoHotel e NumeroQuarto, o número 12 sozinho não identifica um quarto de forma global.',
  steps: ['Pergunte se o identificador local pode se repetir em proprietárias diferentes.', 'Se a identificação depende da chave da proprietária mais um identificador parcial, a modelagem como entidade fraca é adequada.'],
  mistake: 'Ter uma chave estrangeira ou depender de outra entidade para existir, isoladamente, não prova identificação fraca. Também não significa especialização: um quarto pertence a um hotel; ele não é um tipo de hotel.'
 },
 'sm1-04': {
  concept: 'No modelo entidade-relacionamento, entidade é algo distinguível sobre o qual se deseja guardar dados. Pode ser físico, como uma pessoa, ou conceitual, como um curso. Atributos são propriedades que descrevem cada ocorrência.',
  example: 'LIVRO é um tipo de entidade. Um livro específico é uma ocorrência. Titulo e AnoPublicacao são atributos; “Banco de Dados” e 2024 são valores desses atributos.',
  steps: ['Separe o elemento representado das características usadas para descrevê-lo.', 'Diferencie o nome de um atributo, como Titulo, do valor armazenado para uma ocorrência.'],
  mistake: 'Não trate todo substantivo como entidade automaticamente: a escolha depende dos requisitos. Uma propriedade simples pode ser atributo, enquanto algo com identificação e propriedades próprias pode merecer entidade.'
 },
 'sm1-05': {
  concept: 'Normalização organiza os dados para reduzir redundâncias e anomalias. Desnormalização introduz redundância de forma planejada para atender uma necessidade medida de desempenho, por exemplo evitar junções repetidas em consultas frequentes.',
  example: 'Um relatório consulta pedidos e calcula o total de seus itens muitas vezes. Armazenar também o total no pedido pode facilitar a leitura, mas exige atualizá-lo sempre que os itens mudarem.',
  steps: ['Identifique uma consulta frequente e confirme que o custo das junções ou dos cálculos é relevante.', 'Compare o ganho na leitura com o custo de escrita e com o risco de manter valores duplicados inconsistentes.'],
  mistake: 'Desnormalizar não é eliminar tabelas sem critério, nem garantir que toda consulta fique mais rápida. Muitas atualizações podem tornar a redundância mais cara; a decisão precisa considerar a carga real.'
 },
 'sm1-06': {
  concept: 'O modelo relacional representa dados por relações, normalmente implementadas como tabelas. Colunas correspondem a atributos e linhas a registros. Chaves identificam registros e permitem representar associações entre tabelas.',
  example: 'AUTOR possui CodigoAutor e Nome. LIVRO possui CodigoLivro, Titulo e CodigoAutor. A chave estrangeira em LIVRO referencia o autor, sem exigir a repetição do nome dele em cada livro.',
  steps: ['Reconheça a tabela como estrutura que reúne registros do mesmo tipo.', 'Procure a chave que identifica cada registro e as referências que conectam as tabelas.'],
  mistake: 'Uma relação não significa apenas um vínculo entre duas tabelas: no vocabulário relacional, a própria tabela representa uma relação. A ordem física das linhas não é uma classificação garantida dos resultados.'
 },
 'sm1-07': {
  concept: 'Nos modelos navegacionais clássicos, o acesso percorre caminhos definidos entre registros. O modelo hierárquico organiza os registros em árvore; o modelo em rede admite conexões mais gerais. IMS e IDS são exemplos históricos associados a esses modelos.',
  example: 'Em uma árvore, pode-se partir de uma empresa, chegar a um departamento e depois aos funcionários ligados a ele. O percurso de acesso acompanha a organização dos registros.',
  steps: ['Associe árvore ao modelo hierárquico e conexões em rede ao modelo de rede.', 'Observe que navegar por caminhos entre registros é a característica comum que explica o nome navegacional.'],
  mistake: 'A expressão “banco em rede” aqui descreve o modelo de dados, não simplesmente um servidor acessado pela internet. Um banco relacional pode funcionar em rede de computadores sem ser do modelo em rede.'
 },
 'sm1-08': {
  concept: 'Um SGBD distribui tarefas entre componentes. O catálogo guarda metadados, como definições de tabelas e colunas. Em aplicações com SQL embutido, o pré-compilador separa os comandos SQL do código da linguagem hospedeira. O otimizador escolhe planos de execução de consultas.',
  example: 'Ao consultar livros por autor, o otimizador pode comparar caminhos de acesso, como usar um índice ou percorrer a tabela. Confirmar ou desfazer alterações pertence ao gerenciamento de transações.',
  steps: ['Relacione catálogo com informações sobre a estrutura do banco, e não com os registros da aplicação.', 'Separe planejamento de consultas de controle de transações: escolher um plano não é executar COMMIT ou ROLLBACK.'],
  mistake: 'Não atribua ao otimizador a função de confirmar transações ou compilar transações como se fossem consultas. Os módulos cooperam, mas suas responsabilidades não são intercambiáveis.'
 },
 'sm1-09': {
  concept: 'Analisar desempenho envolve volume de dados, frequência das operações, consultas executadas e tempo de resposta esperado. Esses fatores descrevem a carga de trabalho. Políticas de acesso definem quem pode consultar ou alterar dados e pertencem principalmente à segurança.',
  example: 'Um sistema com milhões de pedidos e consultas a cada segundo exige uma análise diferente de um cadastro pequeno usado uma vez por dia. Já decidir quem pode ver salários define uma permissão.',
  steps: ['Classifique cada item: descreve carga, custo de processamento ou meta de tempo?', 'Diferencie esses fatores de uma regra de autorização, que descreve quem pode fazer determinada operação.'],
  mistake: 'A classificação didática não significa que segurança nunca tenha custo: verificações de permissão e filtros podem afetar a execução. A questão distingue a finalidade principal de cada fator.'
 },
 'sm1-10': {
  concept: 'DML é a linguagem de manipulação de dados: INSERT insere linhas, UPDATE modifica valores e DELETE remove linhas. DDL define ou altera a estrutura: CREATE, ALTER e DROP são exemplos. O ponto central é distinguir conteúdo e estrutura.',
  example: 'Cadastrar um leitor novo é INSERT. Corrigir seu nome é UPDATE. Excluir seu cadastro é DELETE. Acrescentar uma coluna à tabela LEITOR é ALTER TABLE, pois muda o esquema.',
  steps: ['Pergunte se a operação atua sobre registros ou sobre a definição de um objeto.', 'Para registros, diferencie inserir, modificar e remover antes de escolher o comando.'],
  mistake: 'DELETE remove linhas e mantém a tabela. DROP TABLE remove o objeto tabela. SELECT é tratado como consulta e sua classificação como DQL ou parte da DML varia entre materiais; o trio de manipulação permanece INSERT, UPDATE e DELETE.'
 },
 'sm2-01': {
  concept: 'A lista do SELECT pode conter colunas e expressões calculadas. O operador * entre dois valores numéricos representa multiplicação. O cálculo é feito para cada linha retornada e não altera os valores armazenados na tabela.',
  example: 'Um item com quantidade 4 e preço unitário 12,50 tem valor total 50,00. Um alias dá um nome legível à coluna calculada do resultado.',
  sql: 'SELECT Codigo, Descricao,\n       Quantidade * PrecoUnitario AS ValorTotal\nFROM ITEM;',
  steps: ['Traduza “produto entre dois valores” como multiplicação, sem confundir com o cadastro de um produto.', 'Mantenha na lista do SELECT as demais colunas solicitadas pelo enunciado.'],
  mistake: 'A divisão responde a outro cálculo. SUM e AVG agregam valores de várias linhas; não substituem a multiplicação por linha. SELECT * usa o asterisco para todas as colunas, em outro contexto sintático.'
 },
 'sm2-02': {
  concept: 'LIKE compara um texto com um padrão. O símbolo % corresponde a zero ou mais caracteres; _ corresponde a exatamente um caractere. AND exige que as duas condições sejam verdadeiras para a linha entrar no resultado.',
  example: 'O padrão M% aceita “Matemática” e “M”, mas não “Álgebra”. Para selecionar nomes iniciados por M e duração inferior a 40, combine o padrão com uma comparação numérica.',
  sql: "SELECT * FROM OFICINA\nWHERE Nome LIKE 'M%' AND Duracao < 40;",
  steps: ['Posicione a letra antes do % quando o texto deve começar por ela.', 'Use < para menor que e combine os critérios com AND; o valor limite não é incluído.'],
  mistake: 'O padrão _M% exige que M seja a segunda letra. NOT LIKE inverte o teste. > seleciona valores maiores, e <= inclui o limite. A comparação de maiúsculas e acentos depende da configuração do banco.'
 },
 'sm2-03': {
  concept: 'AVG calcula a média aritmética dos valores não nulos de uma coluna. Sem GROUP BY, o conjunto filtrado é tratado como um único grupo. FROM deve indicar a tabela que contém a coluna usada no cálculo.',
  example: 'Para salários 2000, 3000 e 4000, a soma é 9000 e há três valores: a média é 3000. Um salário NULL é ignorado; um salário zero participa da média.',
  sql: 'SELECT AVG(Salario) AS MediaSalarial\nFROM COLABORADOR;',
  steps: ['Identifique que o pedido é a média, não o menor valor nem a soma.', 'Aplique AVG à coluna e confira se o nome após FROM é a tabela correta.'],
  mistake: 'MIN devolve o menor salário; SUM devolve o total. Selecionar apenas Salario lista valores individuais. Se não houver valores não nulos para calcular, AVG retorna NULL, e não automaticamente zero.'
 },
 'sm2-04': {
  concept: 'IN testa se um valor pertence a uma lista. Pode substituir várias igualdades ligadas por OR. Um AND adicional permite exigir outra condição junto com a participação na lista.',
  example: 'Para aceitar as cidades Recife ou Natal e exigir ano superior a 2018, use uma lista de textos entre parênteses e uma condição numérica separada.',
  sql: "SELECT * FROM FILIAL\nWHERE Cidade IN ('Recife', 'Natal')\n  AND AnoInicio > 2018;",
  steps: ['Coloque os valores permitidos em IN, com textos entre aspas e separados por vírgulas.', 'Combine a lista com o critério de ano usando AND e confira se o limite deve ser incluído.'],
  mistake: 'NOT IN seleciona valores fora da lista, ressalvado o tratamento de NULL. LIKE trabalha com padrão textual, não com essa lista de alternativas. AnoInicio = 2018 representa somente o próprio ano.'
 },
 'sm2-05': {
  concept: 'A RIGHT OUTER JOIN B preserva todas as linhas de B, que está à direita. Para cada linha, procura correspondências em A conforme o ON. Sem correspondência, as colunas de A ficam com NULL. Linhas de A sem correspondente não são preservadas.',
  example: 'Se A contém pedidos e B contém clientes, a junção à direita mantém até o cliente que ainda não fez pedido. Para esse cliente, as colunas vindas de pedido aparecem como NULL.',
  sql: 'SELECT P.Codigo, C.Nome\nFROM PEDIDO P RIGHT JOIN CLIENTE C\n  ON P.CodigoCliente = C.Codigo;',
  steps: ['Localize as tabelas antes e depois de JOIN: isso define esquerda e direita.', 'Preserve a tabela à direita e complete com NULL os campos da esquerda quando não houver correspondência.'],
  mistake: 'INNER JOIN exige correspondência. FULL OUTER JOIN preserva também as linhas sem par da esquerda, acrescentando resultados que RIGHT JOIN não garante. Uma correspondência múltipla pode gerar mais de uma linha por cliente.'
 },
 'sm2-06': {
  concept: 'LEFT JOIN preserva todas as linhas da tabela à esquerda e combina as correspondências da direita. Quando nenhuma linha da direita satisfaz o ON, a linha da esquerda permanece e recebe NULL nas colunas vindas da direita.',
  example: 'Uma turma sem matrículas continua aparecendo em TURMA LEFT JOIN MATRICULA. Já uma turma com três matrículas aparece em três combinações, uma para cada matrícula correspondente.',
  sql: 'SELECT T.Nome, M.CodigoAluno\nFROM TURMA T LEFT JOIN MATRICULA M\n  ON T.Codigo = M.CodigoTurma;',
  steps: ['Identifique a tabela que aparece antes de LEFT JOIN: ela será preservada.', 'Aplique o ON para encontrar os pares; sem par, mantenha a linha esquerda com NULL à direita.'],
  mistake: 'LEFT JOIN não mantém todas as linhas sem par das duas tabelas; isso é papel do FULL OUTER JOIN. Também não promete exatamente uma linha por registro da esquerda quando existem vários correspondentes.'
 },
 'sm2-07': {
  concept: 'A ordem escrita das cláusulas é SELECT, FROM, WHERE, GROUP BY, HAVING e ORDER BY. WHERE filtra linhas antes do agrupamento; GROUP BY forma grupos; HAVING filtra grupos; ORDER BY ordena o resultado.',
  example: 'Para contar colaboradores ativos por setor e mostrar somente setores com mais de cinco pessoas, o estado ativo é filtro de linha e a contagem mínima é filtro de grupo.',
  sql: "SELECT Setor, COUNT(*) AS Total\nFROM COLABORADOR\nWHERE Ativo = 'S'\nGROUP BY Setor\nHAVING COUNT(*) > 5\nORDER BY Setor;",
  steps: ['Separe os critérios aplicados a cada registro daqueles aplicados ao resultado agregado.', 'Escreva o agrupamento antes de HAVING e deixe a ordenação para depois dessas cláusulas.'],
  mistake: 'A ordem de escrita não é a ordem lógica de processamento. Não coloque ORDER BY antes de GROUP BY nem use WHERE COUNT(*) > 5 para filtrar grupos. Colunas não agregadas selecionadas normalmente precisam constar no agrupamento.'
 },
 'sm2-08': {
  concept: 'Uma subconsulta com IN produz um conjunto de valores para testar a pertinência de cada linha da consulta externa. Se o código externo aparece entre os valores retornados pela subconsulta, a condição é satisfeita.',
  example: 'Se LIVRO contém CodigoAutor 2, 2 e 7, a consulta externa seleciona os autores 2 e 7 existentes em AUTOR. Um autor sem nenhum livro não aparece.',
  sql: 'SELECT Codigo, Nome FROM AUTOR\nWHERE Codigo IN (SELECT CodigoAutor FROM LIVRO);',
  steps: ['Leia primeiro a subconsulta para descobrir quais códigos ela fornece.', 'Volte à tabela externa e mantenha apenas os registros cujos códigos aparecem nessa lista.'],
  mistake: 'A consulta retorna colunas da tabela externa, não os registros da tabela interna. DISTINCT é dispensável para o teste com IN: repetir um código não exige vários vínculos nem duplica a linha externa.'
 },
 'sm2-09': {
  concept: 'OR aceita uma linha quando ao menos uma condição é verdadeira. UNION reúne os resultados de duas consultas e elimina duplicatas. Com uma chave única não nula incluída na projeção, é possível reescrever os dois filtros com UNION preservando os registros selecionados.',
  example: 'Um colaborador pode estar ativo, ter salário acima de 8000 ou atender aos dois critérios. Ele deve aparecer uma vez na união. O código único distingue pessoas com nomes iguais.',
  sql: "SELECT Codigo, Nome FROM COLABORADOR\nWHERE Ativo = 'S'\nUNION\nSELECT Codigo, Nome FROM COLABORADOR\nWHERE Salario > 8000;",
  steps: ['Transforme cada lado do OR em uma consulta com as mesmas colunas e tipos compatíveis.', 'Reúna os resultados com UNION e confira se a projeção identifica unicamente cada registro.'],
  mistake: 'AND exige as duas condições. EXCEPT retira resultados. UNION ALL repete registros que atendem aos dois filtros. Sem uma chave na projeção, UNION pode eliminar linhas iguais que o SELECT com OR manteria.'
 },
 'sm2-10': {
  concept: 'Para interpretar uma junção externa, primeiro descubra qual tabela é preservada. Depois leia ON como a regra que associa registros. Os aliases apenas abreviam nomes de tabelas, e ORDER BY modifica a apresentação, sem criar nem remover correspondências.',
  example: 'AUTOR A LEFT JOIN LIVRO L preserva os autores, inclusive os sem livros. Um autor com dois livros aparece em duas linhas; um sem livros aparece com NULL no título.',
  sql: 'SELECT A.Nome, L.Titulo\nFROM AUTOR A LEFT JOIN LIVRO L\n  ON A.Codigo = L.CodigoAutor\nORDER BY A.Nome;',
  steps: ['Leia da esquerda para a direita e anote qual conjunto precisa continuar aparecendo sem correspondência.', 'Observe quais colunas ficam nulas na ausência do vínculo e, por fim, qual coluna ordena o resultado.'],
  mistake: 'Trocar a ordem das tabelas pode mudar o resultado de LEFT JOIN. A junção não preserva linhas órfãs da direita. Um filtro posterior em WHERE que rejeite os NULL da direita pode excluir as linhas sem correspondência.'
 }
};
