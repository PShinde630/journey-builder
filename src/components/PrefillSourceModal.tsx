import { useMemo, useState } from 'react';
import type { JourneyFormField } from '../types/graph';
import type { PrefillSourceGroup, PrefillSourceOption } from '../types/prefill';

type PrefillSourceModalProps = {
  targetField: JourneyFormField;
  sourceGroups: PrefillSourceGroup[];
  onClose: () => void;
  onSelectSource: (source: PrefillSourceOption) => void;
};

function PrefillSourceModal({
  targetField,
  sourceGroups,
  onClose,
  onSelectSource,
}: PrefillSourceModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredGroups = useMemo(
    () =>
      sourceGroups
        .map((group) => ({
          ...group,
          options: normalizedSearchTerm
            ? group.options.filter((option) =>
                [
                  option.sourceFormName,
                  option.sourceFieldLabel,
                  option.sourceFieldId,
                ]
                  .join(' ')
                  .toLowerCase()
                  .includes(normalizedSearchTerm)
              )
            : group.options,
        }))
        .filter((group) => group.options.length > 0),
    [normalizedSearchTerm, sourceGroups]
  );
  const hasUpstreamFields = sourceGroups.some(
    (group) => group.id !== 'global-data' && group.options.length > 0
  );
  const hasFilteredResults = filteredGroups.length > 0;

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="prefill-modal-title"
        aria-modal="true"
        className="modal-panel"
        role="dialog"
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">Prefill source</p>
            <h2 id="prefill-modal-title">Map {targetField.label}</h2>
          </div>
          <button
            aria-label="Close prefill source picker"
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            X
          </button>
        </header>

        <div className="modal-search">
          <label htmlFor="prefill-source-search">Search sources</label>
          <input
            id="prefill-source-search"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by form or field"
            type="search"
            value={searchTerm}
          />
        </div>

        <div className="source-group-list">
          {!hasUpstreamFields && !normalizedSearchTerm ? (
            <div className="source-empty-state">
              <h3>No upstream form fields available.</h3>
              <p>Global data is still available for this field.</p>
            </div>
          ) : null}

          {!hasFilteredResults ? (
            <div className="source-empty-state">
              <h3>No matching sources.</h3>
              <p>
                Upstream form fields must match this field key. Try searching
                global data too.
              </p>
            </div>
          ) : null}

          {filteredGroups.map((group) => (
            <section className="source-group" key={group.id}>
              <div className="source-group-header">
                <h3>{group.label}</h3>
                <p>{group.description}</p>
              </div>

              <div className="source-option-list">
                {group.options.map((option) => (
                  <button
                    className="source-option"
                    key={option.id}
                    onClick={() => onSelectSource(option)}
                    type="button"
                  >
                    <span>{option.sourceFormName}</span>
                    <strong>{option.sourceFieldLabel}</strong>
                    <code>{option.sourceFieldId}</code>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}

export default PrefillSourceModal;
