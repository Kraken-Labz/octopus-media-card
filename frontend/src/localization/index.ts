import { en } from "./en";
import { ptBR } from "./pt-BR";

export type TranslationKey = keyof typeof en;

export function translate(language: string | undefined, key: TranslationKey): string {
  return language?.toLowerCase().startsWith("pt") ? ptBR[key] : en[key];
}
