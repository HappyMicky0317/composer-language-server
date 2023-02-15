import Context from '../context';
import { Actions, CompletionResult, HoverResult } from './index.types';

import hoverPackageDetailsAction from './hover/package-details';
import completePackageNameAction from './completion/package-name';
import completePossibleKeysAction from './completion/possible-keys';

export const actions = {
  hover: [hoverPackageDetailsAction],
  completion: [completePackageNameAction, completePossibleKeysAction],
} as Actions;

/**
 * Runs the defined hover actions, stops at first result.
 */
export async function runHover(
  context: Context
): Promise<HoverResult | undefined> {
  for (const action of actions.hover) {
    const result = await action(context);
    if (result) return result;
  }
}

/**
 * Runs the defined completion actions, combining each action's results.
 */
export async function runCompletion(
  context: Context
): Promise<CompletionResult[]> {
  return (
    await Promise.all(actions.completion.map((action) => action(context)))
  ).flat();
}
