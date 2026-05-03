import type {
  ActionBlueprintGraph,
  JourneyFormDetails,
  JourneyFormSummary,
} from '../types/graph';

export function getJourneyFormSummaries(
  graph: ActionBlueprintGraph
): JourneyFormSummary[] {
  const formsById = new Map(graph.forms.map((form) => [form.id, form]));

  return graph.nodes
    .filter((node) => node.type === 'form')
    .map((node) => {
      const form = formsById.get(node.data.component_id);

      return {
        nodeId: node.id,
        formId: node.data.component_id,
        name: node.data.name,
        fieldCount: form ? Object.keys(form.field_schema.properties).length : 0,
        prerequisiteCount: node.data.prerequisites.length,
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function getJourneyFormDetails(
  graph: ActionBlueprintGraph,
  nodeId: string
): JourneyFormDetails | null {
  const node = graph.nodes.find((candidate) => candidate.id === nodeId);

  if (!node) {
    return null;
  }

  const form = graph.forms.find(
    (candidate) => candidate.id === node.data.component_id
  );

  if (!form) {
    return null;
  }

  const requiredFields = new Set(form.field_schema.required ?? []);

  return {
    nodeId: node.id,
    formId: node.data.component_id,
    name: node.data.name,
    fieldCount: Object.keys(form.field_schema.properties).length,
    prerequisiteCount: node.data.prerequisites.length,
    fields: Object.entries(form.field_schema.properties).map(([id, field]) => ({
      id,
      label: field.title ?? humanizeFieldName(id),
      type: field.type,
      avantosType: field.avantos_type,
      required: requiredFields.has(id),
    })),
  };
}

function humanizeFieldName(fieldName: string) {
  return fieldName
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
