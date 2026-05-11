import { useState } from 'react';
import { api } from '../api/client.js';

export function IssuePanel({ context, issues, draft, onSaved, onSelectIssue, user, isAdmin }) {
  const [filters, setFilters] = useState({ status: '', assignedTo: '', from: '', to: '' });
  const [form, setForm] = useState({ title: '', description: '', status: 'Aberto' });

  async function saveIssue(event) {
    event.preventDefault();
    if (!draft || !context.version) return;
    await api.post('/issues', {
      projectId: context.project._id,
      modelId: context.model._id,
      versionId: context.version._id,
      ...draft,
      ...form
    });
    setForm({ title: '', description: '', status: 'Aberto' });
    onSaved();
  }

  async function updateStatus(issue, status) {
    await api.put(`/issues/${issue._id}`, { status });
    onSaved();
  }

  return (
    <aside className="issue-panel">
      <h2>Issues</h2>
      <div className="filters">
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">Todos os status</option>
          <option>Aberto</option>
          <option>Em andamento</option>
          <option>Resolvido</option>
        </select>
        <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
      </div>
      {draft && (
        <form className="issue-form" onSubmit={saveIssue}>
          <strong>Nova issue no elemento {draft.elementId}</strong>
          <input placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Aberto</option>
            <option>Em andamento</option>
            <option>Resolvido</option>
          </select>
          <button>Salvar issue</button>
        </form>
      )}
      <div className="issue-list">
        {issues
          .filter((issue) => !filters.status || issue.status === filters.status)
          .filter((issue) => !filters.from || new Date(issue.createdAt) >= new Date(filters.from))
          .filter((issue) => !filters.to || new Date(issue.createdAt) <= new Date(filters.to))
          .map((issue) => {
            const canEdit = isAdmin || issue.createdBy?._id === user?.id || issue.createdBy === user?.id;
            return (
              <article key={issue._id} onClick={() => onSelectIssue(issue)}>
                <span className={`badge ${issue.status.replaceAll(' ', '-')}`}>{issue.status}</span>
                <h3>{issue.title}</h3>
                <p>{issue.description}</p>
                <small>Elemento {issue.elementId} • {new Date(issue.createdAt).toLocaleDateString()}</small>
                {canEdit && (
                  <select value={issue.status} onChange={(e) => updateStatus(issue, e.target.value)} onClick={(e) => e.stopPropagation()}>
                    <option>Aberto</option>
                    <option>Em andamento</option>
                    <option>Resolvido</option>
                  </select>
                )}
              </article>
            );
          })}
      </div>
    </aside>
  );
}
