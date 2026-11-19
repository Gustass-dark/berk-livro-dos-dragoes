const PERGUNTAS = [
  {
    "enunciado": "Quem é o companheiro de Banguela?",
    "alternativas": [
      "Soluço",
      "Melequento",
      "Perna-de-Peixe"
    ],
    "correta": 0,
    "explicacao": "Soluço e Banguela constroem a amizade que transforma Berk."
  },
  {
    "enunciado": "Qual dragão canaliza a eletricidade dos raios?",
    "alternativas": [
      "Batatão",
      "Estridente",
      "Tempestade"
    ],
    "correta": 1,
    "explicacao": "O Estridente, também chamado Skrill, se destaca durante as tempestades."
  },
  {
    "enunciado": "Qual é a habilidade especial do Pesadelo Monstruoso?",
    "alternativas": [
      "Construir um santuário de gelo",
      "Envolver o corpo em chamas",
      "Lançar âmbar"
    ],
    "correta": 1,
    "explicacao": "Dente de Anzol consegue envolver o próprio corpo em chamas."
  },
  {
    "enunciado": "Quem voa ao lado de Tempestade?",
    "alternativas": [
      "Heather",
      "Valka",
      "Astrid"
    ],
    "correta": 2,
    "explicacao": "Tempestade é a Nadder Mortal companheira de Astrid."
  },
  {
    "enunciado": "Como a Canção da Morte aprisiona suas presas?",
    "alternativas": [
      "Com uma substância que endurece como âmbar",
      "Com gelo",
      "Com túneis subterrâneos"
    ],
    "correta": 0,
    "explicacao": "Seu canto atrai outros dragões, e o âmbar os aprisiona."
  }
];

const tituloQuiz = document.getElementById('quiz-question');
const opcoesQuiz = document.getElementById('quiz-options');
const retornoQuiz = document.getElementById('quiz-feedback');
const proxima = document.getElementById('quiz-next');
let rodada = 0;
let acertos = 0;

function atualizarBarra(concluidas) {
  document.getElementById('quiz-bar').style.width = (concluidas / PERGUNTAS.length * 100) + '%';
}

function mostrarPergunta() {
  const pergunta = PERGUNTAS[rodada];
  document.getElementById('quiz-progress').textContent = `PERGUNTA ${rodada + 1} DE ${PERGUNTAS.length}`;
  tituloQuiz.textContent = pergunta.enunciado;
  retornoQuiz.textContent = '';
  atualizarBarra(rodada);
  proxima.hidden = true;
  opcoesQuiz.replaceChildren();

  pergunta.alternativas.forEach((texto, indice) => {
    const botao = document.createElement('button');
    botao.className = 'quiz-option';
    botao.textContent = texto;
    botao.onclick = () => responder(indice);
    opcoesQuiz.append(botao);
  });
}

function responder(escolha) {
  const pergunta = PERGUNTAS[rodada];
  const botoes = opcoesQuiz.children;
  for (const botao of botoes) {
    botao.disabled = true;
  }
  botoes[pergunta.correta].classList.add('correct');

  let mensagem = 'Você acertou!';
  if (escolha === pergunta.correta) {
    acertos++;
  } else {
    botoes[escolha].classList.add('incorrect');
    mensagem = 'Quase! Resposta: ' + pergunta.alternativas[pergunta.correta] + '.';
  }

  retornoQuiz.textContent = mensagem + ' ' + pergunta.explicacao;
  atualizarBarra(rodada + 1);
  proxima.textContent = rodada === PERGUNTAS.length - 1 ? 'Ver meu resultado →' : 'Próxima pergunta →';
  proxima.hidden = false;
  proxima.focus();
}

function mostrarResultado() {
  document.getElementById('quiz-progress').textContent = 'DESAFIO CONCLUÍDO';
  tituloQuiz.textContent = `${acertos} de ${PERGUNTAS.length} acertos`;
  opcoesQuiz.replaceChildren();
  retornoQuiz.textContent = acertos === PERGUNTAS.length
    ? 'Você conhece bem os dragões de Berk! Que tal escolher seu favorito no catálogo?'
    : 'Mais uma aventura concluída! Explore as fichas do catálogo e tente novamente quando quiser.';
  proxima.textContent = 'Jogar novamente ↺';
}

proxima.onclick = () => {
  if (rodada === PERGUNTAS.length) {
    rodada = 0;
    acertos = 0;
  } else {
    rodada++;
  }
  if (rodada === PERGUNTAS.length) mostrarResultado();
  else mostrarPergunta();
  tituloQuiz.focus();
};

mostrarPergunta();
