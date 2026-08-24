// mystudy.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBQjnlOfeVvWQJHDxGE9cq-jGsYF3uo0PY",
  authDomain: "mystudy-portal.firebaseapp.com",
  projectId: "mystudy-portal",
  storageBucket: "mystudy-portal.firebasestorage.app",
  messagingSenderId: "62253255474",
  appId: "1:62253255474:web:817a3cbd1ab3ea63e7e52b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ① 生徒IDチェック（未ログインならポータルへ戻す）
const urlParams = new URLSearchParams(window.location.search);
const studentId = urlParams.get('student');
const PORTAL_URL = "https://shigakusakura-pixel.github.io/mystudyroom/";

if (!studentId || studentId === 'ゲスト' || studentId.trim() === '') {
  alert("ログイン（生徒IDの確認）が必要です。ポータルへ戻ります。");
  window.location.replace(PORTAL_URL);
}

// ② 重複送信防止
const sentRecords = new Set();

// ③ 共通送信処理（画面ロック ＋ 送信完了アラート付き）
window.sendLearningRecord = async function(unitId, questionId) {
  const recordKey = unitId + "-" + questionId;
  if (sentRecords.has(recordKey)) return;

  // 画面操作ロック
  const lock = document.createElement("div");
  lock.id = "lock-screen";
  lock.innerHTML = `<div style="background:#fff;padding:16px 24px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.3);font-weight:bold;">⏳ 記録を保存中...</div>`;
  Object.assign(lock.style, {
    position: "fixed", top: "0", left: "0", width: "100vw", height: "100vh",
    background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: "99999"
  });
  document.body.appendChild(lock);

  try {
    // ページタイトルやパスから教科名を自動判定（例: 数学、理科など）
    const subjectName = document.title || "教材";

    await addDoc(collection(db, "learning_records"), {
      studentId: studentId,
      subject: subjectName,
      unit: unitId,
      questionId: questionId,
      action: "答えを確認",
      timestamp: serverTimestamp()
    });

    sentRecords.add(recordKey);
    lock.remove();
    alert(`【記録完了】問題（${questionId}）を保存しました！`);

  } catch (e) {
    console.error("保存失敗:", e);
    lock.remove();
    alert("⚠️ 保存に失敗しました。電波の良い場所で再度お試しください。");
  }
};