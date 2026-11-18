import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';

const FavoritesContext = createContext(null);
export const useFavorites = () => useContext(FavoritesContext);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const chave = user ? `gb:fav:${user.email}` : null;
  const [lista, setLista] = useState([]);

  useEffect(() => {
    if (!chave) { setLista([]); return; }
    try { setLista(JSON.parse(localStorage.getItem(chave)) ?? []); } catch { setLista([]); }
  }, [chave]);

  const salvar = useCallback((nova) => {
    setLista(nova);
    if (chave) localStorage.setItem(chave, JSON.stringify(nova));
  }, [chave]);

  const isFav = (tipo, id) => lista.some((f) => f.tipo === tipo && String(f.id) === String(id));

  const toggle = (item) =>
    salvar(isFav(item.tipo, item.id)
      ? lista.filter((f) => !(f.tipo === item.tipo && String(f.id) === String(item.id)))
      : [...lista, item]);

  return <FavoritesContext.Provider value={{ lista, isFav, toggle }}>{children}</FavoritesContext.Provider>;
}
