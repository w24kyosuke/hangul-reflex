let hangulDataEasy = [];
let hangulDataNormal = [];
let hangulDataHard = [];
let hangulFreqMap = {}; 
let totalWeightEasy = 0;

let tierTotals = { 'C': 0, 'B': 0, 'A': 0, 'S': 0, 'SS': 0 };

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
let survivalTimeRemaining = 10.0;
let lastFrameTime = 0;
let timerAnimationFrame = null;
let countdownTimeout = null;

const TITLE_RULES = [
    { id: "ne1", cat: "通常 - Easy", name: "맞춤법 파괴자 (正書法破壊者)", cond: "プレイする", thresh: 0, mode: "normal", diff: "easy" },
    { id: "ne2", cat: "通常 - Easy", name: "집현전 학동 (集賢殿の学童)", cond: "スコア 4,000 以上", thresh: 4000, mode: "normal", diff: "easy" },
    { id: "ne3", cat: "通常 - Easy", name: "띄어쓰기 감별사 (分かち書き鑑定士)", cond: "スコア 7,000 以上", thresh: 7000, mode: "normal", diff: "easy" },
    { id: "ne4", cat: "通常 - Easy", name: "두벌식 타자기의 달인 (2ボル式タイプライターの達人)", cond: "スコア 10,000 以上", thresh: 10000, mode: "normal", diff: "easy" },
    { id: "ne5", cat: "通常 - Easy", name: "세종대왕의 숨겨진 오른팔 (世宗大王の隠された右腕)", cond: "スコア 13,000 以上", thresh: 13000, mode: "normal", diff: "easy" },
    { id: "nn1", cat: "通常 - Normal", name: "오타와 사이시옷의 늪 (誤字と사이시옷の沼)", cond: "プレイする", thresh: 0, mode: "normal", diff: "normal" },
    { id: "nn2", cat: "通常 - Normal", name: "주시경 선생의 수제자 (周時経先生の高弟)", cond: "スコア 5,000 以上", thresh: 5000, mode: "normal", diff: "normal" },
    { id: "nn3", cat: "通常 - Normal", name: "국립국어원 명예 연구원 (国立国語院の名誉研究員)", cond: "スコア 8,000 以上", thresh: 8000, mode: "normal", diff: "normal" },
    { id: "nn4", cat: "通常 - Normal", name: "한글 맞춤법 제1항의 화신 (ハングル正書法第1項の化身)", cond: "スコア 12,000 以上", thresh: 12000, mode: "normal", diff: "normal" },
    { id: "nn5", cat: "通常 - Normal", name: "훈민정음 해례본의 진정한 저자 (訓民正音解例本の真の著者)", cond: "スコア 16,000 以上", thresh: 16000, mode: "normal", diff: "normal" },
    { id: "nh1", cat: "通常 - Hard", name: "11,172개의 게슈탈트 붕괴 (11,172個のゲシュタルト崩壊)", cond: "プレイする", thresh: 0, mode: "normal", diff: "hard" },
    { id: "nh2", cat: "通常 - Hard", name: "복잡한 겹받침의 지배자 (複雑な二重パッチムの支配者)", cond: "スコア 6,000 以上", thresh: 6000, mode: "normal", diff: "hard" },
    { id: "nh3", cat: "通常 - Hard", name: "잃어버린 아래아(ㆍ)를 찾는 자 (失われた아래아[ㆍ]を探求する者)", cond: "スコア 10,000 以上", thresh: 10000, mode: "normal", diff: "hard" },
    { id: "nh4", cat: "通常 - Hard", name: "팔만대장경 디지털 복원가 (八万大蔵経のデジタル復元家)", cond: "スコア 15,000 以上", thresh: 15000, mode: "normal", diff: "hard" },
    { id: "nh5", cat: "通常 - Hard", name: "우주적 훈민정음 창제자 (宇宙的訓民正音の創製者)", cond: "スコア 20,000 以上", thresh: 20000, mode: "normal", diff: "hard" },
    { id: "se1", cat: "サバイバル - Easy", name: "획순을 잊은 손가락 (画順を忘れた指)", cond: "プレイする", thresh: 0, mode: "survival", diff: "easy" },
    { id: "se2", cat: "サバイバル - Easy", name: "서당의 지치지 않는 붓 (書堂の疲れない筆)", cond: "WAVE 15 到達", thresh: 15, mode: "survival", diff: "easy" },
    { id: "se3", cat: "サバイバル - Easy", name: "모음조화의 영원한 굴레 (母音調和の永遠の羈絆)", cond: "WAVE 30 到達", thresh: 30, mode: "survival", diff: "easy" },
    { id: "se4", cat: "サバイバル - Easy", name: "조선 왕조 실록 자동 기록기 (朝鮮王朝実録の自動記録機)", cond: "WAVE 60 到達", thresh: 60, mode: "survival", diff: "easy" },
    { id: "se5", cat: "サバイバル - Easy", name: "영원히 돌아가는 금속 활자 (永遠に回り続ける金属活字)", cond: "WAVE 100 到達", thresh: 100, mode: "survival", diff: "easy" },
    { id: "sn1", cat: "サバイバル - Normal", name: "형태소 단위의 붕괴 (形態素単位の崩壊)", cond: "プレイする", thresh: 0, mode: "survival", diff: "normal" },
    { id: "sn2", cat: "サバイバル - Normal", name: "집현전 철야 작업반장 (集賢殿の徹夜作業班長)", cond: "WAVE 10 到達", thresh: 10, mode: "survival", diff: "normal" },
    { id: "sn3", cat: "サバイバル - Normal", name: "표준국어대사전 무한 정독자 (標準国語大辞典の無限精読者)", cond: "WAVE 25 到達", thresh: 25, mode: "survival", diff: "normal" },
    { id: "sn4", cat: "サバイバル - Normal", name: "자음과 모음의 무한동력 (子音と母音の無限動力)", cond: "WAVE 50 到達", thresh: 50, mode: "survival", diff: "normal" },
    { id: "sn5", cat: "サバイバル - Normal", name: "언어의 한계를 초월한 타건 (言語の限界を超越した打鍵)", cond: "WAVE 80 到達", thresh: 80, mode: "survival", diff: "normal" },
    { id: "sh1", cat: "サバイバル - Hard", name: "외계어 해독 실패 (宇宙語の解読失敗)", cond: "プレイする", thresh: 0, mode: "survival", diff: "hard" },
    { id: "sh2", cat: "サバイバル - Hard", name: "옛한글 망령들의 인도자 (古ハングルの亡霊たちの導き手)", cond: "WAVE 5 到達", thresh: 5, mode: "survival", diff: "hard" },
    { id: "sh3", cat: "サバイバル - Hard", name: "11,172번의 수라도 (11,172回の修羅道)", cond: "WAVE 15 到達", thresh: 15, mode: "survival", diff: "hard" },
    { id: "sh4", cat: "サバイバル - Hard", name: "한글 빅뱅의 한가운데 (ハングル・ビッグバンの中心)", cond: "WAVE 30 到達", thresh: 30, mode: "survival", diff: "hard" },
    { id: "sh5", cat: "サバイバル - Hard", name: "다중우주 표준어 제정 위원회 (多元宇宙標準語制定委員会)", cond: "WAVE 50 到達", thresh: 50, mode: "survival", diff: "hard" },
    { id: "g1", cat: "特別実績", name: "무호흡 연타 신드롬 (無呼吸連打シンドローム)", cond: "MAX 50 COMBO 達成" },
    { id: "g2", cat: "特別実績", name: "기계와의 융합 (機械との融合)", cond: "平均反応時間 150ms 未満でクリア" },
    { id: "g3", cat: "特別実績", name: "운명을 비트는 손가락 (運命を捻じ曲げる指)", cond: "Hardモードで MAX 10 COMBO" },
    { id: "g4", cat: "特別実績", name: "기적의 확률변동 (奇跡の確率変動)", cond: "Hardモードで PERFECT 判定" }
];

