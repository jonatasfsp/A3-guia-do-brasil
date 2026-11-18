import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePageTitle } from '../hooks/useAsync.js';

export default function About() {
  usePageTitle('Sobre');
  const { hash } = useLocation();
  
  useEffect(() => { if (hash) document.getElementById(hash.slice(1))?.scrollIntoView(); }, [hash]);
  return (
    <article className="prose">
      <h1>Sobre o Guia do Brasil</h1>
      <p>O Guia do Brasil é um projeto acadêmico (UC HUB / Projeto A3) que reúne dados oficiais sobre regiões, estados e municípios brasileiros em uma interface simples, acessível e pesquisável.</p>
      <h2 id="dados-abertos">Dados abertos</h2>
      <ul>
        <li>Localidades, Censo 2022 e PIB: <a href="https://servicodados.ibge.gov.br/api/docs" target="_blank" rel="noreferrer">APIs de dados do IBGE<span className="sr-only"> (abre em nova aba)</span></a>.</li>
        <li>Textos e fotos: <a href="https://pt.wikipedia.org" target="_blank" rel="noreferrer">Wikipédia<span className="sr-only"> (abre em nova aba)</span></a> (CC BY-SA).</li>
        <li>CEP: <a href="https://viacep.com.br" target="_blank" rel="noreferrer">ViaCEP<span className="sr-only"> (abre em nova aba)</span></a>.</li>
      </ul>
      <h2 id="termos">Termos de uso</h2>
      <p>O serviço é gratuito e educacional. Os dados exibidos pertencem às fontes citadas e podem ter atualização posterior ao Censo.</p>
      <h2 id="privacidade">Privacidade</h2>
      <p>Sua conta e seus favoritos ficam armazenados somente no seu navegador (localStorage). Nenhum dado pessoal é enviado a servidores do projeto. Esta autenticação é uma simulação didática.</p>
    </article>
  );
}
