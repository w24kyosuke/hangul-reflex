let hangulDataEasy = [];
let hangulDataNormal = [];
let hangulDataHard = [];
let totalWeightEasy = 0;

let isPlaying = false;
let currentMode = 'normal';
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

let currentCombo = 0;
let maxCombo = 0;
let survivalTimeRemaining = 5.0;
let lastFrameTime = 0;
let timerAnimationFrame = null;

// --- やり込みローカルストレージ ---
let nemesisData = JSON.parse(localStorage.getItem('hangulNemesis')) || { char: null, time: 0 };
let unlockedTitles = JSON.parse(localStorage.getItem('hangulUnlockedTitles')) || ['【初級】ハングル一年生'];
let equippedTitle = localStorage.getItem('hangulEquippedTitle') || '';
// 出会ったハングル図鑑 (Setとして扱いやすくする)
let encounteredHangul = new Set(JSON.parse(localStorage.getItem('hangulEncountered')) || []);
const TOTAL_HANGUL_COUNT = 11172;

let sessionWorstChar = { char: null, time: 0 };

const els = {
    startScreen: document.getElementById('start-screen'),
    gameArea: document.getElementById('game-area'),
    resultArea: document.getElementById('result-area'),
    collectionArea: document.getElementById('collection-area'), // 追加
    targetDisplay: document.getElementById('target-display'),
    freqDisplay: document.getElementById('freq-display'),
    inputField: document.getElementById('hangul-input'),
    progressText: document.getElementById('progress-text'),
    diffBadge: document.getElementById('diff-badge'),
    currentReaction: document.getElementById('current-reaction'),
    currentTyping: document.getElementById('current-typing'),
    currentScore: document.getElementById('current-score'),
    timerContainer: document.getElementById('timer-container'),
    timerBar: document.getElementById('timer-bar'),
    judgmentDisplay: document.getElementById('judgment-display'),
    comboDisplay: document.getElementById('combo-display'),
    nemesisContainer: document.getElementById('nemesis-container'),
    nemesisChar: document.getElementById('nemesis-char'),
    nemesisTime: document.getElementById('nemesis-time'),
    titleDisplay: document.getElementById('player-title-display'),
    titleSelect: document.getElementById('title-select'),
    titleEquipGroup: document.getElementById('title-equip-group'),
    qCountGroup: document.getElementById('q-count-group'),
    achievementAlert: document.getElementById('achievement-alert'),
    newAchievementName: document.getElementById('new-achievement-name'),
    survivalResultWave: document.getElementById('survival-result-wave'),
    maxComboResult: document.getElementById('max-combo-result')
};

function parseCSV(text) {
    hangulDataEasy = []; hangulDataNormal = []; hangulDataHard = [];
    const lines = text.replace(/\r/g, '').split('\n');
    if(lines.length === 0) return;
    const header = lines[0].split(',');
    const charIdx = header.indexOf('character');
    const freqIdx = header.indexOf('total_frequency_all_time');
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        let cols = []; let cur = ""; let inQuotes = false;
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
                    const item = { char: char, freq: freq };
                    hangulDataHard.push(item);
                    if (freq >= 10000) hangulDataNormal.push(item);
                    hangulDataEasy.push({ ...item, weight: freq });
                }
            }
        }
    }
    totalWeightEasy = hangulDataEasy.reduce((sum, item) => sum + item.weight, 0);
    initTitleUI();
}

window.addEventListener('DOMContentLoaded', () => {
    fetch('kor_Hang.csv')
        .then(response => { if (!response.ok) throw new Error('Network error'); return response.text(); })
        .then(text => {
            parseCSV(text);
            document.getElementById('loading-msg').style.display = 'none';
            document.getElementById('start-form').style.display = 'block';
        })
        .catch(err => {
            document.getElementById('loading-msg').innerHTML = '⚠️ CSV読み込み失敗';
        });
});

