# Fase 3C.2.3 — metadados operacionais responsivos

## Status e correção de direção

Este documento registra o checkpoint local corrigido. O Playing Hero não exibe `Overview`,
sinopse, resumo ou parágrafo descritivo. A proposta anterior de bloco complementar foi rejeitada e
não representa a direção do componente.

A implementação fonte e as fixtures estão aprovadas localmente. A promoção ao LAB permanece
**parcial/não validada**: a URL do recurso foi atualizada, mas a auditoria em contexto novo mostrou
que o JavaScript realmente servido não corresponde ao bundle local aprovado.

## Composição

O hero mantém somente duas regiões:

1. pôster;
2. um fluxo contínuo à direita.

No fluxo direito, todos os elementos compartilham o mesmo eixo horizontal:

```text
EM REPRODUÇÃO
[Tocando] [Filme]

Título
Ano · duração · gênero 1 · gênero 2 · avaliação
[resolução] [HDR] [áudio]

[dispositivo] [usuário]
[progresso, percentual e tempos]
```

Não existe terceira coluna, moldura complementar ou área textual separada.

## Inventário e contrato

Antes desta fase, o coordenador `playing` já fazia uma única chamada `GET /Sessions` e preservava
referência opaca, tipo, título, subtítulo/ano, dispositivo, usuário, estado, duração, posição,
progresso e referências de imagem.

O contrato corrigido acrescenta somente dados operacionais/editoriais já presentes nessa mesma
resposta:

| Campo normalizado  | Origem                      | Regra                                                     |
| ------------------ | --------------------------- | --------------------------------------------------------- |
| `genres`           | `Genres`                    | strings não vazias, no máximo duas                        |
| `rating`           | `CommunityRating`           | número opcional, uma casa decimal                         |
| `video_resolution` | stream de vídeo selecionado | bucket `720p`, `1080p`, `1440p` ou `4K`                   |
| `video_hdr`        | stream de vídeo selecionado | verdadeiro somente com marcador HDR reconhecido           |
| `audio_channels`   | stream de áudio selecionado | `1.0`, `2.0`, `5.1` ou `7.1`; demais valores são omitidos |

`ProductionYear` e `RunTimeTicks` já eram consumidos. O ano continua no `subtitle` normalizado e é
reaproveitado pela linha editorial; não foi criada uma chave duplicada.

`Overview` foi removido novamente do tipo Jellyfin parcial, do modelo Playing, do serializer, do
normalizador, do modelo frontend e das fixtures. Ele não possui consumidor aprovado nesse modo.

Campos rejeitados: `OfficialRating`, codecs, bitrate, contêiner, perfil e qualquer fonte externa.

## Seleção técnica

`VideoStreamIndex` e `AudioStreamIndex` selecionam o stream quando disponíveis. Na ausência do
índice, usa-se o primeiro stream do tipo como fallback determinístico. Ausência ou valor não
reconhecido não produz chip.

Não existe nova chamada, parâmetro `fields`, detalhe por item, segundo coordinator ou polling
adicional. O frontend continua sem `fetch` para Jellyfin.

## Responsividade pela largura do componente

O custom element usa `container-type: inline-size` e `@container`:

- abaixo de `560 px`: mantém o Playing Hero oficial; ano isolado, sem linha enriquecida e sem chips
  técnicos;
- de `560 px` a `639 px`: linha reduzida com os três primeiros valores disponíveis por prioridade;
- de `640 px` a `699 px`: libera o quarto valor disponível;
- a partir de `700 px`: mostra todos os valores disponíveis da linha e até três chips técnicos.

Prioridade da linha:

1. ano;
2. duração;
3. primeiro gênero;
4. segundo gênero;
5. avaliação.

Separadores são gerados visualmente entre spans visíveis, sem deixar pontos órfãos. Quando a linha
enriquecida está ativa, o ano isolado do filme é ocultado para não haver repetição. Em episódios, o
subtítulo `TxxExx · nome` permanece e a linha seguinte começa pela duração.

## Fallbacks

- Campos ausentes desaparecem sem `N/A`, “desconhecido” ou outro placeholder.
- Sem gêneros, duração e nota continuam lado a lado.
- Sem nota, a linha termina no último gênero disponível.
- Sem dados técnicos, o conjunto de chips não é criado.
- Com dados mínimos, espaço livre é mantido; nenhum elemento é esticado.
- Paused e stale continuam congelando o progresso.

## Preservações

- Altura externa exata de 240 px.
- Uma única borda no container externo; hover/foco apenas modulam sua cor.
- Pôster, superfície, gradiente e backdrop seguro existentes.
- Dispositivo, usuário, barra, percentual, posição, duração e restante.
- Uma única assinatura de snapshot e avanço local existentes.
- Referências opacas e sistema seguro de imagens.
- Strip oficial, catálogo de dispositivos e demais dashboards.
- Compacto 390×240 pixel a pixel igual ao checkpoint aprovado.

