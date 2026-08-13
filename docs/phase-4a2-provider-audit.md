# Fase 4A.2 — providers oficiais do Home Assistant

> Status atual: registro histórico da auditoria. O contrato de providers está implementado no
> código local e coberto por testes/fixtures; nenhuma validação desta baseline foi feita no HA-LAB.

O Options Flow seleciona ConfigEntries oficiais e armazena somente
`radarr_config_entry_id` e `sonarr_config_entry_id`. O provider ativo usa
`radarr.get_movies(entry_id)` e `sonarr.get_upcoming(entry_id, days=30)`.

Auditoria real confirmou:

- Radarr retorna `movies` como mapping indexado por título, com `id`,
  `has_file` e `images`;
- Sonarr retorna `episodes` como mapping; `{}` é uma resposta vazia válida;
- `calendar.radarr` pertence à ConfigEntry Radarr selecionada;
- `calendar.get_events` publica apenas campos padrão e não expõe o movie ID
  interno nem preserva `release_type`;
- a correlação pública é um lookup exato de `calendar.summary` nas chaves do
  mapping `movies`, sem lowercase, fuzzy matching ou fallback.

A política antiga `digital → physical → cinema` não é aplicada ao provider
público. A granularidade de release não é fabricada: eventos de calendário
usam `date_kind = "release"`.

Após o lookup, a identidade usa `movie.id`; títulos duplicados continuam uma
limitação do contrato público indexado por título e não recebem heurística.

As imagens externas não são enviadas ao frontend. O contrato pode registrar
uma referência controlada, por exemplo `source=radarr`, `item_id` e
`kind=poster`, para futura resolução por endpoint assinado.

Não houve deploy, restart, build frontend, commit, push, release ou HACS.
