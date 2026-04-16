let hangulData = [];
let totalWeightEasy = 0;
let totalWeightNormal = 0;

let isPlaying = false;

let totalQuestions = 10;
let questionCount = 0;
let currentDifficulty = 'normal';

let currentTarget = '';
let currentFreq = 0;

let timeCharAppeared = 0;
let timeFirstKeyPressed = 0;

let reactionTimes = [];
let typingTimes = [];
let totalGameScore = 0;

// UI要素の取得
const startScreen = document.getElementById('start-screen');
const gameArea = document.getElementById('game-area');
const resultArea = document.getElementById('result-area');
const targetDisplay = document.getElementById('target-display');
const freqDisplay = document.getElementById('freq-display');
const inputField = document.getElementById('hangul-input');
const progressText = document.getElementById('progress-text');
const diffBadge = document.getElementById('diff-badge');
const currentReactionDisplay = document.getElementById('current-reaction');
const currentTypingDisplay = document.getElementById('current-typing');
const currentScoreDisplay = document.getElementById('current-score');

// === CSVデータのパース関数 ===
function parseCSV(text) {
    hangulData = [];
    const lines = text.replace(/\r/g, '').split('\n');
    if(lines.length === 0) return;
    
    const header = lines[0].split(',');
    const charIdx = header.indexOf('character');
    const freqIdx = header.indexOf('total_frequency_all_time');
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        let cols = [];
        let cur = "";
        let inQuotes = false;
        for (let j = 0; j < lines[i].length; j++) {
            const c = lines[i][j];
            if (c === '"') { inQuotes = !inQuotes; }
            else if (c === ',' && !inQuotes) { cols.push(cur); cur = ""; }
            else { cur += c; }
        }
        cols.push(cur);
        
        if (cols.length > Math.max(charIdx, freqIdx)) {
            const char = cols[charIdx];
            const freq = parseInt(cols[freqIdx], 10);
            
            if (char.length === 1 && !isNaN(freq)) {
                const code = char.charCodeAt(0);
                if (code >= 0xAC00 && code <= 0xD7A3) {
                    const wEasy = Math.max(0.1, Math.sqrt(freq + 1));
                    const wNormal = Math.max(0.1, Math.cbrt(freq + 1));
                    hangulData.push({ char: char, freq: freq, weightEasy: freq, weightNormal: wNormal });
                }
            }
        }
    }
    totalWeightEasy = hangulData.reduce((sum, item) => sum + item.weightEasy, 0);
    totalWeightNormal = hangulData.reduce((sum, item) => sum + item.weightNormal, 0);
}

// 起動時のCSV読み込み
window.addEventListener('DOMContentLoaded', () => {
    fetch('kor_Hang.csv')
        .then(response => {
            if (!response.ok) throw new Error('ネットワークエラー');
            return response.text();
        })
        .then(text => {
            parseCSV(text);
            document.getElementById('loading-msg').style.display = 'none';
            document.getElementById('start-form').style.display = 'block';
        })
        .catch(err => {
            const msg = document.getElementById('loading-msg');
            msg.style.color = '#EF4444';
            msg.innerHTML = '⚠️ CSVの読み込みに失敗しました。<br><span style="font-size:0.8rem; font-weight:normal;">GitHub Pagesにデプロイするか、ローカルサーバー経由で開いてください。</span>';
        });
});

// ハングルの選択ロジック
function setNextHangul() {
    let selected = null;
    if (currentDifficulty === 'easy') {
        let r = Math.random() * totalWeightEasy;
        for (let i = 0; i < hangulData.length; i++) {
            r -= hangulData[i].weightEasy;
            if (r <= 0) { selected = hangulData[i]; break; }
        }
    } else if (currentDifficulty === 'normal') {
        let r = Math.random() * totalWeightNormal;
        for (let i = 0; i < hangulData.length; i++) {
            r -= hangulData[i].weightNormal;
            if (r <= 0) { selected = hangulData[i]; break; }
        }
    } else {
        selected = hangulData[Math.floor(Math.random() * hangulData.length)];
    }
    if (!selected) selected = hangulData[hangulData.length - 1];
    currentTarget = selected.char;
    currentFreq = selected.freq;
}

// スコア計算
function calculateScore(reactTime, typeTime, freq) {
    let totalTime = reactTime + typeTime;
    const reactScore = 1000000000 / (totalTime * totalTime);
    const typeScore = 10000000 / (typeTime * typeTime); 
    const baseScore = reactScore + typeScore;

    const rarityBonus = Math.max(0, 10 - Math.log10(freq + 1)); 
    const multiplier = 1.0 + (rarityBonus * 0.2); 

    return Math.floor(baseScore * multiplier);
}

