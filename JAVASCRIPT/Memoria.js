const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('button'),
    win: document.querySelector('.win')
};

const state = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
};

const shuffle = array => {
    const clonedArray = [...array];
    for (let i = clonedArray.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        const original = clonedArray[i];
        clonedArray[i] = clonedArray[randomIndex];
        clonedArray[randomIndex] = original;
    }
    return clonedArray;
};

const pickRandom = (array, items) => {
    const clonedArray = [...array];
    const randomPicks = [];
    for (let i = 0; i < items; i++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length);
        randomPicks.push(clonedArray[randomIndex]);
        clonedArray.splice(randomIndex, 1);
    }
    return randomPicks;
};

const generateGame = () => {
    const dimensions = selectors.board.getAttribute('data-dimension');
    if (dimensions % 2 !== 0) {
        throw new Error("The dimension of the board must be an even number.");
    }
    const images = [
        '../CSS/img/1.png', '../CSS/img/2.png', '../CSS/img/3.png', '../CSS/img/4.png', '../CSS/img/5.png',
        '../CSS/img/6.png', '../CSS/img/7.png', '../CSS/img/8.png', '../CSS/img/9.png', '../CSS/img/10.png'
    ];
    const picks = pickRandom(images, (dimensions * dimensions) / 2);
    const items = shuffle([...picks, ...picks]);
    const cards = `
        <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items.map(item => `
                <div class="card">
                    <div class="card-front"></div>
                    <div class="card-back">
                        <img src="${item}" alt="Card Image" style="width: 80%; height: 80%; object-fit: contain;">
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    const parser = new DOMParser().parseFromString(cards, 'text/html');
    selectors.board.replaceWith(parser.querySelector('.board'));
};

const startGame = () => {
    state.gameStarted = true;
    selectors.start.classList.add('disabled');
    state.loop = setInterval(() => {
        state.totalTime++;
        selectors.moves.innerText = `Movimientos ${state.totalFlips}`;
        selectors.timer.innerText = `Tiempo: ${state.totalTime} segundos`;
    }, 1000);
};

const flipBackCards = () => {
    document.querySelectorAll('.card:not(.matched)').forEach(card => {
        card.classList.remove('flipped');
    });
    state.flippedCards = 0;
};

const flipCard = card => {
    state.flippedCards++;
    state.totalFlips++;
    if (!state.gameStarted) {
        startGame();
    }
    if (state.flippedCards <= 2) {
        card.classList.add('flipped');
    }
    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.flipped:not(.matched)');
        // Comparar las rutas de las imágenes
        const img1 = flippedCards[0].querySelector('.card-back img').src;
        const img2 = flippedCards[1].querySelector('.card-back img').src;

        if (img1 === img2) {

            flippedCards[0].classList.add('matched');
            flippedCards[1].classList.add('matched');
        }

        setTimeout(() => {
            flipBackCards();
        }, 1000);
    }
    if (!document.querySelectorAll('.card:not(.flipped):not(.matched)').length) {
        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped');
            selectors.win.innerHTML = `
                <span class="win-text">
                    Ganaste! con <span class="highlight">${state.totalFlips}</span> movimientos<br /> en <span class="highlight">${state.totalTime}</span> segundos
                </span>
            `;
            clearInterval(state.loop);
        }, 1000);
    }
};

const attachEventListeners = () => {
    document.addEventListener('click', event => {
        const eventTarget = event.target;
        const eventParent = eventTarget.parentElement;
        if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped')) {
            flipCard(eventParent);
        } else if (eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
            startGame();
        }
    });
};

generateGame();
attachEventListeners();