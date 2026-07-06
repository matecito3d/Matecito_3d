document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Menú mobile ----------
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open ? "true" : "false");
});

const productsDropdownWrap = document.getElementById("productsDropdownWrap");
const productsToggle = document.getElementById("productsToggle");
// En mobile, tocar "Productos" despliega el submenú en vez de navegar directo
productsToggle.addEventListener("click", (e) => {
  if (window.innerWidth <= 760) {
    e.preventDefault();
    productsDropdownWrap.classList.toggle("open");
  }
});

// ---------- Helpers ----------
function formatPrice(value) {
  if (value === "" || value === null || value === undefined) return "Consultar";
  const n = Number(value);
  if (Number.isNaN(n)) return "Consultar";
  return "$ " + n.toLocaleString("es-AR");
}

function mediaMarkup(product) {
  if (product.thumbnail) {
    return `<img src="${product.thumbnail}" alt="${escapeHtml(product.name)}" loading="lazy" />`;
  }
  return `<span class="placeholder">Sin imagen</span>`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function productCard(product) {
  const link = product.link && product.link !== "#" ? product.link : "#";
  return `
    <article class="card">
      <a href="${link}" class="card-media" target="${link !== "#" ? "_blank" : "_self"}" rel="noopener">
        ${product.novedad ? '<span class="badge-new">Nuevo</span>' : ""}
        ${mediaMarkup(product)}
      </a>
      <div class="card-body">
        <div class="card-cat">${escapeHtml(MatecitoStore.categoryLabel(product.category))}</div>
        <div class="card-name">${escapeHtml(product.name)}</div>
        <div class="card-foot">
          <span class="card-price">${formatPrice(product.price)}</span>
          <a href="${link}" class="card-link" target="${link !== "#" ? "_blank" : "_self"}" rel="noopener">Ver ficha</a>
        </div>
      </div>
    </article>
  `;
}

// ---------- Novedades ----------
function renderNovedades() {
  const track = document.getElementById("novedadesTrack");
  const empty = document.getElementById("novedadesEmpty");
  const novedades = MatecitoStore.getNovedades();
  if (novedades.length === 0) {
    track.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";
  track.innerHTML = novedades.map(productCard).join("");
}

// ---------- Productos por categoría ----------
function renderProducts() {
  const container = document.getElementById("productsByCategory");
  const empty = document.getElementById("productsEmpty");
  const all = MatecitoStore.getAll();

  if (all.length === 0) {
    container.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  const blocks = MatecitoStore.CATEGORIES.map((cat) => {
    const items = all.filter((p) => p.category === cat.id);
    if (items.length === 0) return "";
    return `
      <div class="category-block" id="cat-${cat.id}">
        <div class="category-head">
          <h3>${escapeHtml(cat.label)}</h3>
          <span class="category-count">${items.length} producto${items.length !== 1 ? "s" : ""}</span>
        </div>
        <div class="product-grid">
          ${items.map(productCard).join("")}
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = blocks;
}

// ---------- Dropdown de navbar (dinámico, agrupado por categoría) ----------
function renderDropdown() {
  const dropdown = document.getElementById("productsDropdown");
  const all = MatecitoStore.getAll();

  if (all.length === 0) {
    dropdown.innerHTML = `<div class="dropdown-empty">Todavía no hay productos cargados.</div>`;
    return;
  }

  const groups = MatecitoStore.CATEGORIES.map((cat) => {
    const items = all.filter((p) => p.category === cat.id);
    if (items.length === 0) return "";
    return `
      <div class="dropdown-group">
        <div class="dropdown-group-label">${escapeHtml(cat.label)}</div>
        ${items.map((p) => {
          const link = p.link && p.link !== "#" ? p.link : `#cat-${p.category}`;
          return `
            <a class="dropdown-item" href="${link}" target="${p.link && p.link !== "#" ? "_blank" : "_self"}" rel="noopener">
              <span class="thumb">${p.thumbnail ? `<img src="${p.thumbnail}" alt="" />` : ""}</span>
              <span>${escapeHtml(p.name)}</span>
            </a>
          `;
        }).join("")}
      </div>
    `;
  }).join("");

  dropdown.innerHTML = groups || `<div class="dropdown-empty">Todavía no hay productos cargados.</div>`;
}

// ---------- Stats del hero ----------
function renderStats() {
  const all = MatecitoStore.getAll();
  const cats = new Set(all.map((p) => p.category));
  document.getElementById("statProducts").textContent = all.length;
  document.getElementById("statCategories").textContent = cats.size;
}

function renderAll() {
  renderNovedades();
  renderProducts();
  renderDropdown();
  renderStats();
}

renderAll();

// Si se edita el catálogo desde el admin en otra pestaña del mismo navegador,
// esta página se actualiza sola (localStorage dispara este evento).
window.addEventListener("storage", (e) => {
  if (e.key === "matecito3d_products_v1") renderAll();
});
