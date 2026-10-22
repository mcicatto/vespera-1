# REGRAS DO PROJETO — VÉSPERA

> Este arquivo guarda o prompt original do jogo. Quando eu pedir
> "leia o arquivo regras" / "abre o regras", use este documento como
> a especificação oficial do que deve ser construído.

---

## PROMPT ORIGINAL (do usuário)

CRIE UM JOGO DE AVENTURA:

Crie um pequeno jogo de aventura 2D, com exploração, enigmas, diálogos, escolhas e
uma história misteriosa. O jogo deve ser simples de jogar, mas fugindo do clichê de
"salvar a princesa", "derrotar o rei maligno" ou simplesmente "pegar 3 objetos mágicos".

### 🌒 A PREMISSA
O mundo está desaparecendo. Não de uma vez.
Primeiro desapareceram pequenas coisas: uma árvore, uma música, o nome de uma rua.
Depois desapareceram pessoas.
Agora, partes inteiras da cidade estão sendo apagadas da realidade.
O personagem principal recebe uma missão aparentemente simples:
encontrar a Última Página.
Ninguém sabe o que é a última página. Ninguém sabe quem está escrevendo.
E existe um problema ainda maior: (o jogador descobre durante o jogo).

### 🗺️ O MUNDO
O jogo acontece em uma pequena cidade chamada **Véspera**.
A cidade possui 5 áreas exploráveis:
- 🏚️ Casas abandonadas — onde os objetos lembram dos antigos moradores.
- 🌲 Floresta — os caminhos mudam dependendo da direção em que o jogador olha.
- 🕰️ Casa dos Relógios — cada sala representa um momento diferente do tempo.
- 🌊 Lago — ninguém aparece no reflexo da água, exceto alguém que não deveria estar ali.
- 📚 Biblioteca — uma biblioteca impossível onde existem livros contando a vida dos habitantes.

Cada área deve possuir pelo menos: um pequeno enigma; um personagem; um objeto
importante; um segredo; um perigo ou inimigo; uma informação que faça o jogador
desconfiar da verdadeira história.

### 🧍 O PROTAGONISTA
O personagem não começa sabendo quem é. Seu nome aparece inicialmente como: **???**
Durante a aventura, o jogador encontra fragmentos de memória. Em vez de simplesmente
ganhar experiência, o personagem recupera memórias.
Algumas lembranças podem ser verdadeiras. Outras podem ser falsas.
E algumas podem ter sido colocadas ali por outra pessoa.

### 🎯 A MISSÃO
O objetivo inicial é encontrar a Última Página.
Porém, cada fragmento contém uma palavra. Ao reunir os cinco fragmentos, o jogador
descobre que eles formam uma frase. A partir desse momento, a missão muda.
O jogador precisa descobrir quem escreveu a história e por quê.

### 👥 PERSONAGENS
- 🕯️ **A Vendedora de Memórias** — vende memórias engarrafadas; pode vender uma
  memória sobre algo que ainda não aconteceu.
- 🐦 **O Menino que Sempre Chega Primeiro** — aparece antes do jogador em vários
  lugares; conhece coisas que o jogador ainda não descobriu.
- 🐈 **O Gato** — aparentemente inútil, mas sempre aparece perto de objetos
  importantes. Se o jogador segui-lo em vez do objetivo principal, encontra uma área secreta.
- 📖 **O Bibliotecário** — afirma conhecer o protagonista. Quando perguntado sobre seu
  passado, responde de forma enigmática. As respostas do jogador alteram diálogos posteriores.

### 💬 DIÁLOGOS E ESCOLHAS
Não transforme os diálogos em simples caixas de texto. Algumas escolhas têm consequências.
Exemplo — NPC: "Você viu minha irmã?" Opções: "Sim." / "Não." / "Quem é sua irmã?" /
"Eu acho que ela nunca existiu."
Dependendo da escolha, o NPC pode: entregar um objeto; desaparecer; mudar de
personalidade; revelar informação; tornar-se inimigo; lembrar de algo esquecido.
Algumas escolhas NÃO mostram imediatamente suas consequências.

### 🧩 ENIGMAS
Os enigmas devem fazer o jogador pensar, não apenas achar uma chave.
Ex.: quatro relógios (12:00, 03:00, 06:00, 09:00) com uma frase na parede —
o jogador percebe que precisa ordená-los com base nas decisões anteriores.
Outro enigma pode exigir que o jogador **espere**. O jogo deve reconhecer a espera como ação.

### 👹 INIMIGOS
Não use inimigos tradicionais. Crie criaturas chamadas **Apagadores**.
Eles não atacam diretamente. Eles APAGAM coisas: uma ponte, parte do mapa, um diálogo,
o nome de um personagem, um item do inventário, uma memória do jogador.
Se o jogador for atingido muitas vezes, partes do jogo ficam "incompletas".
Isso cria uma mecânica diferente de combate.

### ⚔️ COMBATE
Simples. O jogador possui três ações. Descobre o padrão do inimigo. Pode usar objetos
do cenário. Em alguns combates, a melhor opção NÃO é atacar.
Ex.: um inimigo gigante bloqueia o caminho; o jogador pode atacá-lo, mas também pode
perguntar. A resposta pode revelar que o inimigo tenta impedir o jogador de repetir um erro.

### 🎒 INVENTÁRIO
Objetos comuns e estranhos:
- 🗝️ Chave que abre portas que ainda não existem.
- 🪞 Espelho que mostra uma versão diferente do personagem.
- 🕰️ Relógio que volta 5 segundos no tempo.
- ✉️ Carta escrita pelo próprio jogador.
- 🔔 Sino que pode ser ouvido por personagens que desapareceram.
- 🧵 Fio vermelho que conecta pessoas que possuem um segredo em comum.
- 📕 Livro que muda seu conteúdo dependendo das escolhas do jogador.
Alguns objetos devem ter mais de uma utilidade.