let unlockedTitles = JSON.parse(localStorage.getItem('hangulUnlockedTitles')) || [];
let encounteredHangul = new Set(JSON.parse(localStorage.getItem('hangulEncountered')) || []);
let unseenTitles = new Set(JSON.parse(localStorage.getItem('hangulUnseenTitles')) || []);
let unseenHangul = new Set(JSON.parse(localStorage.getItem('hangulUnseenHangul')) || []);

const TOTAL_HANGUL_COUNT = 11172;

const els = {
    startScreen: document.getElementById('start-screen'),
    gameArea: document.getElementById('game-area'),
    resultArea: document.getElementById('result-area'),
    collectionArea: document.getElementById('collection-area'),
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
    qCountGroup: document.getElementById('q-count-group'),
    achievementAlert: document.getElementById('achievement-alert'),
    newAchievementName: document.getElementById('new-achievement-name'),
    survivalResultWave: document.getElementById('survival-result-wave'),
    maxComboResult: document.getElementById('max-combo-result'),
    btnCollectionTop: document.getElementById('btn-collection-top'),
    countdownOverlay: document.getElementById('countdown-overlay'),
    countdownDisplay: document.getElementById('countdown-display')
};

function parseCSV(text) {
    hangulDataEasy = []; hangulDataNormal = []; hangulDataHard = [];
    tierTotals = { 'C': 0, 'B': 0, 'A': 0, 'S': 0, 'SS': 0 };
    
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
                    hangulFreqMap[char] = freq; 
                    if (freq >= 10000) hangulDataNormal.push(item);
                    hangulDataEasy.push({ ...item, weight: freq });

                    if (freq >= 100000000) tierTotals['C']++;
                    else if (freq >= 10000000) tierTotals['B']++;
                    else if (freq >= 1000000) tierTotals['A']++;
                    else if (freq >= 10000) tierTotals['S']++;
                    else tierTotals['SS']++;
                }
            }
        }
    }
    totalWeightEasy = hangulDataEasy.reduce((sum, item) => sum + item.weight, 0);
    updateTopNotification();
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

