"use strict";

/**
 * Базовий клас: Телефон
 * поле: k (кількість функцій)
 * Метод вартість: 40 * ln(k)
 */
class Phone {
  constructor(k) {
    if (!Number.isFinite(k) || k <= 0) {
      throw new Error("k має бути додатним числом");
    }
    this.k = k;
  }

  cost() {
    // Натуральний логарифм:
    return 40 * Math.log(this.k);
  }

  type() {
    return "Телефон";
  }
}

/**
 * Нащадок: Мобільний (поле: model)
 * Зміни: збільшити вартість у 3 рази.
 */
class Mobile extends Phone {
  constructor(k, model = "") {
    super(k);
    this.model = model?.trim() ?? "";
  }

  cost() {
    return 3 * super.cost();
  }

  type() {
    return "Мобільний";
  }
}

/* ====================== УТИЛІТИ ======================= */

function formatMoney(x) {
  if (!Number.isFinite(x)) return "—";
  return x.toFixed(2);
}

function byId(id) {
  return document.getElementById(id);
}

function readForm() {
  const type = /** @type {HTMLInputElement} */ (
    document.querySelector('input[name="type"]:checked')
  )?.value;

  const kVal = Number(byId("k").value);
  const model = byId("model").value.trim();

  return { type, kVal, model };
}

/* ====================== РЕНДЕР ======================= */

const items = [];

function renderResult(obj) {
  const result = byId("result");
  if (!result) return;

  const isMobile = obj instanceof Mobile;
  const extra =
    isMobile && obj.model
      ? `<div>Модель: <strong>${obj.model}</strong></div>`
      : "";

  const k = obj.k;
  const baseCost = 40 * Math.log(k);
  const finalCost = obj.cost();

  result.innerHTML = `
    <div class="card summary-card">
      <div><strong>${obj.type()}</strong></div>
      <div>k: <strong>${k}</strong></div>
      ${extra}
      <div style="margin-top:8px;">
        Формула базової вартості: <code>40 · ln(k)</code> = <strong>${formatMoney(
          baseCost
        )}</strong>
        ${
          isMobile
            ? `<div>Для мобільного: ×3 → <strong>${formatMoney(
                finalCost
              )}</strong></div>`
            : `<div>Підсумкова вартість: <strong>${formatMoney(
                finalCost
              )}</strong></div>`
        }
      </div>
    </div>
  `;
}

function renderList() {
  const body = byId("listBody");
  if (!body) return;

  if (!items.length) {
    body.innerHTML = `<tr><td colspan="5" style="padding:12px; color:var(--muted);">Список порожній</td></tr>`;
    return;
  }

  body.innerHTML = items
    .map((o, i) => {
      const modelCell = o instanceof Mobile ? o.model || "—" : "—";
      return `
        <tr style="border-top:1px solid var(--border);">
          <td style="padding:10px;">${i + 1}</td>
          <td style="padding:10px;">${o.type()}</td>
          <td style="padding:10px;">${o.k}</td>
          <td style="padding:10px;">${modelCell}</td>
          <td style="padding:10px;">${formatMoney(o.cost())}</td>
        </tr>
      `;
    })
    .join("");
}

/* ====================== ЛОГІКА ФОРМИ ======================= */

function toggleModelRow() {
  const type = /** @type {HTMLInputElement} */ (
    document.querySelector('input[name="type"]:checked')
  )?.value;
  const modelRow = byId("modelRow");
  if (modelRow) {
    modelRow.style.display = type === "mobile" ? "" : "none";
  }
}

function handleCalc() {
  const { type, kVal, model } = readForm();

  try {
    let obj;
    if (type === "mobile") {
      obj = new Mobile(kVal, model);
    } else {
      obj = new Phone(kVal);
    }
    renderResult(obj);
  } catch (e) {
    byId("result").innerHTML = `<div class="card" style="color:#b91c1c;">
      Помилка: ${(e && e.message) || e}
    </div>`;
  }
}

function handleAdd() {
  const { type, kVal, model } = readForm();

  try {
    let obj;
    if (type === "mobile") {
      obj = new Mobile(kVal, model);
    } else {
      obj = new Phone(kVal);
    }
    items.push(obj);
    renderList();
    renderResult(obj);
  } catch (e) {
    byId("result").innerHTML = `<div class="card" style="color:#b91c1c;">
      Помилка: ${(e && e.message) || e}
    </div>`;
  }
}

function handleClear() {
  items.length = 0;
  renderList();
  byId("result").innerHTML = "";
}

/* ====================== ІНІЦІАЛІЗАЦІЯ ======================= */

document.addEventListener("DOMContentLoaded", () => {
  // початковий стан форми
  toggleModelRow();

  // обробники
  document.querySelectorAll('input[name="type"]').forEach((r) => {
    r.addEventListener("change", toggleModelRow);
  });

  byId("calcBtn").addEventListener("click", handleCalc);
  byId("addBtn").addEventListener("click", handleAdd);
  byId("clearBtn").addEventListener("click", handleClear);

  // демо-початок: кілька рядків у список
  items.push(new Phone(5));
  items.push(new Mobile(10, "Galaxy S24"));
  items.push(new Mobile(20, "iPhone 15"));
  renderList();
});
