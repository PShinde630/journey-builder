export type PrefillMapping = {
  targetNodeId: string;
  targetFieldId: string;
  sourceNodeId?: string;
  sourceFormName: string;
  sourceFieldId: string;
  sourceFieldLabel: string;
};

export type PrefillMappingsByTarget = Record<string, PrefillMapping>;

export type PrefillSourceOption = {
  id: string;
  sourceNodeId?: string;
  sourceFormName: string;
  sourceFieldId: string;
  sourceFieldLabel: string;
  sourceType: 'direct-form' | 'transitive-form' | 'global';
};

export type PrefillSourceGroup = {
  id: string;
  label: string;
  description: string;
  options: PrefillSourceOption[];
};

export function getPrefillMappingKey(nodeId: string, fieldId: string) {
  return `${nodeId}:${fieldId}`;
}
