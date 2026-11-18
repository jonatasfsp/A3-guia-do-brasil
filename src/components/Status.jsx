export function Loading({ texto = 'Carregando dados do IBGE…' }) {
  return (
    <div className="status" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{texto}</span>
    </div>
  );
}

export function ErrorBox({ error, onRetry }) {
  return (
    <div className="status status-error" role="alert">
      <p><strong>Não conseguimos carregar esses dados.</strong></p>
      <p>{error?.message || 'Verifique sua conexão e tente novamente.'}</p>
      {onRetry && <button className="btn btn-primary" onClick={onRetry}>Tentar novamente</button>}
    </div>
  );
}

export function Empty({ children }) {
  return <div className="status status-empty" role="status">{children}</div>;
}
