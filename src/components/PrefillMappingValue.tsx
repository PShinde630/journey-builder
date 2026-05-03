import {
  getPrefillMappingKey,
  type PrefillMappingsByTarget,
} from '../types/prefill';

type PrefillMappingValueProps = {
  nodeId: string;
  fieldId: string;
  mappings: PrefillMappingsByTarget;
  onClearMapping: (nodeId: string, fieldId: string) => void;
  onOpenMapping: (nodeId: string, fieldId: string) => void;
};

function PrefillMappingValue({
  nodeId,
  fieldId,
  mappings,
  onClearMapping,
  onOpenMapping,
}: PrefillMappingValueProps) {
  const mapping = mappings[getPrefillMappingKey(nodeId, fieldId)];

  if (!mapping) {
    return (
      <button
        className="empty-prefill"
        onClick={() => onOpenMapping(nodeId, fieldId)}
        type="button"
      >
        No prefill selected
      </button>
    );
  }

  return (
    <div className="prefill-value">
      <button
        className="prefill-edit-button"
        onClick={() => onOpenMapping(nodeId, fieldId)}
        type="button"
      >
        Prefilled from {mapping.sourceFormName} {'>'} {mapping.sourceFieldLabel}
      </button>
      <button
        aria-label={`Clear prefill mapping for ${fieldId}`}
        className="prefill-clear-button"
        onClick={() => onClearMapping(nodeId, fieldId)}
        type="button"
      >
        X
      </button>
    </div>
  );
}

export default PrefillMappingValue;