function updateTopNotification() {
    if (unseenTitles.size > 0 || unseenHangul.size > 0) {
        els.btnCollectionTop.innerHTML = `コレクション＆図鑑を見る <span class="btn-new-badge">NEW</span>`;
    } else {
        els.btnCollectionTop.innerHTML = `コレクション＆図鑑を見る`;
    }
}

window.setGameMode = function(mode) {
    currentMode = mode;
    document.getElementById('btn-mode-normal').classList.remove('active');
    document.getElementById('btn-mode-survival').classList.remove('active');
    document.getElementById(`btn-mode-${mode}`).classList.add('active');
    
    els.qCountGroup.style.display = (mode === 'survival') ? 'none' : 'flex';
};

window.showCollection = function() {
    els.startScreen.style.display = 'none';
    els.collectionArea.style.display = 'block';
    
    const titlesContainer = document.getElementById('titles-container');
    titlesContainer.innerHTML = '';
    
    const categories = [...new Set(TITLE_RULES.map(r => r.cat))];
    categories.forEach(cat => {
        const catHeader = document.createElement('div');
        catHeader.className = 'category-header';
        catHeader.innerText = cat;
        titlesContainer.appendChild(catHeader);
        
        const ul = document.createElement('ul');
        ul.className = 'titles-list';
        
        TITLE_RULES.filter(r => r.cat === cat).forEach(t => {
            const li = document.createElement('li');
            const isUnlocked = unlockedTitles.includes(t.id);
            const isNew = unseenTitles.has(t.id);
            
            if (isUnlocked) {
                li.innerHTML = `<span class="title-name">${t.name}</span>${isNew ? '<span class="new-badge">NEW</span>' : ''}<span class="title-cond">${t.cond}</span>`;
                li.classList.add('unlocked');
            } else {
                li.innerHTML = `<span class="title-name locked">？？？</span><span class="title-cond">${t.cond}</span>`;
                li.classList.add('locked');
            }
            ul.appendChild(li);
        });
        titlesContainer.appendChild(ul);
    });

    document.getElementById('hangul-encounter-count').innerText = encounteredHangul.size;
    const globalRate = (encounteredHangul.size / TOTAL_HANGUL_COUNT) * 100;
    document.getElementById('hangul-encounter-rate').innerText = globalRate.toFixed(2) + '%';
    
    const hContainer = document.getElementById('hangul-container');
    hContainer.innerHTML = '';
    
    const tiers = [
        { id: 'C', label: "【C】 1億回以上 (超頻出)", min: 100000000, max: Infinity },
        { id: 'B', label: "【B】 1000万回以上 (頻出)", min: 10000000, max: 100000000 },
        { id: 'A', label: "【A】 100万回以上 (一般)", min: 1000000, max: 10000000 },
        { id: 'S', label: "【S】 1万回以上 (稀)", min: 10000, max: 1000000 },
        { id: 'SS', label: "【SS】 1万回未満 (極レア)", min: 0, max: 10000 }
    ];

    const sortedEncountered = Array.from(encounteredHangul).sort((a, b) => {
        return (hangulFreqMap[b] || 0) - (hangulFreqMap[a] || 0);
    });

    tiers.forEach((tier) => {
        const charsInTier = sortedEncountered.filter(c => {
            const f = hangulFreqMap[c] || 0;
            return f >= tier.min && f < tier.max;
        });

        const totalInTier = tierTotals[tier.id] || 1; 
        const encounterCount = charsInTier.length;
        const tierRate = ((encounterCount / totalInTier) * 100).toFixed(2);

        const headerDiv = document.createElement('div');
        headerDiv.className = 'tier-header-info';
        headerDiv.innerHTML = `
            <span class="tier-title">${tier.label}</span>
            <span class="tier-stats">${encounterCount} / ${totalInTier} (${tierRate}%)</span>
        `;
        hContainer.appendChild(headerDiv);

        const progressDiv = document.createElement('div');
        progressDiv.className = 'tier-progress-bar';
        progressDiv.innerHTML = `<div class="tier-progress-fill" style="width: ${tierRate}%;"></div>`;
        hContainer.appendChild(progressDiv);

        if (encounterCount > 0) {
            const grid = document.createElement('div');
            grid.className = 'hangul-grid';
            
            charsInTier.forEach(char => {
                const isNew = unseenHangul.has(char);
                const div = document.createElement('div');
                div.innerHTML = `${char}${isNew ? '<div class="new-dot"></div>' : ''}`;
                div.onclick = () => showHangulDetail(char);
                grid.appendChild(div);
            });
            hContainer.appendChild(grid);
        }
    });

    unseenTitles.clear();
    unseenHangul.clear();
    localStorage.setItem('hangulUnseenTitles', JSON.stringify([]));
    localStorage.setItem('hangulUnseenHangul', JSON.stringify([]));
    updateTopNotification();
};

