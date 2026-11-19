// Os dados de cada dragão vêm de dados.js.
const elemento = seletor => document.querySelector(seletor);
const ficha = elemento('#details');
const busca = elemento('#search');
let classeAtual = 'Todos';
let somenteFavoritos = false;
let favoritos = carregarFavoritos();
let dragaoAtual;
let botaoDeOrigem;
let temporizador;

function carregarFavoritos() {
  try {
    const salvos = JSON.parse(localStorage.getItem('berk-favoritos'));
    if (Array.isArray(salvos)) {
      return DRAGOES.filter(dragao => salvos.includes(dragao.id)).map(dragao => dragao.id);
    }
  } catch {
    // Se o navegador bloquear o armazenamento, a lista começa vazia.
  }
  return [];
}

function alternarFavorito(id) {
  if (favoritos.includes(id)) {
    favoritos = favoritos.filter(favorito => favorito !== id);
  } else {
    favoritos.push(id);
  }

  try {
    localStorage.setItem('berk-favoritos', JSON.stringify(favoritos));
  } catch {
    const aviso = elemento('#toast');
    aviso.textContent = 'Favoritos disponíveis apenas durante esta visita.';
    aviso.classList.add('show');
    clearTimeout(temporizador);
    temporizador = setTimeout(() => aviso.classList.remove('show'), 2500);
  }
  mostrarCatalogo();
  if (ficha.open) atualizarFavoritoDaFicha();
}

