"use strict";

/**
 * Дані конференцій:
 * - title: назва конференції
 * - organizer: університет-організатор
 * - startDate: початок (конференція триває 3 дні)
 * - sections: масив секцій (кожна секція триває 1 день, має власну дату)
 *
 * Дати задані як YYYY-MM-DD. За потреби — просто відредагуйте значення.
 */
const conferences = [
  {
    title: "Міжнародна конференція з комп'ютерних наук",
    organizer: "КНУ імені Тараса Шевченка",
    startDate: "2025-09-10",
    sections: [
      { title: "ШІ та машинне навчання", date: "2025-09-10" },
      { title: "Кібербезпека", date: "2025-09-11" },
      { title: "Хмарні обчислення", date: "2025-09-12" },
    ],
  },
  {
    title: "Конференція з прикладної математики",
    organizer: 'Національний університет "Львівська політехніка"',
    startDate: "2025-09-08",
    sections: [
      { title: "Оптимізація", date: "2025-09-08" },
      { title: "Статистика та дані", date: "2025-09-09" },
      { title: "Моделювання систем", date: "2025-09-10" },
    ],
  },
  {
    title: "Інформаційні системи та технології",
    organizer: "Харківський національний університет",
    startDate: "2025-09-05",
    sections: [
      { title: "Інженерія ПЗ", date: "2025-09-05" },
      { title: "Бази даних", date: "2025-09-06" },
      { title: "Інтернет речей", date: "2025-09-07" },
    ],
  },
];

/* ====================== УТИЛІТИ ДАТ ======================= */
const DAY_MS = 24 * 60 * 60 * 1000;

function toLocalDateYMD(ymd) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d); // локальна північ
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function daysDiff(fromDate, toDate) {
  const a = startOfLocalDay(fromDate).getTime();
  const b = startOfLocalDay(toDate).getTime();
  return Math.round((b - a) / DAY_MS);
}

function isSameLocalDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function inRangeInclusive(day, start, end) {
  const s = startOfLocalDay(start).getTime();
  const e = startOfLocalDay(end).getTime();
  const t = startOfLocalDay(day).getTime();
  return t >= s && t <= e;
}

function fmtDate(date) {
  return date.toLocaleDateString("uk-UA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/* ====================== ЛОГІКА РОЗРАХУНКІВ ======================= */

function buildConferenceViewModel(today) {
  return conferences.map((conf) => {
    const start = toLocalDateYMD(conf.startDate);
    const end = addDays(start, 2); // 3 дні: 0,1,2

    const before = daysDiff(today, start) > 0; // майбутня
    const after = daysDiff(end, today) > 0; // завершилась
    const ongoing = inRangeInclusive(today, start, end);

    let conferenceStatus;
    let daysToStart = null;
    let daysToFinish = null;

    if (ongoing) {
      const d = daysDiff(today, end); // скільки днів до завершення
      conferenceStatus = "Триває";
      daysToFinish = d;
    } else if (!ongoing && !after && !before) {
      // today == start? (враховано вище ongoing), тож цей else майже не спрацює
      conferenceStatus = "Триває";
      daysToFinish = daysDiff(today, end);
    } else if (before) {
      conferenceStatus = "Ще не почалась";
      daysToStart = daysDiff(today, start);
    } else {
      conferenceStatus = "Завершилась";
    }

    const sections = conf.sections.map((s) => {
      const sDate = toLocalDateYMD(s.date);
      let status, days;

      if (isSameLocalDay(today, sDate)) {
        status = "Сьогодні";
        days = 0; // секція триває 1 день, завершується сьогодні
      } else if (daysDiff(today, sDate) > 0) {
        status = "Почнеться";
        days = daysDiff(today, sDate);
      } else {
        status = "Завершилась";
        days = Math.abs(daysDiff(sDate, today));
      }

      return {
        title: s.title,
        date: sDate,
        status,
        days,
      };
    });

    const sectionsToday = sections.filter((s) => s.status === "Сьогодні");

    return {
      title: conf.title,
      organizer: conf.organizer,
      start,
      end,
      conferenceStatus,
      daysToStart,
      daysToFinish,
      sections,
      sectionsToday,
      isOngoing: ongoing,
    };
  });
}

/* ====================== РЕНДЕР ======================= */

function render() {
  const output = document.getElementById("output");
  if (!output) return;

  const now = new Date();
  const today = startOfLocalDay(now);

  const vm = buildConferenceViewModel(today);

  const ongoingList = vm.filter((c) => c.isOngoing);
  const allSectionsToday = vm.flatMap((c) =>
    c.sections
      .filter((s) => s.status === "Сьогодні")
      .map((s) => ({ conf: c.title, title: s.title }))
  );

  let html = "";

  // Зведення на сьогодні
  html += `<div class="card summary-card">
    <div><strong>Сьогодні:</strong> ${fmtDate(today)}</div>
    <div>Конференції, що тривають сьогодні: <strong>${
      ongoingList.length
    }</strong>${
    ongoingList.length
      ? ": " + ongoingList.map((c) => `"${c.title}"`).join(", ")
      : ""
  }</div>
    <div>Секції сьогодні: <strong>${allSectionsToday.length}</strong>${
    allSectionsToday.length
      ? ": " +
        allSectionsToday.map((x) => `"${x.title}" (${x.conf})`).join(", ")
      : ""
  }</div>
  </div>`;

  // Деталі по конференціях
  html += `<div class="grid">`;

  vm.forEach((c) => {
    html += `
    <details class="conf-card" ${c.isOngoing ? "open" : ""}>
      <summary class="conf-summary">
        <strong>${c.title}</strong> — ${c.organizer}
      </summary>

      <div class="meta">
        <div>Початок: <strong>${fmtDate(c.start)}</strong></div>
        <div>Завершення: <strong>${fmtDate(c.end)}</strong></div>
        <div>Статус: <strong>${c.conferenceStatus}</strong>${
      c.daysToStart != null
        ? ` (початок через ${c.daysToStart} дн.)`
        : c.daysToFinish != null
        ? ` (до завершення ${c.daysToFinish} дн.)`
        : ""
    }</div>
      </div>

      <div class="sections">
        <div><strong>Секції:</strong></div>
        <ul>
          ${c.sections
            .map((s) => {
              const tail =
                s.status === "Сьогодні"
                  ? ` — <em>сьогодні (залишилось 0 дн.)</em>`
                  : s.status === "Почнеться"
                  ? ` — почнеться через ${s.days} дн.`
                  : ` — завершилась ${s.days} дн. тому`;
              return `<li>${fmtDate(s.date)} — ${s.title}${tail}</li>`;
            })
            .join("")}
        </ul>
      </div>

      <div class="sections">
        <strong>Секції сьогодні:</strong>
        ${
          c.sectionsToday.length
            ? "<ul>" +
              c.sectionsToday.map((s) => `<li>${s.title}</li>`).join("") +
              "</ul>"
            : "<div>Немає</div>"
        }
      </div>
    </details>
    `;
  });

  html += `</div>`;

  output.innerHTML = html;
}

/* ====================== ІНІЦІАЛІЗАЦІЯ ======================= */

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("showInfoBtn");
  if (btn) {
    btn.addEventListener("click", render);
  }
});