function initTitleUI() {
    if (nemesisData.char) {
        els.nemesisContainer.style.display = 'block';
        els.nemesisChar.innerText = nemesisData.char;
        els.nemesisTime.innerText = `構築に ${nemesisData.time.toFixed(0)} ms かかっています`;
    }
    if (unlockedTitles.length > 0) {
        els.titleEquipGroup.style.display = 'flex';
        els.titleSelect.innerHTML = '';
        unlockedTitles.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t; opt.innerText = t;
            if (t === equippedTitle) opt.selected = true;
            els.titleSelect.appendChild(opt);
        });
    }
    if (equippedTitle) {
        els.titleDisplay.style.display = 'inline-block';
        els.titleDisplay.innerText = equippedTitle;
    }
}

window.equipTitle = function() {
    equippedTitle = els.titleSelect.value;
    localStorage.setItem('hangulEquippedTitle', equippedTitle);
    els.titleDisplay.innerText = equippedTitle;
    els.titleDisplay.style.display = 'inline-block';
};

window.toggleModeSettings = function() {
    currentMode = document.getElementById('game-mode').value;
    els.qCountGroup.style.display = (currentMode === 'survival') ? 'none' : 'flex';
};

// === コレクション（図鑑）機能 ===
window.showCollection = function() {
    els.startScreen.style.display = 'none';
    els.collectionArea.style.display = 'block';
    
    // 称号リスト更新
    const titleList = document.getElementById('unlocked-titles-list');
    titleList.innerHTML = '';
    unlockedTitles.forEach(t => {
        const li = document.createElement('li');
        li.innerText = t;
        titleList.appendChild(li);
    });

    // 図鑑更新
    document.getElementById('hangul-encounter-count').innerText = encounteredHangul.size;
    const rate = (encounteredHangul.size / TOTAL_HANGUL_COUNT) * 100;
    document.getElementById('hangul-encounter-rate').innerText = rate.toFixed(2) + '%';
    
    const grid = document.getElementById('hangul-grid');
    grid.innerHTML = '';
    encounteredHangul.forEach(char => {
        const div = document.createElement('div');
        div.innerText = char;
        grid.appendChild(div);
    });
};

window.hideCollection = function() {
    els.collectionArea.style.display = 'none';
    els.startScreen.style.display = 'block';
};

window.switchCollectionTab = function(tab) {
    document.getElementById('tab-titles').classList.remove('active');
    document.getElementById('tab-hangul').classList.remove('active');
    document.getElementById('collection-titles-content').style.display = 'none';
    document.getElementById('collection-hangul-content').style.display = 'none';

    document.getElementById(`tab-${tab}`).classList.add('active');
    document.getElementById(`collection-${tab}-content`).style.display = 'block';
};

// === ゲーム進行 ===
function setNextHangul() {
    let selected = null;
    if (currentDifficulty === 'easy') {
        let r = Math.random() * totalWeightEasy;
        for (let i = 0; i < hangulDataEasy.length; i++) {
            r -= hangulDataEasy[i].weight;
            if (r <= 0) { selected = hangulDataEasy[i]; break; }
        }
    } else if (currentDifficulty === 'normal') {
        selected = hangulDataNormal[Math.floor(Math.random() * hangulDataNormal.length)];
    } else {
        selected = hangulDataHard[Math.floor(Math.random() * hangulDataHard.length)];
    }
    if (!selected) selected = hangulDataHard[hangulDataHard.length - 1];
    currentTarget = selected.char;
    currentFreq = selected.freq;

    // 図鑑に追加して保存
    if (!encounteredHangul.has(currentTarget)) {
        encounteredHangul.add(currentTarget);
        localStorage.setItem('hangulEncountered', JSON.stringify(Array.from(encounteredHangul)));
    }
}

