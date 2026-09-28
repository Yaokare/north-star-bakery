// ─────────────────────────────────────────────
// favorites.js  –  North Star Bakery
// "Save to Favorites" interactive feature for products.html
// ─────────────────────────────────────────────

"use strict";

// =============================================
// SECTION 1 — DATA
// Two module-level data structures drive every
// other function in this file.  Changing the
// product catalog means editing only this array.
// =============================================

/**
 * products
 * An array of objects.  Each object represents one
 * item on the Products page.
 *
 * Properties
 *   id       – unique kebab-case string; used as the
 *              data-product-id attribute and localStorage key
 *   name     – must match the h3 text in the HTML card exactly
 *              (case-insensitive comparison is used, but spelling
 *              must be identical)
 *   category – display label used to group items in the panel
 */
const products = [
  { id: "classic-sourdough",     name: "Classic Sourdough",               category: "Breads"   },
  { id: "honey-oat-loaf",        name: "Honey Oat Loaf",                  category: "Breads"   },
  { id: "seeded-rye",            name: "Seeded Rye",                      category: "Breads"   },
  { id: "rosemary-focaccia",     name: "Rosemary Focaccia",               category: "Breads"   },
  { id: "butter-croissant",      name: "Butter Croissant",                category: "Pastries" },
  { id: "fruit-danish",          name: "Seasonal Fruit Danish",           category: "Pastries" },
  { id: "morning-bun",           name: "Cinnamon Morning Bun",            category: "Pastries" },
  { id: "choc-almond-croissant", name: "Chocolate Almond Croissant",      category: "Pastries" },
  { id: "vanilla-cake",          name: "Classic Vanilla Celebration Cake",category: "Cakes"    },
  { id: "chocolate-cake",        name: "Dark Chocolate Ganache Cake",     category: "Cakes"    },
  { id: "lemon-loaf",            name: "Lemon Drizzle Loaf",              category: "Cakes"    },
  { id: "carrot-cake",           name: "Carrot Cake with Cream Cheese Frosting", category: "Cakes" },
];

/**
 * favorites
 * A module-level array of product id strings that
 * the user has saved.  Populated from localStorage
 * on page load; kept in sync with localStorage on
 * every toggle.
 *
 * @type {string[]}
 */
let favorites = [];

// =============================================
// SECTION 2 — LOCALSTORAGE HELPERS
// All reads and writes to localStorage are
// isolated here so the storage key "nsb_favorites"
// only appears in one place.
// =============================================

/**
 * loadFavorites
 * Reads the "nsb_favorites" key from localStorage
 * and returns it as a parsed array.
 * Returns an empty array when nothing is stored or
 * when the stored value cannot be parsed.
 *
 * @returns {string[]}
 */
function loadFavorites() {
  try {
    const stored = localStorage.getItem("nsb_favorites");
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    // JSON.parse can throw if the stored value is corrupt.
    // Return a clean empty array so the page still works.
    console.warn("favorites.js: could not parse stored favorites.", e);
    return [];
  }
}

/**
 * saveFavorites
 * Serialises the current favorites array and writes
 * it to localStorage under "nsb_favorites".
 * Called after every toggle so the stored value is
 * always up to date.
 */
function saveFavorites() {
  localStorage.setItem("nsb_favorites", JSON.stringify(favorites));
}

/**
 * clearFavorites
 * Empties the favorites array, removes the
 * localStorage entry, and refreshes the UI.
 * Attached to the "Clear All" button injected
 * by injectFavoritesPanel().
 */
function clearFavorites() {
  favorites = [];
  localStorage.removeItem("nsb_favorites");

  // Reset every button on the page to its unsaved state
  products.forEach((p) => updateButtonState(p.id));

  // Re-render the panel to show the empty-state message
  renderFavoritesList();
}

// =============================================
// SECTION 3 — PRODUCT LOOKUP HELPERS
// Small, single-purpose functions that query
// the products array or the favorites array.
// =============================================

/**
 * findProduct
 * Returns the product object whose id matches the
 * given string, or undefined if not found.
 *
 * @param  {string} id
 * @returns {object|undefined}
 */
function findProduct(id) {
  return products.find((p) => p.id === id);
}

/**
 * findProductByName
 * Returns the product object whose name matches the
 * given string (case-insensitive).
 * Used by injectFavoriteButtons() to match card
 * headings to product objects without relying on
 * exact capitalisation in the HTML.
 *
 * @param  {string} name
 * @returns {object|undefined}
 */
