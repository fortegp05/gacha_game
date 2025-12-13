// トランプカードの定義
const suits = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
};

const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// 全てのカードを生成
function createDeck() {
    const deck = [];
    for (const suit in suits) {
        for (const rank of ranks) {
            deck.push({
                suit: suit,
                rank: rank,
                symbol: suits[suit]
            });
        }
    }
    return deck;
}

// デッキをシャッフル
function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// カードのHTML要素を作成
function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = `card ${card.suit}`;

    const topDiv = document.createElement('div');
    topDiv.className = 'card-top';
    topDiv.textContent = `${card.rank}${card.symbol}`;

    const centerDiv = document.createElement('div');
    centerDiv.className = 'card-center';
    centerDiv.textContent = card.symbol;

    const bottomDiv = document.createElement('div');
    bottomDiv.className = 'card-bottom';
    bottomDiv.textContent = `${card.rank}${card.symbol}`;

    cardDiv.appendChild(topDiv);
    cardDiv.appendChild(centerDiv);
    cardDiv.appendChild(bottomDiv);

    return cardDiv;
}

// カードを表示
function displayCards() {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);
    const selectedCards = shuffled.slice(0, 4); // 4枚のカードを選択

    const container = document.getElementById('card-container');
    container.innerHTML = ''; // 既存のカードをクリア

    selectedCards.forEach((card, index) => {
        const cardElement = createCardElement(card);
        // アニメーション用の遅延を追加
        setTimeout(() => {
            cardElement.style.opacity = '0';
            cardElement.style.transform = 'translateY(20px)';
            container.appendChild(cardElement);

            // フェードインアニメーション
            setTimeout(() => {
                cardElement.style.transition = 'all 0.5s ease';
                cardElement.style.opacity = '1';
                cardElement.style.transform = 'translateY(0)';
            }, 10);
        }, index * 100);
    });
}

// 初期表示
document.addEventListener('DOMContentLoaded', () => {
    displayCards();

    // シャッフルボタンのイベントリスナー
    const shuffleBtn = document.getElementById('shuffle-btn');
    shuffleBtn.addEventListener('click', displayCards);
});
