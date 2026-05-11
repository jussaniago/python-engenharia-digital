import { useEffect, useState } from 'react';
import { api } from './api/client.js';
import { AuthScreen } from './components/AuthScreen.jsx';
import { ForgeViewer } from './components/ForgeViewer.jsx';
import { IssuePanel } from './components/IssuePanel.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { UploadPanel } from './components/UploadPanel.jsx';
import { useAuth } from './context/AuthContext.jsx';

export function App() {
  const { user, isAdmin, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [models, setModels] = useState([]);
  const [versions, setVersions] = useState([]);
  const [issues, setIssues] = useState([]);
  const [selected, setSelected] = useState({ project: null, model: null, version: null });
  const [draftIssue, setDraftIssue] = useState(null);
  const [focusedIssue, setFocusedIssue] = useState(null);

  async function loadProjects() {
    const { data } = await api.get('/projects');
    setProjects(data);
  }

  async function selectProject(project) {
    setSelected({ project, model: null, version: null });
    const { data } = await api.get(`/models/projects/${project._id}/models`);
    setModels(data);
    setVersions([]);
    setIssues([]);
  }

  async function selectModel(model) {
    const { data } = await api.get(`/models/${model._id}/versions`);
    const active = data.find((version) => version.isActive) || data[0] || null;
    setSelected((current) => ({ ...current, model, version: active }));
    setVersions(data);
  }

  async function loadIssues(version = selected.version) {
    if (!version) return;
    const { data } = await api.get('/issues', { params: { versionId: version._id } });
    setIssues(data);
  }

  async function createProject() {
    const name = window.prompt('Nome do projeto');
    if (!name) return;
    await api.post('/projects', { name });
    await loadProjects();
  }

  useEffect(() => {
    if (user) loadProjects();
  }, [user]);

  useEffect(() => {
    loadIssues();
  }, [selected.version?._id]);

  if (!user) return <AuthScreen />;

  return (
    <div className="dashboard">
      <Sidebar
        projects={projects}
        models={models}
        versions={versions}
        selected={selected}
        isAdmin={isAdmin}
        onCreateProject={createProject}
        onSelectProject={selectProject}
        onSelectModel={selectModel}
        onSelectVersion={(version) => setSelected((current) => ({ ...current, version }))}
      />
      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Dashboard BIM</p>
            <h1>{selected.project?.name || 'Selecione um projeto'}</h1>
          </div>
          <div className="user-chip">{user.name} • {user.role}<button onClick={logout}>Sair</button></div>
        </header>
        {isAdmin && <UploadPanel project={selected.project} model={selected.model} onUploaded={() => selected.project && selectProject(selected.project)} />}
        <ForgeViewer
          version={selected.version}
          issues={issues}
          focusedIssue={focusedIssue}
          onCreateIssue={setDraftIssue}
          onSelectIssue={setFocusedIssue}
        />
      </main>
      <IssuePanel
        context={selected}
        issues={issues}
        draft={draftIssue}
        onSaved={() => {
          setDraftIssue(null);
          loadIssues();
        }}
        onSelectIssue={setFocusedIssue}
        user={user}
        isAdmin={isAdmin}
      />
    </div>
  );
}
