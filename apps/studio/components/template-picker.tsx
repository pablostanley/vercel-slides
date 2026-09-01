'use client';

import { SlideRenderer } from '@open-slide/document';
import { Check, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PublishedMaster } from '@/lib/models';

export function TemplatePicker({
  masters,
  onClose,
  onInsert,
}: {
  masters: PublishedMaster[];
  onClose: () => void;
  onInsert: (master: PublishedMaster) => void;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [activeIndex, setActiveIndex] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const categories = useMemo(
    () => ['All', ...new Set(masters.map((master) => master.category))],
    [masters],
  );
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return masters.filter(
      (master) =>
        (category === 'All' || master.category === category) &&
        (!normalized ||
          `${master.title} ${master.description} ${master.tags.join(' ')}`
            .toLowerCase()
            .includes(normalized)),
    );
  }, [category, masters, query]);
  const active = filtered[Math.min(activeIndex, Math.max(0, filtered.length - 1))] ?? null;

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(filtered.length - 1, index + 1));
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(0, index - 1));
    }
    if (event.key === 'Enter' && active) {
      event.preventDefault();
      onInsert(active);
    }
  }

  return (
    <dialog open className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="template-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-title"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <header className="dialog-header">
          <div>
            <p className="eyebrow">Vercel master library</p>
            <h2 id="template-title">Add a slide</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </header>
        <div className="template-filters">
          <label className="search-field template-search">
            <Search size={15} aria-hidden />
            <span className="sr-only">Search master slides</span>
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              placeholder="Search layouts"
            />
          </label>
          <div className="category-tabs" role="tablist" aria-label="Master categories">
            {categories.map((item) => (
              <button
                type="button"
                key={item}
                className={category === item ? 'is-active' : ''}
                onClick={() => {
                  setCategory(item);
                  setActiveIndex(0);
                }}
                role="tab"
                aria-selected={category === item}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="template-body">
          <div className="template-grid" role="listbox" aria-label="Master slides">
            {filtered.map((master, index) => (
              <button
                type="button"
                key={master.version.id}
                className={`template-card ${active?.version.id === master.version.id ? 'is-active' : ''}`}
                onClick={() => setActiveIndex(index)}
                onDoubleClick={() => onInsert(master)}
                role="option"
                aria-selected={active?.version.id === master.version.id}
              >
                <span className="template-thumbnail">
                  <SlideRenderer document={master.version.document} />
                </span>
                <span>
                  <strong>{master.title}</strong>
                  <small>{master.category}</small>
                </span>
              </button>
            ))}
            {filtered.length === 0 && <p className="template-empty">No matching master slides.</p>}
          </div>
          <aside className="template-preview">
            {active ? (
              <>
                <div className="template-preview-canvas">
                  <SlideRenderer document={active.version.document} />
                </div>
                <div>
                  <p className="eyebrow">{active.category}</p>
                  <h3>{active.title}</h3>
                  <p>{active.description}</p>
                  <div className="tag-list">
                    {active.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => onInsert(active)}
                >
                  <Check size={15} /> Insert after selected slide
                </button>
              </>
            ) : (
              <p>No slide selected.</p>
            )}
          </aside>
        </div>
      </section>
    </dialog>
  );
}
