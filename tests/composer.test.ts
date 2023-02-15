import { fetchDetails } from '../src/composer-cli';

describe('FetchDetails', () => {
  it('returns info for a known package', async () => {
    const details = await fetchDetails('phpstan/phpstan');
    expect(details).toContain('[git] https://github.com/phpstan/phpstan.git');
  });

  it('returns undefined for an unknown package', async () => {
    const details = await fetchDetails('laytan/unknown-package');
    expect(details).toBe(undefined);
  });
});
