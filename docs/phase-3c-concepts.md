# Fase 3C — conceitos visuais intermediários

Esta fase apresenta três direções visuais no dashboard LAB sem escolher ou aplicar uma delas a
todos os layouts. Todos os conceitos compartilham o mesmo WebSocket, referências opacas, cache,
endpoint e resolvedor de caminhos assinados da Fase 3B.

## Tokens

O sistema visual usa somente variáveis centralizadas:

- `--octopus-bg`: fundo quase preto azulado;
- `--octopus-surface`: superfície principal;
- `--octopus-surface-elevated`: pôsteres e detalhes;
- `--octopus-accent`: roxo Octopus;
- `--octopus-accent-secondary`: ciano/azul-petróleo;
- `--octopus-text`: branco suavizado;
- `--octopus-muted`: cinza azulado;
- `--octopus-border`: contorno translúcido discreto;
- `--octopus-radius-card`: 19 px;
- `--octopus-radius-poster`: 12 px.

Os aliases antigos `--octopus-media-*` apontam para esses tokens para preservar compatibilidade.

## Conceito A — Cinematic Overlay

- gradiente azul-marinho quase preto;
- pôsteres dominantes, título e metadado curto sobre gradiente inferior;
- brilho ciano/roxo localizado;
- chips pequenos e translúcidos;
- sombra e elevação discretas.

## Conceito B — Gallery Clean

- superfície mais opaca e neutra;
- título pequeno abaixo do pôster;
- menos brilho, transparência e ornamentação;
- a mesma densidade reduzida e navegação da estante.

## Conceito C — Octopus Glass

- superfície escura translúcida com blur;
- acento roxo mais presente e ciano secundário;
- título overlay e chips em glass;
- glow localizado, nunca na borda inteira.

## Densidade e navegação

Com `posters_visible: auto`, o strip usa uma composição de aproximadamente 2,35 colunas abaixo de
560 px e 4,35 colunas a partir daí. Isso mostra dois/quatro itens completos e parte do próximo,
mantendo a escala tipográfica. A scrollbar fica oculta; swipe, trackpad, wheel horizontal, teclado
e setas flutuantes continuam disponíveis. Fades laterais e setas só aparecem quando existe
conteúdo na direção correspondente.

## Imagens de episódio

O contrato agora separa:

- `poster_ref`: série, depois temporada; nunca o frame do episódio;
- `still_ref`: `Primary` do episódio, quando presente, para hero/detalhe horizontal;
- `backdrop_ref`: backdrop da mídia ou pai.

Os campos são referências opacas. Descritores, IDs e image tags continuam somente no backend. A
política usa os metadados já presentes nos DTOs do polling e não acrescenta chamadas N+1.

## Conceito D — Cinematic Octopus Gallery

O quarto protótipo combina a superfície roxa/ciano do C, os títulos abaixo dos pôsteres do B e a
profundidade atmosférica do A. Ele continua restrito ao layout `strip` do LAB e não promove nenhuma
direção visual para os demais layouts.

### Diagnóstico do espaçamento anterior

O excesso percebido não era causado por `justify-content: space-between`. O trilho já era um flex
horizontal com `gap`, mas cada `octopus-media-poster` recebia uma base fracionária calculada por
`100 / posters_visible`. Dentro desse slot largo, a moldura 2:3 era limitada pela altura, mantinha
`width: auto` e usava `justify-self: center`. Assim, o espaço vazio interno dos slots somava-se ao
`gap` de 10/12 px e parecia um grande vão distribuído automaticamente. O cálculo por frações também
dava a todos os itens o mesmo peso e reforçava a aparência rígida.

No D, o trilho declara `justify-content: flex-start`, os itens têm largura fixa derivada da altura
disponível e a moldura ocupa 100% dessa largura, alinhada ao início. O viewport da prateleira termina
em 35% do próximo item; o espaço restante pertence ao fundo artístico do card, não é redistribuído
entre pôsteres. A geometria validada é:

- 390 × 210: pôster de 92 px, `gap` de 13 px, dois completos e 35% do terceiro;
- 800 × 240: pôster de 112 px, `gap` de 17 px, quatro completos e 35% do quinto.

Essas larguras preservam simultaneamente a proporção 2:3, duas linhas de título, uma linha reservada
de metadado e a altura total configurada, sem overflow vertical.

### Diagnóstico da revisão D.1 — antes da correção

A revisão visual seguinte mostrou que a primeira correção eliminou o espaço **entre** pôsteres,
mas não o espaço **depois** da prateleira. A causa exata é
`.cinematic-gallery .viewport { width: var(--octopus-gallery-track-width) }`: a viewport interna
recebe uma largura fixa calculada somente por `posterHeight`, `visible = 2.35/4.35` e gaps. Ela não
usa a largura útil do card. O restante da superfície fica fora da viewport da prateleira e,
como o fundo está muito escuro, é percebido como um deserto roxo.

Medições determinísticas do estado anterior:

