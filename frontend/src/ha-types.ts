export type UnsubscribeFunc = () => void;

export interface HomeAssistantConnection {
  sendMessagePromise<T>(message: Record<string, unknown>): Promise<T>;
  subscribeMessage<T>(
    callback: (message: T) => void,
    subscribeMessage: Record<string, unknown>,
  ): Promise<UnsubscribeFunc>;
}

export interface HomeAssistant {
  config: {
    time_zone: string;
  };
  connection: HomeAssistantConnection;
  language: string;
  themes?: { darkMode?: boolean };
}

export interface LovelaceCardConfig {
  type: string;
  [key: string]: unknown;
}

export interface CustomCardEntry {
  type: string;
  name: string;
  description: string;
  preview: boolean;
}

declare global {
  interface Window {
    customCards?: CustomCardEntry[];
  }
}
