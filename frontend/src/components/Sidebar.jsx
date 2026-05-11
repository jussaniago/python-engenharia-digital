export function Sidebar({ projects, models, versions, selected, onSelectProject, onSelectModel, onSelectVersion, onCreateProject, isAdmin }) {
  return (
    <aside className="sidebar">
      <div className="brand">BIM 3D</div>
      <section>
        <div className="section-title"><span>Projetos</span>{isAdmin && <button onClick={onCreateProject}>+</button>}</div>
        {projects.map((project) => (
          <button className={selected.project?._id === project._id ? 'active item' : 'item'} key={project._id} onClick={() => onSelectProject(project)}>
            {project.name}
          </button>
        ))}
      </section>
      <section>
        <div className="section-title"><span>Modelos</span></div>
        {models.map((model) => (
          <button className={selected.model?._id === model._id ? 'active item' : 'item'} key={model._id} onClick={() => onSelectModel(model)}>
            {model.name}
          </button>
        ))}
      </section>
      <section>
        <div className="section-title"><span>Versões</span></div>
        {versions.map((version) => (
          <button className={selected.version?._id === version._id ? 'active item' : 'item'} key={version._id} onClick={() => onSelectVersion(version)}>
            {version.version} {version.isActive ? '• ativa' : ''}
          </button>
        ))}
      </section>
    </aside>
  );
}
