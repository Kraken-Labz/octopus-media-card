# Fase 4A — contrato de dados de Upcoming

> Status atual: este documento registra as decisões da Fase 4A. A implementação local atual contém
> os providers, normalizadores, coordinator, merge, referências de imagem seguras e testes
> correspondentes. A ausência de payload vivo abaixo continua sendo uma limitação de evidência, não
> uma indicação de que o recurso esteja ausente no código. Ainda não houve deploy desta baseline no
> HA-LAB.

## Resultado

Esta fase implementa somente a fundação backend de Upcoming. O frontend não
foi alterado, nenhum recurso Lovelace foi instalado e o LAB permaneceu
intocado. Playing, Recentes, strip, Jellyfin e `casa-voz-card.js` não fazem
parte desta mudança.

## Auditoria de serviços

O repositório continha `api/radarr.py`, `api/sonarr.py` e um coordenador
placeholder, sem endpoints implementados. A única ConfigEntry disponível no
ambiente do projeto contém Jellyfin; não existem URL ou credenciais Radarr/
Sonarr configuradas. Por isso não foi possível consultar payloads reais sem
inventar acesso ou registrar segredo. Nenhuma chamada externa foi feita.

Quando configurados, os clientes usam exclusivamente:

- Radarr: `GET /api/v3/system/status` e `GET /api/v3/movie`;
- Sonarr: `GET /api/v3/system/status` e `GET /api/v3/episode`.

As chamadas são backend-only, autenticadas por `X-Api-Key`, com timeout,
validação JSON e erros fechados. Headers, chaves e URLs nunca entram no
snapshot, logs ou frontend.

## Campos aceitos

Os normalizadores usam somente campos presentes no payload recebido e ignoram
ou marcam como parcial itens sem identificador/título/data válida.

Radarr: `id`, `title`, `monitored`, `year`, `status`, `hasFile`,
`digitalRelease`, `physicalRelease`, `inCinemas`.

Sonarr: `id`, `seriesId`, `series.title`, `series.monitored`, `title`,
`seasonNumber`, `episodeNumber`, `airDateUtc`/`airDate`, `monitored` e
`hasFile`.

Imagens são `null` nesta fase. Campos `images`/URLs privadas não são copiados;
não existe fallback TMDb/TVDb nem proxy arbitrário. A entrega segura de imagem
Radarr/Sonarr fica para uma fase própria.

## Políticas

Radarr escolhe a primeira data futura válida nesta ordem: digital, physical,
cinema. Datas nulas, inválidas ou passadas são descartadas. O tipo selecionado
é preservado em `date_kind`.

Sonarr considera somente episódios futuros e monitorados quando a informação
existe. A curadoria mantém apenas o episódio mais próximo de cada `seriesId`.

O merge é crescente por data UTC, com desempate por `source`, título e
referência opaca. O limite defensivo é de 20 itens após a curadoria; não há
janela arbitrária de 30/90 dias.

O backend preserva ISO UTC (`event_date` e o alias compatível `release_at`). O
frontend futuro usará `time_zone` do Home Assistant para o badge local.

## Contrato normalizado

Cada item contém `ref`, `source` (`radarr`/`sonarr`), `type` (`movie`/
`episode`), `title`, `subtitle`, `event_date`, `date_kind`, `year`,
`season_number`, `episode_number`, `episode_title`, `image`, `monitored`,
`status`, `downloaded` e referências de imagem somente quando houver uma
estratégia segura aprovada.

O snapshot de seção também expõe `state`: `ready`, `empty`, `partial`,
`unavailable` ou `stale`. Falha de um serviço não apaga itens válidos do outro.

## Capabilities e polling

`capabilities.upcoming` é verdadeiro somente quando pelo menos um cliente foi
configurado. A disponibilidade individual é publicada como `online`,
`offline` ou `not_configured`. O coordinator compartilhado usa o intervalo
defensivo existente de 600 segundos, sem polling agressivo; refresh manual
continua limitado pelo mecanismo por ConfigEntry.

## Evidência e limitações

Fixtures sanitizadas cobrem prioridade de datas, datas passadas, episódios
sem data, deduplicação por série, merge, empate e ausência de imagens. A
limitação principal é a ausência de instâncias Radarr/Sonarr configuradas para
uma auditoria de payload vivo; nenhum campo não observado foi transformado em
consulta adicional ou segredo.
