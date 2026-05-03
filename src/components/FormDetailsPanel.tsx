import type { JourneyFormDetails } from '../types/graph';
import type { PrefillMappingsByTarget } from '../types/prefill';
import PrefillMappingValue from './PrefillMappingValue';

type FormDetailsPanelProps = {
  form: JourneyFormDetails | null;
  mappings: PrefillMappingsByTarget;
  onClearMapping: (nodeId: string, fieldId: string) => void;
  onOpenMapping: (nodeId: string, fieldId: string) => void;
};

function FormDetailsPanel({
  form,
  mappings,
  onClearMapping,
  onOpenMapping,
}: FormDetailsPanelProps) {
  if (!form) {
    return (
      <section className="panel details-panel empty-details">
        <p className="eyebrow">Selected form</p>
        <h2>No form selected</h2>
        <p>Choose a form from the list to inspect its fields.</p>
      </section>
    );
  }

  return (
    <section className="panel details-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Selected form</p>
          <h2>{form.name}</h2>
        </div>
        <span className="count-badge">{form.fields.length}</span>
      </div>

      <div className="field-list">
        {form.fields.map((field) => (
          <article className="field-card" key={field.id}>
            <div>
              <h3>{field.label}</h3>
              <p>{field.id}</p>
            </div>
            <div className="prefill-column">
              <div className="field-meta">
                {field.required ? <span>Required</span> : null}
                <span>{field.avantosType ?? field.type}</span>
              </div>
              <PrefillMappingValue
                fieldId={field.id}
                nodeId={form.nodeId}
                mappings={mappings}
                onClearMapping={onClearMapping}
                onOpenMapping={onOpenMapping}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FormDetailsPanel;