function findProductByName(name) {
  const normalised = name.trim().toLowerCase();
  return products.find((p) => p.name.toLowerCase() === normalised);
}

/**
 * isFavorite
 * Returns true when the given product id is present
 * in the favorites array.
 *
 * @param  {string} id
 * @returns {boolean}
 */
function isFavorite(id) {
  return favorites.includes(id);
}

// =============================================
// SECTION 4 — TOGGLE AND BUTTON STATE
// These two functions are called together every
// time the user clicks a Save button.
// =============================================

/**
 * toggleFavorite
 * Adds the product id to favorites if it is not
 * already there; removes it if it is.
 * After updating the array, persists to localStorage
 * and refreshes both the button and the panel.
 *
 * @param {string} id
 */
function toggleFavorite(id) {
  if (isFavorite(id)) {
    // Remove — keep every id that is NOT this one
    favorites = favorites.filter((f) => f !== id);
  } else {
    // Add
    favorites.push(id);
  }

  saveFavorites();
  updateButtonState(id);
  renderFavoritesList();
}

/**
 * updateButtonState
 * Finds the Save button for the given product id
 * and updates its text, CSS class, and aria-pressed
 * attribute to reflect the current saved/unsaved state.
 *
 * Called by toggleFavorite() for the toggled item
 * and by injectFavoriteButtons() for every button
 * on initial page load.
 *
 * @param {string} id
 */
function updateButtonState(id) {
  const btn = document.querySelector(`[data-product-id="${id}"]`);
  if (!btn) return;

  if (isFavorite(id)) {
    btn.textContent = "★ Saved";
    btn.classList.add("btn-favorite-active");
    btn.setAttribute("aria-pressed", "true");
    btn.setAttribute("aria-label", `Remove ${findProduct(id)?.name ?? id} from saved items`);
  } else {
    btn.textContent = "☆ Save";
    btn.classList.remove("btn-favorite-active");
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("aria-label", `Save ${findProduct(id)?.name ?? id} to your list`);
  }
}

// =============================================
// SECTION 5 — FAVORITES PANEL RENDERING
// renderFavoritesList() is the single function
// responsible for the panel's inner content.
// It is called after every toggle and on load.
// =============================================

/**
 * renderFavoritesList
 * Reads the current favorites array and rebuilds
 * the inner HTML of the favorites panel.
 *
 * When favorites is empty: shows a placeholder message.
 * When favorites has items: groups them by category
 * using a plain object as a map, then builds a nested
 * list — one <li> per category, each containing an
 * inner <ul> of product names.
 *
 * Also updates the item count in the panel heading.
 */
function renderFavoritesList() {
  const list  = document.getElementById("favorites-list");
  const count = document.getElementById("favorites-count");
  if (!list || !count) return;

  // Update the count badge in the heading
  count.textContent = favorites.length;

  // ── Empty state ───────────────────────────────
  if (favorites.length === 0) {
    list.innerHTML =
      "<li class='favorites-empty'>" +
      "No items saved yet. Click ☆ Save on any product above." +
      "</li>";
    return;
  }

  // ── Group by category ─────────────────────────
  // grouped is a plain object used as a map:
  //   { "Breads": ["Classic Sourdough", ...], "Pastries": [...] }
  const grouped = {};

  favorites.forEach((id) => {
    const product = findProduct(id);
    if (!product) return; // skip stale ids that no longer exist

    if (!grouped[product.category]) {
      grouped[product.category] = [];
    }
    grouped[product.category].push(product.name);
  });

  // ── Build HTML ────────────────────────────────
  // Use a DocumentFragment to avoid repeated reflows
  const fragment = document.createDocumentFragment();

  Object.keys(grouped).forEach((category) => {
    const categoryItem = document.createElement("li");
    categoryItem.className = "favorites-category";

    const categoryLabel = document.createElement("strong");
    categoryLabel.textContent = category;
    categoryItem.appendChild(categoryLabel);

    const nameList = document.createElement("ul");

    grouped[category].forEach((name) => {
      const nameItem = document.createElement("li");
      nameItem.textContent = name;
      nameList.appendChild(nameItem);
    });

    categoryItem.appendChild(nameList);
    fragment.appendChild(categoryItem);
  });

  // Replace list contents in a single DOM operation
  list.innerHTML = "";
  list.appendChild(fragment);
}

