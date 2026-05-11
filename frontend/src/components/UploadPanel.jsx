import { useState } from 'react';
import { api } from '../api/client.js';

export function UploadPanel({ project, model, onUploaded }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  async function upload(event) {
    event.preventDefault();
    if (!project || !file) return;
    setBusy(true);
    const form = new FormData();
    form.append('projectId', project._id);
    if (model) form.append('modelId', model._id);
    if (name) form.append('name', name);
    form.append('file', file);
    await api.post('/models/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    setFile(null);
    setName('');
    setBusy(false);
    onUploaded();
  }

  return (
    <form className="upload-panel" onSubmit={upload}>
      <strong>Upload NWD / nova versão</strong>
      <input placeholder="Nome do modelo" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="file" accept=".nwd" onChange={(e) => setFile(e.target.files[0])} />
      <button disabled={!project || !file || busy}>{busy ? 'Enviando para APS...' : model ? 'Criar nova versão' : 'Enviar modelo'}</button>
    </form>
  );
}
