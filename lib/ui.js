
/**
 * Föll sem sjá um að kalla í `fetchNews` og birta viðmót:
 * - Loading state meðan gögn eru sótt
 * - Villu state ef villa kemur upp við að sækja gögn
 * - Birta gögnin ef allt OK
 * Fyrir gögnin eru líka búnir til takkar sem leyfa að fara milli forsíðu og
 * flokks *án þess* að nota sjálfgefna <a href> virkni—við tökum yfir og sjáum
 * um sjálf með History API.
 */

import { fetchNews } from "./news.js";
import { el, empty } from "./helpers.js"

/**
 * Sér um smell á flokk og birtir flokkinn *á sömu síðu* og við erum á.
 * Þarf að:
 * - Stoppa sjálfgefna hegðun <a href>
 * - Tæma `container` þ.a. ekki sé verið að setja efni ofan í annað efni
 * - Útbúa link sem fer til baka frá flokk á forsíðu, þess vegna þarf `newsItemLimit`
 * - Sækja og birta flokk
 * - Bæta við færslu í `history` þ.a. back takki virki
 *
 * Notum lokun þ.a. við getum útbúið föll fyrir alla flokka með einu falli. Notkun:
 * ```
 * link.addEventListener('click', handleCategoryClick(categoryId, container, newsItemLimit));
 * ```
 *
 * @param {string} id ID á flokk sem birta á eftir að smellt er
 * @param {HTMLElement} container Element sem á að birta fréttirnar í
 * @param {number} newsItemLimit Hámark frétta sem á að birta
 * @returns {function} Fall sem bundið er við click event á link/takka
 */
function handleCategoryClick(id, container, newsItemLimit) {
  return (e) => {
    e.preventDefault();
    empty(container);
    const goback = createCategoryBackLink(container, newsItemLimit);
    fetchAndRenderCategory(id, container, goback);
    window.history.pushState({},'', `?category=${id}`);
    // TODO útfæra
  };
}

/**
 * Eins og `handleCategoryClick`, nema býr til link sem fer á forsíðu.
 *
 * @param {HTMLElement} container Element sem á að birta fréttirnar í
 * @param {number} newsItemLimit Hámark frétta sem á að birta
 * @returns {function} Fall sem bundið er við click event á link/takka
 */
function handleBackClick(container, newsItemLimit) {
  return (e) => {
    e.preventDefault();
    empty(container);
    window.history.pushState({},'','/');
    fetchAndRenderLists(container, newsItemLimit);
    // TODO útfæra
  };
}

/**
 * Útbýr takka sem fer á forsíðu.
 * @param {HTMLElement} container Element sem á að birta fréttirnar í
 * @param {number} newsItemLimit Hámark frétta sem á að birta
 * @returns {HTMLElement} Element með takka sem fer á forsíðu
 */
export function createCategoryBackLink(container, newsItemLimit) {
  // TODO útfæra
  const b_link = el('a', 'Til baka');
  b_link.setAttribute('href', '/');
  b_link.classList.add('news__link');
  b_link.addEventListener('click', handleBackClick(container, newsItemLimit));
  
  return b_link;
}

/**
 * Sækir grunnlista af fréttum, síðan hvern flokk fyrir sig og birtir nýjustu
 * N fréttir úr þeim flokk með `fetchAndRenderCategory()`
 * @param {HTMLElement} container Element sem mun innihalda allar fréttir
 * @param {number} newsItemLimit Hámark fjöldi frétta sem á að birta í yfirliti
 */
export async function fetchAndRenderLists(container, newsItemLimit) {
  // Byrjum á að birta loading skilaboð
  const loadel =  el("p", "Sækir gögn");
  
  // Birtum þau beint á container
  container.appendChild(loadel);
  // Sækjum yfirlit með öllum flokkum, hér þarf að hugsa um Promises!
  const newsItemList = await fetchNews();
  console.log(newsItemList);
  // Fjarlægjum loading skilaboð
  container.removeChild(loadel);
  // Athugum hvort villa hafi komið upp => fetchNews skilaði null
  if(newsItemList == null){
    const none = el("p", "Villa kom upp");
    container.appendChild(none);
    return;
  }
  // Athugum hvort engir fréttaflokkar => fetchNews skilaði tómu fylki
  if(newsItemList.length == 0){
    const empty = el("p", "Fylkið er tómt");
    container.appendChild(empty);
    return;
  }
  // Búum til <section> sem heldur utan um allt
  const frettir = el("div");
  frettir.classList.add('newsList__list');
  const sec = el("section", frettir);
  sec.classList.add("newsList");

  container.appendChild(sec);
  // Höfum ekki-tómt fylki af fréttaflokkum! Ítrum í gegn og birtum
  for (let i = 0; i < newsItemList.length; i++){
      newsItemList[i];
      const listi = el("div");
      frettir.appendChild(listi);
      const link = el("a", "Sjá meira");
      const query = `/category=${ newsItemList[i].id}`;
      link.setAttribute("href", query);
      link.classList.add('news__link');
      link.addEventListener("click", handleCategoryClick(newsItemList[i].id, container, newsItemLimit));
      fetchAndRenderCategory(newsItemList[i].id, listi, link, newsItemLimit);
  }

  // Þegar það er smellt á flokka link, þá sjáum við um að birta fréttirnar, ekki default virknin
  
}

/**
 * Sækir gögn fyrir flokk og birtir í DOM.
 * @param {string} id ID á category sem við erum að sækja
 * @param {HTMLElement} parent Element sem setja á flokkinn í
 * @param {HTMLELement | null} [link=null] Linkur sem á að setja eftir fréttum
 * @param {number} [limit=Infinity] Hámarks fjöldi frétta til að sýna
 */
export async function fetchAndRenderCategory(
  id,
  parent,
  link = null,
  limit = Infinity
) {
  // Búum til <section> sem heldur utan um flokkinn
  const flokk = el("section");
  // Bætum við parent og þannig DOM, allar breytingar héðan í frá fara gegnum
  // container sem er tengt parent
  parent.appendChild(flokk);
  // Setjum inn loading skilaboð fyrir flokkinn
  const loading =  el("p", "Sækir gögn");
  flokk.appendChild(loading);


  // Sækjum gögn fyrir flokkinn og bíðum
  const newNews = await fetchNews(id);
  console.log(newNews);
  // Fjarlægjum loading skilaboð
  flokk.removeChild(loading);
  // Ef það er linkur, bæta honum við
  if (link){
    flokk.appendChild(link);
  }
  // Villuskilaboð ef villa og hættum
  if (!newNews){
    const villa = el("p", "Villa kom upp");
    flokk.appendChild(villa);
    return;
  }
  // Skilaboð ef engar fréttir og hættum
  if (newNews.items.length==0){
    const tómt = el("p", "Engar fréttir");
    flokk.appendChild(tómt);
    return;
  }
  // Bætum við titli
  const titill = el("h2", newNews.title);
  flokk.appendChild(titill);
  const allarfrettir = el("ul");
  flokk.appendChild(allarfrettir);
  // Höfum fréttir! Ítrum og bætum við <ul>
  for(let i = 0; i<newNews.items.length && i < limit; i++){
    const { title, link } = newNews.items[i];
    const site = el("a", title);
    site.setAttribute("href", link);
    const frett = el("li", site);
    flokk.appendChild(frett);
  }
}
