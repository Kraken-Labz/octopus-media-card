# Validação real controlada do Jellyfin — Fase 3A.1

## Estado e limites

Este roteiro prepara uma validação manual da Fase 3A contra uma instalação Jellyfin real.
Ele não é evidência de aprovação: todos os resultados reais começam como **não executados** e
devem ser preenchidos pelo operador durante o ensaio.

Escopo desta validação:

- config flow e seleção de usuário;
- coordenadores compartilhados de `recent` e `playing`;
- snapshots normalizados e assinatura WebSocket;
- card com placeholders locais;
- reload, unload, reconexão e reautenticação;
- falhas parciais, dados stale, segurança e medições leves.

Continuam fora do escopo: download real de imagens, caminhos assinados, cache binário,
Radarr, Sonarr, `upcoming` real, controles de reprodução, release, publicação HACS e qualquer
automação do armazenamento Lovelace. Não use dados do servidor real em issue, fixture,
captura pública, commit ou neste documento.

## Regras de evidência segura

1. Nunca copie a API key para console, terminal, YAML do card, planilha ou tabela de resultados.
2. Em capturas, oculte endereço do servidor, nomes pessoais, títulos privados, IDs e cookies.
3. Prefira contagens, tempos e códigos de estado a logs brutos ou respostas completas.
4. Não anexe frames WebSocket ou diagnostics sem revisá-los e sanitizá-los localmente.
5. Não altere `.storage` manualmente. Faça backup antes de instalar ou remover a integração.
6. Se houver qualquer exposição, pare o ensaio, revogue a chave e descarte a evidência.

## Pacote reproduzível e contrato de instalação

Na raiz do repositório, depois da suíte e do build, execute:

```powershell
.\scripts\package-dev.ps1
```

O script:

- exige `dist/octopus-media-card.js` e o bundle de runtime byte a byte idênticos;
- seleciona somente Python de runtime, `manifest.json`, traduções e bundle compilado sob
  `custom_components/octopus_media/`;
- exclui testes, fixtures, documentação, ambientes, caches, bytecode, sourcemaps e temporários;
- normaliza ordem e timestamp das entradas para produzir o mesmo ZIP a partir dos mesmos bytes;
- reabre e audita o ZIP final;
- rejeita entrada fora da árvore esperada, `.env`, IP privado, URL local, caminho de perfil,
  credencial literal, UUID ou identificador estático de 32 hexadecimais;
- imprime conteúdo exato, SHA-256 do bundle e SHA-256 do ZIP.

Saída local prevista:

```text
dist/octopus-media-card-dev.zip
```

O ZIP é somente um pacote de desenvolvimento. Não é release e está ignorado pelo Git.

## 1. Pré-requisitos

Use uma janela de manutenção e confirme cada item antes de começar:

- [ ] Home Assistant 2026.7.x em ambiente de teste ou com backup restaurável. Esta é a versão
      de desenvolvimento atual, não uma declaração pública de compatibilidade mínima.
- [ ] Jellyfin acessível **a partir do host/container do Home Assistant**, não apenas do navegador.
- [ ] URL HTTP(S) completa conhecida; prefira HTTPS com certificado válido.
- [ ] API key exclusiva para o ensaio, criada no Jellyfin e disponível sem ser registrada aqui.
- [ ] Pelo menos um usuário Jellyfin habilitado e autorizado para a biblioteca de teste.
- [ ] Backup atual do diretório/configuração do Home Assistant e procedimento de restauração.
- [ ] Nenhum diretório antigo conflitante em
      `/config/custom_components/octopus_media`.
- [ ] Nenhum recurso Lovelace antigo com a mesma URL ou uma cópia antiga do card.
- [ ] Horário e fuso do Home Assistant corretos para avaliar datas e progresso.
- [ ] Navegador com DevTools disponível e uma janela privada para o teste não autenticado.

Não coloque a chave no pacote. Ela só deve ser informada no seletor de senha do config flow do
Home Assistant.

## 2. Instalação

### 2.1 Gerar e conferir o artefato

