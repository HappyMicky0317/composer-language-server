import axios from 'axios';
import { Segment } from 'jsonc-parser';
import { JSONSchema4 } from 'json-schema';

let schema: JSONSchema4 | undefined;
export async function getSchema(): Promise<JSONSchema4 | undefined> {
  if (schema === undefined) {
    schema = await axios
      .get('https://getcomposer.org/schema.json')
      .then((r) => r.data as JSONSchema4);
  }

  return schema;
}

/**
 * Follows the given path in the schema and returns the properties that are possible at that path.
 */
export function getPossibleProperties(
  schema: JSONSchema4,
  path: Segment[]
): Record<string, JSONSchema4> {
  // Remove the last element because that is the element currently being written.
  path.pop();

  // Loop through the path and keep deepening the properties
  // untill we are at the current location (last index of path).
  let properties: Record<string, JSONSchema4> | undefined = schema.properties;
  while (path.length) {
    const part = path.shift();

    if (!part || typeof part === 'number') continue;
    if (!properties) break;

    // Resolve $ref to the definitions.
    if (typeof properties[part].$ref === 'string') {
      // $ref is something like #/definitions/authors, we only need the last one.
      // to retrieve the definition.
      const definitionParts = (properties[part].$ref as string).split('/');
      const definitionId = definitionParts[definitionParts.length - 1];

      properties = schema.definitions?.[definitionId] ?? undefined;
    } else {
      properties = properties[part];
    }

    // If the next part is a number, we are in an array and need to use the
    // .item.properties.
    properties =
      typeof path[0] === 'number'
        ? properties?.items.properties ?? undefined
        : properties?.properties ?? undefined;
  }

  return properties ?? {};
}
