import type { ActionBlueprintGraph } from '../types/graph';
import {
  getPrefillMappingKey,
  type PrefillSourceGroup,
  type PrefillMappingsByTarget,
} from '../types/prefill';
import { getJourneyFormDetails } from './forms';

const PREFILL_STORAGE_PREFIX = 'journey-builder-prefill-mappings';

export function createInitialPrefillMappings(
  graph: ActionBlueprintGraph
): PrefillMappingsByTarget {
  const formANode = graph.nodes.find((node) => node.data.name === 'Form A');
  const formBNode = graph.nodes.find((node) => node.data.name === 'Form B');

  if (!formANode || !formBNode) {
    return {};
  }

  return {
    [getPrefillMappingKey(formBNode.id, 'email')]: {
      targetNodeId: formBNode.id,
      targetFieldId: 'email',
      sourceNodeId: formANode.id,
      sourceFormName: formANode.data.name,
      sourceFieldId: 'email',
      sourceFieldLabel: 'Email',
    },
  };
}

export function getPrefillMappingsStorageKey(graphId: string) {
  return `${PREFILL_STORAGE_PREFIX}:${graphId}`;
}

export function loadPrefillMappings(
  storageKey: string
): PrefillMappingsByTarget | null {
  try {
    const storedValue = window.localStorage.getItem(storageKey);

    if (!storedValue) {
      return null;
    }

    const parsedValue = JSON.parse(storedValue);

    if (!parsedValue || typeof parsedValue !== 'object') {
      return null;
    }

    return parsedValue as PrefillMappingsByTarget;
  } catch {
    return null;
  }
}

export function savePrefillMappings(
  storageKey: string,
  mappings: PrefillMappingsByTarget
) {
  window.localStorage.setItem(storageKey, JSON.stringify(mappings));
}

export function getPrefillSourceGroups(
  graph: ActionBlueprintGraph,
  targetNodeId: string,
  targetFieldId?: string
): PrefillSourceGroup[] {
  const directNodeIds = getDirectPrerequisiteNodeIds(graph, targetNodeId);
  const transitiveNodeIds = getTransitivePrerequisiteNodeIds(
    graph,
    targetNodeId,
    directNodeIds
  );

  return [
    createFormSourceGroup(
      graph,
      'direct-form-fields',
      'Direct dependencies',
      'Fields from forms this form directly depends on.',
      directNodeIds,
      'direct-form',
      targetNodeId,
      targetFieldId
    ),
    createFormSourceGroup(
      graph,
      'transitive-form-fields',
      'Earlier dependencies',
      'Fields from forms found further upstream in the journey.',
      transitiveNodeIds,
      'transitive-form',
      targetNodeId,
      targetFieldId
    ),
    createGlobalSourceGroup(),
  ].filter((group) => group.options.length > 0);
}

function getDirectPrerequisiteNodeIds(
  graph: ActionBlueprintGraph,
  targetNodeId: string
) {
  const targetNode = graph.nodes.find((node) => node.id === targetNodeId);
  return targetNode?.data.prerequisites ?? [];
}

function getTransitivePrerequisiteNodeIds(
  graph: ActionBlueprintGraph,
  targetNodeId: string,
  directNodeIds: string[]
) {
  const directNodeIdSet = new Set(directNodeIds);
  const visitedNodeIds = new Set<string>();
  const result: string[] = [];

  function visit(nodeId: string) {
    const node = graph.nodes.find((candidate) => candidate.id === nodeId);

    if (!node) {
      return;
    }

    for (const prerequisiteId of node.data.prerequisites) {
      if (visitedNodeIds.has(prerequisiteId)) {
        continue;
      }

      visitedNodeIds.add(prerequisiteId);

      if (!directNodeIdSet.has(prerequisiteId)) {
        result.push(prerequisiteId);
      }

      visit(prerequisiteId);
    }
  }

  visit(targetNodeId);

  return result;
}

function createFormSourceGroup(
  graph: ActionBlueprintGraph,
  id: string,
  label: string,
  description: string,
  nodeIds: string[],
  sourceType: 'direct-form' | 'transitive-form',
  targetNodeId?: string,
  targetFieldId?: string
): PrefillSourceGroup {
  return {
    id,
    label,
    description,
    options: nodeIds.flatMap((nodeId) => {
      const form = getJourneyFormDetails(graph, nodeId);

      if (!form) {
        return [];
      }

      return form.fields
        .filter(
          (field) =>
            (!targetFieldId || field.id === targetFieldId) &&
            (nodeId !== targetNodeId || field.id !== targetFieldId)
        )
        .map((field) => ({
          id: `${nodeId}:${field.id}`,
          sourceNodeId: nodeId,
          sourceFormName: form.name,
          sourceFieldId: field.id,
          sourceFieldLabel: field.label,
          sourceType,
        }));
    }),
  };
}

function createGlobalSourceGroup(): PrefillSourceGroup {
  const globalOptions = [
    {
      sourceFormName: 'Action Properties',
      sourceFieldId: 'action_id',
      sourceFieldLabel: 'Action ID',
    },
    {
      sourceFormName: 'Action Properties',
      sourceFieldId: 'created_at',
      sourceFieldLabel: 'Created At',
    },
    {
      sourceFormName: 'Client Organisation Properties',
      sourceFieldId: 'client_name',
      sourceFieldLabel: 'Client Name',
    },
  ];

  return {
    id: 'global-data',
    label: 'Global data',
    description: 'Shared values available to any form in the journey.',
    options: globalOptions.map((option) => ({
      id: `global:${option.sourceFormName}:${option.sourceFieldId}`,
      sourceType: 'global',
      ...option,
    })),
  };
}
