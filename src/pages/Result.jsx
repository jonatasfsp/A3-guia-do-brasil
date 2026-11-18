import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import FavoriteButton from '../components/FavoriteButton.jsx';
import Donut from '../components/Donut.jsx';
import { Loading, ErrorBox, Empty } from '../components/Status.jsx';
import { useAsync, usePageTitle } from '../hooks/useAsync.js';
import {
  getEstado, getMunicipio, getIndicadores, getPib, getPopulacaoMunicipiosDoEstado,
  getMunicipiosDoEstado, getDistritosDoMunicipio, malhaUrl
} from '../services/ibge.js';
import { getResumoWikipedia } from '../services/extras.js';
import { CAPITAIS, fmtMoeda, fmtNum, normalizar, ufDoMunicipio } from '../utils/format.js';

export default function Result({ tipo }) {
  const { id } = useParams();
  const base = useAsync(() => (tipo === 'estado' ? getEstado(id) : getMunicipio(id)), [tipo, id]);
  const nome = base.data?.nome;
  usePageTitle(nome);

  if (base.status === 'loading') return <Loading texto="Buscando o local no IBGE…" />;
  if (base.status === 'error') {
    return (
      <>
        <ErrorBox error={base.error} onRetry={base.retry} />
        <p><Link to="/explorar">Voltar à pesquisa</Link></p>
      </>
    );
  }
  return <Corpo key={`${tipo}-${id}`} tipo={tipo} dados={base.data} />;
}

function Stat({ rotulo, valor, nota, status }) {
  return (
    <div className="card stat">
      <dt>{rotulo}</dt>
      <dd>{status === 'loading' ? <span className="skeleton" aria-hidden="true">···</span> : valor}</dd>
      {nota && <dd className="small">{nota}</dd>}
    </div>
  );
}

