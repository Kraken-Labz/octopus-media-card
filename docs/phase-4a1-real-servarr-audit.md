# Fase 4A.1 — configuração oficial e auditoria real

> Status atual: registro histórico da auditoria. Os providers descritos aqui foram incorporados ao
> código local e possuem cobertura de testes; esta nota não representa validação no HA-LAB nem uma
> release publicada.

O Octopus não duplica URL, API key ou credenciais Radarr/Sonarr. A seleção é
feita por ConfigEntry e o backend chama apenas os serviços públicos do Home
Assistant.

O provider Sonarr respeita o limite público de 30 dias. O provider Radarr
combina `get_movies` com o calendário vinculado à mesma ConfigEntry, mantendo
datas date-only com `all_day=true`.

As referências de imagem são metadados controlados (`source`, `item_id`,
`kind`), nunca URLs arbitrárias. Endpoint assinado/proxy controlado permanece
pendência separada.

Frontend, bundle, LAB visual, Playing Hero, strip, Recentes e demais
dashboards não fazem parte desta fase.
