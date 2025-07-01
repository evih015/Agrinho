// --- Configurações do Jogo ---
let WIDTH = 800;
let HEIGHT = 600;
let CARD_SIZE = 80;
let CARD_MARGIN = 10;
let GRID_COLS = 4; // Para 8 pares (16 cartas), 4x4 é um bom grid
let GRID_ROWS = 4;
let FONT_SIZE_EMOJI = 48;
let FONT_SIZE_TEXT = 32;
let GAME_TIME_LIMIT = 60; // 1 minuto em segundos

// Cores
let WHITE = '#FFFFFF';
let BLACK = '#000000';
let GRAY = '#C8C8C8';
let BLUE = '#0000FF';
let GREEN = '#00FF00';
let RED = '#FF0000';
let CARD_BACK_COLOR = '#4682B4'; // Azul aço para o verso da carta

// Emojis e seus pares
const EMOJI_PAIRS = {
    "🐂": "🥩",  // Boi e Bife
    "🐖": "🥓",  // Porco e Bacon
    "🐄": "🥛",  // Vaca e copo de leite
    "🐝": "🍯",  // Abelha e Mel
    "🌽": "🍿",  // Milho e Pipoca
    "🐓": "🥚",  // Galinha e Ovo
    "🚜": "🍎",  // Tratoe e Maça
    "👩🏽‍🌾": "👨🏻‍💼",  // Fazendeira e Empresário
};

let board = [];
let revealedCards = []; // Armazena as 2 cartas atualmente reveladas [ {row, col}, {row, col} ]
let matchedPairs = 0;
let startTime = 0;
let gameState = "waiting_start"; // Estados: waiting_start, playing, game_over

let startX, startY; // Posição inicial para desenhar o grid centralizado

// --- Funções Essenciais do P5.js ---

function setup() {
    createCanvas(WIDTH, HEIGHT);
    textAlign(CENTER, CENTER);
    textSize(FONT_SIZE_EMOJI); // Tamanho padrão para emojis

    // Calcula a posição inicial para centralizar o grid
    startX = (WIDTH - (GRID_COLS * (CARD_SIZE + CARD_MARGIN))) / 2;
    startY = (HEIGHT - (GRID_ROWS * (CARD_SIZE + CARD_MARGIN))) / 2;
}

function draw() {
    background(WHITE); // Limpa a tela a cada frame

    if (gameState === "waiting_start") {
        displayInstructions();
    } else if (gameState === "playing") {
        drawBoard();
        displayGameInfo();
        checkGameOver(); // Verifica se o jogo terminou a cada frame
    } else if (gameState === "game_over") {
        // A mensagem de game over já é exibida na transição
        // Podemos adicionar uma tela de "jogar novamente" aqui se quisermos
    }
}

function mousePressed() {
    if (gameState === "playing") {
        let cardCoords = getCardAtPos(mouseX, mouseY);
        if (cardCoords) {
            let r = cardCoords.row;
            let c = cardCoords.col;
            let card = board[r][c];

            if (!card.revealed && !card.matched && revealedCards.length < 2) {
                card.revealed = true;
                revealedCards.push({ row: r, col: c });

                if (revealedCards.length === 2) {
                    // Pequeno delay para o jogador ver as duas cartas
                    setTimeout(checkMatch, 1000);
                }
            }
        }
    }
}

function keyPressed() {
    if (keyCode === 32 && gameState === "waiting_start") { // 32 é o código para a tecla ESPAÇO
        startGame();
    }
}

// --- Funções do Jogo ---

function createBoard() {
    let allEmojis = [];
    for (let key in EMOJI_PAIRS) {
        allEmojis.push(key);
        allEmojis.push(EMOJI_PAIRS[key]);
    }
    // Embaralha os emojis
    allEmojis.sort(() => Math.random() - 0.5);

    board = [];
    for (let r = 0; r < GRID_ROWS; r++) {
        let row = [];
        for (let c = 0; c < GRID_COLS; c++) {
            row.push({
                emoji: allEmojis.pop(),
                revealed: false,
                matched: false
                // Adiciona posição para facilitar o clique
                // x: startX + c * (CARD_SIZE + CARD_MARGIN),
                // y: startY + r * (CARD_SIZE + CARD_MARGIN)
            });
        }
        board.push(row);
    }
}

