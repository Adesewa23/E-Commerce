# Blossom Luxe

A complete, responsive e-commerce product listing page for a fictional luxury perfume brand, built as a frontend portfolio piece.

**Live files:** `index.html`, `style.css`, `script.js` — open `index.html` in any browser, no build step required.

---

## 1. Project overview

Blossom Luxe is a single-page storefront: a hero, a filterable/searchable/sortable product grid, a slide-in cart drawer, and a demo checkout flow. The whole experience — rendering products, filtering, sorting, cart math, persistence, and validation — runs in vanilla JavaScript against a single in-memory product catalogue.

## 2. Technologies used

- **HTML5** — semantic structure (`header`, `main`, `section`, `aside`, `footer`, `fieldset`-free but labeled forms)
- **CSS3** — custom properties for the design system, CSS Grid for the product layout, Flexbox for nav/cards/rows, media queries for responsiveness
- **Vanilla JavaScript (ES6+)** — no frameworks or libraries of any kind
- **Web Storage API (`localStorage`)** — cart persistence across page reloads
- **Google Fonts** — Cormorant Garamond (display serif) and Jost (body/UI sans)

No React, Vue, Angular, Bootstrap, or Tailwind is used anywhere in the project, per the brief.

## 3. Features

- Responsive header with logo, nav links, search shortcut, and a live cart-count badge; collapses to a hamburger menu on mobile
- Hero section with a CTA that smooth-scrolls to the product grid
- 10 products across 4 categories (Perfume, Perfume Oil, Body Mist, Gift Sets), each rendered from a single JS data array — no hand-duplicated card markup
- Category filter pills, a live name search, and a sort dropdown (Featured / Price ↑ / Price ↓ / Highest Rated), all combinable
- "Add to Cart" with a brief inline confirmation state, plus an optional "View Details" quick-view modal
- Fully working cart: quantity +/-, remove, per-item subtotal, running total, all formatted in Nigerian Naira (₦)
- Cart drawer slides in from the right with an overlay and a CSS transform transition; closes via the × button, overlay click, or Escape
- Cart persists in `localStorage` and reloads automatically on refresh
- Demo checkout modal with client-side validation (name, email, phone, address) and a success confirmation — no real payment processing
- Toast notifications, visible focus states, and keyboard support (Escape closes any open overlay)

## 4. How the shopping cart works

The cart is a small array of `{ id, quantity }` objects — it stores *references* to products by ID rather than duplicating product data, so the product catalogue (`PRODUCTS`) stays the single source of truth for name, price, and image.

Key functions in `script.js`:

- `addToCart(id)` — adds a new cart entry, or increments quantity if the product is already in the cart
- `removeFromCart(id)` — filters the item out of the cart array
- `changeQuantity(id, delta)` — adjusts quantity by +1/-1; removes the item automatically if quantity reaches 0
- `calcCartTotal()` / `calcCartItemCount()` — derive the total price and total item count from the cart array on demand, so the UI can never drift out of sync with the data
- `renderCart()` — the single function that rebuilds the drawer's HTML, the cart badge count, and both places the order total appears (drawer + checkout modal). Every cart mutation calls `saveCart()` then `renderCart()`, so state, storage, and DOM always update together.

Quantity and remove buttons use **event delegation**: one click listener on the drawer's container handles every row, including rows added after the page first loaded, instead of attaching a new listener per button.

## 5. How LocalStorage is implemented

- Storage key: `blossomluxe_cart_v1`
- `loadCart()` runs once on page load, reads the key, and `JSON.parse`s it into `state.cart` (falls back to an empty array if nothing is saved or the data is malformed)
- `saveCart()` runs after every cart mutation (add, remove, quantity change, checkout completion) and writes `JSON.stringify(state.cart)` back to `localStorage`
- Both functions are wrapped in `try/catch` so the app still works if storage is unavailable (e.g. private browsing with storage disabled) — it just won't persist between sessions

## 6. Responsive design approach

- **Product grid**: CSS Grid, `repeat(4, 1fr)` on desktop, `repeat(3, 1fr)` under 1080px, `repeat(2, 1fr)` under 860px, `1fr` under 620px
- **Header/nav**: Flexbox row on desktop; the nav links become a full-width overlay panel triggered by a hamburger button under 860px
- **Hero & About**: two-column Grid layouts that collapse to a single stacked column on tablet/mobile, with the visual reordered above the copy
- **Cart drawer**: fixed-width panel (`min(420px, 100vw)`) that becomes full-width on small screens
- **Typography**: uses `clamp()` for headline sizes so type scales smoothly between breakpoints rather than jumping at fixed sizes
- No fixed pixel widths that could force horizontal scroll — containers use `max-width` with fluid padding

## 7. How to run the project

1. Download/clone the three files (`index.html`, `style.css`, `script.js`) into the same folder.
2. Open `index.html` directly in a browser — no server, build step, or dependencies required.
3. (Optional) Serve it with any static server, e.g. `npx serve .` or the VS Code "Live Server" extension, if you prefer not to use the `file://` protocol.

## 8. Future improvements

- Replace `placehold.co` placeholder images with real product photography
- Wire the checkout modal to a real backend or a service like Stripe Checkout / Paystack for actual payments
- Add product detail pages (or expand the quick-view modal) with size/variant selection
- Persist the last-used filter/sort/search state, similar to how the cart persists
- Add unit tests around the cart math (`calcCartTotal`, `changeQuantity`) since that logic is the most failure-sensitive part of the app
- Consider an accessible live region announcing cart updates for screen reader users beyond the toast notification
