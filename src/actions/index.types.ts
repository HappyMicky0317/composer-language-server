import Context from '../context';

export enum HoverResultKind {
  Markdown = 'markdown',
  Plain = 'plaintext',
}

export interface HoverResult {
  kind: HoverResultKind;
  value: string;
}

export interface CompletionResult {
  name: string;
  description: string;
}

export type Action<T> = (context: Context) => Promise<T>;

export interface Actions {
  hover: Action<HoverResult | undefined>[];
  completion: Action<CompletionResult[]>[];
}
