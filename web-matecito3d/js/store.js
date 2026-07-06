/**
 * MatecitoStore — capa de datos de la landing.
 *
 * IMPORTANTE (léelo antes de usar esto en producción):
 * Esto guarda los productos en localStorage, es decir, DENTRO DEL NAVEGADOR
 * de cada persona. Sirve perfecto para probar el diseño y el flujo del admin
 * ahora mismo, pero tiene una limitación real: si vos cargás un producto
 * desde tu celu, alguien que entra desde OTRO dispositivo no lo va a ver,
 * porque cada navegador tiene su propio localStorage.
 *
 * Para que el admin cargue productos y los vea CUALQUIER visitante (que es
 * lo que pediste), el siguiente paso es conectar esto a Firebase/Firestore
 * (como ya venís usando en la app de Matecito 3D). Dejé el código separado
 * en este archivo justamente para que ese cambio sea simple: el día que
 * quieras, reemplazamos las funciones de acá por llamadas a Firestore y
 * ni el resto de la web ni el admin.html necesitan tocarse.
 */

const MatecitoStore = (() => {
  const STORAGE_KEY = "matecito3d_products_v1";

  const CATEGORIES = [
    { id: "carteles", label: "Carteles personalizados" },
    { id: "llaveros", label: "Llaveros" },
    { id: "mates", label: "Mates y accesorios" },
    { id: "municion", label: "Cajas de munición" },
    { id: "olfativas", label: "Cápsulas olfativas" },
    { id: "soportes", label: "Soportes para celular" },
    { id: "vehiculos", label: "Piezas para vehículos" },
    { id: "otros", label: "Otros" },
  ];

  // Productos de arranque, tomados del feed de Instagram, para que la
  // landing no se vea vacía mientras se carga todo desde el admin.
  const SEED_PRODUCTS = [
    {
      id: "seed-cartel-aldyxv",
      name: "Cartel luminoso personalizado",
      category: "carteles",
      price: 45000,
      thumbnail: "",
      link: "#",
      novedad: true,
      description: "Cartel con luz LED, diseño y tamaño a medida.",
    },
    {
      id: "seed-mate",
      name: "Mate personalizado",
      category: "mates",
      price: 12000,
      thumbnail: "",
      link: "#",
      novedad: false,
      description: "Mate impreso en 3D, grabado a elección.",
    },
    {
      id: "seed-llavero-o11ce",
      name: "Llavero personalizado",
      category: "llaveros",
      price: 3500,
      thumbnail: "",
      link: "#",
      novedad: false,
      description: "Llavero a medida, cualquier logo o diseño.",
    },
    {
      id: "seed-municion",
      name: "Estuche para munición 9mm",
      category: "municion",
      price: 18000,
      thumbnail: "",
      link: "#",
      novedad: false,
      description: "Para 50 unidades, personalizable en color y logo.",
    },
    {
      id: "seed-olfativas",
      name: "Cápsulas olfativas para entrenamiento canino",
      category: "olfativas",
      price: 9000,
      thumbnail: "",
      link: "#",
      novedad: true,
      description: "Personalizables en color y logo.",
    },
    {
      id: "seed-soporte",
      name: "Soporte para celular",
      category: "soportes",
      price: 6000,
      thumbnail: "",
      link: "#",
      novedad: false,
      description: "De escritorio, distintos colores.",
    },
  ];

  function readAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PRODUCTS));
        return [...SEED_PRODUCTS];
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error("Error leyendo productos:", e);
      return [];
    }
  }

  function writeAll(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }

  function getAll() {
    return readAll();
  }

  function getByCategory(categoryId) {
    return readAll().filter((p) => p.category === categoryId);
  }

  function getNovedades() {
    return readAll().filter((p) => p.novedad);
  }

  function getById(id) {
    return readAll().find((p) => p.id === id) || null;
  }

  function upsert(product) {
    const all = readAll();
    if (!product.id) {
      product.id = "p-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
    }
    const idx = all.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      all[idx] = product;
    } else {
      all.push(product);
    }
    writeAll(all);
    return product;
  }

  function remove(id) {
    const all = readAll().filter((p) => p.id !== id);
    writeAll(all);
  }

  function categoryLabel(id) {
    const c = CATEGORIES.find((c) => c.id === id);
    return c ? c.label : "Otros";
  }

  function resetToSeed() {
    writeAll(SEED_PRODUCTS);
  }

  return {
    CATEGORIES,
    getAll,
    getByCategory,
    getNovedades,
    getById,
    upsert,
    remove,
    categoryLabel,
    resetToSeed,
  };
})();