function calculateScore(reactTime, typeTime, freq, combo) {
    const typingScore = 12000 * Math.exp(-typeTime / 250); 
    const totalTimeScore = 8000 * Math.exp(-(reactTime + typeTime) / 400); 
    const baseScore = typingScore + totalTimeScore;
    const rarityBonus = Math.max(0, 10 - Math.log10(freq + 1)); 
    const comboBonus = combo * 0.05; 
    const multiplier = (1.0 + (rarityBonus * 0.1)) * (1.0 + comboBonus); 
    return Math.floor(baseScore * multiplier);
}

function displayJudgment(reactTime, typeTime) {
    const totalTime = reactTime + typeTime;
    let judgment = "LATE"; // MISS から LATE に変更
    els.judgmentDisplay.className = "judgment-text"; 
    
    if (totalTime <= 400) {
        judgment = "PERFECT";
        els.judgmentDisplay.classList.add('judgment-perfect');
        currentCombo++;
    } else if (totalTime <= 800) {
        judgment = "GREAT";
        els.judgmentDisplay.classList.add('judgment-great');
        currentCombo++;
    } else {
        judgment = "LATE";
        els.judgmentDisplay.classList.add('judgment-late');
        currentCombo = 0;
    }

    if (currentCombo > maxCombo) maxCombo = currentCombo;

    els.judgmentDisplay.innerText = judgment;
    els.judgmentDisplay.classList.add('show');
    
    if (currentCombo >= 2) {
        els.comboDisplay.style.display = 'block';
        els.comboDisplay.innerText = `${currentCombo} COMBO!`;
        els.comboDisplay.style.animation = 'none';
        void els.comboDisplay.offsetWidth; 
        els.comboDisplay.style.animation = 'pulse 0.3s';
    } else {
        els.comboDisplay.style.display = 'none';
    }
    return judgment;
}

function updateSurvivalTimer(timestamp) {
    if (!isPlaying || currentMode !== 'survival') return;
    if (!lastFrameTime) lastFrameTime = timestamp;
    
    const dt = (timestamp - lastFrameTime) / 1000;
    lastFrameTime = timestamp;
    survivalTimeRemaining -= dt;
    
    const percentage = Math.max(0, (survivalTimeRemaining / 5.0) * 100);
    els.timerBar.style.width = percentage + '%';
    
    if (survivalTimeRemaining <= 0) {
        isPlaying = false;
        showResult();
    } else {
        timerAnimationFrame = requestAnimationFrame(updateSurvivalTimer);
    }
}

window.startGame = function(difficulty) {
    isPlaying = true; 
    currentDifficulty = difficulty;
    currentMode = document.getElementById('game-mode').value;
    
    if (currentMode === 'normal') {
        totalQuestions = parseInt(document.getElementById('q-count').value, 10);
        els.timerContainer.style.display = 'none';
    } else {
        totalQuestions = Infinity;
        survivalTimeRemaining = 5.0;
        lastFrameTime = 0;
        els.timerContainer.style.display = 'block';
        timerAnimationFrame = requestAnimationFrame(updateSurvivalTimer);
    }

    questionCount = 0; totalGameScore = 0; currentCombo = 0; maxCombo = 0;
    reactionTimes = []; typingTimes = [];
    sessionWorstChar = { char: null, time: 0 };
    els.achievementAlert.style.display = 'none';
    els.survivalResultWave.style.display = 'none';
    els.comboDisplay.style.display = 'none';
    els.judgmentDisplay.classList.remove('show');
    
    els.diffBadge.innerText = difficulty.toUpperCase();
    if(difficulty === 'easy') els.diffBadge.style.backgroundColor = 'var(--easy)';
    if(difficulty === 'normal') els.diffBadge.style.backgroundColor = 'var(--normal)';
    if(difficulty === 'hard') els.diffBadge.style.backgroundColor = 'var(--hard)';

    els.currentScore.innerText = "0";
    els.startScreen.style.display = 'none';
    els.resultArea.style.display = 'none';
    els.gameArea.style.display = 'block';
    nextQuestion();
};

