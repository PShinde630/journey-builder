import { useState } from 'react';
import FormDetailsPanel from './components/FormDetailsPanel';
import FormList from './components/FormList';
import PrefillSourceModal from './components/PrefillSourceModal';
import { useActionBlueprintGraph } from './hooks/useActionBlueprintGraph';
import { usePrefillMappings } from './hooks/usePrefillMappings';
import type { PrefillSourceOption } from './types/prefill';
import {
  getJourneyFormDetails,
  getJourneyFormSummaries,
} from './utils/forms';
import { getPrefillSourceGroups } from './utils/prefill';

type MappingTarget = {
  nodeId: string;
  fieldId: string;
};

function App() {
  const graphState = useActionBlueprintGraph();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [mappingTarget, setMappingTarget] = useState<MappingTarget | null>(
    null
  );
  const { prefillMappings, clearPrefillMapping, setPrefillMapping } =
    usePrefillMappings(graphState.status === 'success' ? graphState.data : null);

  if (graphState.status === 'loading') {
    return (
      <main className="app-shell">
        <section className="panel state-panel">
          <p className="eyebrow">Journey Builder</p>
          <h1>Loading forms...</h1>
          <p>Fetching the action blueprint graph from the mock server.</p>
        </section>
      </main>
    );
  }

  if (graphState.status === 'error') {
    return (
      <main className="app-shell">
        <section className="panel state-panel">
          <p className="eyebrow">Mock server needed</p>
          <h1>Could not load forms</h1>
          <p>{graphState.error}</p>
          <p className="helper-text">
            Start the Avantos mock server on port 3000, then refresh this page.
          </p>
        </section>
      </main>
    );
  }

  const forms = getJourneyFormSummaries(graphState.data);
  const activeNodeId = selectedNodeId ?? forms[0]?.nodeId ?? null;
  const selectedForm = activeNodeId
    ? getJourneyFormDetails(graphState.data, activeNodeId)
    : null;
  const targetField =
    mappingTarget && selectedForm?.nodeId === mappingTarget.nodeId
      ? selectedForm.fields.find((field) => field.id === mappingTarget.fieldId)
      : null;
  const sourceGroups = mappingTarget
    ? getPrefillSourceGroups(
        graphState.data,
        mappingTarget.nodeId,
        mappingTarget.fieldId
      )
    : [];

  function selectPrefillSource(source: PrefillSourceOption) {
    if (!mappingTarget) {
      return;
    }

    setPrefillMapping(mappingTarget, source);
    setMappingTarget(null);
  }

  return (
    <main className="app-shell">
      <div className="page-layout">
        <header className="page-header">
          <h1>Journey Builder</h1>
          <p className="journey-context">Editing: {graphState.data.name}</p>
          <p>{graphState.data.description}</p>
        </header>

        <div className="workspace-grid">
          <FormList
            forms={forms}
            selectedNodeId={activeNodeId}
            onSelectForm={setSelectedNodeId}
          />
          <FormDetailsPanel
            form={selectedForm}
            mappings={prefillMappings}
            onClearMapping={clearPrefillMapping}
            onOpenMapping={(nodeId, fieldId) =>
              setMappingTarget({ nodeId, fieldId })
            }
          />
        </div>
      </div>
      {targetField ? (
        <PrefillSourceModal
          sourceGroups={sourceGroups}
          targetField={targetField}
          onClose={() => setMappingTarget(null)}
          onSelectSource={selectPrefillSource}
        />
      ) : null}
    </main>
  );
}

export default App;
