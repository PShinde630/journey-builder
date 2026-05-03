import { describe, expect, it } from 'vitest';
import type { ActionBlueprintGraph, GraphForm, GraphNode } from '../types/graph';
import { getPrefillSourceGroups } from './prefill';

const fieldProperties = {
  email: {
    title: 'Email',
    type: 'string',
    avantos_type: 'short-text',
  },
  name: {
    title: 'Name',
    type: 'string',
    avantos_type: 'short-text',
  },
};

function createNode(name: string, prerequisites: string[] = []): GraphNode {
  return {
    id: name,
    type: 'form',
    data: {
      id: name,
      component_key: name,
      component_type: 'form',
      component_id: name,
      name,
      prerequisites,
      input_mapping: {},
    },
  };
}

function createForm(name: string): GraphForm {
  return {
    id: name,
    name,
    description: `${name} schema`,
    field_schema: {
      properties: fieldProperties,
      required: ['email'],
    },
  };
}

const graph: ActionBlueprintGraph = {
  id: 'graph',
  tenant_id: 'tenant',
  name: 'Test graph',
  description: 'Test graph',
  nodes: [
    createNode('Form A'),
    createNode('Form B', ['Form A']),
    createNode('Form C', ['Form A']),
    createNode('Form D', ['Form B']),
    createNode('Form E', ['Form C']),
    createNode('Form F', ['Form D', 'Form E']),
  ],
  edges: [],
  forms: [
    createForm('Form A'),
    createForm('Form B'),
    createForm('Form C'),
    createForm('Form D'),
    createForm('Form E'),
    createForm('Form F'),
  ],
};

function getGroupLabels(nodeId: string) {
  return getPrefillSourceGroups(graph, nodeId, 'email').map(
    (group) => group.label
  );
}

function getSourceFormNames(nodeId: string, groupLabel: string) {
  return [
    ...new Set(
      getPrefillSourceGroups(graph, nodeId, 'email')
        .find((group) => group.label === groupLabel)
        ?.options.map((option) => option.sourceFormName) ?? []
    ),
  ];
}

describe('getPrefillSourceGroups', () => {
  it('returns direct dependency fields for a one-step downstream form', () => {
    expect(getSourceFormNames('Form B', 'Direct dependencies')).toEqual([
      'Form A',
    ]);
    expect(getGroupLabels('Form B')).not.toContain('Earlier dependencies');
  });

  it('separates direct and earlier dependencies', () => {
    expect(getSourceFormNames('Form D', 'Direct dependencies')).toEqual([
      'Form B',
    ]);
    expect(getSourceFormNames('Form D', 'Earlier dependencies')).toEqual([
      'Form A',
    ]);
  });

  it('supports multiple upstream paths', () => {
    expect(getSourceFormNames('Form F', 'Direct dependencies')).toEqual([
      'Form D',
      'Form E',
    ]);
    expect(getSourceFormNames('Form F', 'Earlier dependencies')).toEqual([
      'Form B',
      'Form A',
      'Form C',
    ]);
  });

  it('always includes global data', () => {
    expect(getGroupLabels('Form A')).toEqual(['Global data']);
  });

  it('filters upstream form fields to the target field key', () => {
    const directOptions = getPrefillSourceGroups(graph, 'Form B', 'email').find(
      (group) => group.label === 'Direct dependencies'
    )?.options;

    expect(directOptions?.map((option) => option.sourceFieldId)).toEqual([
      'email',
    ]);
  });

  it('keeps global data available even when field keys do not match', () => {
    const sourceGroups = getPrefillSourceGroups(graph, 'Form B', 'name');
    const globalGroup = sourceGroups.find(
      (group) => group.label === 'Global data'
    );

    expect(globalGroup?.options.map((option) => option.sourceFieldId)).toEqual([
      'action_id',
      'created_at',
      'client_name',
    ]);
  });

  it('filters the target field if the target form appears as a source', () => {
    const sourceGroups = getPrefillSourceGroups(graph, 'Form B', 'email');
    const directOptions = sourceGroups.find(
      (group) => group.label === 'Direct dependencies'
    )?.options;

    expect(
      directOptions?.some(
        (option) =>
          option.sourceNodeId === 'Form B' && option.sourceFieldId === 'email'
      )
    ).toBe(false);
  });
});
