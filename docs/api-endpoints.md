# Jellyfin API endpoints — Fases 3A e 3B

> Escopo histórico: este documento fixa as superfícies Jellyfin das Fases 3A/3B. O código local
> atual também contém Upcoming com providers Radarr/Sonarr; isso é documentado nos contratos da
> Fase 4A e ainda não foi implantado/validado no novo HA-LAB.

Este documento fixa somente a superfície Jellyfin usada pelo Octopus Media Card nas Fases 3A e 3B. A validação foi feita contra os controladores oficiais do Jellyfin e contra as tags `v10.10.7` e `v10.11.0`. A auditoria documental inicial da Fase 3B não consultou nenhum servidor particular.

## Convenções comuns

- A URL configurada pode conter o Base URL do Jellyfin e é normalizada sem a barra final.
- Todas as chamadas são `GET` ou `HEAD` e enviam um `User-Agent` identificável. Metadados usam `Accept: application/json`; downloads da Fase 3B usam `Accept: image/jpeg, image/png, image/webp`.
- Endpoints autenticados usam `Authorization: MediaBrowser Token="<api-key>"`. A chave nunca é colocada na query string, no log ou em mensagens de erro.
- `401` e `403` são tratados como autenticação/autorização rejeitada; timeout, conexão, JSON inválido e demais status HTTP têm erros distintos.
- Datas recebidas são interpretadas como ISO 8601 e normalizadas para UTC antes de cruzarem o contrato com o frontend.
- IDs Jellyfin são usados apenas dentro do backend. O snapshot contém referências HMAC opacas.

