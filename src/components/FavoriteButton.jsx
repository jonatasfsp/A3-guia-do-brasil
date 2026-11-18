import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';

export function Heart({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"
         fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-7-4.6-9.3-9A5.3 5.3 0 0 1 12 6.6 5.3 5.3 0 0 1 21.3 12C19 16.4 12 21 12 21z" />
    </svg>
  );
}

export default function FavoriteButton({ item, compact = false }) {
  const { user } = useAuth();
  const { isFav, toggle } = useFavorites();
  const location = useLocation();

  if (!user) {
    return (
      <Link to="/entrar" state={{ from: location.pathname, aviso: true }} className="btn btn-soft">
        <Heart /> Entre para favoritar
      </Link>
    );
  }
  const ativo = isFav(item.tipo, item.id);
  return (
    <button
      type="button"
      className={`btn ${compact ? 'btn-icon' : 'btn-soft'} ${ativo ? 'is-fav' : ''}`}
      aria-pressed={ativo}
      aria-label={compact ? `${ativo ? 'Remover' : 'Salvar'} ${item.nome} ${ativo ? 'dos' : 'nos'} favoritos` : undefined}
      onClick={() => toggle(item)}
    >
      <Heart filled={ativo} />
      {!compact && (ativo ? 'Salvo nos favoritos' : 'Salvar nos favoritos')}
    </button>
  );
}