function semAcentos(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function criarCard(dragao) {
  const favorito = favoritos.includes(dragao.id);
  const acao = favorito ? 'Remover' : 'Adicionar';
  const numero = String(DRAGOES.indexOf(dragao) + 1).padStart(2, '0');
  return `
    <article class="card scenic">
      <button class="favorite" data-favorite="${dragao.id}" aria-pressed="${favorito}"
        aria-label="${acao} ${dragao.name} ${favorito ? 'dos' : 'aos'} favoritos">
        ${favorito ? '♥' : '♡'}
      </button>
      <button class="card-open" data-open="${dragao.id}" aria-label="Ver detalhes de ${dragao.name}">
        <div class="dragon-art">
          <span class="card-number">Nº ${numero}</span>
          <img src="imagens/${dragao.id}.webp" alt="${dragao.name}" loading="lazy">
        </div>
        <div class="card-body">
          <span class="class-label">Classe ${dragao.group}</span>
          <h3>${dragao.name}</h3>
          <p class="species">${dragao.species}</p>
          <div class="card-bottom"><span>Descobrir este dragão</span><span aria-hidden="true">↗</span></div>
        </div>
      </button>
    </article>`;
}

function mostrarCatalogo() {
  const termo = semAcentos(busca.value);
  const visiveis = DRAGOES.filter(dragao => {
    const mesmaClasse = classeAtual === 'Todos' || dragao.group === classeAtual;
    const mostrarFavorito = !somenteFavoritos || favoritos.includes(dragao.id);
    const nomeOuEspecie = semAcentos(dragao.name + ' ' + dragao.species);
    return mesmaClasse && mostrarFavorito && nomeOuEspecie.includes(termo);
  });

  elemento('#grid').innerHTML = visiveis.map(criarCard).join('');
  elemento('#empty').hidden = visiveis.length > 0;
  elemento('#fav-count').textContent = favoritos.length;
  const legenda = somenteFavoritos ? ' • seus favoritos' : ' para descobrir';
  elemento('#result-count').textContent = `${visiveis.length} de ${DRAGOES.length} dragões${legenda}`;
  elemento('#only-favorites').setAttribute('aria-pressed', somenteFavoritos);
  for (const botao of document.querySelectorAll('[data-group]')) {
    botao.setAttribute('aria-pressed', botao.dataset.group === classeAtual);
  }
}

function limparFiltros(apenasFavoritos = false) {
  classeAtual = 'Todos';
  somenteFavoritos = apenasFavoritos;
  busca.value = '';
  mostrarCatalogo();
}

const classes = new Set(DRAGOES.map(dragao => dragao.group));
for (const classe of ['Todos', ...classes]) {
  const botao = document.createElement('button');
  botao.textContent = classe;
  botao.dataset.group = classe;
  botao.onclick = () => {
    classeAtual = classe;
    mostrarCatalogo();
  };
  elemento('.filters').append(botao);
}

busca.oninput = mostrarCatalogo;
elemento('#clear').onclick = () => limparFiltros();
elemento('#reset-empty').onclick = () => limparFiltros();
elemento('#only-favorites').onclick = () => {
  somenteFavoritos = !somenteFavoritos;
  mostrarCatalogo();
};
elemento('#nav-favorites').onclick = () => {
  limparFiltros(true);
  elemento('#dragoes').scrollIntoView();
};

// Cada card tem dois botões: abrir a ficha ou salvar o favorito.
elemento('#grid').onclick = evento => {
  const botao = evento.target.closest('button');
  if (!botao) return;
  if (botao.dataset.open) {
    abrirFicha(DRAGOES.find(dragao => dragao.id === botao.dataset.open));
  } else {
    const id = botao.dataset.favorite;
    alternarFavorito(id);
    const destino = elemento(`[data-favorite="${id}"]`) || elemento('#only-favorites');
    destino.focus();
  }
};

function atualizarFavoritoDaFicha() {
  const salvo = favoritos.includes(dragaoAtual.id);
  const botao = elemento('#detail-favorite');
  botao.textContent = salvo ? '♥ Remover dos favoritos' : '♡ Adicionar aos favoritos';
  botao.setAttribute('aria-pressed', salvo);
}

function abrirFicha(dragao) {
  dragaoAtual = dragao;
  const imagem = elemento('#detail-image');
  imagem.src = `imagens/${dragao.id}.webp`;
  imagem.alt = dragao.name;
  elemento('#detail-group').textContent = 'Classe ' + dragao.group;
  elemento('#detail-title').textContent = dragao.name;
  elemento('#detail-tagline').textContent = dragao.tagline;
  elemento('#detail-description').textContent = dragao.description;
  elemento('#detail-species').textContent = dragao.species;
  elemento('#detail-power').textContent = dragao.power;
  elemento('#detail-rider').textContent = dragao.rider;
  elemento('#detail-position').textContent = `${DRAGOES.indexOf(dragao) + 1} / ${DRAGOES.length}`;
  atualizarFavoritoDaFicha();
  if (!ficha.open) {
    botaoDeOrigem = document.activeElement;
    ficha.showModal();
  }
}

function mudarDragao(passo) {
  let indice = DRAGOES.indexOf(dragaoAtual) + passo;
  if (indice < 0) indice = DRAGOES.length - 1;
  if (indice === DRAGOES.length) indice = 0;
  abrirFicha(DRAGOES[indice]);
}

elemento('#detail-favorite').onclick = () => alternarFavorito(dragaoAtual.id);
elemento('#previous-dragon').onclick = () => mudarDragao(-1);
elemento('#next-dragon').onclick = () => mudarDragao(1);
elemento('#surprise').onclick = () => {
  const opcoes = DRAGOES.filter(dragao => dragao !== dragaoAtual);
  abrirFicha(opcoes[Math.floor(Math.random() * opcoes.length)]);
};
elemento('.close').onclick = () => ficha.close();
ficha.onkeydown = evento => {
  if (evento.key === 'ArrowLeft' || evento.key === 'ArrowRight') {
    evento.preventDefault();
    mudarDragao(evento.key === 'ArrowLeft' ? -1 : 1);
  }
};
ficha.onclick = evento => {
  if (evento.target !== ficha) return;
  const borda = ficha.getBoundingClientRect();
  const foraNaHorizontal = evento.clientX < borda.left || evento.clientX > borda.right;
  const foraNaVertical = evento.clientY < borda.top || evento.clientY > borda.bottom;
  if (foraNaHorizontal || foraNaVertical) ficha.close();
};
ficha.onclose = () => {
  const destino = botaoDeOrigem.isConnected ? botaoDeOrigem : elemento('#surprise');
  destino.focus();
};

mostrarCatalogo();
