export async function getResumoWikipedia(termo) {
  const url =
    'https://pt.wikipedia.org/w/api.php?action=query&format=json&origin=*' +
    `&generator=search&gsrsearch=${encodeURIComponent(termo)}&gsrlimit=1` +
    '&prop=extracts|pageimages&exintro=1&explaintext=1&exsentences=4' +
    '&piprop=thumbnail&pithumbsize=900&redirects=1';
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const json = await resp.json();
    const pagina = Object.values(json.query?.pages ?? {})[0];
    if (!pagina?.extract) return null;
    return {
      titulo: pagina.title,
      texto: pagina.extract,
      imagem: pagina.thumbnail?.source ?? null,
      link: `https://pt.wikipedia.org/?curid=${pagina.pageid}`
    };
  } catch {
    return null; 
  }
}

export async function getMunicipioPorCep(cep) {
  const limpo = cep.replace(/\D/g, '');
  const resp = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
  if (!resp.ok) throw new Error('Não foi possível consultar o CEP agora.');
  const json = await resp.json();
  if (json.erro || !json.ibge) throw new Error('CEP não encontrado.');
  return { id: json.ibge, nome: json.localidade, uf: json.uf };
}