Fontes primárias: [SystemController](https://github.com/jellyfin/jellyfin/blob/master/Jellyfin.Api/Controllers/SystemController.cs), [UserController](https://github.com/jellyfin/jellyfin/blob/master/Jellyfin.Api/Controllers/UserController.cs), [UserLibraryController](https://github.com/jellyfin/jellyfin/blob/master/Jellyfin.Api/Controllers/UserLibraryController.cs), [SessionController](https://github.com/jellyfin/jellyfin/blob/master/Jellyfin.Api/Controllers/SessionController.cs), [ImageController](https://github.com/jellyfin/jellyfin/blob/master/Jellyfin.Api/Controllers/ImageController.cs), [convenções oficiais de imagens de mídia](https://jellyfin.org/docs/general/server/media/movies/#metadata-images) e [UserLibraryController em v10.10.7](https://raw.githubusercontent.com/jellyfin/jellyfin/v10.10.7/Jellyfin.Api/Controllers/UserLibraryController.cs).

## Identificação e validação do servidor

### `GET /System/Info`

- Finalidade: validar a URL e a API key e obter uma identidade estável da instalação.
- Parâmetros: nenhum.
- Autenticação: obrigatória. O controlador aplica a política `FirstTimeSetupOrIgnoreParentalControl`.
- Resposta relevante: objeto `SystemInfo`.
- Campos usados: `Id`, `ServerName`, `Version`.
- Validação local: a resposta deve ser um objeto e `Id`, `ServerName` e `Version` devem ser strings não vazias.
- Erros: `401/403` indicam credencial ou permissão rejeitada; outros `4xx/5xx` são HTTP inesperado; corpo não JSON ou forma inválida é `invalid_response`.
- Compatibilidade: rota presente em 10.10 e 10.11 e no controlador atual. A implementação não usa `GET /System/Info/Public`, pois esse endpoint não valida a chave.

## Usuários

### `GET /Users`

- Finalidade: listar usuários selecionáveis depois que a chave foi validada.
- Parâmetros enviados: `isDisabled=false`. `isHidden` não é imposto, porque um administrador pode selecionar legitimamente um usuário oculto.
- Autenticação: obrigatória (`[Authorize]`).
- Resposta relevante: array de `UserDto`.
- Campos usados: `Id`, `Name`.
- Validação local: cada opção precisa de `Id` e `Name` não vazios; entradas malformadas tornam a resposta inválida para evitar salvar um usuário ambíguo.
- Erros: mesma taxonomia comum. Array vazio gera o erro de config flow `no_users`.
- Compatibilidade: rota e campos estáveis em 10.10, 10.11 e controlador atual.

### `GET /Users/{userId}`

- Finalidade: referência oficial para validar um usuário individual; na criação inicial a implementação evita essa chamada extra e valida o ID contra a lista de `/Users`.
- Parâmetros: `userId` UUID no caminho.
- Autenticação: obrigatória; política `IgnoreParentalControl`.
- Resposta relevante/campos: `UserDto`, `Id` e `Name`.
- Erros: `404` para usuário inexistente, além da taxonomia comum.
- Compatibilidade: 10.10, 10.11 e controlador atual.

## Itens recentemente adicionados e metadados mínimos

### `GET /Items/Latest`

- Finalidade: obter filmes e episódios recentes do usuário configurado.
- Parâmetros enviados:
  - `userId`: ID selecionado no config flow;
  - `includeItemTypes=Movie,Episode`;
  - `fields=DateCreated`;
  - `enableImages=true`;
  - `imageTypeLimit=1`;
  - `enableImageTypes=Primary,Backdrop`;
  - `enableUserData=false`;
  - `limit`: limite configurado, ampliado de forma defensiva quando o agrupamento local de episódios está ativo;
  - `groupItems=false`, pois o agrupamento normalizado pertence ao backend do Octopus.
- Autenticação: obrigatória; `UserLibraryController` inteiro usa `[Authorize]`.
- Resposta relevante: array de `BaseItemDto`.
- Campos usados: `Id`, `Type`, `Name`, `SeriesId`, `SeriesName`, `ProductionYear`, `ParentIndexNumber`, `IndexNumber`, `DateCreated`, `CommunityRating`, `ImageTags` e `BackdropImageTags`.
- Erros: `404` pode significar usuário inexistente; os demais seguem a taxonomia comum.
- Compatibilidade: é a rota oficial não legada em Jellyfin 10.10.7, 10.11.0 e no controlador atual. A antiga `GET /Users/{userId}/Items/Latest` continua marcada como compatibilidade no servidor, mas não é chamada pela Fase 3A.

### `GET /Items/{itemId}`

- Finalidade: endpoint oficial de detalhe mínimo de um filme/episódio quando uma fase futura precisar completar campos ausentes.
- Parâmetros: `itemId` no caminho e `userId` na query.
- Autenticação: obrigatória.
- Resposta relevante: um `BaseItemDto` com os mesmos campos mínimos acima.
- Erros: `404` se usuário/item não existir, além da taxonomia comum.
- Compatibilidade: 10.10, 10.11 e controlador atual. Não é chamado no polling da Fase 3A: `Items/Latest` e `Sessions` já fornecem os campos necessários, evitando N+1 requests.

## Sessões atuais

### `GET /Sessions`

- Finalidade: obter as sessões para normalizar somente reproduções `playing` ou `paused` com mídia válida.
- Parâmetros: nenhum. Os filtros opcionais oficiais `controllableByUserId`, `deviceId` e `activeWithinSeconds` não são enviados; a integração não expõe nem solicita controle remoto.
- Autenticação: obrigatória (`[Authorize]`).
- Resposta relevante: array de `SessionInfoDto`.
- Campos usados: `Id`, `DeviceId`, `DeviceName`, `UserName`, `LastActivityDate`, `NowPlayingItem` e `PlayState`. Dentro de `NowPlayingItem`: os metadados mínimos de `BaseItemDto`, incluindo `ProductionYear` e `RunTimeTicks`, e, quando presentes no mesmo payload, até dois valores de `Genres`, `CommunityRating` e `MediaStreams`. `Overview` não é consumido por `playing`. Dentro de `PlayState`: `IsPaused`, `PositionTicks`, `VideoStreamIndex` e `AudioStreamIndex`.
- O enriquecimento de `playing` não adiciona `fields`, `enable*`, detalhes por item ou uma segunda chamada. Resolução, HDR e canais são derivados somente do stream selecionado indicado por `PlayState`, com fallback determinístico para o primeiro stream do tipo. Valor ausente ou não reconhecido permanece ausente.
- Erros: mesma taxonomia comum.
- Compatibilidade: rota e forma presentes em 10.10, 10.11 e controlador atual. Ticks são convertidos por `10_000_000` para segundos.

## Imagens de itens — Fase 3B

### `GET /Items/{itemId}/Images/{imageType}`

- Finalidade: obter bytes de uma imagem registrada pelo backend para `Primary` ou `Backdrop`.
- Autenticação: obrigatória por `Authorization: MediaBrowser Token="<api-key>"`, exclusivamente entre o backend do Home Assistant e o Jellyfin. A credencial e a URL Jellyfin nunca atravessam o contrato com o card.
- `itemId`: selecionado somente de um descritor interno registrado; nunca é aceito do navegador.
- `imageType`: allowlist fechada `Primary` ou `Backdrop`.
- Parâmetros permitidos nesta integração:
  - `maxWidth`: largura máxima fixa mapeada pela variante Octopus;
  - `quality=90`: valor fixo dentro do intervalo oficial 0–100;
  - `tag`: revisão obtida de `ImageTags`, `BackdropImageTags`, `SeriesPrimaryImageTag` ou campo equivalente já presente no DTO;
  - `imageIndex=0`: apenas para o primeiro backdrop quando o tipo permite múltiplas imagens.
- Parâmetros oficiais deliberadamente não expostos: `maxHeight`, `width`, `height`, `fillWidth`, `fillHeight`, `format`, `percentPlayed`, `unplayedCount`, `blur`, `backgroundColor` e `foregroundLayer`. Nenhum parâmetro livre vindo do frontend é repassado.
- Resposta esperada: `200` com bytes de imagem. O Octopus aceita somente `image/jpeg`, `image/png` e `image/webp`, além de aplicar limites locais de bytes e validação contra resposta vazia.
- Ausência/erro: item ou imagem inexistente produz `404`; `401/403` é falha de credencial; timeout/conexão e outros status seguem a taxonomia fechada do cliente. HTML, JSON, corpo vazio, redirect proibido e imagem acima do limite falham fechados e nunca são retransmitidos como imagem.
- Cache Jellyfin: a documentação do controlador recomenda fornecer `tag` para receber headers fortes de cache. O Octopus também inclui essa revisão na referência opaca, no ETag local e na chave do cache binário.

### `GET /Items/{itemId}/Images/{imageType}/{imageIndex}`

- Finalidade: forma oficial indexada, documentada para imagens que admitem múltiplas instâncias.
- Uso nesta fase: equivalente a `imageIndex=0` para o primeiro `Backdrop`, se necessário pela versão do servidor. Não é uma rota construída com índice arbitrário do navegador.
- Parâmetros, autenticação, validações e erros: idênticos à rota não indexada.

### Tipos e fallback por mídia

- Movie: `Primary` do próprio filme; na ausência, placeholder local.
- Series: `Primary` da própria série; na ausência, placeholder local.
- Episode em recent: `Primary` do episódio quando `ImageTags.Primary` está presente; depois `Primary` da série quando `SeriesId` e `SeriesPrimaryImageTag` estão presentes; placeholder por último.
- Episode em playing: prefere `Primary` da série; usa `Primary` adequada do episódio somente quando o descritor da série não puder ser formado; placeholder por último.
- Temporada: não é consultada nesta fase. O polling atual não fornece um par completo e confiável de ID/revisão de temporada, e uma busca adicional por item criaria N+1 sem benefício comprovado.
- Backdrop: primeiro `Backdrop` do item atual quando `BackdropImageTags[0]` existe. Fallback de backdrop de série só é usado quando o DTO já fornece simultaneamente o ID e a revisão necessários; nenhuma consulta extra é disparada.

### Matriz fechada de variantes Octopus

| Variante pública  | Tipo Jellyfin | Parâmetros Jellyfin fixos                                |
| ----------------- | ------------- | -------------------------------------------------------- |
| `poster-small`    | `Primary`     | `maxWidth=160`, `quality=90`, `tag=<revisão>`            |
| `poster-medium`   | `Primary`     | `maxWidth=300`, `quality=90`, `tag=<revisão>`            |
| `poster-large`    | `Primary`     | `maxWidth=500`, `quality=90`, `tag=<revisão>`            |
| `backdrop-small`  | `Backdrop`    | `maxWidth=640`, `quality=90`, `tag=<revisão>`, índice 0  |
| `backdrop-medium` | `Backdrop`    | `maxWidth=1280`, `quality=90`, `tag=<revisão>`, índice 0 |

O endpoint Home Assistant aceita somente os nomes acima. Largura, altura, qualidade, formato, URL, host, caminho, item ID e image tag nunca são parâmetros públicos.

### Compatibilidade suportada

- As rotas não indexada e indexada, os tipos `Primary`/`Backdrop` e os parâmetros usados estão presentes nos controladores oficiais das versões Jellyfin 10.10 e 10.11.
- `ImageTags.Primary`, `BackdropImageTags` e `SeriesPrimaryImageTag` são metadados de revisão vindos dos DTOs já lidos pela Fase 3A. Uma revisão ausente impede a criação daquele descritor; não é inventada nem descoberta por scraping do frontend Jellyfin.
- A documentação oficial de organização de mídia identifica `Primary` como capa principal, `Backdrop` como fundo e admite imagem `Primary` específica de episódio por arquivo `*-thumb`; por isso a presença real da tag no DTO, e não apenas o tipo do item, decide se o fallback é utilizável.

## Limites das fases implementadas

- Imagens: a Fase 3B chama somente as rotas de bytes documentadas acima, por descritores registrados e variantes fechadas. Não existe proxy genérico, URL Jellyfin no frontend, cache em disco ou upload.
- Detalhes: não há prefetch nem endpoint N+1 no polling.
- Reprodução: nenhum comando de sessão é usado.
- Radarr/Sonarr: não fazem parte da superfície Jellyfin documentada nesta fase; os providers e o
  coordinator atuais estão registrados nos documentos da Fase 4A.

## Catálogo de dispositivos — Fase 3C.2.1

### `GET /Devices`

- Finalidade: enriquecer o nome de uma sessão ativa com o nome personalizado
  definido em Jellyfin → Administração → Dispositivos.
- Autenticação: a mesma API key no header `Authorization` usada pelas demais
  chamadas do cliente Jellyfin.
- Resposta relevante: objeto cuja propriedade `Items` é um array de
  `DeviceInfo`.
- Campos internos usados: `Id`, `Name`, `CustomName` e `AppName`. Somente
  `CustomName` participa da resolução atual; os demais campos tipados preservam
  o contrato oficial e permitem validação fechada.
- Correspondência: exclusivamente `SessionInfoDto.DeviceId ==
DeviceInfo.Id`, com igualdade exata. Não há comparação por nome, aplicativo,
  IP, substring, caixa ou regra específica da instalação.
- Prioridade pública: `CustomName` não vazio, `DeviceName` da sessão, `Client`
  da sessão e, por último, `Dispositivo Jellyfin`.
- Privacidade: o ID permanece no backend. Snapshot, frontend, YAML,
  diagnostics, logs e erros não recebem o valor bruto.

O catálogo é compartilhado por ConfigEntry e possui TTL de **300 segundos**.
Uma leitura retorna o catálogo inteiro, sem consulta por card ou por sessão. Os
pollings de playing reutilizam a entrada enquanto válida. Um ID desconhecido
pode antecipar uma única renovação por janela de 300 segundos; todas as sessões
do ciclo usam essa mesma leitura, evitando N+1.

Uma atualização manual da seção playing invalida o catálogo antes do refresh.
Assim, um nome alterado no Jellyfin pode aparecer imediatamente, sem recriar a
ConfigEntry, alterar YAML ou reiniciar o Home Assistant. Se a renovação falhar,
o último catálogo válido é preservado e marcado como stale; sem catálogo válido,
playing continua com os fallbacks da sessão. A falha de enriquecimento não
derruba o coordenador nem marca todo o Jellyfin como indisponível.

O frontend recebe somente `device_name` e `device_alias` já normalizados; o hero não recebe
`DeviceId`, `SessionId`, IDs de catálogo, IP, token ou URL interna e não mantém um segundo sistema
de aliases.
