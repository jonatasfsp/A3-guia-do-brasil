import { Link } from 'react-router-dom';
import SearchBox from '../components/SearchBox.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useAsync, usePageTitle } from '../hooks/useAsync.js';
import { getContagens, malhaUrl, getRegioes } from '../services/ibge.js';
import { getResumoWikipedia } from '../services/extras.js';
import { fmtNum } from '../utils/format.js';

function Foto({ termo, legenda, alt }) {
  const { status, data } = useAsync(() => getResumoWikipedia(termo), [termo]);
  return (
    <figure className="foto">
      {status === 'ok' && data?.imagem
        ? <img src={data.imagem} alt={alt} loading="lazy" />
        : <div className="foto-vazia" role="img" aria-label={alt}>{status === 'loading' ? 'Carregando foto…' : 'Foto indisponível'}</div>}
      <figcaption>{legenda}</figcaption>
    </figure>
  );
}

export default function Home() {
  usePageTitle('Descubra o Brasil em dados');
  const { user } = useAuth();
  const contagens = useAsync(getContagens, []);
  const regioes = useAsync(getRegioes, []);
  const c = contagens.data;

  return (
    <>
      <section className="hero" aria-labelledby="hero-titulo">
        <div className="hero-text">
          <p className="chip">Censo e território descomplicado</p>
          <h1 id="hero-titulo">Descubra o Brasil em dados simples e acessíveis</h1>
          <p className="lead">Reunimos informações sobre estados, municípios e distritos de forma intuitiva e visual. Explore população, área, economia e divisões territoriais sem jargões governamentais.</p>
          <div className="btn-row">
            {user
              ? <Link to="/explorar" className="btn btn-primary btn-lg">Ir para o painel</Link>
              : <><Link to="/cadastro" className="btn btn-primary btn-lg">Criar conta grátis</Link>
                  <Link to="/entrar" className="btn btn-outline btn-lg">Entrar no sistema</Link></>}
          </div>
          <p className="small">Acesso 100% livre e aberto · Dados oficiais do IBGE</p>
          <dl className="big-stats" aria-busy={contagens.status === 'loading'}>
            <div><dt>Unidades federativas</dt><dd>{c ? c.estados : '…'}</dd></div>
            <div><dt>Cidades catalogadas</dt><dd>{c ? fmtNum(c.municipios) : '…'}</dd></div>
            <div><dt>Distritos</dt><dd>{c ? fmtNum(c.distritos) : '…'}</dd></div>
          </dl>
          {contagens.status === 'error' && <p className="small" role="status">Não foi possível atualizar os números agora. <button className="link-btn" onClick={contagens.retry}>Tentar de novo</button></p>}
        </div>
        <div className="hero-side">
          <div className="card quick">
            <h2 className="h3">Consulta rápida territorial</h2>
            <SearchBox rotulo="Consulta rápida: estado, cidade ou CEP" placeholder="Estado, cidade ou CEP…" />
          </div>
        </div>
      </section>

      <section aria-labelledby="camadas">
        <h2 id="camadas">Três formas claras de navegar pelo país</h2>
        <p className="muted">Informações territoriais organizadas para você encontrar o que precisa em segundos.</p>
        <div className="grid-3">
          <article className="card layer layer-green">
            <h3>Estados</h3>
            <p>Conheça população, área, densidade, PIB e municípios de cada Unidade da Federação.</p>
            <p className="chip chip-green">{c ? `${c.estados} UFs` : '27 UFs'}</p>
            <Link to="/catalogo/estados" className="more">Explorar os estados</Link>
          </article>
          <article className="card layer layer-blue">
            <h3>Municípios</h3>
            <p>Dados detalhados dos municípios: área, densidade populacional, PIB e distritos.</p>
            <p className="chip chip-blue">{c ? `${fmtNum(c.municipios)} cidades` : '5.570 cidades'}</p>
            <Link to="/catalogo/municipios" className="more">Consultar cidades</Link>
          </article>
          <article className="card layer layer-brown">
            <h3>Distritos e regiões</h3>
            <p>Veja as 5 grandes regiões e os distritos de cada município.</p>
            <p className="chip chip-brown">{regioes.data ? `${regioes.data.length} regiões` : '5 regiões'}</p>
            <Link to="/catalogo/regioes" className="more">Ver subdivisões</Link>
          </article>
        </div>
      </section>

      <section className="identidade" aria-labelledby="ident">
        <div>
          <h2 id="ident">Um retrato autêntico de cada canto do território</h2>
          <p>O Guia do Brasil transforma tabelas frias em conhecimento visual. Entenda a população, a extensão e a riqueza de cada lugar do país.</p>
          <p className="small">Dados oficiais do IBGE · Atualização constante</p>
        </div>
        <Foto termo="Salvador Bahia município" alt="Vista de Salvador, na Bahia" legenda="Litoral brasileiro" />
        <Foto termo="Brasília Distrito Federal" alt="Vista de Brasília, no Distrito Federal" legenda="Planalto Central" />
      </section>

      {!user && (
        <section className="cta" aria-labelledby="cta-t">
          <div>
            <h2 id="cta-t">Crie sua conta gratuita no Guia do Brasil</h2>
            <p>Salve seus municípios favoritos e volte a eles com um clique.</p>
          </div>
          <div className="btn-row">
            <Link to="/cadastro" className="btn btn-primary">Começar agora (grátis)</Link>
            <Link to="/entrar" className="btn btn-white">Já possuo conta</Link>
          </div>
        </section>
      )}
    </>
  );
}