function drawBoard() {
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            let card = board[r][c];
            let x = startX + c * (CARD_SIZE + CARD_MARGIN);
            let y = startY + r * (CARD_SIZE + CARD_MARGIN);

            // Desenha o fundo da carta
            fill(GRAY);
            stroke(BLACK);
            strokeWeight(2);
            rect(x, y, CARD_SIZE, CARD_SIZE, 5); // 5 é o raio do canto para arredondar

            // Se a carta estiver revelada ou já combinada, mostra o emoji
            if (card.revealed || card.matched) {
                fill(BLACK);
                textSize(FONT_SIZE_EMOJI);
                text(card.emoji, x + CARD_SIZE / 2, y + CARD_SIZE / 2);
            } else {
                // Verso da carta
                fill(CARD_BACK_COLOR);
                rect(x, y, CARD_SIZE, CARD_SIZE, 5);
                // Opcional: Adicionar um ícone ou "? " no verso
                // fill(WHITE);
                // textSize(FONT_SIZE_TEXT);
                // text("?", x + CARD_SIZE / 2, y + CARD_SIZE / 2);
            }
        }
    }
}

function getCardAtPos(px, py) {
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            let x = startX + c * (CARD_SIZE + CARD_MARGIN);
            let y = startY + r * (CARD_SIZE + CARD_MARGIN);
            if (px >= x && px <= x + CARD_SIZE && py >= y && py <= y + CARD_SIZE) {
                return { row: r, col: c };
            }
        }
    }
    return null;
}

function checkMatch() {
    let card1Coords = revealedCards[0];
    let card2Coords = revealedCards[1];

    let card1 = board[card1Coords.row][card1Coords.col];
    let card2 = board[card2Coords.row][card2Coords.col];

    // Verifica se os emojis formam um par válido
    const isMatch = (EMOJI_PAIRS[card1.emoji] === card2.emoji || EMOJI_PAIRS[card2.emoji] === card1.emoji);

    if (isMatch) {
        card1.matched = true;
        card2.matched = true;
        matchedPairs++;
    } else {
        card1.revealed = false;
        card2.revealed = false;
    }
    revealedCards = []; // Limpa as cartas reveladas
}

function displayInstructions() {
    fill(BLACK);
    textSize(50);
    text("Jogo da Memória com Emojis!", WIDTH / 2, HEIGHT / 2 - 80);
    textSize(FONT_SIZE_TEXT);
    text("Encontre 8 pares de cartas em 1 minuto.", WIDTH / 2, HEIGHT / 2 - 20);
    text("Pressione ESPAÇO para começar...", WIDTH / 2, HEIGHT / 2 + 40);
}

function startGame() {
    createBoard();
    startTime = millis(); // Tempo em milissegundos desde o início do sketch
    gameState = "playing";
    matchedPairs = 0;
    revealedCards = [];
}

function displayGameInfo() {
    let elapsedTime = (millis() - startTime) / 1000; // Tempo em segundos
    let remainingTime = Math.max(0, GAME_TIME_LIMIT - floor(elapsedTime));

    fill(BLACK);
    textSize(FONT_SIZE_TEXT);

    // Tempo restante
    text(`Tempo: ${remainingTime}s`, 100, 40);

    // Pares encontrados
    text(`Pares: ${matchedPairs}/8`, WIDTH - 100, 40);
}

function checkGameOver() {
    let elapsedTime = (millis() - startTime) / 1000; // Tempo em segundos

    if (matchedPairs === 8) {
        endGame("PARABÉNS!Você achou a todos!", "Green");
    } else if (elapsedTime >= GAME_TIME_LIMIT) {
        endGame("TEMPO ESGOTADO!", RED);
    }
}

function endGame(message, color) {
    gameState = "game_over";
    // Limpa a tela e exibe a mensagem final
    background(WHITE);
    fill(color);
    textSize(50);
    text(message, WIDTH / 2, HEIGHT / 2 - 20);
    textSize(FONT_SIZE_TEXT);
    text("Recarregue a página para tentar novamente.", WIDTH / 2, HEIGHT / 2 + 40);
    noLoop(); // Para o loop 'draw'
}
