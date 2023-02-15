import { readFile } from 'fs/promises';

export const fixturesPath = __dirname + '/__fixtures__';

export async function getFixture(fixture: string): Promise<string> {
  return (await readFile(`${fixturesPath}/${fixture}`)).toString();
}
