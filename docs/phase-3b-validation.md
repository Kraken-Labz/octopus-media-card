# Validação sanitizada — Fase 3B

Data: 2026-07-21

Esta fase validou no LAB o fluxo:

`Jellyfin → download autenticado no backend → cache LRU em memória → HomeAssistantView → caminho assinado do Home Assistant → carregamento lazy no card`.

## Resultado

- pôsteres reais de filmes e séries carregaram por rotas same-origin assinadas;
- episódios agrupados reutilizaram o pôster de série, sem consulta N+1 no endpoint de imagem;
- nenhuma URL externa do Jellyfin ou credencial apareceu no navegador;
- primeira carga: 5 misses, 5 itens e 56.280 bytes;
- segunda carga: os mesmos 5 itens/56.280 bytes, com 5 hits e nenhum miss adicional;
- 0 eviction, 0 falha e 0 download em andamento após as duas cargas;
- estado real de `playing`: vazio;
- o snapshot real não continha item sem imagem, portanto esse caso permaneceu validado somente
  pela suíte local fictícia;
- o dashboard LAB ganhou somente a view `Pôsteres reais — 3B` e permaneceu administrativo e
  oculto da sidebar;
- não houve erro novo/recorrente de `octopus_media` após o restart; o aviso padrão de integração
  customizada continua esperado.

## Artefatos verificados

- bundle: 64.245 bytes;
- SHA-256: `E82C185E6819F230752FB435AE625B9261B9B6C0664841703EA378CD86515492`;
- ZIP de desenvolvimento: 53.855 bytes;
- SHA-256 do ZIP: `E9372F2653DBF55461779B98DDC03E4CA3E7CF947D698884666D4F536F6EB2BA`.

As capturas reais e o relatório detalhado permanecem exclusivamente no diretório privado irmão
`octopus-media-card-validation-private`; nenhum título, screenshot ou payload real foi adicionado
ao projeto publicável.

## Limites da evidência real

Não se fabricou estado no servidor. Por isso, item real sem imagem, sessão `playing` ativa,
pôster/backdrop de sessão ativa e estabilidade durante pausa/retomada permanecem pendentes de uma
janela explicitamente autorizada. Esses estados continuam cobertos por fixtures e testes locais.
