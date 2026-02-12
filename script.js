const calendarEl = document.getElementById("calendar");
const monthSelect = document.getElementById("monthSelect");
const personSelect = document.getElementById("personSelect");

const year = 2026;
const MAX = 7;
const MIN = 5;

const names = {
  p0: "佐藤", p1: "鈴木", p2: "高橋", p3: "田中", p4: "伊藤",
  p5: "渡辺", p6: "山本", p7: "中村", p8: "小林", p9: "加藤"
};

const shifts = {};


// ===== 月セレクト生成 =====
for (let m = 1; m <= 12; m++) {
  const o = document.createElement("option");
  o.value = m;
  o.textContent = `${m}月`;
  monthSelect.appendChild(o);
}

monthSelect.addEventListener("change", renderCalendar);


// ===== 休業日判定 =====
function isClosed(month, day) {
  const d = new Date(year, month - 1, day);
  const w = d.getDay();

  if (w === 0) return true;

  if (w === 1) {
    const week = Math.ceil(day / 7);
    if (week === 1 || week === 3) return true;
  }

  return false;
}


// ===== カレンダー描画 =====
function renderCalendar() {
  calendarEl.innerHTML = "";

  const month = Number(monthSelect.value);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const weeks = ["日","月","火","水","木","金","土"];

  // 曜日ヘッダー
  weeks.forEach((w, i) => {
    const div = document.createElement("div");
    div.className = "week";
    if (i === 0) div.classList.add("sun");
    if (i === 6) div.classList.add("sat");
    div.textContent = w;
    calendarEl.appendChild(div);
  });

  // 空白
  for (let i = 0; i < firstDay; i++) {
    calendarEl.appendChild(document.createElement("div"));
  }

  // 日付ループ
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${month}-${d}`;
    const dayDiv = document.createElement("div");
    dayDiv.className = "day";

    const num = document.createElement("div");
    num.className = "day-number";
    num.textContent = d;
    dayDiv.appendChild(num);

    const closed = isClosed(month, d);
    const count = shifts[key]?.length || 0;

    if (closed) {
      dayDiv.classList.add("closed");
      const c = document.createElement("div");
      c.className = "closed-label";
      c.textContent = "休";
      dayDiv.appendChild(c);
    } else {
      if (count < MIN) dayDiv.classList.add("low");
      if (count > MAX) dayDiv.classList.add("over");
    }

    // シフト表示
    if (shifts[key]) {
      shifts[key].forEach(p => {
        const s = document.createElement("div");
        s.className = `shift ${p}`;
        s.textContent = names[p];
        dayDiv.appendChild(s);
      });
    }

    // 人数表示
    if (!closed) {
      const cnt = document.createElement("div");
      cnt.className = "count";
      cnt.textContent = `${count} / ${MAX}`;
      dayDiv.appendChild(cnt);

      if (count > 0 && count < MIN) {
        const warn = document.createElement("div");
        warn.className = "shortage";
        warn.textContent = "人手不足です！";
        dayDiv.appendChild(warn);
      }
    }

    dayDiv.addEventListener("click", () => {
      if (closed) return;
      toggleShift(key);
    });

    calendarEl.appendChild(dayDiv);
  }
}


// ===== シフト追加削除 =====
function toggleShift(key) {
  const person = personSelect.value;
  if (!person) return;

  if (!shifts[key]) shifts[key] = [];

  if (shifts[key].includes(person)) {
    shifts[key] = shifts[key].filter(p => p !== person);
    if (shifts[key].length === 0) delete shifts[key];
  } else {
    shifts[key].push(person);
  }

  renderCalendar();
}


// ===== ★ここが今回の修正ポイント★ =====
// ページを開いたとき「今月」を自動表示
const today = new Date();
const currentMonth = today.getMonth() + 1;

monthSelect.value = currentMonth;
renderCalendar();
