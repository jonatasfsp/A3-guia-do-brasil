import { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBox from '../components/SearchBox.jsx';
import Surprise from '../components/Surprise.jsx';
import FavCard from '../components/FavCard.jsx';
import { Empty } from '../components/Status.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { usePageTitle } from '../hooks/useAsync.js';

const ABAS = [['todos', 'Todos'], ['estado', 'Estados'], ['municipio', 'Municípios']];
const SUGESTOES = [['estado', 31, 'Minas Gerais'], ['municipio', 4205407, 'Florianópolis (SC)'], ['municipio', 1506807, 'Santarém (PA)']];

export default function Explore() {
  usePageTitle('Explorar');
  const { lista } = useFavorites();
  const [filtro, setFiltro] = useState('estado');
  const [aba, setAba] = useState('todos');
  const visiveis = lista.filter((f) => aba === 'todos' || f.tipo === aba);

  return (
    <>
      <h1>Painel territorial do cidadão</h1>
      <div className="explore-top">
        <section className="card search-card" aria-labelledby="busca-t">
          <p className="kicker">Exploração direta</p>
          <h2 id="busca-t">O que você quer pesquisar hoje?</h2>
          <p className="muted">Escolha o tipo de território e digite o nome (ou um CEP) para consultar os dados do Censo.</p>
          <div className="field">
            <label htmlFor="tipo-busca">Tipo de território</label>
            <select id="tipo-busca" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
              <option value="estado">Estado</option>
              <option value="municipio">Município</option>
              <option value="todos">Estado ou município</option>
            </select>
          </div>
          <SearchBox filtro={filtro} rotulo={`Buscar ${filtro === 'estado' ? 'estado' : filtro === 'municipio' ? 'município' : 'estado ou município'}`} placeholder="Digite o estado ou a cidade…" />
          <p className="small">Sugestões:{' '}
            {SUGESTOES.map(([t, id, nome]) => <Link key={id} className="chip-link" to={`/${t}/${id}`}>{nome}</Link>)}
          </p>
        </section>
        <Surprise />
      </div>

      <section aria-labelledby="fav-t" className="favoritos">
        <p className="kicker">Seu acervo territorial</p>
        <div className="fav-title">
          <h2 id="fav-t">Pesquisas salvas e favoritos</h2>
          <div className="tabs" role="group" aria-label="Filtrar favoritos">
            <span className="muted" aria-live="polite">{lista.length} {lista.length === 1 ? 'salvo' : 'salvos'}</span>
            {ABAS.map(([k, r]) => (
              <button key={k} className="tab" aria-pressed={aba === k} onClick={() => setAba(k)}>{r}</button>
            ))}
          </div>
        </div>
        {visiveis.length === 0 ? (
          <Empty>
            <p><strong>{lista.length === 0 ? 'Você ainda não salvou nenhum lugar.' : 'Nenhum favorito nesta categoria.'}</strong></p>
            <p>Pesquise um estado ou município e use o botão “Salvar nos favoritos” para acessá-lo rapidamente aqui.</p>
          </Empty>
        ) : (
          <div className="grid-3">{visiveis.map((f) => <FavCard key={`${f.tipo}-${f.id}`} item={f} />)}</div>
        )}
      </section>
    </>
  );
}
