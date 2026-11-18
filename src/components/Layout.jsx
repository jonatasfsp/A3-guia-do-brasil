import { useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Guia do Brasil, página inicial">
      <span className="logo-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" fill="currentColor" />
        </svg>
      </span>
      <span><strong>Guia do Brasil</strong><small>Território &amp; Censo</small></span>
    </Link>
  );
}

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />
        <nav aria-label="Principal" className="main-nav">
          <NavLink to="/" end>Início</NavLink>
          <NavLink to="/explorar">Explorar</NavLink>
          <NavLink to="/sobre">Sobre</NavLink>
        </nav>
        <div className="header-actions">
          {user ? (
            <>
              <span className="user-chip" title={user.email}>Olá, {user.nome.split(' ')[0]}</span>
              <button className="btn btn-ghost" onClick={() => { logout(); navigate('/'); }}>Sair</button>
            </>
          ) : (
            <>
              <Link to="/entrar" className="btn btn-ghost">Entrar</Link>
              <Link to="/cadastro" className="btn btn-primary">Criar conta</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <strong>Guia do Brasil</strong>
        <span>Conhecendo nosso território de forma simples.</span>
        <nav aria-label="Rodapé">
          <Link to="/sobre#termos">Termos</Link>
          <Link to="/sobre#privacidade">Privacidade</Link>
          <Link to="/sobre#dados-abertos">Dados abertos</Link>
        </nav>
      </div>
    </footer>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const primeira = useRef(true);

  useEffect(() => {
    if (primeira.current) { primeira.current = false; return; }
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <>
      <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
      <Header />
      <main id="conteudo" ref={mainRef} tabIndex={-1} className="container main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
