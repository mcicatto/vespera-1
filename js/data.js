/* ============================================================
   VÉSPERA — DADOS DO MUNDO
   Tudo aqui é conteúdo: mapas, personagens, diálogos, enigmas.
   A lógica fica em game.js.
   ============================================================ */
(function () {
  const D = {};

  D.TITLE = "VÉSPERA";
  D.SUBTITLE = "a última página";

  /* ---------------------------------------------------------
     INTRO (cutscene)
     --------------------------------------------------------- */
  D.INTRO = [
    "No começo, as pessoas não notaram.",
    "Desapareceu uma árvore. Depois, uma música que ninguém lembrava de ter ouvido.",
    "Depois, o nome de uma rua.",
    "Então começaram a desaparecer pessoas.",
    "Agora a cidade inteira está sendo apagada — devagar, de dentro para fora.",
    "Você acorda em Véspera com a bússola do peito apontando para o nada.",
    "Seu nome, você não sabe. No seu pulso, alguém escreveu: \"???\".",
    "A missão parece simples: encontrar a ÚLTIMA PÁGINA.",
    "Ninguém sabe o que ela contém. Ninguém sabe quem a está escrevendo.",
    "Talvez você descubra as duas coisas. Talvez sejam a mesma."
  ];

  D.CUT_FRAGMENTS = "Os fragmentos se encaixam. As palavras formam uma frase:\n\n« VOCÊ SEMPRE ESCREVEU ESTA PÁGINA »";
  D.CUT_LASTPAGE =
    "A Última Página não tem um final.\n\nEla tem uma lista:\n\n  · cada porta que você abriu\n  · cada silêncio que você escolheu\n  · cada pessoa que você disse não existir\n\nE, no rodapé, uma única frase, escrita por uma mão que parece a sua:\n\n« VOCÊ JÁ ESTEVE AQUI ANTES »\n\nSob a frase, duas palavras, vacilando como se respirassem.";

  /* ---------------------------------------------------------
     ITENS
     --------------------------------------------------------- */
  D.ITEMS = {
    chave:   { ic: "🗝️", nm: "Chave Circular", strange: true,  desc: "Uma chave que não abre portas que existem. Só as que ainda vão existir." },
    espelho: { ic: "🪞", nm: "Espelho Trincado", strange: true, desc: "Mostra uma versão sua. Ela está mais velha. Ela parece cansada." },
    relogio: { ic: "🕰️", nm: "Relógio Curto", strange: true,  desc: "Volta cinco segundos no tempo. Cinco segundos nunca são suficientes." },
    carta:   { ic: "✉️", nm: "Carta Selada", strange: true,   desc: "Uma carta escrita pela sua letra, datada de amanhã. Você não escreveu isto. Ainda." },
    sino:    { ic: "🔔", nm: "Sino Surdo", strange: true,     desc: "Ninguém vivo o ouve. Quem desapareceu, ouve muito bem." },
    fio:     { ic: "🧵", nm: "Fio Vermelho", strange: true,   desc: "Conecta pessoas que guardam um segredo em comum. O outro extremo desaparece sob a terra." },
    livro:   { ic: "📕", nm: "Livro Errado", strange: true,   desc: "Conta a sua vida. O texto muda conforme você escolhe. Termina sempre em branco." },
    memoria: { ic: "🧪", nm: "Memória Engarrafada", strange: true, desc: "Comprada com o futuro. Cheira a chuva que ainda não caiu." },
    lanterna:{ ic: "🏮", nm: "Lanterna Curva", strange: false, desc: "Ilumina o que está atrás de você. Não o que está na frente." },
    moeda:   { ic: "🪙", nm: "Moeda Dupla",   strange: false, desc: "Tem coroa dos dois lados. Toda escolha parece a mesma, ao sol." },
  };

  /* ---------------------------------------------------------
     FRAGMENTOS (na ordem em que devem ser reunidos)
     --------------------------------------------------------- */
  D.FRAGMENTS = ["VOCÊ", "SEMPRE", "ESCREVEU", "ESTA", "PÁGINA"];

  /* ---------------------------------------------------------
     ÁREAS
     C: corredor/hub   I: interior
     legenda mapa: # parede, . chão, ~ água, T árvore, w fonte
     --------------------------------------------------------- */
  D.AREAS = {};

  /* -------- HUB: A Rua Sem Nome -------- */
  D.AREAS.rua = {
    id: "rua",
    name: "A Rua Sem Nome",
    palette: { floor: "#8a6a4a", wall: "#4a3830", accent: "#e7b463", deco: "#c79a5f" },
    map: [
      "#######################",
      "#.....................#",
      "#...C...........F.....#",
      "#.....................#",
      "#.....................#",
      "#....M.........N......#",
      "#.....................#",
      "#.........ww..........#",
      "#.........ww..........#",
      "#R..................L.#",
      "#.....................#",
      "#.....................#",
      "#.........B...........#",
      "#.....................#",
      "#######################",
    ],
    spawn: { x: 11, y: 6 },
    onEnter: { music: "warm", corrupt: 0 },
    npcs: [
      { id: "vend", x: 6, y: 5, icon: "🕯️", name: "A Vendedora de Memórias", dialog: "vend_1" },
      { id: "menino", x: 15, y: 5, icon: "🐦", name: "O Menino que Sempre Chega Primeiro", dialog: "menino_1" },
      { id: "gato", x: 9, y: 9, icon: "🐈", name: "Um Gato", dialog: "gato_1", wander: true, cat: true },
    ],
    objects: [
      { id: "placa", x: 11, y: 1, icon: "🪧", name: "Placa sem nome", kind: "look", text: "Uma placa de rua. O nome foi arrancado da madeira, não escrito por cima. As letras foram apagadas por dentro." },
      { id: "banca", x: 6, y: 6, icon: "🧺", name: "Banca de memórias", kind: "look", text: "Frascos de todas as cores. Num deles, uma tempestade ainda não acontecida. Num outro, a sua voz dizendo algo que você não disse." },
    ],
    portals: [
      { x: 4, y: 2, to: "casa", label: "Casa da Rua Sem Nome", icon: "🏚️", tx: 10, ty: 10 },
      { x: 16, y: 2, to: "floresta", label: "Floresta dos Caminhos Trocados", icon: "🌲", tx: 10, ty: 10 },
      { x: 1, y: 9, to: "relogios", label: "Casa dos Relógios", icon: "🕰️", tx: 10, ty: 10 },
      { x: 21, y: 9, to: "lago", label: "Lago do Reflexo Ausente", icon: "🌊", tx: 10, ty: 6 },
      { x: 11, y: 12, to: "biblioteca", label: "Biblioteca Impossível", icon: "📚", tx: 10, ty: 10 },
    ],
  };

  /* -------- CASA -------- */
  D.AREAS.casa = {
    id: "casa",
    name: "Casa da Rua Sem Nome",
    palette: { floor: "#9a7550", wall: "#5a4034", accent: "#e7b463", deco: "#d9a86a" },
    map: [
      "#####################",
      "#..........#........#",
      "#..........#........#",
      "#..........#........#",
      "#.....######........#",
      "#...................#",
      "#...................#",
      "#........####.......#",
      "#........#..#.......#",
      "#........####.......#",
      "#...................#",
      "#...................#",
      "#####################",
    ],
    spawn: { x: 10, y: 10 },
    onEnter: { music: "warm", toast: "Os objetos aqui lembram das pessoas." },
    npcs: [
      { id: "moradora", x: 4, y: 2, icon: "👵", name: "A Moradora", dialog: "mor_1" },
      { id: "gato", x: 15, y: 6, icon: "🐈", name: "Um Gato", dialog: "gato_1", wander: true, cat: true },
    ],
    objects: [
      { id: "retrato", x: 2, y: 2, icon: "🖼️", name: "Retrato Desbotado", kind: "memory",
        text: "Um retrato de família. O rosto do pai foi apagado. Você olha e lembra, sem saber por quê: uma valsa, uma mão no ombro, alguém cantando \"não durma ainda\".", mem: 1, flag: "lembrou_casa" },
      { id: "piano", x: 8, y: 5, icon: "🎹", name: "Piano Mudo", kind: "puzzle", puzzle: "piano",
        text: "Um piano antigo. Ninguém toca há décadas, mas as teclas se movem sozinhas quando você se aproxima. Ele quer lembrar a canção. Ajude-o." },
      { id: "espelho", x: 16, y: 8, icon: "🪞", name: "Espelho sem prata", kind: "fragment", frag: 0,
        text: "O espelho está sem o azogue, mas reflete uma sala que não é esta. Nele, a parede tem um vão. Você estica a mão e o vão é real." },
      { id: "bau", x: 16, y: 10, icon: "🧰", name: "Baú Trancado", kind: "look", requires: "piano",
        text: "Dentro do baú: um relógio pequeno que anda para trás. Você o guarda. (Objeto: Relógio Curto)" , give: "relogio" },
      { id: "parede", x: 2, y: 10, icon: "🕳️", name: "Rasgo na parede", kind: "battle", enemy: "apagador_menor",
        text: "Um rasgo de nada se abre na parede. De dentro, algo começa a apagar a sala." },
      { id: "armario", x: 10, y: 8, icon: "🚪", name: "Armário", kind: "secret_cat",
        text: "O armário está entreaberto. Só abre se o gato tiver mostrado o caminho." },
    ],
    portals: [
      { x: 10, y: 12, to: "rua", label: "Voltar à rua", icon: "↩", tx: 4, ty: 3 },
    ],
  };

  /* -------- FLORESTA -------- */
  D.AREAS.floresta = {
    id: "floresta",
    name: "Floresta dos Caminhos Trocados",
    palette: { floor: "#3f5a3a", wall: "#22331f", accent: "#9ad07a", deco: "#5c7f4a" },
    map: [
      "#####################",
      "#T.................T#",
      "#..TT....TT....TT..#",
      "#..................#",
      "#....TT........TT..#",
      "#..........TT......#",
      "#..TT.........TT...#",
      "#..................#",
      "#....TT....TT..TT..#",
      "#..................#",
      "#..TT....TT........#",
      "#T.................T#",
      "#####################",
    ],
    spawn: { x: 10, y: 10 },
    onEnter: { music: "forest", toast: "Os caminhos aqui mentem. Olhe para trás." },
    npcs: [
      { id: "menino_f", x: 10, y: 3, icon: "🐦", name: "O Menino que Sempre Chega Primeiro", dialog: "menino_f" },
      { id: "guarda", x: 4, y: 6, icon: "🦌", name: "O Guardador de Caminhos", dialog: "guarda_1" },
      { id: "gato", x: 16, y: 7, icon: "🐈", name: "Um Gato", dialog: "gato_1", wander: true, cat: true },
    ],
    objects: [
      { id: "pedra", x: 16, y: 4, icon: "🪨", name: "Pedra Esculpida", kind: "memory",
        text: "Na pedra, sulcos antigos formam palavras: «O SONO, O TRABALHO, O SOL, A SAUDADE — na ordem em que a vida acontece.»\nVocê não entende ainda. Guarda a frase.", mem: 1, flag: "pista_relogio", imbue: "O SONO 03 · O TRABALHO 06 · O SOL 12 · A SAUDADE 09" },
      { id: "santuario", x: 10, y: 1, icon: "⛩️", name: "Santuário Trocado", kind: "fragment", frag: 1,
        text: "O santuário está de costas para o caminho. Uma voz sem dono sussurra: «Só se abre para quem caminha na direção oposta ao que vê.»" },
      { id: "clareira", x: 3, y: 1, icon: "🌼", name: "Clareira impossível", kind: "memory", hidden: true, requires: "cat_followed",
        text: "Uma clareira que não deveria caber na floresta. Nela, uma criança desenha com giz no chão: uma casa, um gato, uma porta, e três palavras riscadas: «DE NOVO».", mem: 2, flag: "viu_de_novo" },
      { id: "apagador_n", x: 18, y: 2, icon: "🌀", name: "Algo sem nome", kind: "battle", enemy: "apagador_nomes",
        text: "O ar fica fino e sem som. Algo está tentando apagar os nomes das árvores, dos pássaros, e talvez o seu." },
    ],
    portals: [
      { x: 10, y: 12, to: "rua", label: "Voltar à rua", icon: "↩", tx: 16, ty: 3 },
    ],
  };

  /* -------- RELÓGIOS -------- */
  D.AREAS.relogios = {
    id: "relogios",
    name: "Casa dos Relógios",
    palette: { floor: "#6a5a7a", wall: "#33283f", accent: "#c9a3ef", deco: "#8a74a8" },
    map: [
      "#####################",
      "#...................#",
      "#..####.......####..#",
      "#..#..............#.#",
      "#..#..............#.#",
      "#..................#",
      "#..................#",
      "#.....########.....#",
      "#..............#...#",
      "#..................#",
      "#..................#",
      "#..................#",
      "#####################",
    ],
    spawn: { x: 10, y: 10 },
    onEnter: { music: "clocks", toast: "Cada sala desta casa é um momento diferente." },
    npcs: [
      { id: "relojoeiro", x: 10, y: 2, icon: "🧓", name: "O Relojoeiro", dialog: "relog_1" },
      { id: "gato", x: 4, y: 10, icon: "🐈", name: "Um Gato", dialog: "gato_1", wander: true, cat: true },
    ],
    objects: [
      { id: "relogios", x: 6, y: 6, icon: "🕰️", name: "Quatro Relógios", kind: "puzzle", puzzle: "clocks",
        text: "Quatro relógios, parados. Na parede: «Não marcam horas. Marcam o dia de alguém. Ponha-os na ordem em que uma vida acontece.»", imbue: "Lembre-se da pedra da floresta." },
      { id: "fragmento_esq", x: 10, y: 8, icon: "📄", name: "Fragmento na poeira", kind: "fragment", frag: 2, requires: "clocks",
        text: "Quando os relógios certos andam juntos, uma gaveta se abre na parede. Dentro, meio papel, meio lembrança." },
      { id: "memoria_tempo", x: 3, y: 4, icon: "⏳", name: "Ampulheta Rachada", kind: "memory",
        text: "Você vira a ampulheta e, por um instante, vê a sala como ela era há cem anos: cheia de gente, e todas as pessoas usam o seu rosto.", mem: 2, flag: "viu_o_rosto" },
      { id: "apagador_t", x: 16, y: 10, icon: "🌀", name: "Apagador de Horas", kind: "battle", enemy: "vazio",
        text: "Algo bloqueia a porta do tempo. É grande demais para ser vencido. Talvez não precise ser." },
    ],
    portals: [
      { x: 10, y: 12, to: "rua", label: "Voltar à rua", icon: "↩", tx: 3, ty: 9 },
    ],
  };

  /* -------- LAGO -------- */
  D.AREAS.lago = {
    id: "lago",
    name: "Lago do Reflexo Ausente",
    palette: { floor: "#2e4a5a", wall: "#1b2e3a", accent: "#7fd6d1", deco: "#3f6b80" },
    map: [
      "#####################",
      "#...................#",
      "#..~~~~~~~..........#",
      "#.~~~~~~~~~.........#",
      "#.~~~~~~~~~.........#",
      "#..~~~~~~~..........#",
      "#...................#",
      "#...................#",
      "#.........~~~~......#",
      "#........~~~~~~.....#",
      "#........~~~~~~.....#",
      "#.........~~~~......#",
      "#####################",
    ],
    spawn: { x: 10, y: 6 },
    onEnter: { music: "lake", toast: "A água não devolve o seu rosto." },
    npcs: [
      { id: "semreflexo", x: 13, y: 10, icon: "🫥", name: "Quem Não Deveria Estar Ali", dialog: "lago_1" },
      { id: "gato", x: 3, y: 7, icon: "🐈", name: "Um Gato", dialog: "gato_1", wander: true, cat: true },
    ],
    objects: [
      { id: "agua", x: 8, y: 4, icon: "🌊", name: "Superfície da água", kind: "puzzle", puzzle: "lake",
        text: "A água não mostra ninguém. Nem você. Talvez precise ficar parado tempo o bastante para que a água se lembre de te refletir." },
      { id: "fragmento_lago", x: 15, y: 4, icon: "📄", name: "Fragmento nas margens", kind: "fragment", frag: 3, requires: "lake",
        text: "Quando o reflexo aparece, ele deixa algo flutuando: um pedaço de página, ainda molhado de uma vida que não foi esta." },
      { id: "sombra", x: 3, y: 3, icon: "🫥", name: "Sombra no Espelho d'água", kind: "battle", enemy: "sombra_espelho",
        text: "Seu reflexo — o que não deveria existir — sai da água e vem em sua direção." },
      { id: "sino", x: 17, y: 9, icon: "🔔", name: "Sino no Fundo", kind: "look",
        text: "Um sino afundado, mas ainda soa. Você o pendura na cintura. Quem desapareceu vai ouvi-lo.", give: "sino" },
    ],
    portals: [
      { x: 10, y: 12, to: "rua", label: "Voltar à rua", icon: "↩", tx: 19, ty: 9 },
    ],
  };

  /* -------- BIBLIOTECA -------- */
  D.AREAS.biblioteca = {
    id: "biblioteca",
    name: "Biblioteca Impossível",
    palette: { floor: "#6b5236", wall: "#3a2b1c", accent: "#e7b463", deco: "#94723f" },
    map: [
      "#####################",
      "#...................#",
      "#.####.####.####....#",
      "#.#..#.#..#.#..#....#",
      "#.####.####.####....#",
      "#...................#",
      "#.####.####.####....#",
      "#.#..#.#..#.#..#....#",
      "#.####.####.####....#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#####################",
    ],
    spawn: { x: 10, y: 11 },
    onEnter: { music: "library", toast: "Há um livro para cada habitante. Há um livro para você." },
    npcs: [
      { id: "bibliotecario", x: 10, y: 1, icon: "📖", name: "O Bibliotecário", dialog: "bib_1" },
      { id: "gato", x: 16, y: 10, icon: "🐈", name: "Um Gato", dialog: "gato_1", wander: true, cat: true },
    ],
    objects: [
      { id: "livro_eu", x: 3, y: 10, icon: "📕", name: "Um livro sobre você", kind: "memory",
        text: "O livro tem o seu nome na lombada — o nome que você não sabia ter. Ele conta a sua vida até agora. E continua contando enquanto você lê. A última página está em branco e pisca, esperando.", mem: 3, flag: "leu_seu_livro", imbue: "Seu nome, na lombada: «V.»" },
      { id: "estante", x: 16, y: 2, icon: "🗄️", name: "Estante Proibida", kind: "look", requires: "frag5",
        text: "Os livros aqui não têm título. Só uma data — sempre a mesma data. E todos terminam com a mesma frase inacabada." },
      { id: "apagador_d", x: 2, y: 2, icon: "🌀", name: "Apagador de Falas", kind: "battle", enemy: "apagador_falas",
        text: "Ele não apaga objetos. Apaga conversas. Se ele te pegar, você vai esquecer o que ia dizer — para sempre." },
      { id: "porta_final", x: 10, y: 6, icon: "🚪", name: "Porta sem maçaneta", kind: "finaldoor",
        text: "Uma porta que aparece só quando os cinco fragmentos formam a frase. Ela não tem maçaneta. Tem uma frase escrita, e você é a frase." },
    ],
    portals: [
      { x: 10, y: 12, to: "rua", label: "Voltar à rua", icon: "↩", tx: 11, ty: 11 },
    ],
  };

  /* -------- A ÚLTIMA PÁGINA -------- */
  D.AREAS.pagina = {
    id: "pagina",
    name: "A Última Página",
    palette: { floor: "#0e0c14", wall: "#000000", accent: "#ffffff", deco: "#2a2438" },
    map: [
      "#####################",
      "#...................#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#####################",
    ],
    spawn: { x: 10, y: 10 },
    onEnter: { music: "void", corrupt: 0.5 },
    npcs: [],
    objects: [
      { id: "folha", x: 10, y: 4, icon: "📄", name: "A Última Página", kind: "lastpage",
        text: "A página flutua, enorme, branca. Ela espera por você. Sempre esperou." },
    ],
    portals: [],
  };

  /* -------- ÁREA SECRETA: O RASCUNHO (o ciclo) -------- */
  D.AREAS.rascunho = {
    id: "rascunho",
    name: "O Rascunho",
    palette: { floor: "#241826", wall: "#0d0810", accent: "#d98fb0", deco: "#4a2f4a" },
    map: [
      "#####################",
      "#...................#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#####################",
    ],
    spawn: { x: 10, y: 10 },
    onEnter: { music: "void", corrupt: 0.85, toast: "Aqui estão as versões de quem você já foi." },
    npcs: [],
    objects: [
      { id: "quebrados", x: 5, y: 4, icon: "👥", name: "As versões quebradas", kind: "memory",
        text: "Muitos de você, sentados em círculo. Cada um segura um fragmento. Todos estão cansados. Um deles levanta e diz: «É a décima vez. Desta vez, deixe eu ir.»", mem: 3, flag: "viu_o_ciclo" },
      { id: "autor", x: 15, y: 5, icon: "✒️", name: "A mesa do Autor", kind: "talk", dialog: "autor_1" },
      { id: "fim", x: 10, y: 2, icon: "🕯️", name: "A vela do fim", kind: "error_exit",
        text: "Uma vela queima a página de trás para frente. Se você apagar o mundo em vez de deixá-lo apagar você, talvez escape. Talvez." },
    ],
    portals: [
      { x: 10, y: 1, to: "pagina", label: "Voltar à Última Página", icon: "↩", tx: 10, ty: 9 },
    ],
  };

  /* ---------------------------------------------------------
     INIMIGOS — Apagadores
     pattern: sequência correta de ações para dissipá-los
     Regras: OBSERVAR revela, LUTAR usa objeto, FALAR questiona.
     --------------------------------------------------------- */
  D.ENEMIES = {
    apagador_menor: {
      icon: "🌀", name: "Apagador Menor",
      hp: 3,
      erases: "item",
      intro: "Uma rachadura no ar. Ela se abre, come um retrato, depois um nome. Ela quer o seu inventário.",
      solution: ["observe", "fight", "fight"],
      hints: {
        observe: "Você o observa apagar sempre da esquerda para a direita. Ele não percebe movimento brusco.",
        fight: "Um golpe de lembrança cai sobre ele. Ele hesita.",
        talk: "Ele não tem boca. Não tem ouvidos. Falar parece inútil agora.",
      },
      winLog: "O Apagador se dobra sobre si mesmo e desaparece. A sala volta, quase inteira.",
      loseLog: "Ele raspa algo da sua mochila. Algo se vai.",
      attackWin: true,
    },
    apagador_nomes: {
      icon: "🌀", name: "Apagador de Nomes",
      hp: 2,
      erases: "name",
      intro: "Ele não tem forma. Apaga palavras no ar: «árvore», «pássaro»… agora procura o seu nome.",
      solution: ["observe", "talk", "talk"],
      hints: {
        observe: "Você percebe que ele só apaga o que você nomeia em voz alta. O silêncio é uma armadura.",
        fight: "Você o ataca. Uma palavra sua se apaga: você esquece como se chamava a pessoa que te criou.",
        talk: "Você sussurra: «Se eu não te nomear, você não existe.» Ele treme.",
      },
      winLog: "Sem nome para atacar, ele se desfaz como fumaça.",
      loseLog: "Um nome se apaga do mundo. Você não sabe qual era.",
      attackWin: false,
    },
    vazio: {
      icon: "🕳️", name: "O Vazio que Bloqueia",
      hp: 1,
      erases: "memory",
      intro: "É enorme. Não tem olhos, mas te encara. Bloqueia a passagem do tempo. Você pode atacar — ou pode perguntar.",
      solution: ["talk"],
      hints: {
        observe: "Atrás dele há pegadas — suas, de outras visitas. Ele já te impediu antes.",
        fight: "Atacar só o engorda. Ele se alimenta da sua pressa.",
        talk: "Você pergunta: «O que você está protegendo?» … Ele responde: «Você já cometeu este erro. Na última vez, o vazio devorou Véspera inteira.»",
      },
      winLog: "Ele se afasta, devagar, e revela a passagem: está tentando impedir que você se repita.",
      loseLog: "Ele come uma memória. Você sente falta de algo que não sabe nomear.",
      attackWin: false,
    },
    sombra_espelho: {
      icon: "🫥", name: "Seu Reflexo",
      hp: 3,
      erases: "item",
      intro: "É você. Mais velho. Cansado. Ele já desistiu nove vezes. Quer que você desista também.",
      solution: ["observe", "observe", "fight"],
      hints: {
        observe: "Ele espelha seus movimentos com meio segundo de atraso. Meio segundo é tudo.",
        fight: "No instante de atraso, você o acerta. Ele sangra luz.",
        talk: "Ele responde com a sua voz: «Estou cansado. Você vai cansar também. Já cansou.»",
      },
      winLog: "O reflexo afunda de volta na água, derrotado por você — e por pena de você.",
      loseLog: "Ele te devolve um medo antigo. Algo seu se apaga.",
      attackWin: true,
    },
    apagador_falas: {
      icon: "🌀", name: "Apagador de Falas",
      hp: 3,
      erases: "dialogue",
      intro: "Ele não quer o seu corpo. Quer a sua próxima frase. Cada turno, uma conversa sua deixa de existir.",
      solution: ["observe", "talk", "fight"],
      hints: {
        observe: "Ele apaga a última coisa que foi dita. Se você falar algo novo e verdadeiro, ele se confunde.",
        talk: "Você diz a verdade: «Eu não sei quem sou.» Ele não sabe o que apagar. Uma fala sua permanece.",
        fight: "Você golpeia enquanto ele está confuso. Funciona.",
      },
      winLog: "Ele tenta apagar o silêncio e não consegue. Desaparece.",
      loseLog: "Uma conversa inteira se apaga da sua cabeça. Você sabe que esqueceu alguém — mas não quem.",
      attackWin: false,
    },
  };

  /* =========================================================
     DIÁLOGOS
     Estrutura do nó:
     { speaker, text, effects:[], choices:[{text,next,q,effects,if}], next, end }
     Efeitos: 
       {t:'stat',k:'mem'|'cou'|'dou',v}
       {t:'flag',k,v}
       {t:'item',id} | {t:'take',id}
       {t:'frag',i}
       {t:'battle',id}
       {t:'go',area,x,y}
       {t:'ending',id}
       {t:'toast',text,kind}
       {t:'memory',text}
       {t:'corrupt',v}
       {t:'music',layer,on}
     ========================================================= */
  D.DIALOGUES = {

    /* ---------- GATO (em todas as áreas) ---------- */
    gato_1: {
      speaker: "Um Gato",
      text: "O gato te encara. Ele não mia. Ele espera — como se já soubesse que você vai decidir segui-lo.",
      choices: [
        { text: "Seguir o gato.", next: "gato_follow", effects: [{ t: "catfollow" }] },
        { text: "Ignorar o gato e seguir a missão.", next: "gato_ignore", effects: [{ t: "stat", k: "dou", v: -1 }] },
        { text: "Perguntar ao gato o que ele é.", next: "gato_q", q: true, effects: [{ t: "stat", k: "dou", v: 1 }] },
      ],
    },
    gato_ignore: {
      speaker: "",
      text: "O gato não se ofende. Ele apenas desaparece quando você não está olhando. Animais fazem isso. Gatos, principalmente.",
      next: null, end: true,
    },
    gato_q: {
      speaker: "Um Gato",
      text: "O gato inclina a cabeça. Por um instante, atrás dos olhos dele, você jura ver uma cidade inteira — e ela também está desaparecendo, um pouco por dia.",
      next: "gato_1", end: false,
    },
    gato_follow: {
      speaker: "Um Gato",
      text: "Você segue o gato. Ele te leva por um caminho que não estava ali antes — e some no fim, satisfeito, como quem cumpriu uma promessa antiga.",
      effects: [{ t: "toast", text: "O gato te mostrou algo escondido.", kind: "mem" }],
      next: null, end: true,
    },

    /* ---------- VENDEDORA ---------- */
    vend_1: {
      speaker: "A Vendedora de Memórias",
      text: "«Compre uma lembrança, menino. Tenho de tudo: infância, primeiros amores, últimas palavras.» Ela te olha e sorri. «Tenho uma que você ainda não viveu. Quer?»",
      choices: [
        { text: "«Quero a que ainda não vivi.»", next: "vend_future" },
        { text: "«Quanto custa?»", next: "vend_price" },
        { text: "«De onde vêm as suas memórias?»", next: "vend_origin", q: true },
        { text: "«Você já me vendeu isso antes.»", next: "vend_knows", q: true, if: (s) => s.flags.viu_de_novo || s.flags.tem_ciclo },
      ],
    },
    vend_future: {
      speaker: "A Vendedora de Memórias",
      text: "Ela te entrega um frasco morno. Dentro, você vê: você mesmo, de costas, escrevendo numa página imensa. Você não quer ver quem está na sua frente. A visão acaba.",
      effects: [
        { t: "item", id: "memoria" },
        { t: "stat", k: "dou", v: 2 },
        { t: "stat", k: "mem", v: 1 },
        { t: "flag", k: "comprou_futuro", v: true },
        { t: "toast", text: "Você comprou uma memória do futuro.", kind: "mem" },
      ],
      next: "vend_after", end: false,
    },
    vend_price: {
      speaker: "A Vendedora de Memórias",
      text: "«O preço de uma memória é sempre outra memória, menino. Nada se cria. Até o apagamento precisa de matéria-prima.»",
      next: "vend_1", end: false,
    },
    vend_origin: {
      speaker: "A Vendedora de Memórias",
      text: "Ela aponta para a rua, para as casas com fachadas ainda quentes de gente. «Colho quando as pessoas desaparecem. Se ninguém lembra delas, elas murcham e caem do mundo. Eu as guardo. É o meu jeito de não deixar tudo virar branco.»",
      effects: [{ t: "stat", k: "mem", v: 1 }],
      next: "vend_1", end: false,
    },
    vend_knows: {
      speaker: "A Vendedora de Memórias",
      text: "Ela para. As mãos tremem. «Não… não é possível. Você não devia saber disso. A menos que…» Ela olha para a sua testa, procurando algo escrito. «A menos que você seja ele. O que escreve. Oh, menino. Você já esteve aqui tantas vezes.»",
      effects: [
        { t: "stat", k: "dou", v: 3 },
        { t: "flag", k: "vendedora_sabe", v: true },
        { t: "flag", k: "authorKnown", v: true },
      ],
      next: null, end: true,
    },
    vend_after: {
      speaker: "A Vendedora de Memórias",
      text: "«Vá. Mas quando chegar na última página… lembre-se de mim. Eu vou existir enquanto você lembrar de mim. É o único truque que aprendi.»",
      next: null, end: true,
    },

    /* ---------- MENINO ---------- */
    menino_1: {
      speaker: "O Menino que Sempre Chega Primeiro",
      text: "Ele está parado no meio da rua, como se esperasse há horas. «Você demorou. Eu já vi o que tem lá dentro. Já vi tudo, na verdade. A vantagem de chegar primeiro.»",
      choices: [
        { text: "«O que tem lá dentro?»", next: "menino_what" },
        { text: "«Quem é você?»", next: "menino_who", q: true },
        { text: "«Você existe de verdade?»", next: "menino_exists", q: true, effects: [{ t: "stat", k: "dou", v: 2 }] },
        { text: "«Saia do meu caminho.»", next: "menino_leave", effects: [{ t: "stat", k: "cou", v: 1 }] },
      ],
    },
    menino_what: {
      speaker: "O Menino que Sempre Chega Primeiro",
      text: "«Fragmentos. Cinco. Cada um com uma palavra. Juntos, não formam uma direção — formam uma acusação.» Ele ri, sem alegria. «Não pergunte o que a frase quer dizer. Pergunte quem a escreveu.»",
      effects: [{ t: "flag", k: "menino_pista", v: true }],
      next: "menino_1", end: false,
    },
    menino_who: {
      speaker: "O Menino que Sempre Chega Primeiro",
      text: "«Sou o primeiro a chegar. Sabe como é chegar antes de todo mundo? Você vê as coisas antes de serem consertadas. Vê o erro antes de ser cometido. E ninguém nunca acredita em você.» Ele te olha. «Você vai cometer o mesmo erro de novo. Já cometeu.»",
      effects: [{ t: "flag", k: "menino_aviso", v: true }],
      next: "menino_1", end: false,
    },
    menino_exists: {
      speaker: "O Menino que Sempre Chega Primeiro",
      text: "Pela primeira vez, ele hesita. «Isso é uma pergunta perigosa. Se eu responder 'não', você me apaga. Se eu responder 'sim', eu apago você. E nós dois sabemos que só um de nós foi escrito.»",
      next: "menino_1", end: false,
    },
    menino_leave: {
      speaker: "O Menino que Sempre Chega Primeiro",
      text: "Ele dá um passo de lado, educado. «Como quiser. Mas quando você chegar no fim e tiver esquecido o começo, eu ainda vou estar aqui. Sempre estou.»",
      next: null, end: true,
    },

    /* ---------- MORADORA (CASA) ---------- */
    mor_1: {
      speaker: "A Moradora",
      text: "Uma mulher idosa, meio transparente, arruma uma mesa que não existe. «Você viu minha irmã? Ela saiu para comprar pão e não voltou. Faz quarenta anos. Ou quarenta minutos. Difícil saber, aqui.»",
      choices: [
        { text: "«Sim. Eu a vi.»", next: "mor_yes" },
        { text: "«Não.»", next: "mor_no" },
        { text: "«Quem é sua irmã?»", next: "mor_who" },
        { text: "«Eu acho que ela nunca existiu.»", next: "mor_never", q: true, effects: [{ t: "stat", k: "dou", v: 3 }] },
      ],
    },
    mor_yes: {
      speaker: "A Moradora",
      text: "Ela sorri como quem dormia há muito tempo. «Obrigada. Eu sabia. Eu sabia que alguém ia lembrar.» Ela te entrega uma chave pequena. «Ela deixou isso pra quem a visse. Agora é sua.»",
      effects: [
        { t: "item", id: "chave" },
        { t: "stat", k: "mem", v: 1 },
        { t: "flag", k: "moradora_salva", v: true },
        { t: "toast", text: "Você ganhou a Chave Circular.", kind: "mem" },
      ],
      next: null, end: true,
    },
    mor_no: {
      speaker: "A Moradora",
      text: "«Ah.» Ela fica um pouco mais transparente. «Então talvez ela tenha sido apagada. É assim que funciona, sabe. Primeiro a pessoa desaparece. Depois desaparece de todo mundo. Depois desaparece até de ter existido.»",
      effects: [{ t: "flag", k: "moradora_triste", v: true }, { t: "erase", what: "name", target: "a irmã da moradora" }],
      next: null, end: true,
    },
    mor_who: {
      speaker: "A Moradora",
      text: "Ela pausa. «Sabe, é engraçado. Eu estava falando dela agora, mas… eu não lembro o nome. Nem o rosto. Só sei que sinto falta de alguém. Sinto falta é a única coisa que sobrou dela.»",
      next: "mor_1", end: false,
    },
    mor_never: {
      speaker: "A Moradora",
      text: "A sala esfria. A mulher não fica triste — fica aliviada. «Você tem razão. Se ela nunca existiu, então eu nunca perdi ninguém.» Sua boca tenta sorrir e não consegue. Algo no mundo acaba de ser apagado, e você foi quem apagou.",
      effects: [
        { t: "stat", k: "cou", v: 1 },
        { t: "flag", k: "apagou_irma", v: true },
        { t: "corrupt", v: 0.15 },
        { t: "erase", what: "memory", target: "a irmã da moradora" },
        { t: "toast", text: "Você apagou alguém — sem querer, ou querendo.", kind: "bad" },
      ],
      next: null, end: true,
    },

    /* ---------- GUARDADOR (FLORESTA) ---------- */
    guarda_1: {
      speaker: "O Guardador de Caminhos",
      text: "Um cervo de olhos antigos bloqueia a trilha. Ele fala sem abrir a boca: «Esta floresta troca os caminhos quando você olha. Levei séculos para aprender: a saída não está à frente. Está atrás de você.»",
      choices: [
        { text: "«Como saio daqui?»", next: "guarda_exit" },
        { text: "«O que você guarda?»", next: "guarda_guard" },
        { text: "«Você já viu alguém como eu aqui?»", next: "guarda_seen", q: true },
      ],
    },
    guarda_exit: {
      speaker: "O Guardador de Caminhos",
      text: "«Caminhe na direção contrária à que vê. Quando quiser ir para o santuário, vá para longe dele, e ele virá. Os santuários desta floresta são tímidos.»",
      effects: [{ t: "flag", k: "pista_floresta", v: true }],
      next: "guarda_1", end: false,
    },
    guarda_guard: {
      speaker: "O Guardador de Caminhos",
      text: "«Guardo os caminhos que as pessoas pegam e nunca voltam. Cada trilha é uma escolha que alguém fez e esqueceu. Esta que está sob você foi feita por você. Diversas vezes.»",
      effects: [{ t: "stat", k: "dou", v: 1 }, { t: "flag", k: "viu_o_ciclo", v: true }],
      next: "guarda_1", end: false,
    },
    guarda_seen: {
      speaker: "O Guardador de Caminhos",
      text: "«Vi. Muitos. Todos iguais, todos com a mesma pressa. Chegavam, resolviam os enigmas, salvavam a cidade e iam embora sem lembrar de nada. Depois voltavam. A cidade nunca os reconhecia. Nem eles a si mesmos.»",
      effects: [{ t: "flag", k: "authorKnown", v: true }, { t: "stat", k: "mem", v: 1 }],
      next: "guarda_1", end: false,
    },

    /* ---------- RELOJOEIRO ---------- */
    relog_1: {
      speaker: "O Relojoeiro",
      text: "O velho conserta um relógio que anda para trás. «Bem-vindo ao meio-dia. Ou às três. Ou às nove. Depende de quando você entrou — e de quem você era quando entrou.»",
      choices: [
        { text: "«Por que os relógios estão parados?»", next: "relog_pare" },
        { text: "«Quem sou eu?»", next: "relog_who", q: true },
        { text: "«Você me conhece?»", next: "relog_know", q: true },
      ],
    },
    relog_pare: {
      speaker: "O Relojoeiro",
      text: "«Porque eles não contam horas. Contam o dia de uma pessoa. O sono, o trabalho, o sol, a saudade. Quem mexeu neles achou que o tempo era uma linha. Coitado. O tempo é um círculo, e este lugar faz a curva.»",
      effects: [{ t: "stat", k: "mem", v: 1 }],
      next: "relog_1", end: false,
    },
    relog_who: {
      speaker: "O Relojoeiro",
      text: "Ele te encara por cima dos óculos. «Ah, isso eu não posso responder. Não porque não saiba — mas porque se eu disser, você vai acreditar. E regra do meu ofício: nunca dizer a hora exata. Só deixar a pessoa olhar os relógios.»",
      next: "relog_1", end: false,
    },
    relog_know: {
      speaker: "O Relojoeiro",
      text: "«Conheço. Você traz um relógio que eu consertei uma vez. Está com cinco segundos de atraso. Sempre cinco. É o tempo que você leva para decidir se volta atrás — e você nunca decide a tempo.»",
      effects: [{ t: "flag", k: "relojoeiro_sabe", v: true }, { t: "stat", k: "dou", v: 1 }],
      next: "relog_1", end: false,
    },

    /* ---------- LAGO ---------- */
    lago_1: {
      speaker: "Quem Não Deveria Estar Ali",
      text: "Uma figura está sentada à beira da água, de costas. Ela não tem reflexo — e você, pela primeira vez, também não. «Sente-se. Você chegou bem na hora de não acontecer nada.»",
      choices: [
        { text: "«Por que não temos reflexo?»", next: "lago_reflexo" },
        { text: "«Você é eu?»", next: "lago_eu", q: true },
        { text: "«O que aconteceu com a cidade?»", next: "lago_cidade" },
        { text: "Empurrá-la na água.", next: "lago_push", effects: [{ t: "stat", k: "cou", v: 2 }] },
      ],
    },
    lago_reflexo: {
      speaker: "Quem Não Deveria Estar Ali",
      text: "«Porque reflexo é memória, e nós dois esquecemos demais para termos um. Você esquece para continuar. Eu esqueço porque escolhi parar de lembrar. É mais confortável.»",
      next: "lago_1", end: false,
    },
    lago_eu: {
      speaker: "Quem Não Deveria Estar Ali",
      text: "Ela vira o rosto. É o seu rosto, mais velho. «Sou a versão sua que chegou ao fim e voltou. Vim te avisar. Mas vocês nunca escutam — e eu já disse isso nove vezes, que eu me lembre.»",
      effects: [{ t: "flag", k: "authorKnown", v: true }, { t: "flag", k: "viu_o_ciclo", v: true }, { t: "stat", k: "mem", v: 2 }, { t: "stat", k: "dou", v: 2 }],
      next: "lago_1", end: false,
    },
    lago_cidade: {
      speaker: "Quem Não Deveria Estar Ali",
      text: "«Foi apagada, devagar, por alguém que ama Véspera demais para deixá-la terminar. Ele reescreve a cidade sempre que ela chega ao fim. E sempre esquece de reescrever a si mesmo. É por isso que você não tem nome.»",
      effects: [{ t: "flag", k: "authorKnown", v: true }],
      next: "lago_1", end: false,
    },
    lago_push: {
      speaker: "Quem Não Deveria Estar Ali",
      text: "Você a empurra. Ela cai na água sem respingar, sem som, como se a água fosse feita de página. Por um instante você vê o fundo do lago: uma cidade igual a esta, afundada, inteira, com outros vocês caminhando nela. Depois some.",
      effects: [{ t: "flag", k: "empurrou", v: true }, { t: "stat", k: "mem", v: 1 }, { t: "corrupt", v: 0.1 }],
      next: null, end: true,
    },

    /* ---------- BIBLIOTECÁRIO ---------- */
    bib_1: {
      speaker: "O Bibliotecário",
      text: "Um homem de dedos longos lê um livro sem capa. «Ah. Você.» Ele fecha o livro com cuidado, como se tivesse terminado uma frase. «Eu o conheço. Faz muito tempo. Na verdade, faz todas as vezes.»",
      choices: [
        { text: "«Quem eu sou?»", next: "bib_who", q: true },
        { text: "«Qual é o meu passado?»", next: "bib_past" },
        { text: "«Como assim, todas as vezes?»", next: "bib_times", q: true },
        { text: "«Você está inventando isso.»", next: "bib_lie", q: true, effects: [{ t: "stat", k: "dou", v: 2 }] },
        { text: "«Então me dê o que você guarda para mim.»", next: "bib_give" },
      ],
    },
    bib_give: {
      speaker: "O Bibliotecário",
      text: "Ele abre uma gaveta sem fundo e tira um pedaço de papel amarelado. «Estava guardado sob a sua ficha. Está morno — como se alguém tivesse acabado de escrever. Leve. É a última peça, mas não o último passo.»",
      effects: [{ t: "frag", i: 4 }],
      next: "bib_1", end: false,
    },
    bib_who: {
      speaker: "O Bibliotecário",
      text: "«Cada pessoa tem um livro. O seu é especial: ele é escrito, não guardado. Não fui eu que o escrevi. Foi você. Ou, melhor: será você. O tempo aqui não ajuda.»",
      effects: [{ t: "flag", k: "bib_abriu", v: true }],
      next: "bib_1", end: false,
    },
    bib_past: {
      speaker: "O Bibliotecário",
      text: "Ele empurra um livro para você. Na lombada, uma inicial: «V.». «Seu passado é este livro. Ele começa na página vinte e sete — antes disso, as páginas foram arrancadas. Por você, presumo. Ou para você não se lembrar.»",
      effects: [{ t: "stat", k: "mem", v: 2 }, { t: "flag", k: "leu_seu_livro", v: true }, { t: "flag", k: "bib_abriu", v: true }],
      next: "bib_1", end: false,
    },
    bib_times: {
      speaker: "O Bibliotecário",
      text: "«Você entra aqui, pega o fragmento, some, e o mundo esquece você. Depois acontece de novo. Sempre foi antes. Eu poderia te contar o final, mas você não acreditaria — e as consequências, meu caro, são suas.»",
      effects: [{ t: "flag", k: "authorKnown", v: true }, { t: "stat", k: "dou", v: 2 }],
      next: "bib_1", end: false,
    },
    bib_lie: {
      speaker: "O Bibliotecário",
      text: "Ele sorri, sem mágoa. «Talvez. É um dos luxos deste ofício: podermos inventar e guardar a invenção na mesma estante. Mas inventei o seu rosto antes de te ver. Isso eu não consigo fingir.»",
      next: "bib_1", end: false,
    },

    /* ---------- O AUTOR (RASCUNHO) ---------- */
    autor_1: {
      speaker: "O Autor",
      text: "Um homem escreve numa página sem fim. Ele não levanta os olhos. «Senta. Já escrevi esta conversa. Você vai perguntar se sou eu, eu vou dizer que sim, você vai perguntar por quê, e eu vou dizer: porque eu não suporto terminar a cidade.»",
      choices: [
        { text: "«Então você é eu.»", next: "autor_eu" },
        { text: "«Por que continuar reescrevendo?»", next: "autor_why", q: true },
        { text: "«Me devolva o meu nome.»", next: "autor_nome", q: true },
        { text: "«Me deixe escrever.»", next: "autor_write", effects: [{ t: "flag", k: "assumiu", v: true }] },
      ],
    },
    autor_eu: {
      speaker: "O Autor",
      text: "Ele finalmente ergue os olhos. São os seus. «Sou o que sobrou de você depois que você decidiu não terminar nunca. Eu fico aqui, remendando a cidade, página por página, para que ela nunca acabe. Escrevi você para vir me substituir. É sempre assim.»",
      effects: [{ t: "flag", k: "authorKnown", v: true }],
      next: "autor_1", end: false,
    },
    autor_why: {
      speaker: "O Autor",
      text: "«Porque terminar dói. Enquanto eu escrevo, todos que se foram ainda estão aqui, um pouco. Se eu paro, eles viram esquecimento de verdade. Você entende? Eu não sou um deus. Sou um homem com medo de ficar sozinho numa página em branco.»",
      effects: [{ t: "stat", k: "mem", v: 2 }],
      next: "autor_1", end: false,
    },
    autor_nome: {
      speaker: "O Autor",
      text: "«Seu nome… foi a primeira coisa que eu arranquei. Sem nome, você não consegue terminar a história — e sem fim, eu não preciso te perder. O nome está escrito em você. Sempre esteve. Só que você o esconde de si mesmo.»",
      effects: [{ t: "flag", k: "quase_nome", v: true }, { t: "stat", k: "dou", v: 2 }],
      next: "autor_1", end: false,
    },
    autor_write: {
      speaker: "O Autor",
      text: "Ele para de escrever pela primeira vez. A caneta tremendo no ar. «Você tem certeza? Assumir a pena é nunca mais sair daqui. Você vai esquecer Véspera para mantê-la viva. É isso que eu fiz com você.»",
      next: null, end: true,
    },

    /* ---------- A ÚLTIMA PÁGINA ---------- */
    last_1: {
      speaker: "",
      text: D.CUT_LASTPAGE,
      choices: [
        { text: "TERMINAR A HISTÓRIA.", next: null, effects: [{ t: "endpick", choice: "finish" }] },
        { text: "CONTINUAR. (virar a página em branco)", next: null, effects: [{ t: "flag", k: "continued", v: true }, { t: "go", area: "rascunho", x: 10, y: 9 }, { t: "toast", text: "Você vira a página. Do outro lado, alguém já virou antes." }] },
        { text: "Fechar os olhos e ir embora para sempre.", next: null, effects: [{ t: "endpick", choice: "abandon" }] },
        { text: "«Isto não é uma página. É um espelho.» — Quebrá-la.", next: null, if: (s) => s.stats.dou >= 10, effects: [{ t: "ending", id: "erro" }] },
      ],
    },
  };

  /* ---------------------------------------------------------
     ENIGMAS (config)
     --------------------------------------------------------- */
  D.PUZZLES = {
    piano: {
      title: "O Piano Mudo",
      desc: "O piano toca uma canção que os moradores cantavam. Ouça as quatro notas e devolva-as na mesma ordem. Dizem que esta casa esquece tudo — menos o que lhe é tocado de volta.",
      len: 4,
    },
    clocks: {
      title: "Os Quatro Relógios",
      desc: "Quatro relógios parados: 12:00, 03:00, 06:00, 09:00. Na parede: «Não marcam horas — marcam um dia. Ponha-os na ordem em que uma vida acontece.» Você lembra de algo esculpido numa pedra, na floresta.",
      order: [3, 6, 12, 9],
      times: [12, 3, 6, 9],
      clueFlag: "pista_relogio",
    },
    lake: {
      title: "O Reflexo Ausente",
      desc: "A água não reflete você. Fique completamente imóvel, sem se mexer, e deixe a água se lembrar. (Fique parado e não pressione nada.)",
      seconds: 8,
    },
  };

  /* ---------------------------------------------------------
     FINAIS
     selector(shared) em game.js decide qual destes usar.
     --------------------------------------------------------- */
  D.ENDINGS = {
    heroi: {
      title: "O HERÓI",
      text: "Você fecha a Última Página e o mundo para de doer.\n\nVéspera volta. As árvores, as músicas, os nomes das ruas — tudo volta, um pouco torto, como um osso mal curado, mas volta.\n\nO preço é simples e terrível: para caber de novo na história, você teve de abrir espaço. E o espaço era você.\n\nAs pessoas se lembram da cidade. Ninguém se lembra do menino que a salvou.\nMenos um gato. Um gato, à beira do lago, olha para o nada e mia.",
      color: "#7fd6d1",
    },
    autor: {
      title: "O AUTOR",
      text: "Você entende, enfim, quem escreve.\n\nSenta-se na cadeira, pega a caneta e sente o peso dela: é o peso de nunca poder terminar nada, para não perder ninguém.\n\nAlguém novo acorda, lá embaixo, na rua sem nome, com \"???\" escrito no pulso. Você vai escrever a vida dele agora. Vai fazê-lo chegar até aqui. Vai esquecer de lhe dar um nome.\n\nDe cima da página, você observa a cidade girar. É um ciclo. Você finalmente entende.\nE, entendendo, você o repete.",
      color: "#c9a3ef",
    },
    esquecido: {
      title: "O ESQUECIDO",
      text: "Você larga a missão. Vira as costas para a Última Página e vai embora pelo caminho que não leva a nada.\n\nVéspera continua existindo — aos pedaços, meio apagada, mas viva. As pessoas seguem seus dias curtos, esquecendo aos poucos quem já se foi.\n\nVocê se senta no banco da praça, para sempre. Os moradores passam por você sem desviar. Nem um cachorro te fareja.\n\nNão é triste, exatamente. É como ser o espaço em branco entre duas palavras: sem você, elas não se ligariam. Mas ninguém lê os espaços.",
      color: "#9b8bb0",
    },
    erro: {
      title: "O ERRO",
      text: "Você faz o que nenhuma página prevê: você quebra a regra.\n\nApaga o mundo antes que ele te apague. Rasga a história de trás para frente. A cidade se dobra como um papel, e do lado de fora da dobra não existe nada — nem autor, nem ciclo, nem Véspera.\n\nVocê cai em um lugar sem nome. Um quarto. Uma mesa. Um computador ligado.\n\nNa tela, uma janela aberta. Um jogo chamado VÉSPERA. Você o jogou até o fim. E, na última linha, ainda piscando, alguém escreveu:\n\n«Você nunca deveria ter lido esta página.»",
      color: "#d9534f",
    },
  };

  /* ---------------------------------------------------------
     FRASES DE ATMOSFERA (tela inicial, muda a cada sessão)
     --------------------------------------------------------- */
  D.QUOTES = [
    "Uma cidade se apaga devagar quando ninguém olha para ela.",
    "Ninguém sabe quem está escrevendo. Nem quem está sendo escrito.",
    "A última página não tem final. Tem uma lista.",
    "Se você já esteve aqui, finja que é a primeira vez.",
    "Um gato viu tudo. Um gato não conta nada.",
    "Toda memória tem dono. Algumas foram roubadas de você.",
  ];

  window.VesperaData = D;
})();