| alvo                            | container externo | largura útil após padding | pôster |   gap | itens visíveis | largura da viewport/track |  vazio à direita |
| ------------------------------- | ----------------: | ------------------------: | -----: | ----: | -------------: | ------------------------: | ---------------: |
| 390 × 210                       |            390 px |                    374 px |  92 px | 13 px |        2 + 35% |                  242,2 px | 131,8 px — 35,2% |
| 800 × 240                       |            800 px |                    784 px | 112 px | 17 px |        4 + 35% |                  555,2 px | 228,8 px — 29,2% |
| 819 × 240 no viewport 819 × 480 |            819 px |                    803 px | 112 px | 17 px |        4 + 35% |                  555,2 px | 247,8 px — 30,9% |
| LAB largo observado             |          745,3 px |                  729,3 px | 112 px | 17 px |        4 + 35% |                  555,2 px | 174,1 px — 23,9% |

`justify-content` já é `flex-start`; `flex-basis` usa a largura fixa do pôster; `overflow-x: auto`,
`overflow-y: hidden` e `overscroll-behavior-inline: contain` não criam o vazio. `container-type:
size`, `z-index` e `pointer-events: none` do fundo também não são a causa. O erro é a combinação da
viewport com `width` fixo e da largura do pôster derivada apenas da altura, reaproveitada para todos
os containers acima de 560 px.

O hover desapareceu por uma regra explícita do D:
`article[data-presentation="cinematic-gallery"]:hover .image-frame { transform: none; }`. Ela
sobrescreve a elevação genérica. Além disso, o foco só é anunciado em `focus` e `pointerdown`; não
há atualização de `focused-ref` em `pointerenter`. `prefers-reduced-motion` apenas remove
transições e não elimina a sombra/escala estática do item focado, portanto não é a causa.

Cada `octopus-media-shelf` possui estado próprio, e uma instância recém-criada pelo navegador começa
naturalmente com `scrollLeft = 0`. O primeiro item também é inicializado como foco por
`synchronizeFocusAndAmbient`. Os fragmentos à esquerda nas capturas vieram de dois caminhos:

- fixtures com `focus: 2` chamavam `focus()` no terceiro item; o navegador rolava a track para
  revelar esse elemento;
- a captura do LAB reutilizou uma mesma instância depois de interação, preservando corretamente o
  scroll real daquela instância.

Faltava, porém, uma inicialização explícita e testável da shelf em `scrollLeft = 0` no primeiro
`slotchange`; isso torna o contrato dependente do comportamento padrão do navegador e será
corrigido sem apagar a posição em rerenders da mesma instância.

O backdrop já ocupa geometricamente o card: o host é absoluto, usa `inset: -26px`, e a imagem
interna usa `object-fit: cover`. O problema é perceptivo. A combinação `brightness(0.3)`,
`opacity: 0.74`, baixa saturação e um overlay que escurece até 76% quase apaga a arte. Quando não há
backdrop/still, os gradientes têm baixa intensidade e deixam especialmente o lado direito plano.
A viewport curta da prateleira agrava essa leitura. A correção deve usar a largura útil inteira,
preservar a arte abstrata porém perceptível e enriquecer o fallback sem alterar referências,
assinaturas ou endpoints.

### Composição e interação

- cabeçalho de 12,5 px com `mdi:octopus`, título real e contador discreto;
- título de 10,5 px abaixo da imagem, até duas linhas; metadado de 9 px e badge de 8 px;
- somente o item focado mostra o metadado mais completo;
- hover de mouse, foco visível e `data-focused` elevam 4 px, aplicam escala máxima de 1,04,
  aprofundam a sombra e realçam borda/título;
- foco acompanha hover, teclado, toque, o item central durante a rolagem e as setas;
- scrollbar permanece oculta, com swipe, trackpad, teclado, fades e setas preservados;
- cada shelf nova inicializa explicitamente em `scrollLeft = 0` e foco no primeiro item, sem apagar
  o scroll durante rerenders da mesma instância;
- `prefers-reduced-motion` remove transições, mas mantém sombra, borda, cor e transformação
  estáticas de foco; não há animação ou movimento de fundo.

### Geometria responsiva D.1

O cálculo do D não usa mais `posters_visible` como limite de largura. Para cada dimensão ele:

1. remove padding e borda horizontais da largura externa;
2. escolhe 2 itens completos abaixo de 560 px ou 4 itens completos a partir daí;
3. escolhe gap de 12 px ou 16 px;
4. reserva 34% do próximo item;
5. calcula `posterWidth = (usefulWidth - fullItems × gap) / (fullItems + 0,34)`;
6. deriva `peekWidth` do espaço restante e limita a altura pela área vertical disponível para
   imagem, título e metadado.

| alvo      | largura útil da track | completos |    pôster |   gap |           peek | ocupação útil |
| --------- | --------------------: | --------: | --------: | ----: | -------------: | ------------: |
| 390 × 210 |                372 px |         2 | 148,72 px | 12 px | 50,56 px — 34% |          100% |
| 800 × 240 |                782 px |         4 | 165,44 px | 16 px | 56,25 px — 34% |          100% |
| 819 × 240 |                801 px |         4 | 169,82 px | 16 px | 57,74 px — 34% |          100% |

