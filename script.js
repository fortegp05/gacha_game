// トランプカードの定義
const suits = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
};

const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// 当り条件（GitHubから読み込む）
let atariConditions = [];

// シャッフルボタンがクリックされたかどうかのフラグ
let hasShuffled = false;

// GitHubからatari.ymlを読み込む
async function loadAtariConditions() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/fortegp05/gacha_game/main/atari.yml');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const yamlText = await response.text();
        const data = jsyaml.load(yamlText);
        atariConditions = data.atari_conditions || [];
        console.log('atari.ymlを読み込みました:', atariConditions);
    } catch (error) {
        console.error('atari.ymlの読み込みに失敗しました:', error);
        // エラー時は空の配列を使用
        atariConditions = [];
    }
}

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

// カードの色を取得
function getCardColor(card) {
    return (card.suit === 'hearts' || card.suit === 'diamonds') ? 'red' : 'black';
}

// 数字を数値に変換（A=1, J=11, Q=12, K=13）
function rankToNumber(rank) {
    if (rank === 'A') return 1;
    if (rank === 'J') return 11;
    if (rank === 'Q') return 12;
    if (rank === 'K') return 13;
    return parseInt(rank);
}

// 当り判定
function checkAtari(cards) {
    for (const condition of atariConditions) {
        if (matchesCondition(cards, condition)) {
            return condition.description;
        }
    }
    return null;
}

// 条件に一致するかチェック
function matchesCondition(cards, condition) {
    // 色の条件チェック
    if (condition.color !== null) {
        const allMatchColor = cards.every(card => getCardColor(card) === condition.color);
        if (!allMatchColor) return false;
    }

    // スートの条件チェック
    if (condition.suit !== null) {
        const allMatchSuit = cards.every(card => card.suit === condition.suit);
        if (!allMatchSuit) return false;
    }

    // 数字の条件チェック
    if (condition.rank_condition !== null) {
        if (condition.rank_condition === "all_same") {
            // フォーカード: 全て同じ数字
            const firstRank = cards[0].rank;
            const allSameRank = cards.every(card => card.rank === firstRank);
            if (!allSameRank) return false;
        } else if (condition.rank_condition === "current_date") {
            // 当日: 現在日と同じ並び（例: 12/13 -> 1, 2, 1, 3）
            const today = new Date();
            const month = today.getMonth() + 1; // 月は0始まりなので+1
            const day = today.getDate();
            const dateDigits = `${month}${day}`.split('').map(d => parseInt(d));

            // カードが4枚で、日付の桁数が4桁の場合のみチェック
            if (dateDigits.length !== 4) return false;

            const cardNumbers = cards.map(card => rankToNumber(card.rank));
            const matches = dateDigits.every((digit, index) => {
                // 0の場合は10として扱う
                const expected = digit === 0 ? 10 : digit;
                return cardNumbers[index] === expected;
            });
            if (!matches) return false;
        }
    }

    return true;
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

    // 当り判定
    const atariResult = checkAtari(selectedCards);

    // メッセージの表示
    if (!hasShuffled) {
        // 初期状態: 「ガチャを回す」を表示
        drawAtariMessage(ctx, null, startX, startY, cardWidth, gap);
    } else if (atariResult) {
        // 当り表示
        drawAtariMessage(ctx, atariResult, startX, startY, cardWidth, gap);
        // 当たり時の処理
        handleAtari();
    } else {
        // ハズレ表示
        drawAtariMessage(ctx, 'ハズレ', startX, startY, cardWidth, gap);
        // ハズレ時の処理（ボタンを通常状態に戻す）
        handleHazure();
    }
}

// 当たり時の処理
function handleAtari() {
    const shuffleBtn = document.getElementById('shuffle-btn');
    const retryBtn = document.getElementById('retry-btn');

    // シャッフルボタンをグレーアウトして無効化
    shuffleBtn.disabled = true;
    shuffleBtn.style.opacity = '0.5';
    shuffleBtn.style.cursor = 'not-allowed';

    // 当たり用ボタンを表示
    retryBtn.style.display = 'inline-block';
}

// ハズレ時の処理
function handleHazure() {
    const shuffleBtn = document.getElementById('shuffle-btn');
    const retryBtn = document.getElementById('retry-btn');

    // シャッフルボタンを有効化
    shuffleBtn.disabled = false;
    shuffleBtn.style.opacity = '1';
    shuffleBtn.style.cursor = 'pointer';

    // 当たり用ボタンを非表示
    retryBtn.style.display = 'none';
}

// もう一度回す処理
function retryGacha() {
    const shuffleBtn = document.getElementById('shuffle-btn');
    const retryBtn = document.getElementById('retry-btn');

    // シャッフルボタンを有効化
    shuffleBtn.disabled = false;
    shuffleBtn.style.opacity = '1';
    shuffleBtn.style.cursor = 'pointer';

    // 当たり用ボタンを非表示
    retryBtn.style.display = 'none';

    // カードをシャッフル
    displayCards();
}

// 当り表示を描画
function drawAtariMessage(ctx, message, startX, startY, cardWidth, gap) {
    // メッセージ領域の位置とサイズ
    const messageWidth = cardWidth * 4 + gap * 3;
    const messageHeight = 50;
    const messageX = startX;
    const messageY = startY - messageHeight - 20;

    // メッセージの種類によってテキスト色とテキストを変更
    let textColor, displayText;

    if (message === null) {
        // 初期状態: 「ガチャを回す」
        textColor = '#6495ed'; // 青色
        displayText = 'ガチャを回す';
    } else if (message === 'ハズレ') {
        // ハズレの場合
        textColor = '#808080'; // グレー
        displayText = 'ハズレ';
    } else {
        // 当りの場合
        textColor = '#ffd700'; // 金色
        displayText = `当り: ${message}`;
    }

    // テキストのみを描画（背景なし）
    ctx.fillStyle = textColor;
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayText, messageX + messageWidth / 2, messageY + messageHeight / 2);

    // テキスト設定をリセット
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
}

// 初期表示
document.addEventListener('DOMContentLoaded', async () => {
    // atari.ymlを読み込んでから初期表示
    await loadAtariConditions();
    displayCards();

    // シャッフルボタンのイベントリスナー
    const shuffleBtn = document.getElementById('shuffle-btn');
    shuffleBtn.addEventListener('click', () => {
        hasShuffled = true; // ボタンがクリックされたことを記録
        displayCards();
    });

    // もう一度回すボタンのイベントリスナー
    const retryBtn = document.getElementById('retry-btn');
    retryBtn.addEventListener('click', retryGacha);

    // Twitterシェアボタンのイベントリスナー（未実装）
    const shareBtn = document.getElementById('share-btn');
    shareBtn.addEventListener('click', () => {
        // 今回は未実装
        console.log('Twitterシェア機能は未実装です');
    });
});
