import type { JourneyFormSummary } from '../types/graph';

type FormListProps = {
  forms: JourneyFormSummary[];
  selectedNodeId: string | null;
  onSelectForm: (nodeId: string) => void;
};

function FormList({ forms, selectedNodeId, onSelectForm }: FormListProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Forms</p>
          <h2>Journey forms</h2>
        </div>
        <span className="count-badge">{forms.length}</span>
      </div>

      <div className="form-list">
        {forms.map((form) => (
          <button
            className="form-card"
            key={form.nodeId}
            onClick={() => onSelectForm(form.nodeId)}
            type="button"
            aria-pressed={selectedNodeId === form.nodeId}
          >
            <div>
              <h3>{form.name}</h3>
              <p>{form.fieldCount} fields</p>
            </div>
            <span>
              {form.prerequisiteCount === 0
                ? 'Start form'
                : `${form.prerequisiteCount} prerequisite${
                    form.prerequisiteCount === 1 ? '' : 's'
                  }`}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default FormList;
