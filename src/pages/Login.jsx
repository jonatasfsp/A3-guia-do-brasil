import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { usePageTitle } from '../hooks/useAsync.js';

export default function Login() {
  usePageTitle('Entrar');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [erros, setErros] = useState({});
  const [geral, setGeral] = useState('');
  const [ver, setVer] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const refs = { email: useRef(null), senha: useRef(null) };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    const novos = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) novos.email = 'Informe um e-mail válido, como nome@exemplo.com.br.';
    if (!form.senha) novos.senha = 'Digite sua senha.';
    setErros(novos); setGeral('');
    const primeiro = Object.keys(novos)[0];
    if (primeiro) return refs[primeiro].current?.focus();
    setOcupado(true);
    try {
      await login(form);
      navigate(location.state?.from || '/explorar', { replace: true });
    } catch (err) { setGeral(err.message); }
    finally { setOcupado(false); }
  }

  return (
    <section className="auth card" aria-labelledby="login-t">
      <p className="chip chip-green">Portal territorial</p>
      <h1 id="login-t">Acesse o Guia do Brasil</h1>
      <p className="muted">Entre com sua conta para acessar suas pesquisas salvas e favoritos.</p>
      {location.state?.aviso && <p className="notice" role="status">Para continuar, entre na sua conta.</p>}
      {geral && <p className="alert-box" role="alert">{geral}</p>}
      <form onSubmit={enviar} noValidate>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input id="email" ref={refs.email} type="email" autoComplete="email" placeholder="seu.nome@exemplo.com.br"
                 value={form.email} onChange={set('email')} aria-invalid={!!erros.email} aria-describedby={erros.email ? 'email-e' : undefined} />
          {erros.email && <p id="email-e" className="field-error">{erros.email}</p>}
        </div>
        <div className="field">
          <label htmlFor="senha">Senha</label>
          <div className="pw">
            <input id="senha" ref={refs.senha} type={ver ? 'text' : 'password'} autoComplete="current-password" placeholder="Digite sua senha"
                   value={form.senha} onChange={set('senha')} aria-invalid={!!erros.senha} aria-describedby={erros.senha ? 'senha-e' : undefined} />
            <button type="button" className="btn btn-icon" aria-pressed={ver} onClick={() => setVer(!ver)}>{ver ? 'Ocultar' : 'Mostrar'}<span className="sr-only"> senha</span></button>
          </div>
          {erros.senha && <p id="senha-e" className="field-error">{erros.senha}</p>}
        </div>
        <button className="btn btn-primary btn-block btn-lg" disabled={ocupado}>{ocupado ? 'Entrando…' : 'Entrar'}</button>
      </form>
      <p className="divider"><span>ou</span></p>
      <button className="btn btn-outline btn-block" disabled aria-describedby="google-nota">Continuar com Google</button>
      <p id="google-nota" className="small center">Login com Google ainda não está disponível nesta versão.</p>
      <p className="center">Ainda não tem conta? <Link to="/cadastro" state={location.state}>Criar conta</Link></p>
    </section>
  );
}
