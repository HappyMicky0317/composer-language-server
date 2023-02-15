import { CompletionResult } from '../index.types';
import { search } from '../../composer-cli';
import Context from '../../context';

export default async function (context: Context): Promise<CompletionResult[]> {
  if (!context.isDefiningDependencies()) return [];

  const query = context.getCurrentKeyValue();

  if (!query || query.length <= 3) return [];

  return search(query);
}
