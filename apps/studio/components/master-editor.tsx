'use client';

import {
  commitHistory,
  createBlankSlideDocument,
  createHistory,
  redoHistory,
  type SlideDocument,
  type SlideElement,
  SlideRenderer,
  slideDocumentSchema,
  undoHistory,
} from '@open-slide/document';
import {
  BarChart3,
  ChevronLeft,
  Code2,
  Copy,
  Eye,
  Plus,
  Redo2,
  Square,
  Table2,
  Trash2,
  Type,
  Undo2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { AdminMaster, DeckSlide, MasterSlideVersion } from '@/lib/models';
import type { SessionIdentity } from '@/lib/server/auth';
import {
  chartElement,
  codeElement,
  Inspector,
  shapeElement,
  tableElement,
  textElement,
} from './studio-editor';

type SaveState = 'saving' | 'saved' | 'offline' | 'conflict';

function activeVersion(master: AdminMaster) {
  return (
    master.versions.find((version) => version.status === 'draft') ??
    master.versions.find((version) => version.id === master.currentPublishedVersionId) ??
    master.versions[0]
  );
}

export function MasterEditor({
  session,
  initialMaster,
}: {
  session: SessionIdentity;
  initialMaster: AdminMaster;
}) {
  const initialVersion = activeVersion(initialMaster);
  const [master, setMaster] = useState(initialMaster);
  const [selectedVersionId, setSelectedVersionId] = useState(initialVersion?.id ?? '');
  const [history, setHistory] = useState(() =>
    createHistory<SlideDocument>(initialVersion?.document ?? createBlankSlideDocument()),
  );
  const historyRef = useRef(history);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [compare, setCompare] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(initialMaster.title);
  const [description, setDescription] = useState(initialMaster.description);
  const [category, setCategory] = useState(initialMaster.category);
  const [tags, setTags] = useState(initialMaster.tags.join(', '));
  const revisionRef = useRef(initialVersion?.revision ?? 0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedVersion = master.versions.find((version) => version.id === selectedVersionId);
  const draft = master.versions.find((version) => version.status === 'draft');
  const published = master.versions.find(
    (version) => version.id === master.currentPublishedVersionId,
  );
  const editable = selectedVersion?.status === 'draft';
  const document = history.present;
  const selectedElement =
    document.elements.find((element) => element.id === selectedElementId) ?? null;

  function replaceHistory(next: typeof history) {
    historyRef.current = next;
    setHistory(next);
  }

  function setVersion(nextMaster: AdminMaster, version: MasterSlideVersion) {
    setMaster(nextMaster);
    setSelectedVersionId(version.id);
    revisionRef.current = version.revision;
    replaceHistory(createHistory(structuredClone(version.document)));
    setSelectedElementId(null);
    setSaveState('saved');
  }

  async function saveDocument(nextDocument: SlideDocument) {
    if (!draft || selectedVersionId !== draft.id) return;
    setSaveState('saving');
    try {
      const response = await fetch(`/api/admin/masters/${master.id}/versions/${draft.id}`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': session.csrfToken,
        },
        body: JSON.stringify({
          expectedRevision: revisionRef.current,
          document: nextDocument,
        }),
      });
      const result = await response.json();
      if (response.status === 409) {
        setSaveState('conflict');
        return;
      }
      if (!response.ok) throw new Error(result.error?.message ?? 'Draft save failed');
      revisionRef.current = result.version.revision;
      setMaster((current) => ({
        ...current,
        versions: current.versions.map((version) =>
          version.id === result.version.id ? result.version : version,
        ),
      }));
      setSaveState('saved');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Draft save failed');
      setSaveState('offline');
    }
  }

  function scheduleSave(nextDocument: SlideDocument) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState('saving');
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      void saveDocument(nextDocument);
    }, 450);
  }

  function updateDocument(nextDocument: SlideDocument, commit = true) {
    if (!editable) return;
    const parsed = slideDocumentSchema.parse(nextDocument);
    const next = commit
      ? commitHistory(historyRef.current, parsed)
      : { ...historyRef.current, present: parsed };
    replaceHistory(next);
    scheduleSave(parsed);
  }

  function updateElement(elementId: string, update: (element: SlideElement) => SlideElement) {
    updateDocument({
      ...document,
      elements: document.elements.map((element) =>
        element.id === elementId ? update(element) : element,
      ),
    });
  }

  function insertElement(element: SlideElement) {
    const zIndex = Math.max(0, ...document.elements.map((item) => item.zIndex)) + 1;
    updateDocument({ ...document, elements: [...document.elements, { ...element, zIndex }] });
    setSelectedElementId(element.id);
  }

  function duplicateSelected() {
    if (!selectedElement) return;
    const copy = {
      ...structuredClone(selectedElement),
      id: `element:${crypto.randomUUID()}`,
      x: selectedElement.x + 24,
      y: selectedElement.y + 24,
      zIndex: Math.max(0, ...document.elements.map((item) => item.zIndex)) + 1,
    };
    updateDocument({ ...document, elements: [...document.elements, copy] });
    setSelectedElementId(copy.id);
  }

  function deleteSelected() {
    if (!selectedElementId) return;
    updateDocument({
      ...document,
      elements: document.elements.filter((element) => element.id !== selectedElementId),
    });
    setSelectedElementId(null);
  }

  function restoreHistory(next: typeof history) {
    if (!editable || next === historyRef.current) return;
    replaceHistory(next);
    setSelectedElementId(null);
    scheduleSave(next.present);
  }

  function pointerTransform(
    elementId: string,
    event: React.PointerEvent<SVGGElement | SVGCircleElement>,
    kind: 'move' | 'resize',
    handle: 'nw' | 'ne' | 'sw' | 'se' = 'se',
  ) {
    if (!editable || event.detail > 1 || event.target instanceof HTMLTextAreaElement) return;
    const svg = event.currentTarget.ownerSVGElement;
    const element = document.elements.find((item) => item.id === elementId);
    if (!svg || !element) return;
    const activeElement = element;
    const startDocument = document;
    const startX = event.clientX;
    const startY = event.clientY;
    const rect = svg.getBoundingClientRect();
    function onMove(moveEvent: PointerEvent) {
      const dx = ((moveEvent.clientX - startX) / rect.width) * 1920;
      const dy = ((moveEvent.clientY - startY) / rect.height) * 1080;
      updateDocument(
        {
          ...startDocument,
          elements: startDocument.elements.map((item) => {
            if (item.id !== elementId) return item;
            if (kind === 'move') {
              return { ...item, x: activeElement.x + dx, y: activeElement.y + dy };
            }
            const left = handle.endsWith('w');
            const top = handle.startsWith('n');
            const width = Math.max(10, activeElement.width + (left ? -dx : dx));
            const height = Math.max(10, activeElement.height + (top ? -dy : dy));
            return {
              ...item,
              x: left ? activeElement.x + activeElement.width - width : activeElement.x,
              y: top ? activeElement.y + activeElement.height - height : activeElement.y,
              width,
              height,
            };
          }),
        },
        false,
      );
    }
    function onUp() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      replaceHistory({
        past: [...historyRef.current.past, startDocument].slice(-100),
        present: historyRef.current.present,
        future: [],
      });
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  }

  async function mutate(path: string, body: Record<string, unknown>, method = 'POST') {
    setError(null);
    const response = await fetch(path, {
      method,
      headers: { 'content-type': 'application/json', 'x-csrf-token': session.csrfToken },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error?.message ?? 'Master update failed');
      return null;
    }
    return result;
  }

  async function createDraft(sourceVersion: MasterSlideVersion) {
    if (draft) {
      const result = await mutate(
        `/api/admin/masters/${master.id}/versions/${draft.id}`,
        { expectedRevision: draft.revision, document: sourceVersion.document },
        'PUT',
      );
      if (result?.version) {
        const nextMaster = {
          ...master,
          versions: master.versions.map((version) =>
            version.id === result.version.id ? result.version : version,
          ),
        };
        setVersion(nextMaster, result.version);
      }
      return;
    }
    const result = await mutate(`/api/admin/masters/${master.id}/drafts`, {
      sourceVersionId: sourceVersion.id,
    });
    if (result?.version) {
      setVersion({ ...master, versions: [result.version, ...master.versions] }, result.version);
    }
  }

  async function saveMetadata() {
    const result = await mutate(
      `/api/admin/masters/${master.id}`,
      {
        title,
        description,
        category,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      },
      'PATCH',
    );
    if (result?.master) setMaster((current) => ({ ...current, ...result.master }));
  }

  async function publish() {
    if (!draft || saveState !== 'saved') return;
    const result = await mutate(`/api/admin/masters/${master.id}/versions/${draft.id}/publish`, {
      expectedRevision: draft.revision,
    });
    if (result?.master) {
      const version = result.master.versions.find(
        (candidate: MasterSlideVersion) => candidate.id === result.master.currentPublishedVersionId,
      );
      if (version) setVersion(result.master, version);
    }
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'z') return;
      event.preventDefault();
      restoreHistory(
        event.shiftKey ? redoHistory(historyRef.current) : undoHistory(historyRef.current),
      );
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const inspectorSlide: DeckSlide = {
    id: selectedVersion?.id ?? 'master-version',
    deckId: '',
    position: 0,
    masterSlideId: master.id,
    masterVersionId: selectedVersion?.id ?? null,
    schemaVersion: document.schemaVersion,
    document,
    notes: '',
    revision: selectedVersion?.revision ?? 0,
    createdAt: selectedVersion?.createdAt ?? '',
    updatedAt: selectedVersion?.createdAt ?? '',
  };

  return (
    <main className="editor-shell master-editor-shell">
      <header className="editor-toolbar">
        <a href="/admin/templates/vercel" className="icon-button" aria-label="Back to masters">
          <ChevronLeft size={17} />
        </a>
        <strong className="master-toolbar-title">{master.title}</strong>
        <span className={`save-state save-${saveState}`}>
          {editable ? (saveState === 'saving' ? 'Saving…' : saveState) : 'Preview'}
        </span>
        <div className="history-controls">
          <button
            type="button"
            className="icon-button"
            onClick={() => restoreHistory(undoHistory(historyRef.current))}
            disabled={!editable || history.past.length === 0}
            aria-label="Undo"
          >
            <Undo2 size={15} />
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => restoreHistory(redoHistory(historyRef.current))}
            disabled={!editable || history.future.length === 0}
            aria-label="Redo"
          >
            <Redo2 size={15} />
          </button>
        </div>
        {editable && (
          <div className="insert-controls">
            <button
              type="button"
              onClick={() => insertElement(textElement())}
              aria-label="Insert text"
            >
              <Type size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertElement(shapeElement())}
              aria-label="Insert shape"
            >
              <Square size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertElement(chartElement())}
              aria-label="Insert chart"
            >
              <BarChart3 size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertElement(tableElement())}
              aria-label="Insert table"
            >
              <Table2 size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertElement(codeElement())}
              aria-label="Insert code"
            >
              <Code2 size={15} />
            </button>
            <button
              type="button"
              onClick={duplicateSelected}
              disabled={!selectedElement}
              aria-label="Duplicate element"
            >
              <Copy size={15} />
            </button>
            <button
              type="button"
              onClick={deleteSelected}
              disabled={!selectedElement}
              aria-label="Delete element"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
        <div className="toolbar-spacer" />
        <button
          type="button"
          className="button button-secondary"
          onClick={() => setCompare(!compare)}
        >
          <Eye size={14} /> Compare
        </button>
        {editable ? (
          <button
            type="button"
            className="button button-primary"
            disabled={saveState !== 'saved'}
            onClick={publish}
          >
            Publish v{selectedVersion?.version}
          </button>
        ) : (
          selectedVersion && (
            <button
              type="button"
              className="button button-primary"
              onClick={() => createDraft(selectedVersion)}
            >
              <Plus size={14} /> {draft ? 'Restore into draft' : 'Create draft'}
            </button>
          )
        )}
      </header>

      <aside className="slide-rail master-version-rail" aria-label="Version history">
        <div className="master-metadata-form">
          <p className="eyebrow">Master metadata</p>
          <label>
            <span>Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            <span>Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <label>
            <span>Category</span>
            <input value={category} onChange={(event) => setCategory(event.target.value)} />
          </label>
          <label>
            <span>Tags</span>
            <input value={tags} onChange={(event) => setTags(event.target.value)} />
          </label>
          <button type="button" className="button button-secondary" onClick={saveMetadata}>
            Save metadata
          </button>
        </div>
        <div className="version-history-list">
          <p className="eyebrow">Version history</p>
          {master.versions.map((version) => (
            <button
              type="button"
              key={version.id}
              className={version.id === selectedVersionId ? 'is-selected' : ''}
              onClick={() => setVersion(master, version)}
            >
              <span>v{version.version}</span>
              <small>{version.status}</small>
            </button>
          ))}
        </div>
      </aside>

      <section className="editor-canvas workspace-grid" aria-label="Master slide canvas">
        {compare && published && draft ? (
          <div className="master-comparison">
            <figure>
              <SlideRenderer document={published.document} />
              <figcaption>Published v{published.version}</figcaption>
            </figure>
            <figure>
              <SlideRenderer document={draft.document} />
              <figcaption>Draft v{draft.version}</figcaption>
            </figure>
          </div>
        ) : (
          <div className="canvas-frame">
            <SlideRenderer
              document={document}
              interactive={editable}
              selectedElementIds={selectedElementId ? [selectedElementId] : []}
              onSelectElement={(elementId) => setSelectedElementId(elementId)}
              onElementPointerDown={(elementId, event) =>
                pointerTransform(elementId, event, 'move')
              }
              onResizePointerDown={(elementId, handle, event) =>
                pointerTransform(elementId, event, 'resize', handle)
              }
              onTextChange={(elementId, text) =>
                updateElement(elementId, (element) =>
                  element.type === 'text' ? { ...element, text } : element,
                )
              }
            />
          </div>
        )}
        {error && (
          <button type="button" className="canvas-alert" onClick={() => setError(null)}>
            {error}
          </button>
        )}
      </section>

      <Inspector
        slide={inspectorSlide}
        element={selectedElement}
        editable={editable}
        revision={selectedVersion?.revision ?? 0}
        accessRole="owner"
        onUpdateElement={updateElement}
        onUpdateNotes={() => {}}
        showNotes={false}
      />
    </main>
  );
}