window.showHangulDetail = function(char) {
    const freq = hangulFreqMap[char] || 0;
    const detailBox = document.getElementById('hangul-detail');
    detailBox.innerHTML = `
        <strong>${char}</strong> 
        <div style="font-size: 1rem; color: var(--text-muted); margin-bottom: 1rem;">総出現頻度</div>
        <div style="font-size: 1.8rem; color: white;">${freq.toLocaleString()} 回</div>
        <button onclick="closeHangulDetail()">閉じる</button>
    `;
    document.getElementById('modal-overlay').style.display = 'flex';
}

window.closeHangulDetail = function() {
    document.getElementById('modal-overlay').style.display = 'none';
}

window.hideCollection = function() {
    els.collectionArea.style.display = 'none';
    closeHangulDetail();
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

window.resetAllData = function() {
    if(confirm("本当に全てのセーブデータを消去しますか？\n※この操作は取り消せません。")) {
        localStorage.clear();
        alert("セーブデータを消去しました。ページを再読み込みします。");
        location.reload();
    }
};

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

    if (!encounteredHangul.has(currentTarget)) {
        encounteredHangul.add(currentTarget);
        unseenHangul.add(currentTarget);
        localStorage.setItem('hangulEncountered', JSON.stringify(Array.from(encounteredHangul)));
        localStorage.setItem('hangulUnseenHangul', JSON.stringify(Array.from(unseenHangul)));
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
    let judgment = "LATE";
    let judgmentClass = "";
    
    if (totalTime <= 450) { judgment = "PERFECT"; judgmentClass = 'judgment-perfect'; currentCombo++; } 
    else if (totalTime <= 750) { judgment = "GREAT"; judgmentClass = 'judgment-great'; currentCombo++; } 
    else if (totalTime <= 1200) { judgment = "GOOD"; judgmentClass = 'judgment-good'; currentCombo++; } 
    else if (totalTime <= 2000) { judgment = "OK"; judgmentClass = 'judgment-ok'; currentCombo = 0; } 
    else { judgment = "LATE"; judgmentClass = 'judgment-late'; currentCombo = 0; }

    if (currentCombo > maxCombo) maxCombo = currentCombo;

    // --- 確実にアニメーションを発火させる「クローン手法」 ---
    const oldJudgment = els.judgmentDisplay;
    const newJudgment = oldJudgment.cloneNode(true); // 要素を複製
    
    // クラスとテキストを設定
    newJudgment.className = `judgment-text ${judgmentClass} show`;
    newJudgment.innerText = judgment;
    
    // 古い要素を新しい要素に置き換える
    oldJudgment.parentNode.replaceChild(newJudgment, oldJudgment);
    
    // elsオブジェクトの参照を新しい要素に更新しておく
    els.judgmentDisplay = newJudgment;

    // --- コンボの表示処理も同様にクローン手法で ---
    if (currentCombo >= 2) {
        const oldCombo = els.comboDisplay;
        const newCombo = oldCombo.cloneNode(true);
        newCombo.style.display = 'block';
        newCombo.innerText = `${currentCombo} COMBO!`;
        newCombo.style.animation = 'pulse 0.3s forwards'; // forwards を追加
        oldCombo.parentNode.replaceChild(newCombo, oldCombo);
        els.comboDisplay = newCombo;
    } else {
        els.comboDisplay.style.display = 'none';
    }
    
    return judgment;
}
function updateSurvivalTimer(timestamp) {
    if (!isPlaying || currentMode !== 'survival')return;
    // 最初のフレームの時刻を記録し、次のフレームから計算開始
    if (lastFrameTime === 0) {
        lastFrameTime = timestamp;
        timerAnimationFrame = requestAnimationFrame(updateSurvivalTimer);
        return;
    }

    const dt = (timestamp - lastFrameTime) / 1000;
    lastFrameTime = timestamp;
    survivalTimeRemaining -= dt;
    
    const percentage = Math.max(0, (survivalTimeRemaining / 10.0) * 100);
    els.timerBar.style.width = percentage + '%';
    
    if (survivalTimeRemaining <= 0) {
        isPlaying = false;
        timerAnimationFrame = null;
        showResult();
    } else {
        timerAnimationFrame = requestAnimationFrame(updateSurvivalTimer);
    }
}

window.startGame = function(difficulty) {
    // 以前のタイマーが動いていれば完全に停止させる
    if (timerAnimationFrame) {
        cancelAnimationFrame(timerAnimationFrame);
        timerAnimationFrame = null;
    }

    isPlaying = true; 
    currentDifficulty = difficulty;
    
    if (currentMode === 'normal') {
        totalQuestions = parseInt(document.getElementById('q-count').value, 10);
        els.timerContainer.style.display = 'none';
    } else {
        totalQuestions = Infinity;
        survivalTimeRemaining = 10.0;
        lastFrameTime = 0;
        els.timerContainer.style.display = 'block';
    }

    questionCount = 0; totalGameScore = 0; currentCombo = 0; maxCombo = 0;
    reactionTimes = []; typingTimes = [];
    els.achievementAlert.style.display = 'none';

    // カウントダウン中に前回の表示が残らないようリセット
    els.targetDisplay.innerText = "";
    els.progressText.innerText = "";
    els.freqDisplay.innerText = "";
    els.judgmentDisplay.innerText = "";
    els.judgmentDisplay.className = "judgment-text"; 
    els.comboDisplay.style.display = 'none';
    els.inputField.value = "";

    
    // 判定テキストの初期化（クラスをリセット）
    els.judgmentDisplay.className = "judgment-text";
    els.judgmentDisplay.innerText = "";
    
    // --- スコア等の表示を確実に初期化 ---
    els.currentReaction.innerText = '--- ms';
    els.currentTyping.innerText = '--- ms';
    els.currentScore.innerText = '0';
    
    els.diffBadge.innerText = difficulty.toUpperCase();
    if(difficulty === 'easy') els.diffBadge.style.backgroundColor = 'var(--easy)';
    if(difficulty === 'normal') els.diffBadge.style.backgroundColor = 'var(--normal)';
    if(difficulty === 'hard') els.diffBadge.style.backgroundColor = 'var(--hard)';

    els.startScreen.style.display = 'none';
    els.resultArea.style.display = 'none';
    els.gameArea.style.display = 'block';
    
    startCountdown();
};

function startCountdown() {
    els.countdownOverlay.style.display = 'flex';
    let count = 3;
    
    function tick() {
        if (count > 0) {
            els.countdownDisplay.innerText = count;
            els.countdownDisplay.style.animation = 'none';
            void els.countdownDisplay.offsetWidth; // リフロー強制
            els.countdownDisplay.style.animation = 'countdownPop 1s ease-out forwards';
            count--;
            countdownTimeout = setTimeout(tick, 1000);
        } else {
            els.countdownDisplay.innerText = "시작! (START)";
            els.countdownDisplay.style.animation = 'none';
            void els.countdownDisplay.offsetWidth;
            els.countdownDisplay.style.animation = 'countdownPop 1s ease-out forwards';
            
            countdownTimeout = setTimeout(() => {
                els.countdownOverlay.style.display = 'none';
                if (isPlaying) {
                    nextQuestion();
                }
            }, 1000);
        }
    }
    tick();
}


function nextQuestion() {
    if (!isPlaying) return; 
    if (questionCount >= totalQuestions) { showResult(); return; }
    
    questionCount++;
    els.progressText.innerText = currentMode === 'normal' ? `${questionCount} / ${totalQuestions}` : `WAVE: ${questionCount}`;
    // ※自動フェードアウトさせるため、ここでは表示を消さない！
    
    // サバイバルモードのタイマー始動（最初の問題が表示されるタイミングで開始）
    if (currentMode === 'survival' && !timerAnimationFrame) {
        lastFrameTime = 0; // updateSurvivalTimer内で最初のtimestampを取得させる
        timerAnimationFrame = requestAnimationFrame(updateSurvivalTimer);
    }

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
    if (timerAnimationFrame) {
        cancelAnimationFrame(timerAnimationFrame);
        timerAnimationFrame = null;
    }
    if (countdownTimeout) clearTimeout(countdownTimeout);
    
    els.countdownOverlay.style.display = 'none';
    els.gameArea.style.display = 'none';
    els.startScreen.style.display = 'block';
    els.inputField.value = ''; els.inputField.disabled = false;
    els.currentReaction.innerText = '--- ms'; els.currentTyping.innerText = '--- ms';
    els.freqDisplay.innerText = ''; els.targetDisplay.style.color = 'var(--text-main)';
    els.judgmentDisplay.className = "judgment-text"; // 非表示
    updateTopNotification();
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

        els.currentTyping.innerText = `${typingTime.toFixed(0)} ms`;
        
        const judgment = displayJudgment(reactionTime, typingTime);
        const turnScore = calculateScore(reactionTime, typingTime, currentFreq, currentCombo);
        totalGameScore += turnScore;
        els.currentScore.innerText = totalGameScore.toLocaleString();
        
        if (currentMode === 'survival') {
            const recovery = Math.max(0.2, 1.5 - (questionCount * 0.015));
            survivalTimeRemaining = Math.min(10.0, survivalTimeRemaining + recovery);
        }

        els.targetDisplay.style.color = 'var(--success)';
        els.inputField.disabled = true;

        if (currentDifficulty === 'hard' && judgment === 'PERFECT') {
            unlockTitle("g4");
        }

        setTimeout(() => {
            if (!isPlaying) return; 
            els.targetDisplay.style.color = 'var(--text-main)';
            nextQuestion();
        }, 300); 
    }
});

