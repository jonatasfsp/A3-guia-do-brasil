export const fmtNum = (n, digits = 0) =>
  n == null || Number.isNaN(n)
    ? '—'
    : Number(n).toLocaleString('pt-BR', { maximumFractionDigits: digits });

export function fmtMoeda(v) {
  if (v == null) return '—';
  const f = (x, s) => `R$ ${x.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${s}`;
  if (v >= 1e12) return f(v / 1e12, 'tri');
  if (v >= 1e9) return f(v / 1e9, 'bi');
  if (v >= 1e6) return f(v / 1e6, 'mi');
  return `R$ ${v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
}

export const normalizar = (s = '') =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export const CAPITAIS = {
  11: 'Porto Velho', 12: 'Rio Branco', 13: 'Manaus', 14: 'Boa Vista', 15: 'Belém',
  16: 'Macapá', 17: 'Palmas', 21: 'São Luís', 22: 'Teresina', 23: 'Fortaleza',
  24: 'Natal', 25: 'João Pessoa', 26: 'Recife', 27: 'Maceió', 28: 'Aracaju',
  29: 'Salvador', 31: 'Belo Horizonte', 32: 'Vitória', 33: 'Rio de Janeiro',
  35: 'São Paulo', 41: 'Curitiba', 42: 'Florianópolis', 43: 'Porto Alegre',
  50: 'Campo Grande', 51: 'Cuiabá', 52: 'Goiânia', 53: 'Brasília'
};

export function ufDoMunicipio(m) {
  return (
    m?.microrregiao?.mesorregiao?.UF ??
    m?.['regiao-imediata']?.['regiao-intermediaria']?.UF ??
    null
  );
}
