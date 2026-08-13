# Playing Hero oficial

O Playing Hero V2.1 é a única implementação oficial de `mode: playing` com `layout: hero`. Sua
geometria, hierarquia e direção visual aprovadas são independentes do strip oficial.

## Contrato

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

Com `layout: auto`, alturas de pelo menos 200 px selecionam hero a partir do bucket de 280 px;
larguras menores usam list e alturas menores usam compact/list conforme o bucket. A histerese de
12 px continua impedindo oscilações perto dos breakpoints.

## Componentes e responsabilidades

- `hero-layout`: rota oficial; escolhe Playing Hero somente para `mode: playing` e preserva o hero
  genérico para outros modos.
- `playing-hero`: renderiza sessão, estados, contexto, progresso e navegação.
- `octopus-media-card`: assina snapshots, mantém progresso local, reconcilia revisões e encaminha
  apenas view models normalizados.
- `media-image`: resolve referências opacas por `auth/sign_path`; nenhum layout monta URL Jellyfin.
- editor e harness reutilizam o mesmo custom element; não existe cópia visual de protótipo.

O wrapper experimental `playing-hero-prototype` foi removido. O valor legado
`playing-hero-cinematic` continua aceito como paleta, mas não ativa nem altera a geometria oficial.

## Superfície única e hierarquia editorial

O Playing Hero não renderiza o cabeçalho/cápsula externo usado pelos demais layouts. O componente
ocupa os 240 px completos e constitui a única superfície, sem moldura hospedeira duplicada.

A hierarquia interna começa por `EM REPRODUÇÃO`, um eyebrow textual alinhado à coluna editorial.
Ele é um `span` sem fundo, borda, ícone, role interativo ou ação. Os chips independentes `Tocando`
ou `Pausado` e o tipo da mídia permanecem logo abaixo. Título, metadados disponíveis, dispositivo,
usuário e progresso seguem a hierarquia aprovada. Campos ausentes no snapshot normalizado
desaparecem naturalmente; o frontend não os fabrica.

Hover visual é aplicado apenas sob `(hover: hover) and (pointer: fine)`. Touch não mantém elevação,
brilho ou contorno residual; foco visível continua reservado ao teclado.

A única borda visível pertence ao container externo `.playing-hero`, com raio e clipping únicos.
Sessões internas não desenham borda, outline, pseudo-moldura ou shadow inset. Hover e foco alteram
somente a cor dessa borda existente, sem criar uma segunda linha.

## Estados

- **Playing:** badge, tipo, título, contexto de episódio, dispositivo amigável, usuário, posição,
  duração, percentual, restante, progresso local e backdrop.
- **Paused:** as mesmas informações, badge pausado, atmosfera reduzida e progresso congelado.
- **Empty:** identidade Octopus e “Nenhuma reprodução ativa”, sem pôster, barra ou contador falso.
- **Unavailable:** mensagem própria e sanitizada, sem detalhes técnicos.
- **Stale:** última sessão válida, chip “Dados antigos” e progresso congelado.

Snapshots válidos substituem a posição local. Somente sessões `playing`, com duração positiva e
fonte online/não stale, avançam entre snapshots.

## Dispositivo amigável

O backend resolve uma única string na ordem:

1. `DeviceInfo.CustomName`;
2. `Session.DeviceName`;
3. `Session.Client`;
4. `Dispositivo Jellyfin`.

O catálogo é compartilhado por ConfigEntry, usa TTL de 300 segundos, coalesce refresh concorrente
e preserva o último valor válido em falha. DeviceId, SessionId, IDs do catálogo, IP, token e URL
interna não cruzam o contrato frontend.

## Responsividade e múltiplas sessões

- **390×240:** uma sessão por viewport, pôster à esquerda e contexto/progresso à direita.
- **800×240:** pôster limitado, bloco editorial amplo e prévia discreta da próxima sessão.
- **819×480:** sem scroll vertical e compatível com scale factor 1,25.
- **390×844:** touch e leitura compacta sem overflow.

Uma sessão não mostra navegação redundante. Com mais de uma, swipe, setas, indicadores e teclado
alteram em conjunto mídia, arte, contexto e progresso. Cada sessão possui `aria-label`; foco
visível é reservado ao teclado. `prefers-reduced-motion` remove movimento não essencial.

## Editor e limites

O editor expõe modo, hero/auto, altura, tema, cor, visibilidade dos campos, setas, indicadores,
autoplay e intervalo. A prévia é inteiramente fictícia. Não existem play, pause, stop, seek,
volume, legendas ou outros comandos remotos.

## Validação

A matriz cobre 390×240, 800×240, 819×480, 390×844, zoom 125%, scale factor 1,25, filme, episódio,
título/alias longos, duração zero, imagem/backdrop ausentes, uma/duas/muitas sessões, empty,
unavailable, stale, navegação, retorno ao início, teclado, touch, autoplay, cleanup, múltiplas
instâncias e ausência de requests diretos ao Jellyfin.

A matriz também prova a ausência do cabeçalho externo, o eyebrow dentro da sessão, sua natureza
não interativa e transparente, a altura externa exata de 240 px, ausência de overflow e a
independência dos chips de estado/tipo.
