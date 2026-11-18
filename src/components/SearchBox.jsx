import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEstados, getTodosMunicipios } from '../services/ibge.js';
import { getMunicipioPorCep } from '../services/extras.js';
import { normalizar, ufDoMunicipio } from '../utils/format.js';

let indice = null; 
async function carregarIndice() {
  if (indice) return indice;
  const [ests, muns] = await Promise.all([getEstados(), getTodosMunicipios()]);
  indice = [
    ...ests.map((e) => ({ tipo: 'estado', id: e.id, nome: e.nome, uf: e.sigla, norm: normalizar(e.nome) })),
    ...muns.map((m) => ({ tipo: 'municipio', id: m.id, nome: m.nome, uf: ufDoMunicipio(m)?.sigla ?? '', norm: normalizar(m.nome) }))
  ];
  return indice;
}


export default function SearchBox({ filtro = 'todos', rotulo = 'Buscar estado, cidade ou CEP', placeholder = 'Digite o estado, a cidade ou o CEP…' }) {
  const navigate = useNavigate();
  const uid = useId();
  const [q, setQ] = useState('');
  const [itens, setItens] = useState([]);
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(-1);
  const [msg, setMsg] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const inputRef = useRef(null);

  const ehCep = /^\d{5}-?\d{3}$/.test(q.trim());

  useEffect(() => {
    let cancelado = false;
    const termo = normalizar(q);
    if (termo.length < 2 || ehCep) { setItens([]); return; }
    carregarIndice()
      .then((lista) => {
        if (cancelado) return;
        const ok = lista.filter((i) => (filtro === 'todos' || i.tipo === filtro) && i.norm.includes(termo));
        ok.sort((a, b) => Number(b.norm.startsWith(termo)) - Number(a.norm.startsWith(termo)));
        setItens(ok.slice(0, 8));
        setAtivo(-1);
      })
      .catch(() => !cancelado && setMsg('Não foi possível carregar a lista de localidades. Tente novamente.'));
    return () => { cancelado = true; };
  }, [q, filtro, ehCep]);

  const ir = (i) => { setAberto(false); setQ(''); navigate(`/${i.tipo}/${i.id}`); };

  async function enviar(e) {
    e.preventDefault();
    setMsg('');
    if (ativo >= 0 && itens[ativo]) return ir(itens[ativo]);
    if (ehCep) {
      setOcupado(true);
      try {
        const m = await getMunicipioPorCep(q);
        navigate(`/municipio/${m.id}`);
      } catch (err) { setMsg(err.message); }
      finally { setOcupado(false); }
      return;
    }
    if (itens[0]) return ir(itens[0]);
    setMsg(q.trim().length < 2 ? 'Digite ao menos 2 letras ou um CEP com 8 dígitos.' : `Nenhum resultado para “${q}”. Confira a grafia.`);
    inputRef.current?.focus();
  }

  function teclas(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setAberto(true); setAtivo((a) => Math.min(a + 1, itens.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setAtivo((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Escape') { setAberto(false); setAtivo(-1); }
  }

  const mostrar = aberto && itens.length > 0;
  return (
    <form className="searchbox" onSubmit={enviar} role="search" noValidate>
      <label htmlFor={`${uid}-q`} className="sr-only">{rotulo}</label>
      <div className="searchbox-row">
        <input
          id={`${uid}-q`}
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={mostrar}
          aria-controls={`${uid}-lista`}
          aria-autocomplete="list"
          aria-activedescendant={ativo >= 0 ? `${uid}-op-${ativo}` : undefined}
          aria-describedby={`${uid}-msg`}
          autoComplete="off"
          placeholder={placeholder}
          value={q}
          onChange={(e) => { setQ(e.target.value); setAberto(true); setMsg(''); }}
          onKeyDown={teclas}
          onBlur={() => setTimeout(() => setAberto(false), 150)}
        />
        <button type="submit" className="btn btn-primary" disabled={ocupado}>{ocupado ? 'Buscando…' : 'Buscar'}</button>
      </div>
      <ul id={`${uid}-lista`} role="listbox" aria-label="Sugestões" className="suggestions" hidden={!mostrar}>
        {itens.map((i, idx) => (
          <li key={`${i.tipo}-${i.id}`} id={`${uid}-op-${idx}`} role="option" aria-selected={idx === ativo}
              className={idx === ativo ? 'active' : ''} onMouseDown={(e) => { e.preventDefault(); ir(i); }}>
            <span>{i.nome}{i.tipo === 'municipio' && i.uf ? ` (${i.uf})` : ''}</span>
            <small>{i.tipo === 'estado' ? 'Estado' : 'Município'}</small>
          </li>
        ))}
      </ul>
      <p id={`${uid}-msg`} className="field-msg" role="status" aria-live="polite">
        {msg || (mostrar ? `${itens.length} sugestões disponíveis. Use as setas para navegar.` : '')}
      </p>
    </form>
  );
}