// =============================================
// SECTION 6 — DOM INJECTION
// These two functions build and insert elements
// that do not exist in the static HTML.
// Keeping injection separate from rendering means
// each function has one clear responsibility.
// =============================================

/**
 * injectFavoritesPanel
 * Creates the favorites summary <section> and
 * inserts it immediately before .video-section.
 * Falls back to appending to <main> if the video
 * section is not found.
 *
 * The panel contains:
 *   - A heading with a live item count span
 *   - A short description paragraph
 *   - The #favorites-list <ul> (populated by renderFavoritesList)
 *   - A "Pre-Order Saved Items" link to contact.html
 *   - A "Clear All" button wired to clearFavorites()
 *
 * Called once on DOMContentLoaded before any
 * buttons are injected so the panel exists when
 * renderFavoritesList() first runs.
 */
function injectFavoritesPanel() {
  // Guard: do not inject twice if the script somehow runs again
  if (document.getElementById("favorites-panel")) return;

  const panel = document.createElement("section");
  panel.id        = "favorites-panel";
  panel.className = "favorites-panel";
  panel.setAttribute("aria-label", "Your saved items");

  panel.innerHTML = `
    <h2>Your Saved Items (<span id="favorites-count">0</span>)</h2>
    <p>
      Items you save are remembered the next time you visit this page.
      Use your list when you are ready to place a pre-order.
    </p>
    <ul id="favorites-list"></ul>
    <div class="favorites-actions">
      <a href="contact.html" class="btn">Pre-Order Saved Items</a>
      <button type="button" class="btn-clear-favorites" id="btn-clear-favorites">
        Clear All
      </button>
    </div>
  `;

  // Insert before the video section, or append to main as fallback
  const videoSection = document.querySelector(".video-section");
  if (videoSection) {
    videoSection.insertAdjacentElement("beforebegin", panel);
  } else {
    const main = document.querySelector("main");
    if (main) main.appendChild(panel);
  }

  // Wire the Clear All button now that it exists in the DOM
  const clearBtn = document.getElementById("btn-clear-favorites");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearFavorites);
  }
}

/**
 * injectFavoriteButtons
 * Iterates over every .card element on the page,
 * matches each card's <h3> text to a product object
 * using findProductByName(), and appends a Save
 * button to the card's .card-body.
 *
 * The button is inserted after the .price paragraph
 * when one exists, or appended to .card-body otherwise.
 *
 * Each button stores its product id in a
 * data-product-id attribute so updateButtonState()
 * can find it with a single querySelector call.
 *
 * Called once on DOMContentLoaded after
 * injectFavoritesPanel() so the panel is ready to
 * receive the first renderFavoritesList() call.
 */
function injectFavoriteButtons() {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    const heading = card.querySelector("h3");
    if (!heading) return;

    // Match by name so the HTML heading text is the source of truth
    const product = findProductByName(heading.textContent);
    if (!product) return;

    // Build the button element
    const btn = document.createElement("button");
    btn.type            = "button";
    btn.className       = "btn-favorite";
    btn.dataset.productId = product.id;

    // Wire the click handler
    btn.addEventListener("click", () => toggleFavorite(product.id));

    // Insert after .price, or append to .card-body as fallback
    const price    = card.querySelector(".price");
    const cardBody = card.querySelector(".card-body");

    if (price) {
      price.insertAdjacentElement("afterend", btn);
    } else if (cardBody) {
      cardBody.appendChild(btn);
    }

    // Set correct text, class, and aria attributes for initial state
    updateButtonState(product.id);
  });
}

// =============================================
// SECTION 7 — INITIALISATION
// Runs after the DOM is fully parsed.
// Order matters:
//   1. Load stored favorites first so isFavorite()
//      returns correct results during injection.
//   2. Inject the panel before injecting buttons
//      so the panel exists when renderFavoritesList
//      is first called.
//   3. Inject buttons.
//   4. Render the panel with the restored data.
// =============================================

document.addEventListener("DOMContentLoaded", () => {

  // 1. Restore saved favorites from localStorage
  favorites = loadFavorites();

  // 2. Build and insert the favorites summary panel
  injectFavoritesPanel();

  // 3. Build and insert a Save button on every product card
  injectFavoriteButtons();

  // 4. Populate the panel with any restored favorites
  renderFavoritesList();

});
