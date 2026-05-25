const i18nDict = {
    ja: {
        desc: "ハングル1文字の反射タイピングゲーム<br>構築速度と正確性を極めよ",
        loading: "CSVデータを読み込み中...",
        loading_fail: "⚠️ CSV読み込み失敗",
        btn_collection: "コレクション＆図鑑を見る",
        kbd_notice: "※英語(QWERTY)キーボードのままで入力可能です。",
        mode_normal: "通常 (問題数指定)",
        mode_survival: "サバイバル (エンドレス)",
        q_count: "問題数:",
        q_10: "10問",
        q_20: "20問",
        q_30: "30問",
        easy_title: "Easy: スタンダード",
        easy_desc: "超頻出文字オンリー",
        normal_title: "Normal: チャレンジ",
        normal_desc: "低頻度文字もランダムに出題",
        hard_title: "Hard: リストガチャ",
        hard_desc: "完全ランダム - 無慈悲",
        col_title: "コレクション",
        tab_titles: "獲得称号",
        tab_hangul: "ハングル図鑑",
        enc_rate: "全体遭遇率: ",
        btn_back: "タイトルへ戻る",
        btn_reset_data: "⚠️ セーブデータを全て消去する",
        btn_quit: "中断",
        stat_reaction: "反応時間",
        stat_typing: "構築時間",
        stat_score: "スコア",
        rank_label: "最終評価ランク",
        avg_reaction: "平均 反応時間",
        avg_typing: "平均 構築時間",
        placeholder: "入力",
        share_btn: "𝕏 で共有する",
        share_text: "Hangul Reflexで {score} 点を記録し、【{rank}】ランクを達成しました！"
    },
    en: {
        desc: "Hangul single-character reflex typing game.<br>Master your typing speed and accuracy.",
        loading: "Loading CSV data...",
        loading_fail: "⚠️ CSV load failed",
        btn_collection: "View Collection & Dictionary",
        kbd_notice: "* You can type using a standard English (QWERTY) keyboard.",
        mode_normal: "Normal (Fixed count)",
        mode_survival: "Survival (Endless)",
        q_count: "Questions:",
        q_10: "10",
        q_20: "20",
        q_30: "30",
        easy_title: "Easy: Standard",
        easy_desc: "High frequency characters only",
        normal_title: "Normal: Challenge",
        normal_desc: "Includes low frequency characters",
        hard_title: "Hard: Gacha",
        hard_desc: "Completely random - Merciless",
        col_title: "Collection",
        tab_titles: "Titles",
        tab_hangul: "Dictionary",
        enc_rate: "Encounter Rate: ",
        btn_back: "Back to Title",
        btn_reset_data: "⚠️ Erase all save data",
        btn_quit: "Quit",
        stat_reaction: "Reaction Time",
        stat_typing: "Typing Time",
        stat_score: "Score",
        rank_label: "Final Rank",
        avg_reaction: "Avg Reaction",
        avg_typing: "Avg Typing",
        placeholder: "Type here"
    },
    ko: {
        desc: "한글 1글자 반사 타이핑 게임.<br>타이핑 속도와 정확성을 극한으로 끌어올리세요.",
        loading: "CSV 데이터 불러오는 중...",
        loading_fail: "⚠️ CSV 불러오기 실패",
        btn_collection: "컬렉션 및 도감 보기",
        kbd_notice: "※ 영어(QWERTY) 키보드 그대로 입력 가능합니다.",
        mode_normal: "일반 (문제 수 지정)",
        mode_survival: "서바이벌 (무한)",
        q_count: "문제 수:",
        q_10: "10문제",
        q_20: "20문제",
        q_30: "30문제",
        easy_title: "쉬움: 스탠다드",
        easy_desc: "초고빈도 문자만 출제",
        normal_title: "보통: 챌린지",
        normal_desc: "저빈도 문자도 무작위 출제",
        hard_title: "어려움: 가챠",
        hard_desc: "완전 무작위 - 자비 없음",
        col_title: "컬렉션",
        tab_titles: "획득 칭호",
        tab_hangul: "한글 도감",
        enc_rate: "전체 조우율: ",
        btn_back: "타이틀로 돌아가기",
        btn_reset_data: "⚠️ 모든 세이브 데이터 지우기",
        btn_quit: "중단",
        stat_reaction: "반응 시간",
        stat_typing: "입력 시간",
        stat_score: "스코어",
        rank_label: "최종 평가 랭크",
        avg_reaction: "평균 반응 시간",
        avg_typing: "평균 입력 시간",
        placeholder: "입력",
        confirm_reset: "정말로 모든 세이브 데이터를 지우시겠습니까?\n※ 이 작업은 취소할 수 없습니다.",
        alert_reset: "세이브 데이터를 지웠습니다. 페이지를 새로고침합니다.",
        start_msg: "시작! (START)",
        share_btn: "𝕏 공유하기",
        share_text: "Hangul Reflex에서 {score}점을 기록하고 【{rank}】 랭크를 달성했습니다!"
    }
};

let currentLang = localStorage.getItem('hangulReflexLang') || 'ja';

function setLanguage(lang) {
    if (!i18nDict[lang]) return;
    currentLang = lang;
    localStorage.setItem('hangulReflexLang', lang);
    applyTranslations();
    
    // Update active button state
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

function t(key) {
    return i18nDict[currentLang][key] || key;
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (el.tagName === 'INPUT' && el.type === 'text') {
            el.placeholder = t(key);
        } else {
            el.innerHTML = t(key);
        }
    });

    // Handle dynamically populated elements or text with nested spans manually if needed.
    // E.g., btn-collection-top has a nested <span class="btn-new-badge">NEW</span>
    if(typeof window.updateTopNotification === 'function') {
        window.updateTopNotification();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
});
