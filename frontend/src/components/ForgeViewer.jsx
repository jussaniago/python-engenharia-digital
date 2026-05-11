import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';

export function ForgeViewer({ version, issues, focusedIssue, onCreateIssue, onSelectIssue }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    if (!version?.urn || !window.Autodesk) return;

    let cancelled = false;
    async function start() {
      const options = {
        env: 'AutodeskProduction2',
        api: 'streamingV2',
        getAccessToken: async (callback) => {
          const { data } = await api.get('/aps/token');
          callback(data.access_token, data.expires_in);
        }
      };

      window.Autodesk.Viewing.Initializer(options, () => {
        if (cancelled) return;
        if (!viewerRef.current) {
          viewerRef.current = new window.Autodesk.Viewing.GuiViewer3D(containerRef.current, { extensions: ['Autodesk.DocumentBrowser'] });
          viewerRef.current.start();
          viewerRef.current.addEventListener(window.Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event) => {
            const dbId = event.dbIdArray?.[0];
            setSelectedElement(dbId || null);
            if (dbId) {
              viewerRef.current.getProperties(dbId, (result) => setProperties(result.properties?.slice(0, 12) || []));
            }
          });
        }

        window.Autodesk.Viewing.Document.load(
          `urn:${version.urn}`,
          (doc) => {
            const defaultModel = doc.getRoot().getDefaultGeometry();
            viewerRef.current.loadDocumentNode(doc, defaultModel);
          },
          (error) => console.error('Falha ao carregar documento APS', error)
        );
      });
    }

    start();
    return () => {
      cancelled = true;
    };
  }, [version?.urn]);

  useEffect(() => {
    if (viewerRef.current && focusedIssue?.cameraState) {
      viewerRef.current.restoreState(focusedIssue.cameraState);
    }
  }, [focusedIssue?._id]);

  function captureIssuePoint() {
    const viewer = viewerRef.current;
    if (!viewer || !selectedElement) return;
    const camera = viewer.getState({ viewport: true, objectSet: true });
    const position = viewer.navigation.getPosition();
    onCreateIssue({
      elementId: String(selectedElement),
      position: { x: position.x, y: position.y, z: position.z },
      cameraState: camera,
      screenshot: viewer.getScreenShotBuffer?.()
    });
  }

  function goToIssue(issue) {
    onSelectIssue(issue);
    if (viewerRef.current && issue.cameraState) viewerRef.current.restoreState(issue.cameraState);
  }

  return (
    <section className="viewer-panel">
      <div className="viewer-toolbar">
        <div>
          <strong>{version ? `${version.fileName} • ${version.version}` : 'Selecione um modelo'}</strong>
          <span>{version?.translationStatus ? `Status APS: ${version.translationStatus}` : 'Orbit, zoom, pan e seleção via APS Viewer'}</span>
        </div>
        <button disabled={!selectedElement} onClick={captureIssuePoint}>Criar issue no elemento</button>
      </div>
      <div className="viewer-frame" ref={containerRef}>
        {!version && <div className="empty-viewer">Escolha projeto, modelo e versão para carregar o viewer.</div>}
        <div className="markers">
          {issues.map((issue, index) => (
            <button key={issue._id} style={{ left: `${18 + index * 4}%`, top: `${24 + index * 6}%` }} onClick={() => goToIssue(issue)}>
              !
            </button>
          ))}
        </div>
      </div>
      <aside className="properties-card">
        <strong>Metadata BIM do elemento {selectedElement || '-'}</strong>
        {properties.map((item) => (
          <p key={`${item.displayName}-${item.displayValue}`}><b>{item.displayName}:</b> {String(item.displayValue)}</p>
        ))}
      </aside>
    </section>
  );
}
