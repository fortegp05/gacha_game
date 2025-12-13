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

// カードをcanvasに描画
function drawCard(ctx, card, x, y, width, height) {
    // カードの背景
    ctx.fillStyle = 'white';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    // 角丸の矩形を描画
    const radius = 10;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // カードの色を設定
    const color = (card.suit === 'hearts' || card.suit === 'diamonds') ? '#e74c3c' : '#2c3e50';
    ctx.fillStyle = color;

    // 上部のランクとスート
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`${card.rank}${card.symbol}`, x + 10, y + 25);

    // 中央のスート
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(card.symbol, x + width / 2, y + height / 2);

    // 下部のランクとスート（回転）
    ctx.save();
    ctx.translate(x + width - 10, y + height - 25);
    ctx.rotate(Math.PI);
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`${card.rank}${card.symbol}`, 0, 0);
    ctx.restore();

    // テキスト設定をリセット
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
}

// カードを表示
function displayCards() {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);
    const selectedCards = shuffled.slice(0, 4); // 4枚のカードを選択

    const canvas = document.getElementById('card-container');
    const ctx = canvas.getContext('2d');

    // canvasをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // カードのサイズと配置
    const cardWidth = 140;
    const cardHeight = 200;
    const gap = 20;
    const startX = (canvas.width - (cardWidth * 4 + gap * 3)) / 2;
    const startY = (canvas.height - cardHeight) / 2;

    // 各カードを描画
    selectedCards.forEach((card, index) => {
        const x = startX + (cardWidth + gap) * index;
        const y = startY;
        drawCard(ctx, card, x, y, cardWidth, cardHeight);
    });
}

// 初期表示
document.addEventListener('DOMContentLoaded', () => {
    displayCards();

    // シャッフルボタンのイベントリスナー
    const shuffleBtn = document.getElementById('shuffle-btn');
    shuffleBtn.addEventListener('click', displayCards);
});
