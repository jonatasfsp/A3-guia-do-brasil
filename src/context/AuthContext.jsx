import { createContext, useContext, useState, useCallback } from 'react';


const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const USERS = 'gb:users';
const SESSION = 'gb:session';

const ler = (k, padrao) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? padrao; } catch { return padrao; }
};

async function hash(senha, salt) {
  const bytes = new TextEncoder().encode(salt + senha);
  const buf = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => ler(SESSION, null));

  const register = useCallback(async ({ nome, email, senha }) => {
    const users = ler(USERS, []);
    const mail = email.trim().toLowerCase();
    if (users.some((u) => u.email === mail)) {
      throw new Error('Já existe uma conta com este e-mail. Tente entrar.');
    }
    const salt = crypto.randomUUID();
    users.push({ nome: nome.trim(), email: mail, salt, hash: await hash(senha, salt) });
    localStorage.setItem(USERS, JSON.stringify(users));
    const sessao = { nome: nome.trim(), email: mail };
    localStorage.setItem(SESSION, JSON.stringify(sessao));
    setUser(sessao);
  }, []);

  const login = useCallback(async ({ email, senha }) => {
    const mail = email.trim().toLowerCase();
    const u = ler(USERS, []).find((x) => x.email === mail);
    if (!u || (await hash(senha, u.salt)) !== u.hash) {
      throw new Error('E-mail ou senha incorretos. Confira os dados e tente de novo.');
    }
    const sessao = { nome: u.nome, email: u.email };
    localStorage.setItem(SESSION, JSON.stringify(sessao));
    setUser(sessao);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION);
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, register, login, logout }}>{children}</AuthContext.Provider>;
}