## Matriz local corrigida

As novas evidências privadas ficam em
`octopus-media-card-validation-private/phase-3c23-playing-hero-wide-metadata-design/corrected-single-flow/`:

1. 390×240, filme completo;
2. 600×240, linha reduzida;
3. 800×240, linha completa e chips;
4. 800×240, episódio;
5. 800×240, título longo;
6. 800×240, sem gêneros;
7. 800×240, sem avaliação;
8. 800×240, sem dados técnicos;
9. 800×240, dados mínimos.

Além das capturas, a validação cobre ausência total de `.overview`, uma única coluna no fluxo de
conteúdo, alinhamento comum entre título/linha/chips/contexto/progresso, overflow, campos ausentes,
paused, stale, empty, teclado, touch, múltiplas instâncias, zoom 125%, scale factor 1,25 e ausência
de requests diretos ao Jellyfin.

## Limitação para promoção futura

A presença de gêneros, nota e streams no payload `Sessions` do servidor real ainda precisa ser
confirmada em uma sessão natural, sem persistir payload bruto ou segredos. O bundle local aprovado
está promovido no recurso do LAB; a entrega byte a byte no filesystem remoto permanece não
confirmada pelo conector disponível.

## Resultado da tentativa de promoção ao LAB

O build único produziu bundles byte-idênticos de 138.050 bytes, SHA-256
`c844ae3903f581f45271d557e0ca54f4b80b65bb43a9ba88b89a7a7419095d75`. O ZIP de desenvolvimento
determinístico contém 31 entradas exclusivamente sob `custom_components/octopus_media/`, mede
73.052 bytes e tem SHA-256
`3c313cc8eeeda222246071ae3b915d1413ae694040a16415a631383ca837d520`; a segunda execução produziu
o mesmo hash. A auditoria rejeita caminhos não-POSIX, traversal, segredos, URLs locais, testes,
fixtures, harness, caches e temporários.

Foram aprovados localmente: backend (111 testes, Ruff, Ruff format, mypy, cobertura total 91%),
frontend (ESLint, Prettier, TypeScript, Vitest: 59 testes), e Playwright (55 aprovados, 1 teste de
captura opt-in executado separadamente, 1 teste condicional omitido na execução sem diretório de
evidência). A captura privada da borda foi gerada para DPR 1 e 1,25, com estados normal/hover,
390/800 px e crops dos dois cantos.

No LAB, a ConfigEntry `octopus_media` permanece `loaded`, com uma única entrada. O único recurso
do Octopus foi atualizado de `?v=64C535E58EC0` para `?v=C844AE3903F5`; a contagem de recursos
permaneceu 60 e a configuração do dashboard permaneceu com o mesmo hash `7b6a3e3c6d0ee47d`. Em
um novo contexto de navegador, a URL abriu como JavaScript (`text/javascript`), mas o corpo servido
teve 134.444 caracteres e SHA-256 `eb66736b7455e5548281fcad283ca4a06e4feddc75b97c3f08acb7f3df01104f`,
divergente dos 138.050 bytes e hash `c844ae3903f581f45271d557e0ca54f4b80b65bb43a9ba88b89a7a7419095d75`
locais. O corpo remoto não contém os marcadores da composição enriquecida nem o token da borda
aprovada. A API de navegador disponível não expõe status HTTP/Content-Length nem oferece contexto
autenticado do dashboard para medir largura e breakpoint; estes itens continuam não confirmados.

Conclusão: o LAB está servindo um bundle antigo/diferente. A rota é registrada por
`custom_components/octopus_media/frontend.py` e aponta para
`/config/custom_components/octopus_media/frontend/octopus-media-card.js` no host do Home Assistant.
Alterar apenas o cache-buster do recurso não substituiu esse arquivo. Nenhum CSS, normalizador,
coordinator, dashboard ou geometria foi alterado nesta auditoria. A cópia remota precisa ser
substituída por procedimento autorizado de filesystem/SSH e então validada novamente em contexto
novo.

Na janela observada não havia payload `Sessions` sanitizado disponível para confirmar ano, duração,
gêneros, nota, resolução, HDR, áudio ou campos de episódio. Esses campos permanecem suportados pelo
contrato e são omitidos quando ausentes; não foi feita consulta adicional a `/Items`, nem qualquer
manipulação de reprodução. Foi observado um erro preexistente `unexpected_http` no coordenador
Playing antes da atualização; não houve erro Octopus após a troca do recurso. Nenhum segredo ou
payload bruto foi guardado.
