import { promisify } from 'util';
import { exec } from 'child_process';

const cli = promisify(exec);

interface SearchResult {
  name: string;
  description: string;
}

/**
 * Checks that the returned objects are search results.
 */
function isSearchResult(result: any): result is SearchResult[] {
  if (!Array.isArray(result)) {
    return false;
  }

  if (
    result.some(
      (res) =>
        typeof res?.name !== 'string' && typeof res?.description !== 'string'
    )
  ) {
    return false;
  }

  return true;
}

/**
 * Searches for a package using composer's cli.
 */
export async function search(query: string): Promise<SearchResult[]> {
  // search global so an incomplete (invalid JSON) composer.json does not make this error.
  const { stdout } = await cli(`composer global search ${query} --format json`);

  const result = JSON.parse(stdout);

  if (!isSearchResult(result)) return [];

  return result;
}

/**
 * Searches details for the given package name.
 */
export async function fetchDetails(name: string): Promise<string | undefined> {
  try {
    // search global so an incomplete (invalid JSON) composer.json does not make this error.
    const { stdout } = await cli(`composer global show ${name} -a`);
    return stdout;
  } catch {
    return undefined;
  }
}
