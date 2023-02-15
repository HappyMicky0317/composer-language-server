import Context from '../../context';
import { CompletionResult } from '../index.types';
import { getSchema, getPossibleProperties } from '../../composer-schema';

/**
 * Returns the possible properties for the current path.
 */
export default async function (context: Context): Promise<CompletionResult[]> {
  try {
    const schema = await getSchema();
    if (!schema) {
      throw new Error('No schema found or the schema could not be parsed.');
    }

    if (!context.isAtPropertyKey()) return [];

    const properties = getPossibleProperties(schema, context.location.path);

    return Object.entries(properties).map(([k, v]) => ({
      name: k,
      description: v.description ?? '',
    }));
  } catch (e) {
    if (typeof e === 'object' && typeof e?.toString === 'function') {
      context.logger.error(e.toString());
    }

    return [];
  }
}
