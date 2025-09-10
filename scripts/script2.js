/* ====================== ЗАВДАННЯ 10: КНИГИ ЗА ЖАНРАМИ ======================= */

// Список жанрів (можна змінювати/доповнювати)
const GENRES = [
  "Фантастика",
  "Детектив",
  "Роман",
  "Наука",
  "Історія",
  "Бізнес",
];

const library = GENRES.reduce((acc, g) => {
  acc[g] = [];
  return acc;
}, {});

function initBooksUI() {
  const form = document.getElementById("bookForm");
  const genreSelect = document.getElementById("genreSelect");
  const titleInput = document.getElementById("bookTitle");
  const authorInput = document.getElementById("bookAuthor");
  const lists = document.getElementById("genreLists");

  if (!form || !genreSelect || !titleInput || !authorInput || !lists) return;

  genreSelect.innerHTML = GENRES.map(
    (g) => `<option value="${g}">${g}</option>`
  ).join("");

  // Не даємо формі перезавантажувати сторінку
  form.addEventListener("submit", (e) => e.preventDefault());

  // Додавання книги
  function addBook() {
    const genre = genreSelect.value;
    const title = titleInput.value.trim();
    const author = authorInput.value.trim();

    if (!genre || !title || !author) return;

    // Перевірка на дубль (назва + автор)
    const exists = library[genre].some(
      (b) =>
        b.title.toLowerCase() === title.toLowerCase() &&
        b.author.toLowerCase() === author.toLowerCase()
    );
    if (!exists) {
      library[genre].push({ title, author });
      // Сортуємо всередині жанру за назвою
      library[genre].sort((a, b) => a.title.localeCompare(b.title, "uk"));
    }

    // Очищуємо поля та фокус назад у назву
    titleInput.value = "";
    authorInput.value = "";
    titleInput.focus();

    renderBookLists();
  }

  // Рендер списків по кожному жанру
  function renderBookLists() {
    const total = Object.values(library).reduce((n, arr) => n + arr.length, 0);

    let html = `
      <div class="card summary-card">
        <strong>Додано книг:</strong> ${total}
      </div>
      <div class="output">
    `;

    GENRES.forEach((g) => {
      const items = library[g];
      const count = items.length;

      html += `
        <details class="conf-card" ${count ? "open" : ""}>
          <summary class="conf-summary">
            ${g} <span class="badge">${count}</span>
          </summary>
          ${
            count
              ? `<ul>${items
                  .map(
                    (b) =>
                      `<li>${escapeHTML(b.title)} — <em>${escapeHTML(
                        b.author
                      )}</em></li>`
                  )
                  .join("")}</ul>`
              : `<div>Поки немає книг</div>`
          }
        </details>
      `;
    });

    html += `</div>`;
    lists.innerHTML = html;
  }

  // Натискання Enter у полі "Автор" — додати книгу
  authorInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addBook();
    }
  });

  // Початковий рендер (порожні списки)
  renderBookLists();
}

document.addEventListener("DOMContentLoaded", initBooksUI);

/* ====================== ЗАВДАННЯ 10: ТАБЛИЦЯ → СПИСОК СПИСКІВ ======================= */

function tableToListOfLists(tableEl) {
  if (!tableEl) return [];
  const rows = Array.from(tableEl.querySelectorAll("tr"));
  const result = [];

  for (const row of rows) {
    const cells = Array.from(row.querySelectorAll("th, td"));
    const values = cells.map((cell) => cell.textContent.trim());
    // пропускаємо порожні рядки
    if (values.every((v) => v === "")) continue;
    result.push(values);
  }
  return result;
}

// ЗАМІНИ ЦЮ ФУНКЦІЮ у scripts/script1.js
function renderListOfLists(arr) {
  const out = document.getElementById("listOutput");
  if (!out) return;

  const rowsHtml = arr
    .map(
      (row) =>
        `<li>
          <ul class="list-cells">
            ${row.map((v) => `<li>${escapeHTML(v)}</li>`).join("")}
          </ul>
        </li>`
    )
    .join("");

  out.innerHTML = `
    <ul class="list-rows">
      ${rowsHtml}
    </ul>
  `;
}

function initTableToListUI() {
  const btn = document.getElementById("convertTableBtn");
  const table = document.getElementById("dataTable");
  if (!btn || !table) return;

  btn.addEventListener("click", () => {
    const arr = tableToListOfLists(table);
    renderListOfLists(arr);
  });
}

document.addEventListener("DOMContentLoaded", initTableToListUI);

// Безпечний вивід тексту
function escapeHTML(s) {
  return s.replace(/[&<>"']/g, (ch) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return map[ch] || ch;
  });
}
