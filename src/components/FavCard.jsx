import { Link } from 'react-router-dom';
import FavoriteButton from './FavoriteButton.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { getIndicadores } from '../services/ibge.js';
import { fmtNum } from '../utils/format.js';

export default function FavCard({ item }) {
  const { status, data } = useAsync(() => getIndicadores(item.tipo, item.id), [item.tipo, item.id]);
  const valor = (v) => (status === 'loading' ? '…' : fmtNum(v));
  return (
    <article className={`card fav-card tipo-${item.tipo}`}>
      <div className="fav-head">
        <div>
          <p className="kicker">{item.tipo === 'estado' ? 'Estado' : 'Município'}</p>
          <h3>{item.nome}{item.uf ? ` (${item.uf})` : ''}</h3>
          <p className="muted">{item.sub} · Código IBGE {item.id}</p>
        </div>
        <FavoriteButton item={item} compact />
      </div>
      <dl className="mini-stats">
        <div><dt>População</dt><dd>{valor(data?.populacao)}</dd></div>
        <div><dt>Área (km²)</dt><dd>{valor(data?.area)}</dd></div>
      </dl>
      <Link className="btn btn-soft btn-block" to={`/${item.tipo}/${item.id}`}>
        Ver resultado<span className="sr-only"> de {item.nome}</span>
      </Link>
    </article>
  );
}