A moldura usa toda a largura calculada e recorta a imagem com `object-fit: cover` dentro da altura
vertical disponível. Isso é necessário para satisfazer simultaneamente a altura fixa, o título
abaixo e o número obrigatório de itens completos. A referência de episódio continua sendo o pôster
vertical correto da série/temporada; apenas a apresentação no tile é recortada.

### Fundo artístico seguro

O fundo usa primeiro `backdrop_ref` do item inicial/focado e, quando apropriado, `still_ref` como
fallback. A imagem passa pelo mesmo `octopus-media-image`, resolvedor `auth/sign_path` e endpoint
autenticado do Home Assistant da Fase 3B. Nunca é construída uma URL direta do Jellyfin.

A composição aplica imagem ampliada em `cover`, blur forte, saturação reduzida, contraste moderado,
overlay escuro, gradiente azul-petróleo no lado da prateleira, gradiente roxo no lado oposto e
vinheta. A próxima imagem é pré-carregada invisivelmente; o fundo anterior permanece até ela estar
pronta, evitando flash e mudança de geometria. Sem backdrop/still, um fallback Octopus com três
luzes difusas e gradiente azul-petróleo/roxo ocupa toda a superfície, sem material externo.

A política de episódios não muda: `poster_ref` continua sendo série → temporada → placeholder;
`still_ref` e `backdrop_ref` seguem separados e só podem influenciar composições horizontais ou o
fundo ambiente.

## Recuperação controlada — Conceito D2

As duas iterações anteriores do Conceito D tentaram combinar pôsteres 2:3, título abaixo, altura
baixa, poucos itens e preenchimento horizontal. Esses requisitos são geometricamente
incompatíveis. A D.1 acabou aumentando a largura da moldura sem derivá-la da altura, produzindo
capas quase quadradas e recorte excessivo.

Não existia commit, tag ou cópia de fonte do último checkpoint estável que permitisse reverter
somente D sem risco para A/B/C. O estado D.1 foi preservado no diretório privado de validação e a
recuperação começou em um custom element isolado. Depois da aprovação visual, a Fase 3C.1 migrou
essa implementação para `octopus-media-card`/`strip-layout` e removeu o custom element experimental,
a shelf antiga e as geometrias duplicadas.

### Geometria D2 — Cinematic Poster Strip

O strip baixo usa título sobreposto e mantém invariavelmente:

`posterWidth = posterHeight × 2 / 3`

A altura é limitada primeiro pelo espaço vertical do card. A densidade-alvo apenas pode reduzir
essa altura; nunca aumenta a largura de forma independente.

| alvo              |           útil | completos |    altura |   largura |   gap |        próximo |
| ----------------- | -------------: | --------: | --------: | --------: | ----: | -------------: |
| 390 × 210         |         372 px |         3 | 159,32 px | 106,21 px | 10 px | 23,37 px — 22% |
| 800 × 240         |         730 px |         5 | 192,53 px | 128,35 px | 12 px | 28,24 px — 22% |
| 819 × 240         |         749 px |         5 | 197,99 px | 131,99 px | 12 px | 29,04 px — 22% |
| celular 390 × 844 | card 390 × 210 |         3 | 159,32 px | 106,21 px | 10 px |            22% |

O cabeçalho ocupa 22 px. A cópia fica dentro dos 42% inferiores do pôster, com duas linhas,
metadado curto e badge pequeno. Não existe atributo HTML `title`; o nome completo permanece em
`aria-label`.

### Layout futuro documentado: `feature-strip`

`feature-strip` é uma composição editorial separada e não foi implementada nesta rodada. Ela poderá
usar um ou dois pôsteres em 390 px, ou três/quatro em 800 px, deixando a área restante para backdrop,
título, metadados, progresso/data e gradientes. Ela não deve ser usada como justificativa para
esticar capas nem substituir o strip de pôsteres.

## Decisão final da Fase 3C.1

A geometria D2 foi aprovada e promovida à única implementação oficial de `layout: strip`. Os
conceitos A, B e C permanecem disponíveis como paletas do LAB, mas usam o mesmo componente,
geometria e comportamento do strip oficial. O custom element experimental D2, a shelf antiga e as
geometrias D/D.1 duplicadas foram removidos após a migração dos testes. A especificação vigente está
em [official-strip.md](official-strip.md).

## Decisão final da Fase 3C.2.2

O Playing Hero V2.1 aprovado foi promovido à única implementação oficial de
`mode: playing` com `layout: hero`. O antigo `hero-layout` genérico permanece apenas para os demais
modos; o wrapper `playing-hero-prototype` e a ativação exclusiva por
`visual_concept: playing-hero-cinematic` foram removidos. Harness e fixtures fictícias continuam
como infraestrutura de teste, sem lógica visual paralela.

O roteamento `layout: auto` seleciona o hero em 390×240 e dimensões maiores compatíveis. Os estados
playing, paused, empty, unavailable e stale, o carrossel de sessões, o nome amigável do dispositivo
e as imagens seguras fazem parte do contrato oficial. A geometria do Playing Hero e a geometria
D2 do strip permanecem independentes. A especificação vigente está em
[official-playing-hero.md](official-playing-hero.md).