function nextQuestion() {
    if (!isPlaying) return; 
    if (questionCount >= totalQuestions) { showResult(); return; }
    
    questionCount++;
    els.progressText.innerText = currentMode === 'normal' ? `${questionCount} / ${totalQuestions}` : `WAVE: ${questionCount}`;
    els.judgmentDisplay.classList.remove('show');

    setNextHangul();
    els.targetDisplay.innerText = currentTarget;
    els.freqDisplay.innerText = `[ 出現頻度: ${currentFreq.toLocaleString()} 回 ]`;
    
    els.inputField.value = '';
    els.inputField.disabled = false;
    els.inputField.focus();
    timeFirstKeyPressed = 0;
    timeCharAppeared = performance.now();
}

window.quitGame = function() {
    isPlaying = false; 
    if (timerAnimationFrame) cancelAnimationFrame(timerAnimationFrame);
    els.gameArea.style.display = 'none';
    els.startScreen.style.display = 'block';
    els.inputField.value = ''; els.inputField.disabled = false;
    els.currentReaction.innerText = '--- ms'; els.currentTyping.innerText = '--- ms';
    els.freqDisplay.innerText = ''; els.targetDisplay.style.color = 'var(--text-main)';
    initTitleUI();
};

els.inputField.addEventListener('keydown', (e) => {
    if (!isPlaying) return;
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;
    if (timeFirstKeyPressed === 0) {
        timeFirstKeyPressed = performance.now();
        const reactionTime = timeFirstKeyPressed - timeCharAppeared;
        els.currentReaction.innerText = `${reactionTime.toFixed(0)} ms`;
    }
});

els.inputField.addEventListener('input', (e) => {
    if (!isPlaying) return;
    if (els.inputField.value === currentTarget) {
        const timeCharCompleted = performance.now();
        if (timeFirstKeyPressed === 0) timeFirstKeyPressed = timeCharAppeared;

        const reactionTime = timeFirstKeyPressed - timeCharAppeared;
        const typingTime = timeCharCompleted - timeFirstKeyPressed;

        reactionTimes.push(reactionTime);
        typingTimes.push(typingTime);

        if (typingTime > sessionWorstChar.time) {
            sessionWorstChar = { char: currentTarget, time: typingTime };
        }

        els.currentTyping.innerText = `${typingTime.toFixed(0)} ms`;
        
        const judgment = displayJudgment(reactionTime, typingTime);
        const turnScore = calculateScore(reactionTime, typingTime, currentFreq, currentCombo);
        totalGameScore += turnScore;
        els.currentScore.innerText = totalGameScore.toLocaleString();
        
        if (currentMode === 'survival') {
            const recovery = Math.max(0.1, 1.0 - (questionCount * 0.02));
            survivalTimeRemaining = Math.min(5.0, survivalTimeRemaining + recovery);
        }

        els.targetDisplay.style.color = 'var(--success)';
        els.inputField.disabled = true;

        if (currentDifficulty === 'hard' && judgment === 'PERFECT') {
            unlockTitle("【SS】11,172分の1の奇跡");
        }

        setTimeout(() => {
            if (!isPlaying) return; 
            els.targetDisplay.style.color = 'var(--text-main)';
            nextQuestion();
        }, 300); 
    }
});

function unlockTitle(titleName) {
    if (!unlockedTitles.includes(titleName)) {
        unlockedTitles.push(titleName);
        localStorage.setItem('hangulUnlockedTitles', JSON.stringify(unlockedTitles));
        els.newAchievementName.innerText = titleName;
        els.achievementAlert.style.display = 'block';
    }
}

