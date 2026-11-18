import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/useAsync.js';

export default function NotFound() {
  usePageTitle('Página não encontrada');
  return (
    <div className="status status-empty">
      <h1>Página não encontrada</h1>
      <p>O endereço pode estar incorreto ou ter sido removido.</p>
      <Link className="btn btn-primary" to="/">Voltar ao início</Link>
    </div>
  );
}
