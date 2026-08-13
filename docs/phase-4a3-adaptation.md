# Fase 4A.3/4A.4 — adaptação e fechamento do contrato Upcoming

> Status atual: as adaptações abaixo estão refletidas no código local, nos normalizadores e nos
> testes de Upcoming. O texto permanece como registro de decisão; não constitui evidência de deploy
> no HA-LAB ou de release pública.

O provider público Radarr usa o mapping retornado por `radarr.get_movies` e
correlaciona cada evento de `calendar.get_events` por igualdade exata entre
`event.summary` e a chave do mapping. O evento não precisa e não deve conter
movie ID: o `movie.id` é obtido depois do join.

Não há normalização textual, lowercase, remoção de pontuação, contains,
startswith ou fuzzy matching. Se a chave não existir, o evento é ignorado e
um warning sanitizado é emitido. O contrato permanece limitado se títulos
duplicados forem representados de modo ambíguo pelo mapping público.

Radarr usa `date_kind="release"` e eventos date-only com `all_day=true`.
Sonarr usa `date_kind="air"`, mantém datetime e aceita `episodes: {}` como
resposta vazia válida. A ação pública Sonarr limita a janela a 30 dias.

Nenhuma URL externa de poster é enviada ao snapshot. Quando existe poster,
é registrada somente a referência controlada `{source, item_id, kind}`.
Endpoint de imagem assinado permanece fora desta fase.

Na auditoria real, os quatro summaries `Mortal Kombat II`, `Buddy`, `The
Mandalorian and Grogu` e `Dune: Part Three` encontraram chaves exatamente
iguais no mapping de 34 filmes. Todos resolveram para IDs reais 287, 292, 288
e 273, respectivamente; os quatro estavam monitorados e tinham poster.
