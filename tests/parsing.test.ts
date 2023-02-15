import { getLocation } from 'jsonc-parser';
import { getFixture } from './helpers';
import { getPossibleProperties } from '../src/composer-schema';
import { JSONSchema4 } from 'json-schema';

it('parses partly invalid JSON', async () => {
  const json = await getFixture('in-progress.composer.json');
  const location = getLocation(json, json.indexOf('"phps'));
  expect(location.path).toEqual(['require', 'phps']);
});

describe('composer JSON schema', () => {
  describe('getPossibleProperties', () => {
    let schema: JSONSchema4;
    beforeAll(async () => {
      schema = JSON.parse(
        await getFixture('composer-schema.json')
      ) as JSONSchema4;
    });

    it('returns top level properties', () => {
      const path = ['lol'];

      const properties = getPossibleProperties(schema, path);

      expect(properties).toBe(schema.properties);
    });

    it('parses a simple path', () => {
      const path = ['support', 'lol'];

      const properties = getPossibleProperties(schema, path);

      expect(properties).toEqual(schema?.properties?.support?.properties);
    });

    it("follows $ref's", () => {
      const path = ['autoload', 'lol'];

      const properties = getPossibleProperties(schema, path);

      expect(properties).toEqual(schema?.definitions?.autoload?.properties);
    });

    it('handles arrays of objects', () => {
      const path = ['funding', 0, 'lol'];

      const properties = getPossibleProperties(schema, path);

      expect(properties).toEqual(
        (schema?.properties?.funding?.items as JSONSchema4)?.properties
      );
    });

    it("handles arrays of objects with $ref's", () => {
      const path = ['authors', 0, 'lol'];

      const properties = getPossibleProperties(schema, path);

      expect(properties).toEqual(
        (schema?.definitions?.authors?.items as JSONSchema4)?.properties
      );
    });
  });
});
