import { useEffect, useState } from 'react';
import { fetchActionBlueprintGraph } from '../api/graphApi';
import type { ActionBlueprintGraph } from '../types/graph';

type GraphState =
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: ActionBlueprintGraph; error: null }
  | { status: 'error'; data: null; error: string };

export function useActionBlueprintGraph() {
  const [state, setState] = useState<GraphState>({
    status: 'loading',
    data: null,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    fetchActionBlueprintGraph()
      .then((graph) => {
        if (isMounted) {
          setState({ status: 'success', data: graph, error: null });
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setState({
            status: 'error',
            data: null,
            error:
              error instanceof Error
                ? error.message
                : 'Unable to load the action blueprint graph.',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
