# Strip oficial — especificação visual

O D2 aprovado é a única implementação oficial de `layout: strip`. Os antigos caminhos
`media-shelf`, geometria D e custom element D2 foram removidos depois da migração dos testes.

## Geometria de referência

| Card | Pôster (altura × largura) | Gap | Completos | Próximo |
| --- | ---: | ---: | ---: | ---: |
| 390×210 | 159,32 × 106,21 px | 10 px | 3 | 22% |
| 800×240 | 192,53 × 128,35 px | 12 px | 5 | 22% |
| 819×240 | 197,99 × 131,99 px | 12 px | 5 | 22% |

O cálculo sempre mantém `posterWidth = posterHeight × 2/3`. A track usa `flex-start`, largura fixa
por item e gap explícito; não usa `space-between`.

## Linguagem visual

- cabeçalho de 12,5 px em cápsula translúcida, `mdi:octopus` roxo e contador discreto;
- título de mídia 10,5 px/600, line-height 1,06 e no máximo duas linhas;
- metadado de 8,5 px e badge de 7,75 px;
- gradiente progressivo nos 42% inferiores, realmente escuro apenas junto à base;
- backdrop com blur 28 px, brilho 0,48, saturação 0,58, contraste 1,12 e opacidade 0,92;
- composição azul-petróleo à esquerda, roxo escuro à direita, luz difusa e vinheta;
- hover/foco em `translateY(-3px) scale(1.02)`, sombra ampliada e contorno roxo/ciano;
- setas de 22 px com opacidade 0,4 em repouso, fora do centro dos pôsteres.

## Interação e acessibilidade

Mouse, teclado e toque atualizam o mesmo `focusedRef` e o mesmo backdrop. Botões de pôster têm
`aria-label` completo e não usam atributo `title`. A seta esquerda fica ausente no início; ambas
somem quando não há overflow. `prefers-reduced-motion` remove transições sem remover a hierarquia
visual estática.

O `ResizeObserver` do card atualiza apenas dimensões e layout; não refaz assinatura WebSocket. O
`IntersectionObserver` de cada imagem assina o caminho Home Assistant apenas próximo do viewport.
Nenhum componente monta URL Jellyfin direta.

## Imagens

Pôsteres de episódios preservam a política série → temporada → placeholder. `still_ref` nunca vira
pôster vertical. O fundo usa backdrop, depois still e por fim poster, sempre por referência opaca,
`auth/sign_path` e endpoint autenticado do Home Assistant.