function unlockTitle(titleId) {
    if (!unlockedTitles.includes(titleId)) {
        unlockedTitles.push(titleId);
        unseenTitles.add(titleId);
        
        localStorage.setItem('hangulUnlockedTitles', JSON.stringify(unlockedTitles));
        localStorage.setItem('hangulUnseenTitles', JSON.stringify(Array.from(unseenTitles)));
        
        const trule = TITLE_RULES.find(r => r.id === titleId);
        if(trule) {
            els.newAchievementName.innerText = trule.name;
            els.achievementAlert.style.display = 'block';
            els.achievementAlert.style.animation = 'none';
            void els.achievementAlert.offsetWidth;
            els.achievementAlert.style.animation = 'slideDown 0.5s ease-out';
        }
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

    const eligibleRules = TITLE_RULES.filter(r => r.mode === currentMode && r.diff === currentDifficulty);
    let topRule = null; 

    eligibleRules.forEach(r => {
        if ((currentMode === 'normal' && avgScore >= r.thresh) || 
            (currentMode === 'survival' && questionCount >= r.thresh)) {
            unlockTitle(r.id);
            topRule = r; 
        }
    });

    if (maxCombo >= 50) unlockTitle("g1");
    if (avgReaction > 0 && avgReaction < 150 && count >= 10) unlockTitle("g2");
    if (currentDifficulty === 'hard' && maxCombo >= 10) unlockTitle("g3");

    let rankColor = "#6B7280";
    if(topRule) {
        if(topRule.id.endsWith("5")) rankColor = "#D946EF";
        else if(topRule.id.endsWith("4")) rankColor = "#EF4444";
        else if(topRule.id.endsWith("3")) rankColor = "#F59E0B";
        else if(topRule.id.endsWith("2")) rankColor = "#10B981";
        else rankColor = "#3B82F6";
    }

    const rankBox = document.getElementById('rank-box');
    const rankTitle = document.getElementById('rank-title');
    rankBox.style.borderColor = rankColor;
    rankTitle.innerText = topRule ? topRule.name : "単なるキーボードの傍観者";
    rankTitle.style.color = rankColor;
}

window.resetGame = function() {
    els.resultArea.style.display = 'none';
    els.startScreen.style.display = 'block';
    updateTopNotification();
};