### ⭐ SISTEMA DE PONTUAÇÃO
Três estatísticas: **MEMÓRIA** (quanto da história o jogador descobriu),
**CORAGEM** (quantas situações perigosas enfrentou), **DÚVIDA** (quanto questionou a realidade).
A pontuação final depende dessas três. Quem só segue a missão tem final diferente de
quem explora tudo e questiona.

### 🌳 EXPLORAÇÃO
Caminhos secretos. Alguns locais só aparecem quando o jogador: volta a uma área já
visitada; conversa de novo com um personagem; carrega um objeto; escolhe uma resposta;
**permanece parado**; **anda para trás**; ignora uma missão; chega a um local em momento
específico. Não explique tudo — deixe o jogador montar parte da história sozinho.

### 🌀 A GRANDE VIRADA
Ao encontrar a Última Página, ela NÃO contém o final. Contém uma lista do que o jogador
fez. Entre as linhas, uma frase. Então surgem duas opções: **TERMINAR A HISTÓRIA** ou **CONTINUAR**.
- TERMINAR → apresenta um final.
- CONTINUAR → aparece uma nova área no mapa, com versões quebradas dos personagens, e o
  jogador descobre que Véspera é um mundo preso em um ciclo — e que o protagonista já
  tentou escapar antes. Várias vezes.

### 🏁 FINAIS (pelo menos 4)
1. **O HERÓI** — salva Véspera, mas perde todas as próprias memórias.
2. **O AUTOR** — descobre quem escreveu a história e assume seu lugar.
3. **O ESQUECIDO** — abandona a missão; a cidade continua, mas ninguém lembra dele.
4. **O ERRO** — quebra as regras do mundo e escapa da história. Na última tela aparece:
   "Você nunca deveria ter lido esta página."

### 🎨 ESTILO VISUAL
2D estilizado, misterioso e bonito. Misture fantasia, aventura, surrealismo, pequenas
doses de humor e atmosfera de mistério. A cidade começa aconchegante e fica cada vez mais
estranha. Cores quentes no início; frias e distorcidas conforme a realidade desaparece.

### 🎵 ÁUDIO
A música muda com o estado do mundo. Ao descobrir uma memória, pequenos instrumentos
entram na trilha. Quando uma área é apagada, parte da música desaparece. Às vezes, só
sons ambientes são mais assustadores que música.

### 🕹️ ESTRUTURA DO JOGO
Pequeno e concluível em ~30 min, com segredos que incentivem uma segunda partida.
Inclua: tela inicial; tutorial integrado à história; mapa; movimentação; interação com
objetos; diálogos; escolhas; inventário; enigmas; inimigos; sistema de pontuação;
checkpoints; pelo menos 4 finais; áreas secretas; pequenas animações; efeitos sonoros;
música; tela de vitória; tela de derrota; possibilidade de reiniciar.

### REGRA DE OURO
Depois de estabelecer as regras do jogo, comece a quebrá-las lentamente. O jogo deve
fazer o jogador pensar. E, no final, o resultado deve ser curto, divertido, misterioso e
memorável — mecânicas simples, ideias inteligentes o suficiente para dar vontade de
jogar de novo.

---

## DECISÕES TÉCNICAS JÁ TOMADAS
- **Tecnologia:** HTML5 Canvas + JavaScript puro (sem frameworks), áudio via Web Audio API.
- **Modo de execução:** abre `index.html` direto no navegador (sem servidor / sem módulos).
- **Estrutura de arquivos:**
  - `index.html` — telas e canvas.
  - `css/style.css` — visual misterioso (quente → frio conforme `--corrupt`).
  - `js/audio.js` — música procedural em camadas (pad/harp/bass/bell) + efeitos.
  - `js/data.js` — mundo: áreas, mapas, NPCs, itens, diálogos, enigmas, inimigos, finais.
  - `js/game.js` — engine: estado, render, movimento, diálogo, escolhas, puzzles, batalha, finais.
- **Frase dos 5 fragmentos:** VOCÊ · SEMPRE · ESCREVEU · ESTA · PÁGINA.
- **Áreas:** rua (hub), casa, floresta, relogios, lago, biblioteca, pagina (Última Página),
  rascunho (área secreta do ciclo).
- **Estatísticas:** MEMÓRIA, CORAGEM, DÚVIDA.
- **Finais:** heroi, autor, esquecido, erro (em `js/data.js` → `D.ENDINGS`).

## STATUS (atualizar ao final de cada sessão)
- [x] Estrutura de pastas e index.html
- [x] CSS / visual
- [x] Áudio procedural
- [x] Dados do mundo (áreas, NPCs, diálogos, itens, enigmas, inimigos, finais)
- [x] Engine (movimento, interação, diálogo, inventário, puzzle, batalha, finais, save)
- [x] Bug de interação corrigido (switch → if/else; modo não é mais resetado por finais/batalhas)
- [x] Teste automatizado (stub de DOM) sem erros de runtime
- [x] Teste em navegador real (headless Chrome) sem erros no console
- [ ] Ajustar/validar jogabilidade manualmente (visual, dificuldade, texto)
- [ ] Segunda partida (meta/ciclos) — implementada, validar em jogo

### Como rodar
Abra `index.html` no navegador (duplo clique). Não precisa de servidor.
Controles: WASD/setas = andar · E/Espaço = interagir · I = inventário · M = som · ESC = menu.

