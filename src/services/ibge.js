const LOC = 'https://servicodados.ibge.gov.br/api/v1/localidades';
const AGR = 'https://servicodados.ibge.gov.br/api/v3/agregados';
export const malhaUrl = (tipo, id) =>
  `https://servicodados.ibge.gov.br/api/v3/malhas/${tipo === 'estado' ? 'estados' : 'municipios'}/${id}?formato=image/svg+xml`;

const cache = new Map(); 

async function getJSON(url) {
  if (cache.has(url)) return cache.get(url);
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`A API do IBGE respondeu com erro (HTTP ${resp.status}).`);
  const data = await resp.json();
  cache.set(url, data);
  return data;
}

const unico = (d, nome) => {
  const item = Array.isArray(d) ? d[0] : d;
  if (!item) throw new Error(`${nome} não encontrado(a) na base do IBGE.`);
  return item;
};

export const getRegioes = () => getJSON(`${LOC}/regioes?orderBy=nome`);
export const getEstados = () => getJSON(`${LOC}/estados?orderBy=nome`);
export const getTodosMunicipios = () => getJSON(`${LOC}/municipios?orderBy=nome`);
export const getTodosDistritos = () => getJSON(`${LOC}/distritos`);
export const getEstado = async (id) => unico(await getJSON(`${LOC}/estados/${id}`), 'Estado');
export const getMunicipio = async (id) => unico(await getJSON(`${LOC}/municipios/${id}`), 'Município');
export const getMunicipiosDoEstado = (ufId) => getJSON(`${LOC}/estados/${ufId}/municipios?orderBy=nome`);
export const getDistritosDoMunicipio = (id) => getJSON(`${LOC}/municipios/${id}/distritos`);

const ultimo = (serie) => {
  if (!serie) return null;
  const v = Number(Object.values(serie).pop());
  return Number.isFinite(v) ? v : null;
};
const nivelN = (tipo) => (tipo === 'estado' ? 'N3' : 'N6');

export async function getIndicadores(tipo, id) {
  const data = await getJSON(`${AGR}/4714/periodos/2022/variaveis/93|6318|614?localidades=${nivelN(tipo)}[${id}]`);
  const out = {};
  for (const v of data) out[v.id] = ultimo(v.resultados?.[0]?.series?.[0]?.serie);
  return { populacao: out['93'], area: out['6318'], densidade: out['614'] };
}

export async function getPib(tipo, id) {
  try {
    const data = await getJSON(`${AGR}/5938/periodos/-1/variaveis/37?localidades=${nivelN(tipo)}[${id}]`);
    const serie = data[0]?.resultados?.[0]?.series?.[0]?.serie;
    if (!serie) return null;
    const [ano, val] = Object.entries(serie).pop();
    const n = Number(val);
    return Number.isFinite(n) ? { ano, valor: n * 1000 } : null;
  } catch {
    return null; 
  }
}

export async function getPopulacaoMunicipiosDoEstado(ufId) {
  const data = await getJSON(`${AGR}/4714/periodos/2022/variaveis/93?localidades=N6[N3[${ufId}]]`);
  const series = data[0]?.resultados?.[0]?.series ?? [];
  return series
    .map((s) => ({
      id: s.localidade.id,
      nome: s.localidade.nome.replace(/ - [A-Z]{2}$/, ''),
      populacao: ultimo(s.serie)
    }))
    .filter((x) => x.populacao != null)
    .sort((a, b) => b.populacao - a.populacao);
}

export async function getContagens() {
  const [estados, municipios, distritos] = await Promise.all([
    getEstados(), getTodosMunicipios(), getTodosDistritos()
  ]);
  return { estados: estados.length, municipios: municipios.length, distritos: distritos.length };
}