function showResult() {
    isPlaying = false;
    if (timerAnimationFrame) cancelAnimationFrame(timerAnimationFrame);
    els.gameArea.style.display = 'none';
    els.resultArea.style.display = 'block';

    const count = Math.max(1, reactionTimes.length);
    const avgReaction = reactionTimes.reduce((a, b) => a + b, 0) / count;
    const avgTyping = typingTimes.reduce((a, b) => a + b, 0) / count;
    const avgScore = totalGameScore / count;

    els.currentReaction.innerText = `${avgReaction.toFixed(0)} ms`;
    els.currentTyping.innerText = `${avgTyping.toFixed(0)} ms`;
    document.getElementById('avg-reaction').innerText = `${avgReaction.toFixed(0)} ms`;
    document.getElementById('avg-typing').innerText = `${avgTyping.toFixed(0)} ms`;
    els.maxComboResult.innerText = maxCombo.toString();
    document.getElementById('final-score').innerText = totalGameScore.toLocaleString();

    if (currentMode === 'survival') {
        els.survivalResultWave.innerText = `到達 WAVE: ${questionCount}`;
        els.survivalResultWave.style.display = 'block';
    }

    if (sessionWorstChar.time > nemesisData.time) {
        nemesisData = sessionWorstChar;
        localStorage.setItem('hangulNemesis', JSON.stringify(nemesisData));
    }

    // === 称号・ランク判定 ===
    let rankName = ""; let rankColor = "";
    
    if (currentMode === 'survival') {
        // サバイバルモードは WAVE数 と MAXコンボ で評価
        if (questionCount >= 100 && maxCombo >= 50) { rankName = "【生存・伝説】不滅のタイピングマシン"; rankColor = "#D946EF"; }
        else if (questionCount >= 50) { rankName = "【生存・達人】ゾーンに入りし者"; rankColor = "#EF4444"; }
        else if (questionCount >= 20) { rankName = "【生存・中級】しぶとい指先"; rankColor = "#F59E0B"; }
        else { rankName = "【生存・初級】儚きコンボ"; rankColor = "#6B7280"; }
    } else {
        // 通常モードは難易度と平均スコアで評価
        if (currentDifficulty === 'easy') {
            if (avgScore >= 10000) { rankName = "【Easy・達人】入門の覇者"; rankColor = "#10B981"; }
            else if (avgScore >= 5000) { rankName = "【Easy・中級】成長するひよっこ"; rankColor = "#3B82F6"; }
            else { rankName = "【Easy・初級】ハングル一年生"; rankColor = "#6B7280"; }
        } 
        else if (currentDifficulty === 'normal') {
            if (avgScore >= 12000) { rankName = "【Normal・神業】歩く訓民正音"; rankColor = "#8B5CF6"; }
            else if (avgScore >= 6000) { rankName = "【Normal・上級】優秀な宮廷書記官"; rankColor = "#F59E0B"; }
            else { rankName = "【Normal・初級】迷える子音と母音"; rankColor = "#6B7280"; }
        } 
        else { // hard
            if (avgScore >= 15000) { rankName = "【Hard・神業】世宗大王のゴーストライター"; rankColor = "#D946EF"; }
            else if (avgScore >= 8000) { rankName = "【Hard・上級】ゲシュタルト崩壊の超越者"; rankColor = "#EF4444"; }
            else { rankName = "【Hard・初級】11,172の深淵に呑まれし者"; rankColor = "#6B7280"; }
        }
    }

    unlockTitle(rankName);

    // 追加の実績アンロック
    if (avgReaction > 0 && avgReaction < 150) unlockTitle("【S】機械の指");
    if (currentDifficulty === 'hard' && maxCombo >= 10) unlockTitle("【S+】運命を捻じ曲げる者");

    const rankBox = document.getElementById('rank-box');
    const rankTitle = document.getElementById('rank-title');
    rankBox.style.borderColor = rankColor;
    rankTitle.innerText = rankName;
    rankTitle.style.color = rankColor;
}

window.resetGame = function() {
    els.resultArea.style.display = 'none';
    els.startScreen.style.display = 'block';
    initTitleUI(); 
};