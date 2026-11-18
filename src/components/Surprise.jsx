import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getEstados, getTodosMunicipios, getIndicadores } from '../services/ibge.js';
import { getResumoWikipedia } from '../services/extras.js';
import { fmtNum, normalizar, ufDoMunicipio } from '../utils/format.js';
import { Loading, ErrorBox } from './Status.jsx';

const sortear = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function descobrir() {
  const [estados, municipios] = await Promise.all([getEstados(), getTodosMunicipios()]);
  if (Math.random() < 0.25) {
    const e = sortear(estados);
    const [wiki, ind] = await Promise.all([
      getResumoWikipedia(`${e.nome} estado do Brasil`),
      getIndicadores('estado', e.id).catch(() => null)
    ]);
    return montar({ tipo: 'estado', id: e.id, nome: e.nome, uf: e.sigla, regiao: e.regiao.nome, wiki, ind });
  }
  const m = sortear(municipios);
  const uf = ufDoMunicipio(m);
  const [wiki, ind] = await Promise.all([
    getResumoWikipedia(`${m.nome} ${uf?.nome ?? ''} município`),
    getIndicadores('municipio', m.id).catch(() => null)
  ]);
  return montar({
    tipo: 'municipio', id: m.id, nome: m.nome, uf: uf?.sigla, regiao: uf?.regiao?.nome, wiki, ind,
    micro: m.microrregiao?.nome
  });
}


function montar(d) {
  const confiavel = d.wiki && normalizar(d.wiki.titulo).includes(normalizar(d.nome));
  const ibge =
    `${d.nome} fica ${d.tipo === 'estado' ? 'na' : 'no estado de ' + (d.uf ?? '') + ', na'} região ${d.regiao ?? '—'} do Brasil.` +
    (d.ind?.populacao ? ` Segundo o Censo 2022, tem ${fmtNum(d.ind.populacao)} habitantes distribuídos em ${fmtNum(d.ind.area, 1)} km².` : '') +
    (d.micro ? ` Pertence à microrregião ${d.micro}.` : '');
  return { ...d, texto: confiavel ? d.wiki.texto : ibge, imagem: confiavel ? d.wiki.imagem : null, fonte: confiavel ? d.wiki : null };
}

export default function Surprise() {
  const [estado, setEstado] = useState({ status: 'idle', data: null, error: null });

  async function buscar() {
    setEstado({ status: 'loading', data: null, error: null });
    try { setEstado({ status: 'ok', data: await descobrir(), error: null }); }
    catch (error) { setEstado({ status: 'error', data: null, error }); }
  }

  return (
    <section className="surprise" aria-labelledby="surp-titulo">
      <p className="chip chip-light">Descoberta aleatória</p>
      <h2 id="surp-titulo">Descubra algo novo</h2>
      <p>O Brasil tem milhares de lugares fascinantes. Deixe a gente escolher um por você.</p>
      <button className="btn btn-white btn-block" onClick={buscar} disabled={estado.status === 'loading'}>
        {estado.status === 'loading' ? 'Sorteando…' : estado.status === 'ok' ? 'Sortear outro lugar' : 'Surpreenda-me'}
      </button>

      <div aria-live="polite" aria-busy={estado.status === 'loading'} className="surprise-out">
        {estado.status === 'loading' && <Loading texto="Escolhendo um lugar…" />}
        {estado.status === 'error' && <ErrorBox error={estado.error} onRetry={buscar} />}
        {estado.status === 'ok' && (
          <article className="surprise-card">
            {estado.data.imagem && <img src={estado.data.imagem} alt={`Foto de ${estado.data.nome}`} loading="lazy" />}
            <h3>{estado.data.nome}{estado.data.uf && estado.data.tipo === 'municipio' ? ` (${estado.data.uf})` : ''}</h3>
            <p>{estado.data.texto}</p>
            {estado.data.fonte && (
              <p className="small">Fonte do texto: <a href={estado.data.fonte.link} target="_blank" rel="noreferrer">Wikipédia<span className="sr-only"> (abre em nova aba)</span></a> (CC BY-SA)</p>
            )}
            <Link className="btn btn-white" to={`/${estado.data.tipo}/${estado.data.id}`}>Ver dados completos</Link>
          </article>
        )}
      </div>
    </section>
  );
}
