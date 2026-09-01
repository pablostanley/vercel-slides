'use client';

import { SlideRenderer } from '@open-slide/document';
import { Archive, ArrowDown, ArrowUp, Copy, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { AdminMaster, MasterSlideVersion } from '@/lib/models';
import type { SessionIdentity } from '@/lib/server/auth';

function previewVersion(master: AdminMaster) {
  return (
    master.versions.find((version) => version.status === 'draft') ??
    master.versions.find((version) => version.id === master.currentPublishedVersionId) ??
    master.versions[0]
  );
}

export function AdminMasterLibrary({
  session,
  initialMasters,
}: {
  session: SessionIdentity;
  initialMasters: AdminMaster[];
}) {
  const [masters, setMasters] = useState(initialMasters);
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('Untitled master');
  const [slug, setSlug] = useState('untitled-master');
  const [category, setCategory] = useState('Content');
  const [error, setError] = useState<string | null>(null);
  const visible = useMemo(() => {
    const query = search.toLowerCase();
    return masters.filter((master) =>
      [master.title, master.slug, master.category, ...master.tags]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [masters, search]);

  async function request(path: string, body: Record<string, unknown>, method = 'POST') {
    setError(null);
    const response = await fetch(path, {
      method,
      headers: { 'content-type': 'application/json', 'x-csrf-token': session.csrfToken },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error?.message ?? 'Could not update the master library');
      return null;
    }
    return result;
  }

  async function createMaster() {
    const result = await request('/api/admin/templates/vercel/masters', {
      operation: 'create',
      slug,
      title,
      description: '',
      category,
      tags: [category.toLowerCase(), slug],
    });
    if (result?.master)
      window.location.href = `/admin/templates/vercel/masters/${result.master.slug}`;
  }

  async function patchMaster(master: AdminMaster, body: Record<string, unknown>) {
    const result = await request(`/api/admin/masters/${master.id}`, body, 'PATCH');
    if (result?.master) {
      setMasters((current) =>
        current.map((item) => (item.id === master.id ? { ...item, ...result.master } : item)),
      );
    }
  }

  async function duplicateMaster(master: AdminMaster) {
    const nextSlug = window.prompt('Duplicate master slug', `${master.slug}-copy`)?.trim();
    if (!nextSlug) return;
    const result = await request(`/api/admin/masters/${master.id}/duplicate`, { slug: nextSlug });
    if (result?.master) setMasters((current) => [...current, result.master]);
  }

  async function startDraft(master: AdminMaster) {
    const source =
      master.versions.find((version) => version.id === master.currentPublishedVersionId) ??
      master.versions[0];
    if (!source) return;
    const result = await request(`/api/admin/masters/${master.id}/drafts`, {
      sourceVersionId: source.id,
    });
    if (result?.version) {
      window.location.href = `/admin/templates/vercel/masters/${master.slug}`;
    }
  }

  async function moveMaster(master: AdminMaster, direction: -1 | 1) {
    const index = masters.findIndex((item) => item.id === master.id);
    const target = masters[index + direction];
    if (!target) return;
    const next = [...masters];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    setMasters(next.map((item, position) => ({ ...item, position })));
    const result = await request('/api/admin/templates/vercel/masters', {
      operation: 'reorder',
      masterIds: next.map((item) => item.id),
    });
    if (!result) setMasters(masters);
  }

  return (
    <main className="admin-library-shell">
      <header className="admin-header">
        <div>
          <a href="/">Slides</a>
          <span>/</span>
          <strong>Vercel masters</strong>
        </div>
        <span>{masters.length} masters</span>
      </header>
      <section className="admin-create-panel">
        <div>
          <p className="eyebrow">New master</p>
          <h1>Published templates, edited visually.</h1>
          <p>New masters begin as drafts and never replace a published version in place.</p>
        </div>
        <div className="admin-create-fields">
          <label>
            <span>Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            <span>Slug</span>
            <input value={slug} onChange={(event) => setSlug(event.target.value)} />
          </label>
          <label>
            <span>Category</span>
            <input value={category} onChange={(event) => setCategory(event.target.value)} />
          </label>
          <button type="button" className="button button-primary" onClick={createMaster}>
            <Plus size={14} /> Create master
          </button>
        </div>
      </section>
      <section className="admin-library-content">
        <label className="search-field admin-master-search">
          <Search aria-hidden size={15} />
          <span className="sr-only">Search masters</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search names, categories, and tags"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <div className="admin-master-grid">
          {visible.map((master) => {
            const version = previewVersion(master) as MasterSlideVersion | undefined;
            const draft = master.versions.find((item) => item.status === 'draft');
            return (
              <article className="admin-master-card" key={master.id}>
                <a href={`/admin/templates/vercel/masters/${master.slug}`}>
                  <span className="admin-master-preview">
                    {version && <SlideRenderer document={version.document} />}
                  </span>
                  <span className="admin-master-copy">
                    <strong>{master.title}</strong>
                    <small>
                      {master.category} · {draft ? `Draft v${draft.version}` : 'Published'}
                    </small>
                  </span>
                </a>
                <div className="admin-master-actions">
                  <button type="button" onClick={() => moveMaster(master, -1)} aria-label="Move up">
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveMaster(master, 1)}
                    aria-label="Move down"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateMaster(master)}
                    aria-label="Duplicate master"
                  >
                    <Copy size={13} />
                  </button>
                  {!draft && master.currentPublishedVersionId && (
                    <button type="button" onClick={() => startDraft(master)}>
                      Create draft
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      patchMaster(master, {
                        status: master.status === 'active' ? 'archived' : 'active',
                      })
                    }
                  >
                    <Archive size={13} /> {master.status === 'active' ? 'Archive' : 'Unarchive'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
