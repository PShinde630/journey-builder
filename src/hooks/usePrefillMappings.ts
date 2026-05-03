import { useEffect, useState } from 'react';
import type { ActionBlueprintGraph } from '../types/graph';
import {
  getPrefillMappingKey,
  type PrefillMappingsByTarget,
  type PrefillSourceOption,
} from '../types/prefill';
import {
  createInitialPrefillMappings,
  getPrefillMappingsStorageKey,
  loadPrefillMappings,
  savePrefillMappings,
} from '../utils/prefill';

export function usePrefillMappings(graph: ActionBlueprintGraph | null) {
  const [prefillMappings, setPrefillMappings] =
    useState<PrefillMappingsByTarget>({});
  const [hasLoadedStoredMappings, setHasLoadedStoredMappings] = useState(false);

  useEffect(() => {
    if (!graph) {
      return;
    }

    const storageKey = getPrefillMappingsStorageKey(graph.id);
    setHasLoadedStoredMappings(false);
    setPrefillMappings(
      loadPrefillMappings(storageKey) ?? createInitialPrefillMappings(graph)
    );
    setHasLoadedStoredMappings(true);
  }, [graph]);

  useEffect(() => {
    if (!graph || !hasLoadedStoredMappings) {
      return;
    }

    savePrefillMappings(
      getPrefillMappingsStorageKey(graph.id),
      prefillMappings
    );
  }, [graph, hasLoadedStoredMappings, prefillMappings]);

  function clearPrefillMapping(nodeId: string, fieldId: string) {
    setPrefillMappings((currentMappings) => {
      const nextMappings = { ...currentMappings };
      delete nextMappings[getPrefillMappingKey(nodeId, fieldId)];
      return nextMappings;
    });
  }

  function setPrefillMapping(
    target: { nodeId: string; fieldId: string },
    source: PrefillSourceOption
  ) {
    setPrefillMappings((currentMappings) => ({
      ...currentMappings,
      [getPrefillMappingKey(target.nodeId, target.fieldId)]: {
        targetNodeId: target.nodeId,
        targetFieldId: target.fieldId,
        sourceNodeId: source.sourceNodeId,
        sourceFormName: source.sourceFormName,
        sourceFieldId: source.sourceFieldId,
        sourceFieldLabel: source.sourceFieldLabel,
      },
    }));
  }

  return {
    prefillMappings,
    clearPrefillMapping,
    setPrefillMapping,
  };
}
