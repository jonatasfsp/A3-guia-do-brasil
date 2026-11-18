import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { usePageTitle } from '../hooks/useAsync.js';

function forca(s) {
  let n = 0;
  if (s.length >= 8) n++;
  if (/[A-Z]/.test(s) && /[a-z]/.test(s)) n++;
  if (/\d/.test(s) && /[^A-Za-z0-9]/.test(s)) n++;
  return n;
}
const ROT = ['Muito fraca', 'Fraca', 'Média', 'Forte'];

export default function Register() {
  usePageTitle('Criar conta');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({ nome: '', email: '', senha: '', conf: '', termos: false });
  const [erros, setErros] = useState({});
  const [geral, setGeral] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const refs = { nome: useRef(null), email: useRef(null), senha: useRef(null), conf: useRef(null), termos: useRef(null) };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const nivel = forca(f.senha);

  async function enviar(e) {
    e.preventDefault();
    const n = {};
    if (f.nome.trim().length < 3) n.nome = 'Informe seu nome completo.';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) n.email = 'Informe um e-mail válido, como nome@exemplo.com.br.';
    if (f.senha.length < 8) n.senha = 'A senha precisa ter no mínimo 8 caracteres.';
    if (f.conf !== f.senha) n.conf = 'As senhas não são iguais.';
    if (!f.termos) n.termos = 'Para criar a conta, aceite os Termos de Uso.';
    setErros(n); setGeral('');
    const primeiro = Object.keys(n)[0];
    if (primeiro) return refs[primeiro].current?.focus();
    setOcupado(true);
    try { await register(f); navigate('/explorar', { replace: true }); }
    catch (err) { setGeral(err.message); }
    finally { setOcupado(false); }
  }

  const campo = (k, rotulo, tipo, extra = {}) => (
    <div className="field">
      <label htmlFor={k}>{rotulo}</label>
      <input id={k} ref={refs[k]} type={tipo} value={f[k]} onChange={set(k)} aria-invalid={!!erros[k]}
             aria-describedby={[erros[k] ? `${k}-e` : '', extra.ajuda].filter(Boolean).join(' ') || undefined} {...extra.props} />
      {erros[k] && <p id={`${k}-e`} className="field-error">{erros[k]}</p>}
    </div>
  );

  return (
    <section className="auth card" aria-labelledby="reg-t">
      <p className="chip chip-blue">Acesso público</p>
      <h1 id="reg-t">Criar conta no Guia do Brasil</h1>
      <p className="muted">Junte-se gratuitamente para salvar seus municípios favoritos e consultar indicadores.</p>
      {geral && <p className="alert-box" role="alert">{geral}</p>}
      <form onSubmit={enviar} noValidate>
        {campo('nome', 'Nome completo', 'text', { props: { autoComplete: 'name', placeholder: 'Ex.: Marina Silveira Albuquerque' } })}
        {campo('email', 'E-mail', 'email', { props: { autoComplete: 'email', placeholder: 'seu.email@dominio.com' } })}
        {campo('senha', 'Senha de acesso', 'password', { ajuda: 'forca', props: { autoComplete: 'new-password', placeholder: 'Mínimo de 8 caracteres' } })}
        <div className="strength" id="forca" aria-live="polite">
          <div className="bars" aria-hidden="true">{[0, 1, 2].map((i) => <span key={i} className={i < nivel ? `on l${nivel}` : ''} />)}</div>
          <span>{f.senha ? `Segurança: ${ROT[nivel]}` : 'Segurança da senha'}</span>
        </div>
        {campo('conf', 'Confirmar senha', 'password', { props: { autoComplete: 'new-password', placeholder: 'Digite a senha novamente' } })}
        <div className="field check">
          <input id="termos" ref={refs.termos} type="checkbox" checked={f.termos} onChange={set('termos')} aria-invalid={!!erros.termos} aria-describedby={erros.termos ? 'termos-e' : undefined} />
          <label htmlFor="termos">Concordo com os <Link to="/sobre#termos" target="_blank">Termos de Uso</Link> e com o tratamento ético de dados.</label>
        </div>
        {erros.termos && <p id="termos-e" className="field-error">{erros.termos}</p>}
        <button className="btn btn-primary btn-block btn-lg" disabled={ocupado}>{ocupado ? 'Criando conta…' : 'Criar minha conta'}</button>
      </form>
      <p className="center">Já possui uma conta? <Link to="/entrar">Faça login</Link></p>
    </section>
  );
}
