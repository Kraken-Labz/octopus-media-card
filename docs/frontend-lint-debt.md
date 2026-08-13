# Débito de lint frontend

## Classificação da Fase 3C.2.2

O baseline anterior continha 24 erros:

| Origem                            | Quantidade | Classificação                    | Resultado                                                      |
| --------------------------------- | ---------: | -------------------------------- | -------------------------------------------------------------- |
| `playwright/playing-hero.spec.ts` |         15 | Playing Hero preexistente        | corrigidos com casos obrigatórios tipados e guardas explícitas |
| `tests/playing-hero.test.ts`      |          7 | Playing Hero preexistente        | corrigidos sem assertions/optional chains desnecessários       |
| `src/octopus-media-card.ts`       |          1 | consolidação/roteamento          | corrigido ao tornar o estado offline booleano explícito        |
| `tests/editor.test.ts`            |          1 | editor Playing Hero preexistente | corrigido sem optional chain desnecessário                     |

Nenhuma regra foi desabilitada e nenhum comentário de supressão foi adicionado. O lint frontend
integral está limpo após a consolidação; não há débito restante a carregar para o primeiro release.
