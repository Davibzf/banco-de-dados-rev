# Aba Simulados - implementação e verificação

Escopo solicitado: acrescentar simulados baseados somente nas questões SM1/SM2 enviadas, com nível e formato semelhantes, e atualizar a publicação existente.

Decisão: módulo independente, banco próprio de 60 questões (três versões de 20 bases), 10 questões por sessão com uma ocorrência de cada base. Seleção SM1, SM2 ou misto. Navegação livre e troca de respostas antes da finalização. Gabarito comentado ao final, inclusive questões em branco. Sem cronômetro para permitir estudo. Persistência separada para não alterar dados do treino geral.

- [x] Testes iniciais escritos e observados falhar por ausência do módulo.
- [x] Gerador, integridade e correção com testes de respostas em branco e alternativa zero.
- [x] Interface em módulo separado; nova aba e disposição móvel para seis links.
- [x] Testes locais: 10 testes Node e verificações Playwright de simulados e regressão do treino geral.
- [x] Verificação visual em celular, navegação, retomada após reload, correção só ao final e nota 100% em SM2.
- [x] Publicar e verificar ambiente de produção.

Precisão pedagógica: restringir todos os assuntos aos 20 temas enviados. Esclarecer preservação de lado no RIGHT JOIN; assumir CPF único não nulo para equivalência exata OR/UNION; classificar políticas de acesso como segurança sem afirmar ausência absoluta de custo. Reformular a afirmação sobre módulos do SGBD para distinguir claramente otimizador de consultas e controle de transações.

Produção verificada: https://banco-de-dados-rev.vercel.app/#simulados. Banco adicional respondeu HTTP 200 com 60 questões. Fluxos de simulados e regressão do treino passaram no site publicado.

