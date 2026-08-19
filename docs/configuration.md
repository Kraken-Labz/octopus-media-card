# Configuração do Octopus Media Card

O card recebe somente identidade da ConfigEntry e preferências visuais. URL, credencial, API key,
usuário Jellyfin, política TLS e timeout pertencem exclusivamente à integração.

## Exemplo mínimo

```yaml
type: custom:octopus-media-card
entry_id: ID_DA_CONFIG_ENTRY
mode: recent
layout: auto
```

## Exemplo completo

```yaml
type: custom:octopus-media-card
entry_id: ID_DA_CONFIG_ENTRY
mode: recent
layout: strip
title: Recém-adicionados
height: 240
sections:
  - recent
  - upcoming
  - playing
item_count: 12
posters_visible: auto
density: auto
header_alignment: start
theme: midnight
visual_concept: cinematic-overlay
title_position: overlay
accent_color: "#8b5cf6"
autoplay: false
cycle_interval: 10
show_arrows: true
show_indicators: true
show_titles: true
show_dates: true
show_ratings: true
show_badges: true
thumbnail_size: medium
```

## Modos e layouts

`mode` aceita `recent`, `upcoming` e `playing`. `layout` aceita `auto`, `strip`,
`grid`, `hero`, `compact`, `portrait` e `list`.

`layout: auto` usa breakpoints com histerese de 12 px. Em recent/upcoming, containers de 280–699 px
selecionam strip; containers de 700 px ou mais também selecionam strip quando a altura é menor que
360 px. Em playing, 390×240 e dimensões maiores compatíveis selecionam o Playing Hero oficial;
abaixo de 200 px de altura, `auto` usa uma composição mais compacta. Assim, 390×210 e 819×240
continuam usando o mesmo strip oficial em recent, sem compartilhar sua geometria com playing.

## Contrato específico do Playing Hero

```yaml
type: custom:octopus-media-card
entry_id: ID_DA_CONFIG_ENTRY
mode: playing
layout: hero
height: 240
show_titles: true
show_badges: true
show_device: true
show_user: true
show_progress: true
show_time: true
show_arrows: true
show_indicators: true
```

`layout: auto` também seleciona o hero oficial quando a largura e a altura são compatíveis:

```yaml
type: custom:octopus-media-card
entry_id: ID_DA_CONFIG_ENTRY
mode: playing
layout: auto
height: 240
```

- `show_device` usa somente o nome final normalizado pelo backend.
- `show_user`, `show_progress` e `show_time` controlam apenas informação de leitura.
- `show_arrows` e `show_indicators` aparecem somente quando há mais de uma sessão.
- `autoplay` e `cycle_interval` alternam sessões; não comandam o Jellyfin.
- não existem opções de play, pause, stop, seek, volume ou controle remoto.
- `visual_concept` é uma paleta compatível; não é mais necessário para ativar o hero.
- empty, unavailable e stale são estados distintos; stale congela o progresso local.
- o hero ocupa uma superfície única, sem cabeçalho/cápsula externo;
- `EM REPRODUÇÃO` é um eyebrow interno, localizado e não configurável, sem fundo, borda ou ação;
- os chips de estado e tipo permanecem independentes do eyebrow;
- hover visual só é aplicado a ponteiros finos compatíveis com hover.

## Contrato específico do strip

- `height`: altura externa exata quando numérica; `auto` usa a altura oferecida pelo dashboard.
- `item_count`: inteiro de 1 a 50; apenas limita a coleção, sem duplicar itens.
- `posters_visible`: `auto` ou inteiro de 1 a 5. É uma densidade-alvo; a proporção 2:3 e a altura
  disponível são autoritativas. Se a altura impedir o alvo exato, o strip mostra os pôsteres
  adicionais que couberem, sem esticar ou recortar a moldura.
- `show_titles`, `show_dates`, `show_ratings`, `show_badges` e `show_arrows`: aplicados diretamente.
- `accent_color`: controla ícone e contorno/glow de foco.
- `header_alignment`: `start`, `center` ou `end`.
- `theme` e `visual_concept`: preservados; alteram tokens/paleta, não a geometria oficial.
- `title_position`: `overlay` e `below` continuam válidos no schema. No strip, `below` é adaptado
  para overlay para preservar a geometria D2; os demais layouts continuam respeitando a opção.
- `density`: preservado no YAML; no strip não altera a geometria porque conflitaria com a densidade
  D2 aprovada. Continua disponível aos demais layouts.
- `show_indicators`, `autoplay`, `cycle_interval` e `sections`: preservados para compatibilidade
  com YAML legado; não são opções públicas do editor atual.
- `thumbnail_size`: exclusivo do layout list.

Opções incompatíveis permanecem na configuração e não são apagadas pelo editor. As adaptações acima
são explícitas para evitar comportamento silencioso.

## Poucos e muitos itens

- zero: estado vazio verdadeiro;
- um ou dois: alinhamento à esquerda, largura 2:3 normal, sem duplicação, stretch ou `space-between`;
- coleção suficiente: 3 itens completos em 390 px ou 5 em 800/819 px, com alvo de 22% do próximo;
- coleção longa: swipe, trackpad, wheel horizontal, teclado e setas; cada instância começa em
  `scrollLeft = 0`.

## Editor visual

O editor filtra modos pelas capabilities da ConfigEntry e oferece prévia determinística do strip
em 390 e 800 px. A prévia usa títulos, metadados e placeholders fictícios; nunca lê itens, imagens
ou credenciais do ambiente real.
