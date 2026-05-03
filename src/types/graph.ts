export type GraphFieldSchema = {
  avantos_type?: string;
  title?: string;
  type: string;
  format?: string;
};

export type GraphForm = {
  id: string;
  name: string;
  description: string;
  field_schema: {
    properties: Record<string, GraphFieldSchema>;
    required?: string[];
  };
};

export type GraphNode = {
  id: string;
  type: 'form';
  data: {
    id: string;
    component_key: string;
    component_type: 'form';
    component_id: string;
    name: string;
    prerequisites: string[];
    input_mapping: Record<string, unknown>;
  };
};

export type GraphEdge = {
  source: string;
  target: string;
};

export type ActionBlueprintGraph = {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  forms: GraphForm[];
};

export type JourneyFormSummary = {
  nodeId: string;
  formId: string;
  name: string;
  fieldCount: number;
  prerequisiteCount: number;
};

export type JourneyFormField = {
  id: string;
  label: string;
  type: string;
  avantosType?: string;
  required: boolean;
};

export type JourneyFormDetails = JourneyFormSummary & {
  fields: JourneyFormField[];
};
