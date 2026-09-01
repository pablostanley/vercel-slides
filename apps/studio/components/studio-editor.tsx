'use client';

import {
  cloneMasterDocument,
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
import { upload } from '@vercel/blob/client';
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  ChevronLeft,
  Code2,
  Copy,
  Image as ImageIcon,
  Lock,
  LockOpen,
  Play,
  Plus,
  Redo2,
  Share2,
  Square,
  Table2,
  Trash2,
  Type,
  Undo2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { DeckAccess, DeckSlide, PublishedMaster } from '@/lib/models';
import { uploadPathname } from '@/lib/server/asset-upload';
import type { SessionIdentity } from '@/lib/server/auth';
import { ShareDialog } from './share-dialog';
import { TemplatePicker } from './template-picker';

type SaveState = 'saving' | 'saved' | 'offline' | 'conflict';
type EditorSnapshot = { slides: DeckSlide[]; selectedSlideId: string | null };
type RequestBody = Record<string, unknown>;

function cloneDocument(document: SlideDocument, slideId = document.id) {
  return cloneMasterDocument(document, slideId, () => `element:${crypto.randomUUID()}`);
}

function now() {
  return new Date().toISOString();
}

function createSlide(id: string, document: SlideDocument, position: number): DeckSlide {
  const timestamp = now();
  return {
    id,
    deckId: '',
    position,
    masterSlideId: null,
    masterVersionId: null,
    schemaVersion: document.schemaVersion,
    document,
    notes: '',
    revision: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function slideRestorePayload(slides: DeckSlide[]) {
  return slides.map((slide) => ({
    id: slide.id,
    document: slide.document,
    notes: slide.notes,
    masterSlideId: slide.masterSlideId,
    masterVersionId: slide.masterVersionId,
  }));
}

export function textElement(): SlideElement {
  return {
    id: `element:${crypto.randomUUID()}`,
    type: 'text',
    x: 180,
    y: 160,
    width: 900,
    height: 140,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    zIndex: 10,
    text: 'Type something',
    style: {
      fontFamily: 'geist-sans',
      fontSize: 64,
      fontWeight: 500,
      lineHeight: 1.05,
      letterSpacing: -1,
      color: '#000000',
      align: 'left',
      verticalAlign: 'top',
    },
  };
}

export function shapeElement(): SlideElement {
  return {
    id: `element:${crypto.randomUUID()}`,
    type: 'shape',
    x: 300,
    y: 260,
    width: 480,
    height: 300,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    zIndex: 10,
    shape: 'rectangle',
    style: { fill: '#000000', strokeWidth: 0, radius: 12 },
  };
}

export function chartElement(): SlideElement {
  return {
    id: `element:${crypto.randomUUID()}`,
    type: 'chart',
    x: 180,
    y: 250,
    width: 1100,
    height: 560,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    zIndex: 10,
    chart: 'bar',
    categories: ['Q1', 'Q2', 'Q3', 'Q4'],
    series: [
      {
        id: `series:${crypto.randomUUID()}`,
        name: 'Series',
        values: [24, 42, 68, 92],
        color: '#000000',
      },
    ],
    showLegend: false,
    showAxes: true,
    showGrid: true,
    style: { fill: '#ffffff', strokeWidth: 0, radius: 0 },
  };
}

export function tableElement(): SlideElement {
  return {
    id: `element:${crypto.randomUUID()}`,
    type: 'table',
    x: 180,
    y: 230,
    width: 1200,
    height: 480,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    zIndex: 10,
    columns: [1, 1, 1],
    rows: [
      [
        { value: 'Metric', colspan: 1, rowspan: 1 },
        { value: 'Now', colspan: 1, rowspan: 1 },
        { value: 'Next', colspan: 1, rowspan: 1 },
      ],
      [
        { value: 'Adoption', colspan: 1, rowspan: 1 },
        { value: '62%', colspan: 1, rowspan: 1 },
        { value: '85%', colspan: 1, rowspan: 1 },
      ],
    ],
    headerRows: 1,
    style: {
      text: {
        fontFamily: 'geist-sans',
        fontSize: 28,
        fontWeight: 400,
        lineHeight: 1.2,
        letterSpacing: 0,
        color: '#000000',
        align: 'left',
        verticalAlign: 'middle',
      },
      headerText: {
        fontFamily: 'geist-sans',
        fontSize: 28,
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: 0,
        color: '#ffffff',
        align: 'left',
        verticalAlign: 'middle',
      },
      fill: '#ffffff',
      headerFill: '#000000',
      border: '#d4d4d4',
      borderWidth: 2,
      padding: 22,
    },
  };
}

export function codeElement(): SlideElement {
  return {
    id: `element:${crypto.randomUUID()}`,
    type: 'code',
    x: 180,
    y: 200,
    width: 1220,
    height: 600,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    zIndex: 10,
    code: "export function ship() {\n  return 'ready';\n}",
    language: 'typescript',
    theme: 'dark',
    showLineNumbers: true,
    highlightedLines: [],
    style: { fill: '#111111', strokeWidth: 0, radius: 16 },
  };
}

export function StudioEditor({
  session,
  initialAccess,
  testAssetUploads = false,
}: {
  session: SessionIdentity;
  initialAccess: DeckAccess;
  testAssetUploads?: boolean;
}) {
  const editable = initialAccess.role !== 'viewer';
  const initialSelected = initialAccess.slides[0]?.id ?? null;
  const [history, setHistory] = useState(() =>
    createHistory<EditorSnapshot>({
      slides: structuredClone(initialAccess.slides),
      selectedSlideId: initialSelected,
    }),
  );
  const historyRef = useRef(history);
  const [title, setTitle] = useState(initialAccess.deck.title);
  const [revision, setRevision] = useState(initialAccess.deck.revision);
  const revisionRef = useRef(revision);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [masters, setMasters] = useState<PublishedMaster[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [assetError, setAssetError] = useState<string | null>(null);
  const [conflictRemote, setConflictRemote] = useState<DeckAccess | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const requestQueue = useRef<Promise<void>>(Promise.resolve());
  const lastFailedRequest = useRef<(() => Promise<void>) | null>(null);
  const dragSlideId = useRef<string | null>(null);
  const copiedElements = useRef<SlideElement[]>([]);

  const slides = history.present.slides;
  const selectedSlide =
    slides.find((slide) => slide.id === history.present.selectedSlideId) ?? null;
  const selectedElements = selectedSlide
    ? selectedSlide.document.elements.filter((element) => selectedElementIds.includes(element.id))
    : [];
  const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;

  const replaceHistory = useCallback((next: typeof history) => {
    historyRef.current = next;
    setHistory(next);
  }, []);

  const enqueueRequest = useCallback(
    (path: string, method: 'PATCH' | 'PUT', body: RequestBody) => {
      const execute = async () => {
        setSaveState('saving');
        try {
          const response = await fetch(path, {
            method,
            headers: {
              'content-type': 'application/json',
              'x-csrf-token': session.csrfToken,
            },
            body: JSON.stringify({ ...body, expectedRevision: revisionRef.current }),
          });
          const result = await response.json();
          if (response.status === 409) {
            const latestResponse = await fetch(`/api/decks/${initialAccess.deck.id}`);
            if (latestResponse.ok) setConflictRemote(await latestResponse.json());
            setSaveState('conflict');
            return;
          }
          if (!response.ok) throw new Error(result.error?.message ?? 'Save failed');
          const nextRevision = result.access?.deck.revision ?? result.deck?.revision;
          if (typeof nextRevision === 'number') {
            revisionRef.current = nextRevision;
            setRevision(nextRevision);
          }
          lastFailedRequest.current = null;
          setSaveState('saved');
        } catch {
          lastFailedRequest.current = execute;
          setSaveState('offline');
        }
      };
      requestQueue.current = requestQueue.current.then(execute, execute);
    },
    [initialAccess.deck.id, session.csrfToken],
  );

  useEffect(() => {
    fetch('/api/templates/vercel/masters')
      .then((response) => (response.ok ? response.json() : { masters: [] }))
      .then((result) => setMasters(result.masters ?? []))
      .catch(() => setMasters([]));
  }, []);

  useEffect(() => {
    function retry() {
      if (!lastFailedRequest.current) return;
      const task = lastFailedRequest.current;
      lastFailedRequest.current = null;
      requestQueue.current = requestQueue.current.then(task, task);
    }
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, []);

  useEffect(
    () => () => {
      for (const timer of saveTimers.current.values()) clearTimeout(timer);
    },
    [],
  );

  function commitSnapshot(snapshot: EditorSnapshot) {
    replaceHistory(commitHistory(historyRef.current, snapshot));
  }

  function scheduleSlideSave(slide: DeckSlide, delay = 500) {
    const previous = saveTimers.current.get(slide.id);
    if (previous) clearTimeout(previous);
    setSaveState('saving');
    const timer = setTimeout(() => {
      saveTimers.current.delete(slide.id);
      enqueueRequest(`/api/decks/${initialAccess.deck.id}/slides`, 'PUT', {
        operation: 'update',
        slideId: slide.id,
        document: slide.document,
        notes: slide.notes,
      });
    }, delay);
    saveTimers.current.set(slide.id, timer);
  }

  function updateSelectedSlide(
    update: (slide: DeckSlide) => DeckSlide,
    options: { commit?: boolean; save?: boolean } = {},
  ) {
    if (!selectedSlide || !editable) return;
    const nextSlides = slides.map((slide) =>
      slide.id === selectedSlide.id ? update(slide) : slide,
    );
    const snapshot = { ...history.present, slides: nextSlides };
    if (options.commit === false) {
      const next = { ...historyRef.current, present: structuredClone(snapshot) };
      replaceHistory(next);
    } else {
      commitSnapshot(snapshot);
    }
    if (options.save !== false) {
      const nextSlide = nextSlides.find((slide) => slide.id === selectedSlide.id);
      if (nextSlide) scheduleSlideSave(nextSlide);
    }
  }

  function updateDocument(document: SlideDocument, options?: { commit?: boolean; save?: boolean }) {
    const parsed = slideDocumentSchema.parse(document);
    updateSelectedSlide((slide) => ({ ...slide, document: parsed, updatedAt: now() }), options);
  }

  function updateElement(elementId: string, updater: (element: SlideElement) => SlideElement) {
    if (!selectedSlide) return;
    updateDocument({
      ...selectedSlide.document,
      elements: selectedSlide.document.elements.map((element) =>
        element.id === elementId ? updater(element) : element,
      ),
    });
  }

  function insertElement(element: SlideElement) {
    if (!selectedSlide) return;
    const zIndex = Math.max(0, ...selectedSlide.document.elements.map((item) => item.zIndex)) + 1;
    updateDocument({
      ...selectedSlide.document,
      elements: [...selectedSlide.document.elements, { ...element, zIndex }],
    });
    setSelectedElementIds([element.id]);
  }

  function structuralChange(
    nextSlides: DeckSlide[],
    selectedSlideId: string | null,
    request: RequestBody,
  ) {
    const positioned = nextSlides.map((slide, position) => ({ ...slide, position }));
    commitSnapshot({ slides: positioned, selectedSlideId });
    setSelectedElementIds([]);
    enqueueRequest(`/api/decks/${initialAccess.deck.id}/slides`, 'PUT', request);
  }

  function insertMaster(master: PublishedMaster) {
    const slideId = `slide:${crypto.randomUUID()}`;
    const document = cloneDocument(master.version.document, slideId);
    const slide = {
      ...createSlide(slideId, document, 0),
      deckId: initialAccess.deck.id,
      masterSlideId: master.id,
      masterVersionId: master.version.id,
    };
    const selectedIndex = selectedSlide
      ? slides.findIndex((candidate) => candidate.id === selectedSlide.id)
      : -1;
    const next = [...slides];
    next.splice(selectedIndex + 1, 0, slide);
    structuralChange(next, slideId, {
      operation: 'insert-master',
      slideId,
      afterSlideId: selectedSlide?.id ?? null,
      masterVersionId: master.version.id,
    });
    setPickerOpen(false);
  }

  function insertBlank() {
    const slideId = `slide:${crypto.randomUUID()}`;
    const slide = {
      ...createSlide(slideId, createBlankSlideDocument(slideId), 0),
      deckId: initialAccess.deck.id,
    };
    const selectedIndex = selectedSlide
      ? slides.findIndex((candidate) => candidate.id === selectedSlide.id)
      : -1;
    const next = [...slides];
    next.splice(selectedIndex + 1, 0, slide);
    structuralChange(next, slideId, {
      operation: 'insert-blank',
      slideId,
      afterSlideId: selectedSlide?.id ?? null,
    });
  }

  function duplicateSlide(slideId = selectedSlide?.id) {
    if (!slideId) return;
    const sourceIndex = slides.findIndex((slide) => slide.id === slideId);
    if (sourceIndex < 0) return;
    const source = slides[sourceIndex];
    const newSlideId = `slide:${crypto.randomUUID()}`;
    const duplicate = {
      ...structuredClone(source),
      id: newSlideId,
      document: cloneDocument(source.document, newSlideId),
      createdAt: now(),
      updatedAt: now(),
      revision: 0,
    };
    const next = [...slides];
    next.splice(sourceIndex + 1, 0, duplicate);
    structuralChange(next, newSlideId, {
      operation: 'duplicate',
      slideId,
      newSlideId,
    });
  }

  function deleteSlide(slideId = selectedSlide?.id) {
    if (!slideId) return;
    const index = slides.findIndex((slide) => slide.id === slideId);
    if (index < 0) return;
    const next = slides.filter((slide) => slide.id !== slideId);
    const nextSelected = next[Math.min(index, Math.max(0, next.length - 1))]?.id ?? null;
    structuralChange(next, nextSelected, { operation: 'delete', slideId });
  }

  function reorderSlides(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    const next = [...slides];
    const sourceIndex = next.findIndex((slide) => slide.id === sourceId);
    const targetIndex = next.findIndex((slide) => slide.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    structuralChange(next, sourceId, {
      operation: 'reorder',
      slideIds: next.map((slide) => slide.id),
    });
  }

  function moveSelected(direction: -1 | 1) {
    if (!selectedSlide) return;
    const index = slides.findIndex((slide) => slide.id === selectedSlide.id);
    const target = slides[index + direction];
    if (target) reorderSlides(selectedSlide.id, target.id);
  }

  const restoreHistory = useCallback(
    (next: typeof history) => {
      if (next === historyRef.current) return;
      replaceHistory(next);
      setSelectedElementIds([]);
      enqueueRequest(`/api/decks/${initialAccess.deck.id}/slides`, 'PUT', {
        operation: 'restore',
        slides: slideRestorePayload(next.present.slides),
      });
    },
    [enqueueRequest, initialAccess.deck.id, replaceHistory],
  );

  const undo = useCallback(() => restoreHistory(undoHistory(historyRef.current)), [restoreHistory]);
  const redo = useCallback(() => restoreHistory(redoHistory(historyRef.current)), [restoreHistory]);

  const keyboardState = useRef({
    duplicateSlide,
    editable,
    redo,
    replaceHistory,
    selectedElementIds,
    selectedElements,
    selectedSlide,
    undo,
    updateDocument,
  });
  keyboardState.current = {
    duplicateSlide,
    editable,
    redo,
    replaceHistory,
    selectedElementIds,
    selectedElements,
    selectedSlide,
    undo,
    updateDocument,
  };

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const actions = keyboardState.current;
      const target = event.target as HTMLElement;
      const isTextInput =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable;
      const modifier = event.metaKey || event.ctrlKey;
      if (modifier && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        event.shiftKey ? actions.redo() : actions.undo();
        return;
      }
      if (!actions.editable || isTextInput) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const current = historyRef.current.present;
        const index = current.slides.findIndex((slide) => slide.id === current.selectedSlideId);
        const next = current.slides[index + (event.key === 'ArrowLeft' ? -1 : 1)];
        if (next) {
          event.preventDefault();
          actions.replaceHistory({
            ...historyRef.current,
            present: { ...current, selectedSlideId: next.id },
          });
          setSelectedElementIds([]);
        }
      }
      if (
        (event.key === 'Backspace' || event.key === 'Delete') &&
        actions.selectedElementIds.length > 0
      ) {
        event.preventDefault();
        const current = historyRef.current.present;
        const slide = current.slides.find((item) => item.id === current.selectedSlideId);
        if (!slide) return;
        const document = {
          ...slide.document,
          elements: slide.document.elements.filter(
            (element) => !actions.selectedElementIds.includes(element.id),
          ),
        };
        actions.updateDocument(document);
        setSelectedElementIds([]);
      }
      if (modifier && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        actions.duplicateSlide();
      }
      if (modifier && event.key.toLowerCase() === 'c' && actions.selectedElements.length > 0) {
        copiedElements.current = structuredClone(actions.selectedElements);
      }
      if (modifier && event.key.toLowerCase() === 'v' && copiedElements.current.length > 0) {
        event.preventDefault();
        const copies = copiedElements.current.map((element) => ({
          ...structuredClone(element),
          id: `element:${crypto.randomUUID()}`,
          x: element.x + 24,
          y: element.y + 24,
        }));
        if (actions.selectedSlide) {
          actions.updateDocument({
            ...actions.selectedSlide.document,
            elements: [...actions.selectedSlide.document.elements, ...copies],
          });
          setSelectedElementIds(copies.map((element) => element.id));
        }
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function pointerTransform(
    elementId: string,
    event: React.PointerEvent<SVGGElement | SVGCircleElement>,
    kind: 'move' | 'resize',
    handle: 'nw' | 'ne' | 'sw' | 'se' = 'se',
  ) {
    if (!selectedSlide || event.detail > 1 || event.target instanceof HTMLTextAreaElement) return;
    const svg = event.currentTarget.ownerSVGElement;
    const element = selectedSlide.document.elements.find((item) => item.id === elementId);
    if (!svg || !element) return;
    const activeSlide = selectedSlide;
    const activeElement = element;
    const originalHistory = structuredClone(historyRef.current);
    const startX = event.clientX;
    const startY = event.clientY;
    const rect = svg.getBoundingClientRect();
    let latestDocument = activeSlide.document;
    function onMove(moveEvent: PointerEvent) {
      const dx = ((moveEvent.clientX - startX) / rect.width) * 1920;
      const dy = ((moveEvent.clientY - startY) / rect.height) * 1080;
      latestDocument = {
        ...activeSlide.document,
        elements: activeSlide.document.elements.map((item) => {
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
      };
      updateDocument(latestDocument, { commit: false, save: false });
    }
    function onUp() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      const current = historyRef.current.present;
      replaceHistory({
        past: [...originalHistory.past, originalHistory.present].slice(-100),
        present: current,
        future: [],
      });
      const slide = current.slides.find((item) => item.id === current.selectedSlideId);
      if (slide) scheduleSlideSave(slide);
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  }

  async function addImage(file: File) {
    if (!selectedSlide) return;
    setAssetError(null);
    try {
      const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const image = new Image();
        const url = URL.createObjectURL(file);
        image.onload = () => {
          URL.revokeObjectURL(url);
          resolve({ width: image.naturalWidth, height: image.naturalHeight });
        };
        image.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Could not read image'));
        };
        image.src = url;
      });
      let imageUrl: string;
      if (testAssetUploads) {
        const form = new FormData();
        form.set('file', file);
        form.set('deckId', initialAccess.deck.id);
        form.set('width', String(dimensions.width));
        form.set('height', String(dimensions.height));
        const response = await fetch('/api/assets/test-upload', {
          method: 'POST',
          headers: { 'x-csrf-token': session.csrfToken },
          body: form,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error?.message ?? 'Image upload failed');
        imageUrl = result.url;
      } else {
        const blob = await upload(
          uploadPathname(session.id, initialAccess.deck.id, file.name),
          file,
          {
            access: 'public',
            handleUploadUrl: '/api/assets/upload',
            headers: { 'x-csrf-token': session.csrfToken },
            clientPayload: JSON.stringify({
              deckId: initialAccess.deck.id,
              size: file.size,
              width: dimensions.width,
              height: dimensions.height,
            }),
          },
        );
        imageUrl = blob.url;
      }
      insertElement({
        id: `element:${crypto.randomUUID()}`,
        type: 'image',
        x: 260,
        y: 180,
        width: 960,
        height: 600,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: 10,
        src: imageUrl,
        alt: file.name,
        fit: 'cover',
        style: { strokeWidth: 0, radius: 12 },
      });
    } catch (error) {
      setAssetError(error instanceof Error ? error.message : 'Image upload failed');
    }
  }

  async function resolveConflict(choice: 'local' | 'server') {
    if (!conflictRemote) return;
    if (choice === 'server') {
      const snapshot = {
        slides: structuredClone(conflictRemote.slides),
        selectedSlideId: conflictRemote.slides[0]?.id ?? null,
      };
      replaceHistory(createHistory(snapshot));
      revisionRef.current = conflictRemote.deck.revision;
      setRevision(conflictRemote.deck.revision);
      setTitle(conflictRemote.deck.title);
      setConflictRemote(null);
      setSaveState('saved');
      return;
    }
    const response = await fetch(`/api/decks/${initialAccess.deck.id}/slides`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'x-csrf-token': session.csrfToken },
      body: JSON.stringify({
        operation: 'restore',
        expectedRevision: conflictRemote.deck.revision,
        slides: slideRestorePayload(historyRef.current.present.slides),
      }),
    });
    const result = await response.json();
    if (!response.ok) return;
    revisionRef.current = result.access.deck.revision;
    setRevision(result.access.deck.revision);
    setConflictRemote(null);
    setSaveState('saved');
  }

  function saveTitle() {
    const normalized = title.trim();
    if (!normalized || normalized === initialAccess.deck.title || !editable) return;
    enqueueRequest(`/api/decks/${initialAccess.deck.id}`, 'PATCH', {
      title: normalized,
    });
  }

  return (
    <main className="editor-shell">
      <header className="editor-toolbar">
        <a href="/" className="icon-button" aria-label="Back to presentations">
          <ChevronLeft size={17} />
        </a>
        <input
          className="title-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={saveTitle}
          aria-label="Presentation title"
          readOnly={!editable}
        />
        <button
          type="button"
          className={`save-state save-${saveState}`}
          onClick={() => lastFailedRequest.current?.()}
          aria-label={saveState === 'offline' ? 'Retry save' : `Save state: ${saveState}`}
        >
          {saveState === 'saving'
            ? 'Saving…'
            : saveState === 'offline'
              ? 'Offline · Retry'
              : saveState === 'conflict'
                ? 'Conflict'
                : 'Saved'}
        </button>
        {editable && (
          <div className="history-controls">
            <button
              type="button"
              className="icon-button"
              onClick={undo}
              disabled={history.past.length === 0}
              aria-label="Undo"
            >
              <Undo2 size={15} />
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={redo}
              disabled={history.future.length === 0}
              aria-label="Redo"
            >
              <Redo2 size={15} />
            </button>
          </div>
        )}
        {editable && (
          <button
            type="button"
            className="icon-button toolbar-add-slide"
            onClick={() => setPickerOpen(true)}
            aria-label="Add slide"
          >
            <Plus size={16} />
          </button>
        )}
        <div className="insert-controls" role="toolbar" aria-label="Insert element">
          {editable && selectedSlide && (
            <>
              <button
                type="button"
                className="icon-button"
                onClick={() => insertElement(textElement())}
                aria-label="Insert text"
              >
                <Type size={15} />
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Insert image"
              >
                <ImageIcon size={15} />
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={() => insertElement(shapeElement())}
                aria-label="Insert shape"
              >
                <Square size={15} />
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={() => insertElement(chartElement())}
                aria-label="Insert chart"
              >
                <BarChart3 size={15} />
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={() => insertElement(tableElement())}
                aria-label="Insert table"
              >
                <Table2 size={15} />
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={() => insertElement(codeElement())}
                aria-label="Insert code"
              >
                <Code2 size={15} />
              </button>
              <input
                ref={fileInputRef}
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) addImage(file);
                  event.target.value = '';
                }}
              />
            </>
          )}
        </div>
        <div className="toolbar-spacer" />
        <button
          type="button"
          className="button button-secondary"
          onClick={() => setShareOpen(true)}
        >
          <Share2 size={14} /> Share
        </button>
        <a className="button button-primary" href={`/decks/${initialAccess.deck.id}/present`}>
          <Play size={14} /> Present
        </a>
      </header>

      <aside className="slide-rail" aria-label="Slides">
        <ul className="slide-list">
          {slides.map((slide, index) => (
            <li
              className={`slide-row ${selectedSlide?.id === slide.id ? 'is-selected' : ''}`}
              key={slide.id}
              draggable={editable}
              onDragStart={() => {
                dragSlideId.current = slide.id;
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragSlideId.current) reorderSlides(dragSlideId.current, slide.id);
                dragSlideId.current = null;
              }}
            >
              <button
                type="button"
                className="slide-thumbnail-button"
                onClick={() => {
                  replaceHistory({
                    ...historyRef.current,
                    present: { ...historyRef.current.present, selectedSlideId: slide.id },
                  });
                  setSelectedElementIds([]);
                }}
                aria-label={`Select slide ${index + 1}`}
                aria-current={selectedSlide?.id === slide.id ? 'true' : undefined}
              >
                <span>{index + 1}</span>
                <span className="rail-thumbnail">
                  <SlideRenderer document={slide.document} />
                </span>
              </button>
              {editable && selectedSlide?.id === slide.id && (
                <div className="slide-actions">
                  <button type="button" onClick={() => moveSelected(-1)} aria-label="Move slide up">
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSelected(1)}
                    aria-label="Move slide down"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateSlide(slide.id)}
                    aria-label="Duplicate slide"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSlide(slide.id)}
                    aria-label="Delete slide"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
              {editable && selectedSlide?.id === slide.id && (
                <button
                  type="button"
                  className="rail-insert"
                  onClick={() => setPickerOpen(true)}
                  aria-label={`Add slide after slide ${index + 1}`}
                >
                  <Plus size={13} />
                </button>
              )}
            </li>
          ))}
        </ul>
        {editable && (
          <button type="button" className="add-slide-rail" onClick={() => setPickerOpen(true)}>
            <Plus size={16} /> Add slide
          </button>
        )}
      </aside>

      <section className="editor-canvas workspace-grid" aria-label="Slide canvas">
        {selectedSlide ? (
          <div
            className="canvas-frame"
            onPointerDown={(event) => {
              if (event.currentTarget === event.target) setSelectedElementIds([]);
            }}
          >
            <SlideRenderer
              document={selectedSlide.document}
              interactive={editable}
              selectedElementIds={selectedElementIds}
              onSelectElement={(elementId, additive) =>
                setSelectedElementIds((current) =>
                  additive
                    ? current.includes(elementId)
                      ? current.filter((id) => id !== elementId)
                      : [...current, elementId]
                    : [elementId],
                )
              }
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
        ) : (
          <div className="empty-deck">
            <div className="empty-slide-preview" />
            <h1>Add your first slide</h1>
            <p>Choose a published Vercel master or begin with a blank canvas.</p>
            <div className="empty-actions">
              <button
                type="button"
                className="button button-primary button-large"
                onClick={() => setPickerOpen(true)}
              >
                <Plus size={16} /> Browse slide templates
              </button>
              <button
                type="button"
                className="button button-secondary button-large"
                onClick={insertBlank}
              >
                Start blank
              </button>
            </div>
          </div>
        )}
        {assetError && (
          <button type="button" className="canvas-alert" onClick={() => setAssetError(null)}>
            {assetError}
          </button>
        )}
      </section>

      <Inspector
        slide={selectedSlide}
        element={selectedElement}
        editable={editable}
        revision={revision}
        accessRole={initialAccess.role}
        onUpdateElement={updateElement}
        onUpdateNotes={(notes) =>
          updateSelectedSlide((slide) => ({ ...slide, notes, updatedAt: now() }))
        }
      />

      {pickerOpen && (
        <TemplatePicker
          masters={masters}
          onClose={() => setPickerOpen(false)}
          onInsert={insertMaster}
        />
      )}
      {shareOpen && (
        <ShareDialog
          deckId={initialAccess.deck.id}
          deckRole={initialAccess.role}
          session={session}
          onClose={() => setShareOpen(false)}
        />
      )}
      {saveState === 'conflict' && conflictRemote && (
        <div className="modal-backdrop">
          <section
            className="conflict-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="conflict-title"
          >
            <p className="eyebrow">Revision conflict</p>
            <h2 id="conflict-title">This presentation changed elsewhere.</h2>
            <p>Your unsaved version is still open. Choose which copy should continue.</p>
            <div>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => resolveConflict('server')}
              >
                Use latest saved copy
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={() => resolveConflict('local')}
              >
                Save my open copy
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="inspector-field compact-field">
      <span>{label}</span>
      <input
        type="number"
        value={Math.round(value * 100) / 100}
        min={min}
        max={max}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export function Inspector({
  slide,
  element,
  editable,
  revision,
  accessRole,
  onUpdateElement,
  onUpdateNotes,
  showNotes = true,
}: {
  slide: DeckSlide | null;
  element: SlideElement | null;
  editable: boolean;
  revision: number;
  accessRole: DeckAccess['role'];
  onUpdateElement: (elementId: string, update: (element: SlideElement) => SlideElement) => void;
  onUpdateNotes: (notes: string) => void;
  showNotes?: boolean;
}) {
  const update = (patch: Partial<SlideElement>) => {
    if (element)
      onUpdateElement(element.id, (current) => ({ ...current, ...patch }) as SlideElement);
  };
  const box =
    element && ['shape', 'image', 'chart', 'code'].includes(element.type)
      ? (element as Extract<SlideElement, { type: 'shape' | 'image' | 'chart' | 'code' }>)
      : null;
  return (
    <aside className="inspector-panel" aria-label="Inspector">
      <div className="inspector-scroll">
        <p className="eyebrow">{element ? element.type : 'Presentation'}</p>
        {element ? (
          <>
            {element.type === 'text' && (
              <label className="inspector-field">
                <span>Content</span>
                <textarea
                  value={element.text}
                  readOnly={!editable}
                  onChange={(event) =>
                    update({ text: event.target.value } as Partial<SlideElement>)
                  }
                />
              </label>
            )}
            {element.type === 'richText' && (
              <label className="inspector-field">
                <span>Content</span>
                <textarea
                  value={element.paragraphs
                    .map((paragraph) => paragraph.runs.map((run) => run.text).join(''))
                    .join('\n')}
                  readOnly={!editable}
                  onChange={(event) =>
                    update({
                      paragraphs: event.target.value.split('\n').map((text, index) => ({
                        id: `paragraph:${index + 1}`,
                        runs: [{ id: `paragraph:${index + 1}:run:1`, text }],
                      })),
                    } as Partial<SlideElement>)
                  }
                />
              </label>
            )}
            {element.type === 'list' && (
              <label className="inspector-field">
                <span>Items</span>
                <textarea
                  value={element.items.join('\n')}
                  readOnly={!editable}
                  onChange={(event) =>
                    update({ items: event.target.value.split('\n') } as Partial<SlideElement>)
                  }
                />
              </label>
            )}
            {element.type === 'metric' && (
              <div className="inspector-grid">
                <label className="inspector-field compact-field">
                  <span>Value</span>
                  <input
                    value={element.value}
                    readOnly={!editable}
                    onChange={(event) =>
                      update({ value: event.target.value } as Partial<SlideElement>)
                    }
                  />
                </label>
                <label className="inspector-field compact-field">
                  <span>Label</span>
                  <input
                    value={element.label}
                    readOnly={!editable}
                    onChange={(event) =>
                      update({ label: event.target.value } as Partial<SlideElement>)
                    }
                  />
                </label>
              </div>
            )}
            {element.type === 'image' && (
              <>
                <label className="inspector-field">
                  <span>Image URL</span>
                  <input
                    value={element.src}
                    readOnly={!editable}
                    onChange={(event) =>
                      update({ src: event.target.value } as Partial<SlideElement>)
                    }
                  />
                </label>
                <label className="inspector-field">
                  <span>Alternative text</span>
                  <input
                    value={element.alt}
                    readOnly={!editable}
                    onChange={(event) =>
                      update({ alt: event.target.value } as Partial<SlideElement>)
                    }
                  />
                </label>
              </>
            )}
            {element.type === 'shape' && (
              <label className="inspector-field">
                <span>Shape</span>
                <select
                  value={element.shape}
                  disabled={!editable}
                  onChange={(event) =>
                    update({ shape: event.target.value } as Partial<SlideElement>)
                  }
                >
                  <option value="rectangle">Rectangle</option>
                  <option value="ellipse">Ellipse</option>
                  <option value="pill">Pill</option>
                  <option value="triangle">Triangle</option>
                  <option value="diamond">Diamond</option>
                </select>
              </label>
            )}
            {element.type === 'chart' && (
              <>
                <label className="inspector-field">
                  <span>Categories</span>
                  <textarea
                    value={element.categories.join('\n')}
                    readOnly={!editable}
                    onChange={(event) =>
                      update({
                        categories: event.target.value.split('\n').filter(Boolean),
                      } as Partial<SlideElement>)
                    }
                  />
                </label>
                <label className="inspector-field">
                  <span>Values</span>
                  <input
                    value={element.series[0]?.values.join(', ') ?? ''}
                    readOnly={!editable}
                    onChange={(event) => {
                      const values = event.target.value.split(',').map((value) => {
                        const number = Number(value.trim());
                        return Number.isFinite(number) ? number : null;
                      });
                      update({
                        series: element.series.map((series, index) =>
                          index === 0 ? { ...series, values } : series,
                        ),
                      } as Partial<SlideElement>);
                    }}
                  />
                </label>
              </>
            )}
            {element.type === 'table' && (
              <label className="inspector-field">
                <span>Cells (tab-separated)</span>
                <textarea
                  value={element.rows
                    .map((row) => row.map((cell) => cell.value).join('\t'))
                    .join('\n')}
                  readOnly={!editable}
                  onChange={(event) => {
                    const rows = event.target.value
                      .split('\n')
                      .map((row) =>
                        row.split('\t').map((value) => ({ value, colspan: 1, rowspan: 1 })),
                      );
                    const columnCount = Math.max(1, ...rows.map((row) => row.length));
                    update({
                      rows,
                      columns: Array.from({ length: columnCount }, () => 1),
                    } as Partial<SlideElement>);
                  }}
                />
              </label>
            )}
            {element.type === 'code' && (
              <label className="inspector-field">
                <span>Code</span>
                <textarea
                  className="code-input"
                  value={element.code}
                  readOnly={!editable}
                  onChange={(event) =>
                    update({ code: event.target.value } as Partial<SlideElement>)
                  }
                />
              </label>
            )}
            <div className="inspector-grid">
              <NumberField label="X" value={element.x} onChange={(x) => update({ x })} />
              <NumberField label="Y" value={element.y} onChange={(y) => update({ y })} />
              <NumberField
                label="W"
                min={1}
                value={element.width}
                onChange={(width) => update({ width })}
              />
              <NumberField
                label="H"
                min={1}
                value={element.height}
                onChange={(height) => update({ height })}
              />
              <NumberField
                label="Rotate"
                value={element.rotation}
                onChange={(rotation) => update({ rotation })}
              />
              <NumberField
                label="Opacity"
                min={0}
                max={1}
                value={element.opacity}
                onChange={(opacity) => update({ opacity })}
              />
            </div>
            {element.type === 'text' && (
              <div className="inspector-grid">
                <NumberField
                  label="Size"
                  min={1}
                  value={element.style.fontSize}
                  onChange={(fontSize) =>
                    update({ style: { ...element.style, fontSize } } as Partial<SlideElement>)
                  }
                />
                <NumberField
                  label="Weight"
                  min={100}
                  max={900}
                  value={element.style.fontWeight}
                  onChange={(fontWeight) =>
                    update({ style: { ...element.style, fontWeight } } as Partial<SlideElement>)
                  }
                />
                <label className="inspector-field compact-field">
                  <span>Color</span>
                  <input
                    type="color"
                    value={element.style.color}
                    onChange={(event) =>
                      update({
                        style: { ...element.style, color: event.target.value },
                      } as Partial<SlideElement>)
                    }
                  />
                </label>
              </div>
            )}
            {box && (
              <div className="inspector-grid">
                <label className="inspector-field compact-field">
                  <span>Fill</span>
                  <input
                    value={box.style.fill ?? '#ffffff'}
                    onChange={(event) =>
                      update({
                        style: { ...box.style, fill: event.target.value },
                      } as Partial<SlideElement>)
                    }
                  />
                </label>
                <label className="inspector-field compact-field">
                  <span>Border</span>
                  <input
                    type="color"
                    value={box.style.stroke ?? '#000000'}
                    onChange={(event) =>
                      update({
                        style: { ...box.style, stroke: event.target.value },
                      } as Partial<SlideElement>)
                    }
                  />
                </label>
                <NumberField
                  label="Border width"
                  min={0}
                  value={box.style.strokeWidth}
                  onChange={(strokeWidth) =>
                    update({ style: { ...box.style, strokeWidth } } as Partial<SlideElement>)
                  }
                />
                <NumberField
                  label="Radius"
                  min={0}
                  value={box.style.radius}
                  onChange={(radius) =>
                    update({ style: { ...box.style, radius } } as Partial<SlideElement>)
                  }
                />
              </div>
            )}
            <div className="layer-controls">
              <button
                type="button"
                onClick={() => update({ visible: !element.visible })}
                disabled={!editable}
              >
                {element.visible ? 'Visible' : 'Hidden'}
              </button>
              <button
                type="button"
                onClick={() => update({ locked: !element.locked })}
                disabled={!editable}
              >
                {element.locked ? <Lock size={13} /> : <LockOpen size={13} />}
                {element.locked ? 'Locked' : 'Unlocked'}
              </button>
            </div>
          </>
        ) : (
          <dl>
            <div>
              <dt>Access</dt>
              <dd>{accessRole}</dd>
            </div>
            <div>
              <dt>Slides</dt>
              <dd>{slide ? 1 : 0}</dd>
            </div>
            <div>
              <dt>Revision</dt>
              <dd>{revision}</dd>
            </div>
          </dl>
        )}
      </div>
      {slide && showNotes && (
        <label className="notes-field">
          <span>Speaker notes</span>
          <textarea
            value={slide.notes}
            readOnly={!editable}
            onChange={(event) => onUpdateNotes(event.target.value)}
            placeholder="Add speaker notes"
          />
        </label>
      )}
    </aside>
  );
}
