import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'VIEWER' });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível autenticar.');
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div>
          <p className="eyebrow">BIM Collaboration Platform</p>
          <h1>Visualização BIM 3D com Autodesk APS</h1>
          <p>Entre para gerenciar projetos, modelos NWD versionados e issues vinculadas aos elementos.</p>
        </div>
        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && (
            <input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          )}
          <input placeholder="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Senha" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {mode === 'register' && (
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="VIEWER">Visualizador</option>
              <option value="ADMIN">Administrador</option>
            </select>
          )}
          {error && <span className="error">{error}</span>}
          <button type="submit">{mode === 'login' ? 'Entrar' : 'Cadastrar'}</button>
          <button type="button" className="link-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Criar conta' : 'Já tenho conta'}
          </button>
        </form>
      </section>
    </main>
  );
}
