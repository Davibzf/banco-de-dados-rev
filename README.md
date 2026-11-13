# BD em dia

Site de estudo de Banco de Dados, feito para celular. **500 questões autorais** com cinco alternativas e explicação: 180 fáceis, 200 médias e 120 difíceis.

## Usar

Escolha nível, assunto e sessões de 10, 20 ou 50 questões. Confirme a resposta para ver o raciocínio. Progresso, favoritos e sessão são salvos no navegador por `localStorage`. Há busca, revisão de erros, resumo e tema escuro. Não há cadastro, sincronização de aparelhos, backend ou coleta de respostas em servidor.

## Conteúdo

100 questões conceituais e 400 situações de SQL em 40 famílias com dados diferentes. Base temática: Sistema de banco de dados; Modelagem conceitual; Modelagem lógica e física; Criação e manipulação no PostgreSQL; Consulta com uma tabela; Consulta com várias tabelas; Praticando Banco de Dados. Não é gabarito oficial e os PDFs do curso não são publicados.

Os 400 exemplos gerados usam SQL compartilhado entre PostgreSQL e SQLite moderno. O gerador executa cada consulta em um banco em memória para obter seu resultado. Particularidades exclusivas do PostgreSQL, como SERIAL, ILIKE e EXTRACT, são explicadas em questões conceituais ou no resumo. A correção automática dos resultados não substitui revisão pedagógica humana.

## Executar localmente

Requer Python 3.13+ (SQLite 3.39+ para RIGHT/FULL JOIN) e Node.js 20+ para os testes. O site em si não precisa de instalação ou compilação.

```sh
python -m http.server 4173 --directory public
```

Abra `http://localhost:4173`.

## Verificar

```sh
python scripts/generate_questions.py --check
node --test tests/core.test.js
```

Para reconstruir o JSON, execute `python scripts/generate_questions.py`. As opções são embaralhadas de forma determinística e os filtros não mudam o banco original.

## Publicar na Vercel

Importe o repositório, use Framework Preset **Other**, sem comando de build, diretório de saída `public`. `vercel.json` já define essas opções e cabeçalhos de segurança.

```sh
npx vercel --prod
```

Não comite `.vercel`, tokens ou arquivos `.env`. A aplicação não depende de variáveis de ambiente.