// ゲーム開始処理
// グローバル空間（window）に登録してHTMLから呼び出せるようにする
window.startGame = function(difficulty) {
    isPlaying = true; 
    currentDifficulty = difficulty;
    totalQuestions = parseInt(document.getElementById('q-count').value, 10);
    questionCount = 0;
    totalGameScore = 0;
    reactionTimes = [];
    typingTimes = [];
    
    diffBadge.innerText = difficulty.toUpperCase();
    if(difficulty === 'easy') diffBadge.style.backgroundColor = 'var(--easy)';
    if(difficulty === 'normal') diffBadge.style.backgroundColor = 'var(--normal)';
    if(difficulty === 'hard') diffBadge.style.backgroundColor = 'var(--hard)';

    currentScoreDisplay.innerText = "0";
    startScreen.style.display = 'none';
    resultArea.style.display = 'none';
    gameArea.style.display = 'block';
    nextQuestion();
};

function nextQuestion() {
    if (!isPlaying) return; 
    if (questionCount >= totalQuestions) { showResult(); return; }
    
    questionCount++;
    progressText.innerText = `${questionCount} / ${totalQuestions}`;
    
    setNextHangul();
    targetDisplay.innerText = currentTarget;
    freqDisplay.innerText = `[ 出現頻度: ${currentFreq.toLocaleString()} 回 ]`;
    
    inputField.value = '';
    inputField.disabled = false;
    inputField.focus();
    timeFirstKeyPressed = 0;
    timeCharAppeared = performance.now();
}

// === 中断（リタイア）機能 ===
window.quitGame = function() {
    isPlaying = false; 
    
    gameArea.style.display = 'none';
    startScreen.style.display = 'block';
    
    inputField.value = '';
    inputField.disabled = false;
    
    currentReactionDisplay.innerText = '--- ms';
    currentTypingDisplay.innerText = '--- ms';
    freqDisplay.innerText = '';
    targetDisplay.style.color = 'var(--text-main)';
};

// キーボード入力監視
inputField.addEventListener('keydown', (e) => {
    if (!isPlaying) return;
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;
    if (timeFirstKeyPressed === 0) {
        timeFirstKeyPressed = performance.now();
        const reactionTime = timeFirstKeyPressed - timeCharAppeared;
        currentReactionDisplay.innerText = `${reactionTime.toFixed(0)} ms`;
    }
});

inputField.addEventListener('input', (e) => {
    if (!isPlaying) return;
    if (inputField.value === currentTarget) {
        const timeCharCompleted = performance.now();
        if (timeFirstKeyPressed === 0) timeFirstKeyPressed = timeCharAppeared;

        const reactionTime = timeFirstKeyPressed - timeCharAppeared;
        const typingTime = timeCharCompleted - timeFirstKeyPressed;

        reactionTimes.push(reactionTime);
        typingTimes.push(typingTime);

        currentTypingDisplay.innerText = `${typingTime.toFixed(0)} ms`;
        
        const turnScore = calculateScore(reactionTime, typingTime, currentFreq);
        totalGameScore += turnScore;
        currentScoreDisplay.innerText = totalGameScore.toLocaleString();
        
        targetDisplay.style.color = 'var(--success)';
        inputField.disabled = true;

        setTimeout(() => {
            if (!isPlaying) return; 
            targetDisplay.style.color = 'var(--text-main)';
            nextQuestion();
        }, 450);
    }
});

// リザルト画面表示
function showResult() {
    isPlaying = false;
    gameArea.style.display = 'none';
    resultArea.style.display = 'block';

    const avgReaction = reactionTimes.reduce((a, b) => a + b, 0) / totalQuestions;
    const avgTyping = typingTimes.reduce((a, b) => a + b, 0) / totalQuestions;
    const avgScore = totalGameScore / totalQuestions;

    document.getElementById('avg-reaction').innerText = `${avgReaction.toFixed(0)} ms`;
    document.getElementById('avg-typing').innerText = `${avgTyping.toFixed(0)} ms`;
    document.getElementById('avg-score').innerText = avgScore.toFixed(0);
    document.getElementById('final-score').innerText = totalGameScore.toLocaleString();

    let rankName = "";
    let rankColor = "";
    
    if (avgScore >= 5000000) { rankName = "【S+】世宗大王のゴーストライター"; rankColor = "#8B5CF6"; } 
    else if (avgScore >= 100000) { rankName = "【S】歩く訓民正音"; rankColor = "#EF4444"; } 
    else if (avgScore >= 500000) { rankName = "【A】ゲシュタルト崩壊の超越者"; rankColor = "#F59E0B"; } 
    else if (avgScore >= 10000) { rankName = "【B】優秀な宮廷書記官"; rankColor = "#10B981"; } 
    else if (avgScore >= 5000) { rankName = "【C】迷える子音と母音"; rankColor = "#3B82F6"; } 
    else { rankName = "【D】キーボードと睨み合う者"; rankColor = "#6B7280"; } 

    const rankBox = document.getElementById('rank-box');
    const rankTitle = document.getElementById('rank-title');
    
    rankBox.style.backgroundColor = rankColor;
    rankTitle.innerText = rankName;

    currentReactionDisplay.innerText = '--- ms';
    currentTypingDisplay.innerText = '--- ms';
    freqDisplay.innerText = '';
}

// タイトルへ戻る
window.resetGame = function() {
    resultArea.style.display = 'none';
    startScreen.style.display = 'block';
};
