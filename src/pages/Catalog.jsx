import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loading, ErrorBox, Empty } from '../components/Status.jsx';
import { useAsync, usePageTitle } from '../hooks/useAsync.js';
import { getEstados, getMunicipiosDoEstado, getRegioes } from '../services/ibge.js';
import { fmtNum, normalizar } from '../utils/format.js';
import NotFound from './NotFound.jsx';

const TITULOS = { estados: 'Estados', municipios: 'Municípios', regioes: 'Regiões e distritos' };

export default function Catalog() {
  const { tipo } = useParams();
  usePageTitle(TITULOS[tipo]);
  if (!TITULOS[tipo]) return <NotFound />;
  return (
    <>
      <h1>{TITULOS[tipo]}</h1>
      {tipo === 'estados' && <Estados />}
      {tipo === 'municipios' && <Municipios />}
      {tipo === 'regioes' && <Regioes />}
    </>
  );
}

function Estados() {
  const { status, data, error, retry } = useAsync(getEstados, []);
  if (status === 'loading') return <Loading />;
  if (status === 'error') return <ErrorBox error={error} onRetry={retry} />;
  const grupos = data.reduce((acc, e) => ({ ...acc, [e.regiao.nome]: [...(acc[e.regiao.nome] ?? []), e] }), {});
  return Object.entries(grupos).map(([regiao, ufs]) => (
    <section key={regiao} aria-labelledby={`r-${regiao}`}>
      <h2 id={`r-${regiao}`}>Região {regiao}</h2>
      <ul className="grid-3 plain">
        {ufs.map((e) => (
          <li key={e.id} className="card"><Link to={`/estado/${e.id}`}><strong>{e.nome}</strong> <span className="muted">({e.sigla})</span></Link></li>
        ))}
      </ul>
    </section>
  ));
}

function Municipios() {
  const ufs = useAsync(getEstados, []);
  const [uf, setUf] = useState('35');
  const [q, setQ] = useState('');
  const [n, setN] = useState(40);
  const muns = useAsync(() => getMunicipiosDoEstado(uf), [uf]);
  const lista = (muns.data ?? []).filter((m) => normalizar(m.nome).includes(normalizar(q)));
  return (
    <>
      <div className="filters">
        <div className="field">
          <label htmlFor="uf">Estado</label>
          <select id="uf" value={uf} onChange={(e) => { setUf(e.target.value); setN(40); }}>
            {(ufs.data ?? []).map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
            {!ufs.data && <option value="35">São Paulo</option>}
          </select>
        </div>
        <div className="field">
          <label htmlFor="q">Filtrar por nome</label>
          <input id="q" type="search" value={q} onChange={(e) => { setQ(e.target.value); setN(40); }} />
        </div>
      </div>
      {muns.status === 'loading' && <Loading />}
      {muns.status === 'error' && <ErrorBox error={muns.error} onRetry={muns.retry} />}
      {muns.status === 'ok' && (
        <>
          <p role="status" aria-live="polite">{fmtNum(lista.length)} município(s)</p>
          {lista.length === 0 ? <Empty>Nenhum município com esse nome neste estado.</Empty> : (
            <ul className="list-cols">{lista.slice(0, n).map((m) => <li key={m.id}><Link to={`/municipio/${m.id}`}>{m.nome}</Link></li>)}</ul>
          )}
          {n < lista.length && <button className="btn btn-soft" onClick={() => setN(n + 40)}>Mostrar mais</button>}
        </>
      )}
    </>
  );
}

function Regioes() {
  const { status, data, error, retry } = useAsync(async () => {
    const [regioes, estados] = await Promise.all([getRegioes(), getEstados()]);
    return regioes.map((r) => ({ ...r, ufs: estados.filter((e) => e.regiao.id === r.id) }));
  }, []);
  if (status === 'loading') return <Loading />;
  if (status === 'error') return <ErrorBox error={error} onRetry={retry} />;
  return (
    <>
      <p className="muted">Estrutura territorial: País › Região › UF › Município › Distrito. Os distritos aparecem na página de cada município.</p>
      <div className="grid-3">
        {data.map((r) => (
          <article key={r.id} className="card">
            <h2 className="h3">{r.nome}</h2>
            <ul className="plain">{r.ufs.map((e) => <li key={e.id}><Link to={`/estado/${e.id}`}>{e.nome}</Link></li>)}</ul>
          </article>
        ))}
      </div>
    </>
  );
}