1. Na estação de desenvolvimento, execute a suíte, o build e a verificação descritos em
   [Teste de contrato local](#teste-de-contrato-local).
2. Execute `.\scripts\package-dev.ps1`.
3. Guarde, no registro privado do ensaio, apenas os hashes e a lista de arquivos impressos.
4. Execute o empacotamento uma segunda vez sem mudar arquivos e confirme o mesmo SHA-256.

### 2.2 Copiar o componente

1. Faça backup da configuração do Home Assistant.
2. Pare o Home Assistant ou use o procedimento seguro do método de instalação em uso.
3. Extraia o ZIP na raiz de configuração do Home Assistant. O resultado deve ser exatamente:

   ```text
   /config/custom_components/octopus_media/manifest.json
   /config/custom_components/octopus_media/__init__.py
   /config/custom_components/octopus_media/frontend/octopus-media-card.js
   ```

4. Confirme que não surgiu um nível duplicado como
   `/config/custom_components/octopus_media/custom_components/...`.
5. Reinicie o Home Assistant.
6. Procure nos logs apenas por erros de carga de `octopus_media`. Não publique o log integral.
   A ausência de erro de importação/manifest e a inicialização normal são o esperado.

### 2.3 Adicionar a integração

1. Abra **Configurações → Dispositivos e serviços → Adicionar integração**.
2. Selecione **Octopus Media Card**.
3. Informe URL, API key, verificação TLS e timeout.
4. Selecione o usuário Jellyfin apresentado pelo segundo passo.
5. Confirme que uma única ConfigEntry foi criada e carregada.
6. Obtenha o `entry_id` opaco na página de detalhes da entrada, pelo identificador exibido no
   caminho da página. Não abra nem edite arquivos `.storage` para obtê-lo.

### 2.4 Registrar o recurso Lovelace manualmente

A integração serve o bundle pela rota pública estática já registrada:

```text
/octopus_media/octopus-media-card.js
```

No Home Assistant:

1. Habilite o modo avançado do perfil se a página **Recursos** não estiver visível.
2. Abra **Configurações → Dashboards → menu de três pontos → Recursos**.
3. Adicione a URL `/octopus_media/octopus-media-card.js`.
4. Selecione o tipo **JavaScript Module**.
5. Salve. Não use automação ou edição direta do armazenamento Lovelace.

Para eliminar cache durante o ensaio, pode-se editar manualmente a URL do recurso para:

```text
/octopus_media/octopus-media-card.js?v=HASH_CURTO_DO_BUNDLE
```

Use os primeiros 12 caracteres do SHA-256 impresso pelo build; a query é somente um
cache-buster. Em seguida, feche/reabra o app ou use recarga forçada (`Ctrl+F5`) com cache
desabilitado no DevTools. Na aba **Network**, filtre por `octopus-media-card.js` e confirme:

- a URL/cache-buster atual;
- resposta HTTP bem-sucedida, sem `(disk cache)`/`(memory cache)` na primeira carga forçada;
- tamanho compatível com o bundle recém-gerado;
- ausência de múltiplos recursos antigos com o mesmo custom element.

No host do Home Assistant, se houver terminal autorizado, o método mais confiável para detectar
bundle antigo é calcular o SHA-256 de
`/config/custom_components/octopus_media/frontend/octopus-media-card.js` e compará-lo ao hash
impresso por `verify:bundle`. Isso não lê credenciais.

### 2.5 Criar o primeiro card

Adicione um card manual com valores não sensíveis:

```yaml
type: custom:octopus-media-card
entry_id: ID_DA_CONFIG_ENTRY
mode: recent
layout: strip
height: 210
```

A URL do Jellyfin, API key, ID interno do usuário, TLS e timeout nunca pertencem ao YAML.
Os pôsteres devem continuar como placeholders nesta fase.

## Logging temporário e seguro

Para um intervalo curto de medição, acrescente à configuração do Home Assistant:

```yaml
logger:
  default: info
  logs:
    custom_components.octopus_media: debug
```

Reinicie ou recarregue a configuração de logging conforme suportado pelo ambiente. O DEBUG do
projeto registra somente:

- ConfigEntry opaca e intervalos configurados no setup/unload;
- seção (`recent` ou `playing`), duração em milissegundos e quantidade normalizada por ciclo;
- códigos fechados de falha produzidos pelo coordenador.

Ele não registra URL, API key, header de autenticação, ID Jellyfin, resposta bruta ou item de
mídia. Ainda assim, revise localmente antes de guardar evidência. Ao terminar a medição, remova
o override e volte o logger ao nível normal; DEBUG não deve ficar ativo permanentemente.

## 3. Config flow

Execute os casos separadamente. Para casos negativos, não reutilize evidência que mostre a chave.

| Caso | Ação controlada | Resultado esperado |
|---|---|---|
| URL válida | Informar a URL alcançável e a chave do ensaio | Validação do servidor conclui e avança à seleção de usuário |
| Chave válida | Usar a chave exclusiva do ensaio | Informações públicas do sistema e usuários são aceitos sem expor a chave |
| Listagem de usuários | Concluir a conexão | Somente nomes selecionáveis aparecem; a API key não aparece |
| Seleção do usuário | Escolher um usuário habilitado | A entrada é criada vinculada ao usuário selecionado |
| ConfigEntry | Finalizar o fluxo | Uma entrada carregada, com capacidades `recent=true`, `playing=true`, `upcoming=false` |
| Duplicidade | Repetir o fluxo para o mesmo servidor | Fluxo aborta como `already_configured`; nenhuma segunda entrada é criada |
| URL inválida | Usar valor sem host/esquema válido | Formulário permanece e mostra `invalid_url` |
| Chave inválida | Usar uma chave de ensaio revogada/incorreta | Formulário permanece e mostra `invalid_auth` |
| Timeout | Apontar temporariamente para destino controlado que não responde dentro do limite | Formulário permanece e mostra `timeout` |
| Servidor indisponível | Interromper conectividade no ambiente de teste | Formulário permanece e mostra `cannot_connect` |

Não use endereço de terceiro como alvo de erro. Restaure a conectividade/chave imediatamente após
cada caso negativo.

## 4. `recent`

Use conteúdo não sensível ou sanitize todas as evidências.

- [ ] Filmes recentes aparecem uma vez e na ordem esperada.
- [ ] Episódios recentes têm série/temporada/episódio normalizados quando disponíveis.
- [ ] Com `group_episodes=true`, episódios da mesma série são agrupados deterministicamente.
- [ ] A ordenação usa a data normalizada mais recente, com UTC no contrato e exibição no fuso do
      Home Assistant.
- [ ] Títulos longos não quebram o card e permanecem disponíveis ao leitor de tela/tooltip.
- [ ] Campos opcionais ausentes não quebram snapshot ou renderização.
- [ ] Biblioteca sem itens produz estado vazio explícito, não erro genérico.
- [ ] Todo item usa placeholder; nenhuma requisição de bytes reais de imagem ocorre.
- [ ] Após refresh aceito, novo snapshot chega e a revisão só muda quando os dados mudam.
- [ ] Após falha temporária, o último conjunto válido permanece visível como `stale` e a
      disponibilidade apresenta somente código seguro.

Para testar refresh sem criar carga, faça uma única ação de atualização pelo card/contrato e
respeite o rate limit. Não faça loops no console.

## 5. `playing`

- [x] Sem reprodução, o estado vazio é estável.
- [x] Uma reprodução ativa aparece como `playing`.
- [x] Uma sessão pausada aparece como `paused`.
- [ ] Nome/alias do dispositivo e nome de exibição do usuário são coerentes.
- [ ] Filme apresenta título correto sem ID interno.
- [x] Série apresenta série, episódio e título normalizados quando disponíveis.
- [x] Progresso permanece entre 0 e 100 e avança de modo coerente entre snapshots.
- [x] Um snapshot novo reconcilia a sessão existente em vez de duplicá-la.
- [ ] Múltiplas sessões aparecem uma vez cada, com referências opacas distintas.
- [x] Ao encerrar a sessão, ela desaparece no próximo ciclo confirmado.
- [ ] Com Jellyfin indisponível, dados válidos anteriores ficam `stale`; sem histórico válido,
      aparece indisponibilidade segura em vez de DTO bruto.

O card é somente leitura. Não espere botões ou comandos de reprodução nesta fase.

## 6. Lifecycle

### Reload, unload e reinício

1. Registre a revisão atual e as contagens, não o snapshot bruto.
2. Use **Recarregar** na entrada da integração. Espere um único par de coordenadores e um novo
   snapshot inicial.
3. Desabilite a entrada para provocar unload controlado. Confirme que atualizações cessam e que
   assinaturas existentes terminam sem loop de reconexão agressivo.
4. Reabilite a entrada e confirme uma única inicialização.
5. Reinicie o Home Assistant e confirme carga automática, sem entrada duplicada.

### Navegador e múltiplos consumidores

1. Abra um dashboard e aguarde a assinatura WebSocket estabilizar.
2. Recarregue o navegador; deve surgir uma nova assinatura do cliente, sem novo coordenador
   backend por card.
3. Abra dois dashboards e depois dois cards para a mesma `entry_id`.
4. Com DEBUG temporário, conte apenas as linhas `recent update completed` e
   `playing update completed` e seus timestamps. A cadência deve seguir o intervalo da ConfigEntry,
   não multiplicar por dashboard/card.
5. Feche os consumidores e confirme que não há timer frontend ou tentativa contínua anormal.

### Remover, recriar e reautenticar

1. Com backup válido, remova a entrada e confirme unload; depois recrie pelo config flow.
2. Para reautenticação, revogue somente a chave exclusiva do ensaio e aguarde a falha de
   autenticação. O comportamento esperado é erro seguro e oferta do fluxo de reautenticação.
3. Informe uma nova chave do **mesmo servidor**. O usuário selecionado e o segredo interno de
   referências devem ser preservados e a entrada recarregada.
4. Repita com chave inválida: a entrada anterior não deve ser sobrescrita.
5. Tente no formulário de reautenticação uma URL/chave de outra instância controlada. O fluxo
   deve mostrar `wrong_server` e preservar servidor, usuário e credenciais anteriores.
6. Se o usuário configurado não existir mais, o fluxo deve mostrar `user_not_found`, sem trocar
   silenciosamente de usuário.

Não apague nem troque credenciais fora da janela de manutenção. A aparição automática do fluxo de
reautenticação em falha de runtime é um item de validação real; não está pré-aprovada por testes do
config flow isolado.

## 7. Segurança

### Navegador e WebSocket autenticado

1. Abra **Network → WS → Messages** e filtre visualmente mensagens `octopus_media`.
2. Confirme que o snapshot contém somente o contrato normalizado: `entry_id` opaca,
   capacidades, disponibilidade, referências `media_...`/`image_...`, campos de apresentação e
   estados.
3. Confirme ausência de `api_key`, `Authorization`, `Token`, URL do Jellyfin, ID interno de
   servidor/usuário, image tag interna e resposta bruta.
4. O nome de exibição de usuário/dispositivo em `playing` é funcional e esperado; IDs internos
   desnecessários não são.

### YAML, bundle, logs e diagnostics

- [ ] YAML contém apenas opções do card e a `entry_id` opaca.
- [ ] O bundle instalado tem o mesmo SHA-256 do artefato construído antes de a chave ser
      informada ao Home Assistant.
- [ ] A auditoria de `package-dev.ps1` conclui sem falha.
- [ ] Logs normais e DEBUG não exibem URL, chave, header, ID Jellyfin ou DTO completo.
- [ ] Diagnostics baixados localmente mostram `**REDACTED**` nos campos sensíveis e não contêm
      endereço, chave, usuário interno, segredo de referência ou aliases privados.
- [ ] Nenhum arquivo de evidência foi copiado de volta ao repositório.

Não procure a chave real digitando-a em comando: isso a gravaria no histórico. Como o bundle é
estático e gerado antes da configuração, igualdade de hash e inspeção por nomes proibidos são a
verificação segura.

### WebSocket não autenticado

Em uma janela privada, sem sessão do Home Assistant, abra a página de login e use o console apenas
para observar o handshake, sem credenciais:

```javascript
const protocol = location.protocol === "https:" ? "wss:" : "ws:";
const socket = new WebSocket(`${protocol}//${location.host}/api/websocket`);
socket.onmessage = ({ data }) => console.log(JSON.parse(data).type);
socket.onopen = () =>
  socket.send(JSON.stringify({ id: 1, type: "octopus_media/get_entries" }));
```

O esperado é `auth_required` e rejeição/fechamento ao enviar comando antes de autenticar; nunca um
resultado de `octopus_media`. Feche a janela ao terminar. Não cole tokens no console.

### Endpoint de imagem fail-closed

Mesmo autenticado, uma referência desconhecida/variante inválida deve retornar `404`; uma
referência registrada deve retornar `501 Not Implemented` nesta fase. Sem autenticação, deve
retornar `401`. Nenhuma chamada deve alcançar o Jellyfin para obter bytes. Não use URL externa no
path: o endpoint aceita apenas referência opaca e variante fechada.

## 8. Desempenho

Ative DEBUG somente durante uma janela curta e registre dados agregados:

| Medida | Método seguro | Registrar |
|---|---|---|
| Duração de `recent` | Linha `recent update completed` | mínimo/mediana/máximo em ms, sem itens/títulos |
| Duração de `playing` | Linha `playing update completed` | mínimo/mediana/máximo em ms |
| Snapshot aproximado | DevTools WS mostra tamanho do frame; não exporte o payload | faixa em bytes/KiB |
| Frequência real | Diferença de timestamp entre linhas da mesma seção | intervalo observado |
| Chamadas duplicadas | Conte ciclos por seção antes/depois do segundo card | contagem por janela fixa |
| Dois cards | Compare frequência e resposta visual | mudou/não mudou, sem payload |
| CPU/memória | Métrica já disponível no Supervisor/host, se houver | faixa aproximada opcional |

Faça pelo menos três ciclos por seção. O esperado é uma atualização por seção/ConfigEntry a cada
intervalo, independentemente do número de cards. A primeira atualização após setup/reload é extra
e deve ser separada da cadência. Não adicione Prometheus, sensor, analytics ou telemetria ao código
para este teste.

## Teste de contrato local

Antes de empacotar, na raiz do projeto:

```powershell
$env:PYTHONPATH = "tests\windows_compat;."
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\ruff.exe check .
.\.venv\Scripts\ruff.exe format --check .
.\.venv\Scripts\mypy.exe custom_components tests
pnpm --dir frontend lint
pnpm --dir frontend test
pnpm --dir frontend test:visual
pnpm --dir frontend build
pnpm --dir frontend verify:bundle
.\scripts\package-dev.ps1
```

Critérios antes da instalação:

- [ ] toda a suíte existente passou sem rede externa;
- [ ] linters, formatação e tipos passaram;
- [ ] build único sincronizou os dois destinos;
- [ ] `verify:bundle` confirmou igualdade byte a byte e hashes iguais;
- [ ] empacotamento repetido produziu o mesmo hash;
- [ ] listagem do ZIP tem apenas `custom_components/octopus_media/`;
- [ ] auditoria de segredos/URLs/artefatos locais passou;
- [ ] testes HTTP confirmam imagem `401` sem autenticação e `404` para referência inválida;
- [ ] implementação de imagem continua encerrando referência válida com `501`, sem bytes reais;
- [ ] nenhuma etapa tentou alcançar Jellyfin real.

## 9. Registro de resultados

Preencha `Resultado`, `Evidência` e `Observação` somente durante/depois do ensaio. Use evidência
privada sanitizada, por exemplo `captura S-03 sanitizada`, `contagem local L-02` ou apenas um hash.

| Teste | Esperado | Resultado | Evidência | Observação |
|---|---|---|---|---|
| Instalação do ZIP | Integração carrega sem erro de importação | Não executado | — | — |
| Recurso Lovelace | JS Module carrega pela rota prevista | Não executado | — | — |
| Cache do bundle | Hash/tamanho corresponde ao build atual | Não executado | — | — |
| Config flow válido | Avança para seleção de usuário | Não executado | — | — |
| Usuário | Lista e vincula o usuário escolhido | Não executado | — | — |
| Duplicidade | Segunda entrada é recusada | Não executado | — | — |
| URL inválida | `invalid_url` sem criar entrada | Não executado | — | — |
| Chave inválida | `invalid_auth` sem expor chave | Não executado | — | — |
| Timeout | `timeout` seguro | Não executado | — | — |
| Indisponível | `cannot_connect`/`unreachable` seguro | Não executado | — | — |
| Recent filmes/episódios | Normalização e ordem corretas | Não executado | — | — |
| Agrupamento | Episódios agrupados por série | Não executado | — | — |
| Recent vazio/campos ausentes | Estado explícito sem quebra | Não executado | — | — |
| Recent refresh/stale | Atualiza; preserva último válido na falha | Não executado | — | — |
| Placeholders | Nenhum byte real de imagem é buscado | Não executado | — | — |
| Playing vazio/ativo/pausado | Estados correspondem às sessões | Não executado | — | — |
| Playing metadados/progresso | Campos normalizados e progresso coerente | Não executado | — | — |
| Playing múltiplo/encerrado | Reconcilia sem duplicar e remove ao encerrar | Não executado | — | — |
| Reload/unload/reinício | Recursos encerram e reiniciam uma vez | Não executado | — | — |
| Reconexão/2 dashboards | Sem multiplicar polling backend | Não executado | — | — |
| Remover/recriar | Teardown e nova entrada íntegros | Não executado | — | — |
| Reautenticação | Nova chave do mesmo servidor é aceita | Não executado | — | — |
| Troca de servidor | `wrong_server`, dados antigos preservados | Não executado | — | — |
| Segurança WebSocket | Sem credencial, URL, DTO ou IDs internos | Não executado | — | — |
| Diagnostics/logs/YAML/bundle | Segredos ausentes ou redigidos | Não executado | — | — |
| WebSocket sem autenticação | Comando recusado antes de auth | Não executado | — | — |
| Endpoint de imagem | `401`/`404`/`501`, nunca bytes reais | Não executado | — | — |
| Desempenho | Cadência compartilhada e tempos registrados | Não executado | — | — |

## Critério de encerramento da Fase 3A.1

A validação só pode ser considerada concluída quando os casos aplicáveis tiverem resultado real,
evidência sanitizada e observação para qualquer desvio. Uma falha não autoriza corrigir ou iniciar
a Fase 3B automaticamente: registre-a, restaure o ambiente seguro e faça uma nova decisão de
escopo. A Fase 3B depende de aprovação explícita posterior.
