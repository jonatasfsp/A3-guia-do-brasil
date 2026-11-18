# Guia do Brasil

Plataforma web em **React** para consultar regiões, estados e municípios brasileiros com dados oficiais do **IBGE**.
Projeto A3 (UC HUB) – front-end consumindo APIs públicas, com foco em **usabilidade (Nielsen)** e **acessibilidade (WCAG)**.

## Como rodar

```bash
npm install
npm run dev        
npm run build      
npm run preview    
```
Requer Node 18+. Não há chave de API nem variável de ambiente.

## Funcionalidades (mapeadas ao pré-projeto)

| Tela do pré-projeto | Rota | O que faz |
|---|---|---|
| Tela inicial | `/#/` | Contagens ao vivo (UFs, municípios, distritos), mapa, consulta rápida, fotos |
| Login | `/#/entrar` | E-mail + senha, validação, mostrar/ocultar senha |
| Sign in (cadastro) | `/#/cadastro` | Nome, e-mail, senha com medidor de força, termos |
| Tela inicial logado | `/#/explorar` | Busca com autocomplete, **Surpreenda-me**, favoritos |
| Resultado da pesquisa | `/#/estado/:id` e `/#/municipio/:id` | População, área, densidade, PIB, ranking, mapa, texto |
| Extras | `/#/catalogo/estados\|municipios\|regioes`, `/#/sobre` | Navegação por camadas (cards da home) |

## APIs utilizadas (todas públicas, sem chave)

| API | Endpoint base | Exemplo | Uso |
|---|---|---|---|
| IBGE Localidades | `https://servicodados.ibge.gov.br/api/v1/localidades` | `/estados`, `/municipios/3550308`, `/municipios/3550308/distritos` | Regiões, UFs, municípios, distritos |
| IBGE Agregados (SIDRA) | `https://servicodados.ibge.gov.br/api/v3/agregados` | `/4714/periodos/2022/variaveis/93\|6318\|614?localidades=N3[35]` | População, área e densidade (Censo 2022) |
| IBGE Agregados – PIB | idem | `/5938/periodos/-1/variaveis/37?localidades=N6[3550308]` | PIB a preços correntes (último ano) |
| IBGE Malhas | `https://servicodados.ibge.gov.br/api/v3/malhas` | `/estados/35?formato=image/svg+xml` | Contorno do território |
| Wikipédia (pt) | `https://pt.wikipedia.org/w/api.php` | `action=query&generator=search&prop=extracts\|pageimages` | Texto e fotos; base do **Surpreenda-me** |
| ViaCEP | `https://viacep.com.br/ws/{cep}/json/` | `/01001000/json/` | Busca por CEP → município |

**Surpreenda-me:** sorteia um estado ou município a partir da API do IBGE, busca um resumo na Wikipédia e
mostra o texto só se o título bater com o local sorteado; caso contrário monta a curiosidade apenas com dados do IBGE.
Não usa IA nem chave de API.

## Estrutura

```
src/
  services/    ibge.js (IBGE) · extras.js (Wikipédia, ViaCEP)
  context/     AuthContext (login simulado) · FavoritesContext
  hooks/       useAsync (loading/erro/retry) · usePageTitle
  components/  Layout, SearchBox, Surprise, FavCard, Donut, Status, FavoriteButton…
  pages/       Home, Login, Register, Explore, Result, Catalog, About, NotFound
  utils/       format.js (números, moeda, normalização de texto)
```

