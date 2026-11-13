# Banco de Dados / revisão no celular

Pedido: site público no repositório Davibzf/banco-de-dados-rev e na Vercel, com 500 questões nos níveis fácil, médio e difícil, baseadas nos exercícios e nos sete PDFs estudados.

## Decisões de implementação

HTML, CSS e JavaScript estáticos, sem framework ou conta de usuário. Essa escolha oferece carregamento rápido, publicação simples na Vercel e manutenção pequena. Um framework com servidor acrescentaria custo sem beneficiar o treino local; Sites hosting não atende ao destino Vercel explicitamente solicitado.

Interface mobile-first: início com progresso, filtros por assunto e nível, sessões de 10/20/50 questões, respostas com cinco alternativas, explicações após confirmar, favoritos, revisão de erros e resultado da sessão. Biblioteca pesquisável de questões e uma revisão teórica curta. Progresso e sessão corrente persistem em localStorage, com mensagem se o navegador bloquear a gravação. Dados ficam neste navegador; sem sincronização entre aparelhos.

Conteúdo autoral inspirado nos materiais enviados, sem republicar os PDFs. 100 questões conceituais e 400 questões com situações e dados em 40 famílias de raciocínio, distribuídas em 180 fáceis, 200 médias e 120 difíceis. Cinco opções distintas e uma resposta correta; conjuntos não dependem de ordem implícita. Consultas geradas são executadas para validar os resultados com subconjunto SQL compatível. Detalhes exclusivos do PostgreSQL ficam nas questões conceituais e nos comentários explícitos.

Design: fundo claro, tinta azul-marinho, verde petróleo, destaque âmbar e cartões com tipografia legível. Sem imagens decorativas. Alvos de toque de pelo menos 44px, estados de foco, feedback textual e contraste. Barra de navegação inferior com área segura no celular.

## Autorização e escopo

O pedido autoriza implementar, enviar ao GitHub e publicar na Vercel. Preservar autenticação existente. Não criar cobranças, não expor credenciais e não copiar documentos privados para o repositório. Acesso ausente à Vercel depende de login do usuário; continuar implementação e testes enquanto isso.

## Prova de entrega

Exatamente 500 IDs e enunciados únicos; distribuição conferida; filtros e sorteio sem repetição; persistência robusta; conferência visual em 390px e desktop; fluxo início/resposta/explicação/resultado/revisão; URL publicada acessível.