function Corpo({ tipo, dados }) {
  const uf = tipo === 'estado' ? dados : ufDoMunicipio(dados);
  const regiao = uf?.regiao;
  const ind = useAsync(() => getIndicadores(tipo, dados.id), [tipo, dados.id]);
  const pib = useAsync(() => getPib(tipo, dados.id), [tipo, dados.id]);
  const wiki = useAsync(
    () => getResumoWikipedia(tipo === 'estado' ? `${dados.nome} estado do Brasil` : `${dados.nome} ${uf?.nome ?? ''} município`),
    [tipo, dados.id]
  );
  const extra = useAsync(
    () => (tipo === 'estado' ? getPopulacaoMunicipiosDoEstado(dados.id) : getDistritosDoMunicipio(dados.id)),
    [tipo, dados.id]
  );
  const [mapaOk, setMapaOk] = useState(true);

  const item = {
    tipo, id: dados.id, nome: dados.nome, uf: uf?.sigla,
    sub: tipo === 'estado' ? `Região ${regiao?.nome ?? ''}` : `${uf?.nome ?? ''} · Região ${regiao?.nome ?? ''}`
  };
  const wikiOk = wiki.data && normalizar(wiki.data.titulo).includes(normalizar(dados.nome));
  const top5 = tipo === 'estado' && extra.status === 'ok' ? extra.data.slice(0, 5) : [];

  return (
    <>
      <nav aria-label="Você está em" className="breadcrumb">
        <Link to="/">Início</Link> / {regiao && <span>Região {regiao.nome} / </span>}
        {tipo === 'municipio' && uf && <><Link to={`/estado/${uf.id}`}>{uf.nome}</Link> / </>}
        <span aria-current="page">{dados.nome}</span>
        <Link to="/explorar" className="back">← Voltar à pesquisa</Link>
      </nav>

      <header className="card result-head">
        <div>
          <p className="badges">
            {regiao && <span className="chip chip-blue">Região {regiao.nome}</span>}
            <span className="chip chip-green">Código IBGE: {dados.id}</span>
            {pib.data && <span className="chip chip-brown">PIB {pib.data.ano}: {fmtMoeda(pib.data.valor)}</span>}
          </p>
          <h1>{dados.nome} {uf && <small>{uf.sigla}</small>}</h1>
          <p className="muted">
            {tipo === 'estado'
              ? `Capital: ${CAPITAIS[dados.id] ?? '—'} · Área territorial: ${ind.data ? `${fmtNum(ind.data.area, 1)} km²` : '…'}`
              : `${dados.microrregiao ? `Microrregião: ${dados.microrregiao.nome} · ` : ''}${dados.microrregiao?.mesorregiao ? `Mesorregião: ${dados.microrregiao.mesorregiao.nome}` : ''}`}
          </p>
        </div>
        <FavoriteButton item={item} />
      </header>

      {ind.status === 'error' && <ErrorBox error={ind.error} onRetry={ind.retry} />}

      <section aria-label="Indicadores principais">
        <dl className="grid-4">
          <Stat rotulo="População total" valor={fmtNum(ind.data?.populacao)} nota="Censo Demográfico 2022" status={ind.status} />
          <Stat rotulo={tipo === 'estado' ? 'Municípios' : 'Distritos'}
                valor={extra.status === 'ok' ? fmtNum(extra.data.length) : '—'} nota="IBGE – Localidades" status={extra.status} />
          <Stat rotulo="Produto Interno Bruto" valor={pib.data ? fmtMoeda(pib.data.valor) : 'Indisponível'}
                nota={pib.data ? `Preços correntes, ${pib.data.ano}` : undefined} status={pib.status} />
          <Stat rotulo="Densidade demográfica" valor={ind.data?.densidade != null ? `${fmtNum(ind.data.densidade, 1)} hab/km²` : '—'}
                nota={ind.data?.area != null ? `Área: ${fmtNum(ind.data.area, 1)} km²` : undefined} status={ind.status} />
        </dl>
      </section>

      <div className="result-cols">
        {tipo === 'estado' ? (
          <section className="card" aria-labelledby="top-t">
            <h2 id="top-t">Principais cidades</h2>
            <p className="muted">Os cinco municípios mais populosos de {dados.nome}.</p>
            {extra.status === 'loading' && <Loading texto="Calculando o ranking…" />}
            {extra.status === 'error' && <ErrorBox error={extra.error} onRetry={extra.retry} />}
            {extra.status === 'ok' && (
              <>
                <ol className="ranking">
                  {top5.map((c) => (
                    <li key={c.id}>
                      <Link to={`/municipio/${c.id}`}><strong>{c.nome}</strong><span>{fmtNum(c.populacao)} hab.</span></Link>
                    </li>
                  ))}
                </ol>
                <Catalogo cidades={extra.data} uf={dados.nome} />
              </>
            )}
          </section>
        ) : (
          <section className="card" aria-labelledby="loc-t">
            <h2 id="loc-t">Onde fica</h2>
            <dl className="defs">
              <dt>Estado</dt><dd>{uf ? <Link to={`/estado/${uf.id}`}>{uf.nome} ({uf.sigla})</Link> : '—'}</dd>
              <dt>Região</dt><dd>{regiao?.nome ?? '—'}</dd>
              <dt>Região imediata</dt><dd>{dados['regiao-imediata']?.nome ?? '—'}</dd>
              <dt>Região intermediária</dt><dd>{dados['regiao-imediata']?.['regiao-intermediaria']?.nome ?? '—'}</dd>
            </dl>
            <h3>Distritos</h3>
            {extra.status === 'loading' && <Loading texto="Carregando distritos…" />}
            {extra.status === 'error' && <ErrorBox error={extra.error} onRetry={extra.retry} />}
            {extra.status === 'ok' && (extra.data.length
              ? <ul className="chips">{extra.data.map((d) => <li key={d.id} className="chip">{d.nome}</li>)}</ul>
              : <Empty>Nenhum distrito cadastrado para este município.</Empty>)}
          </section>
        )}

        <aside className="stack">
          {tipo === 'estado' && top5.length > 0 && ind.data?.populacao && (
            <section className="card" aria-labelledby="div-t">
              <h2 id="div-t">Divisão populacional</h2>
              <Donut titulo="População do estado"
                     centro={`${fmtNum(ind.data.populacao / 1e6, 1)} mi`}
                     segmentos={[
                       ...top5.slice(0, 3).map((c) => ({ label: c.nome, valor: c.populacao })),
                       { label: 'Demais municípios', valor: Math.max(ind.data.populacao - top5.slice(0, 3).reduce((s, c) => s + c.populacao, 0), 0) }
                     ]} />
            </section>
          )}
          {mapaOk && (
            <section className="card" aria-labelledby="mapa-t">
              <h2 id="mapa-t" className="h3">Mapa</h2>
              <img className="malha" src={malhaUrl(tipo, dados.id)} alt={`Contorno de ${dados.nome} na malha territorial do IBGE`}
                   onError={() => setMapaOk(false)} />
            </section>
          )}
        </aside>
      </div>

      <section className="card" aria-labelledby="sobre-t">
        <h2 id="sobre-t">Sobre {dados.nome}</h2>
        {wiki.status === 'loading' && <Loading texto="Buscando texto e foto…" />}
        {wiki.status !== 'loading' && !wikiOk && <p className="muted">Não encontramos um texto descritivo para este local. Os números acima vêm direto do IBGE.</p>}
        {wikiOk && (
          <div className="about-wiki">
            {wiki.data.imagem && <img src={wiki.data.imagem} alt={`Foto de ${dados.nome}`} loading="lazy" />}
            <div>
              <p>{wiki.data.texto}</p>
              <p className="small">Texto e imagem: <a href={wiki.data.link} target="_blank" rel="noreferrer">Wikipédia<span className="sr-only"> (abre em nova aba)</span></a>, licença CC BY-SA.</p>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function Catalogo({ cidades, uf }) {
  const [aberto, setAberto] = useState(false);
  const [q, setQ] = useState('');
  const [n, setN] = useState(30);
  const filtradas = cidades.filter((c) => normalizar(c.nome).includes(normalizar(q)));
  return (
    <div className="catalogo">
      <button className="link-btn" aria-expanded={aberto} aria-controls="catalogo-lista" onClick={() => setAberto(!aberto)}>
        {aberto ? 'Ocultar catálogo' : `Ver catálogo completo (${fmtNum(cidades.length)} municípios)`}
      </button>
      <div id="catalogo-lista" hidden={!aberto}>
        <div className="field">
          <label htmlFor="filtro-mun">Filtrar municípios de {uf}</label>
          <input id="filtro-mun" type="search" value={q} onChange={(e) => { setQ(e.target.value); setN(30); }} />
        </div>
        <p className="small" role="status" aria-live="polite">{fmtNum(filtradas.length)} resultado(s)</p>
        <ul className="list-cols">
          {filtradas.slice(0, n).map((c) => <li key={c.id}><Link to={`/municipio/${c.id}`}>{c.nome}</Link> <span className="muted">{fmtNum(c.populacao)} hab.</span></li>)}
        </ul>
        {n < filtradas.length && <button className="btn btn-soft" onClick={() => setN(n + 30)}>Mostrar mais</button>}
      </div>
    </div>
  );
}
