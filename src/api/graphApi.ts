import type { ActionBlueprintGraph } from '../types/graph';

const DEFAULT_GRAPH_URL =
  'http://localhost:3000/api/v1/1/actions/blueprints/bp_01jk766tckfwx84xjcxazggzyc/graph';

export async function fetchActionBlueprintGraph(
  graphUrl = DEFAULT_GRAPH_URL
): Promise<ActionBlueprintGraph> {
  const response = await fetch(graphUrl);

  if (!response.ok) {
    throw new Error(`Graph request failed with status ${response.status}`);
  }

  return response.json() as Promise<ActionBlueprintGraph>;
}
