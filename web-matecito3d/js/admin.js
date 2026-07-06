/**
 * Login fijo, simple, solo para uso interno del taller.
 * ⚠️ OJO: esto es una validación en el navegador (JavaScript del lado del
 * cliente). Cualquiera que mire el código fuente puede ver el usuario y la
 * contraseña. Sirve para que un curioso no te toque el catálogo por accidente,
 * pero NO es seguridad real. El día que pasemos esto a Firebase, lo correcto
 * es usar Firebase Authentication en vez de este chequeo.
 */
const ADMIN_USER = "matecito3d";
const ADMIN_PASS = "matecito2026";
const SESSION_KEY = "matecito3d_admin_session";

const loginScreen = document.getElementById("loginScreen");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

function showDashboard() {
  loginScreen.style.display = "none";
  dashboard.style.display = "block";
  initDashboard();
}

function showLogin() {
  loginScreen.style.display = "flex";
  dashboard.style.display = "none";
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value;
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    sessionStorage.setItem(SESSION_KEY, "true");
    loginError.classList.remove("show");
    showDashboard();
  } else {
    loginError.classList.add("show");
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem(SESSION_KEY);
  showLogin();
});

if (isLoggedIn()) {
  showDashboard();
} else {
  showLogin();
}

// ================= DASHBOARD =================
let dashboardInitialized = false;
let currentThumbDataUrl = "";

function initDashboard() {
  populateCategorySelect();
  renderProductList();
  if (dashboardInitialized) return;
  dashboardInitialized = true;

  const form = document.getElementById("productForm");
  const thumbInput = document.getElementById("pThumb");
  const thumbPreview = document.getElementById("thumbPreview");
  const cancelBtn = document.getElementById("cancelEditBtn");

  thumbInput.addEventListener("change", () => {
    const file = thumbInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      currentThumbDataUrl = reader.result;
      thumbPreview.innerHTML = `<img src="${currentThumbDataUrl}" alt="Vista previa" />`;
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    saveProductFromForm();
  });

  cancelBtn.addEventListener("click", () => {
    resetForm();
  });
}

function populateCategorySelect() {
  const select = document.getElementById("pCategory");
  select.innerHTML = MatecitoStore.CATEGORIES.map(
    (c) => `<option value="${c.id}">${c.label}</option>`
  ).join("");
}

function resetForm() {
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
  document.getElementById("thumbPreview").innerHTML = "Sin imagen";
  document.getElementById("formTitle").textContent = "Nuevo producto";
  document.getElementById("formSub").textContent = "Completá los datos y guardá para publicarlo en la landing.";
  document.getElementById("cancelEditBtn").style.display = "none";
  currentThumbDataUrl = "";
}

function saveProductFromForm() {
  const id = document.getElementById("productId").value;
  const existing = id ? MatecitoStore.getById(id) : null;

  const product = {
    id: id || undefined,
    name: document.getElementById("pName").value.trim(),
    category: document.getElementById("pCategory").value,
    price: document.getElementById("pPrice").value,
    link: document.getElementById("pLink").value.trim() || "#",
    description: document.getElementById("pDescription").value.trim(),
    novedad: document.getElementById("pNovedad").checked,
    thumbnail: currentThumbDataUrl || (existing ? existing.thumbnail : ""),
  };

  if (!product.name) {
    alert("Ponele un nombre al producto.");
    return;
  }

  MatecitoStore.upsert(product);
  resetForm();
  renderProductList();
}

function editProduct(id) {
  const p = MatecitoStore.getById(id);
  if (!p) return;
  document.getElementById("productId").value = p.id;
  document.getElementById("pName").value = p.name;
  document.getElementById("pCategory").value = p.category;
  document.getElementById("pPrice").value = p.price || "";
  document.getElementById("pLink").value = p.link === "#" ? "" : p.link;
  document.getElementById("pDescription").value = p.description || "";
  document.getElementById("pNovedad").checked = !!p.novedad;
  currentThumbDataUrl = p.thumbnail || "";
  document.getElementById("thumbPreview").innerHTML = p.thumbnail
    ? `<img src="${p.thumbnail}" alt="Vista previa" />`
    : "Sin imagen";
  document.getElementById("formTitle").textContent = "Editar producto";
  document.getElementById("formSub").textContent = `Estás editando "${p.name}".`;
  document.getElementById("cancelEditBtn").style.display = "inline-flex";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteProduct(id) {
  const p = MatecitoStore.getById(id);
  if (!p) return;
  if (!confirm(`¿Borrar "${p.name}"? Esta acción no se puede deshacer.`)) return;
  MatecitoStore.remove(id);
  renderProductList();
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function renderProductList() {
  const container = document.getElementById("productList");
  const all = MatecitoStore.getAll();
  document.getElementById("totalCount").textContent = all.length;

  if (all.length === 0) {
    container.innerHTML = `<div class="admin-row"><div class="info">No hay productos cargados todavía.</div></div>`;
    return;
  }

  container.innerHTML = all
    .map((p) => `
      <div class="admin-row">
        <div class="thumb">${p.thumbnail ? `<img src="${p.thumbnail}" alt="" />` : ""}</div>
        <div class="info">
          <div class="name">${escapeHtml(p.name)}</div>
          <div class="meta">
            <span>${escapeHtml(MatecitoStore.categoryLabel(p.category))}</span>
            <span>${p.price ? "$ " + Number(p.price).toLocaleString("es-AR") : "Consultar"}</span>
            ${p.novedad ? '<span class="pill">Novedad</span>' : ""}
          </div>
        </div>
        <div class="actions">
          <button class="icon-btn" onclick="editProduct('${p.id}')">Editar</button>
          <button class="icon-btn danger" onclick="deleteProduct('${p.id}')">Borrar</button>
        </div>
      </div>
    `)
    .join("");
}
