# UI/UX Audit

Scope paused: CI/CD, Vercel debugging, Midtrans webhook, database schema, API contracts, new business features.

Local app used: `npm run start -- -p 3001` at `http://127.0.0.1:3001` after production build.

Browser QA limits: browser viewport resize tool unavailable, so desktop was visually inspected in browser. Mobile remains code/CSS responsive audit only. Authenticated customer/admin pages redirected to `/login`; no credentials/session were provided, so protected page visual QA is blocked.

| route | audited | light mode status | dark mode status | desktop status | mobile status | issues found | fixes applied | remaining issues | screenshot path |
|---|---|---|---|---|---|---|---|---|---|
| / | yes | pass with minor issues | not rechecked after fixes | pass | code audit only | sparse product sections; low-emphasis small labels; heart icon faint | shared header/footer/product card theme fixes already applied | mobile visual QA; product image data/placeholder quality | `/home/zulfikar/.hermes/cache/screenshots/browser_screenshot_07bafd68de744b92995c739524c54c69.png` |
| /products | yes | pass after fixes | issues found before fixes | pass | code audit only | filter inputs weak; clear filters looked plain; blank product image harsh in dark | added visible borders to search/select fields | mobile visual QA; product image/placeholder still data-dependent | `/home/zulfikar/.hermes/cache/screenshots/browser_screenshot_700e1fe30d1c4a19a9146ebeaf0ad6f4.png`, `/home/zulfikar/.hermes/cache/screenshots/browser_screenshot_8abe89e642a94769b755073d037afe59.png` |
| /products/runtime-glow-serum | yes | pass after fixes | issues found before fixes | pass | code audit only | literal `\\n` shown in Benefits; product gallery image looked blank/white; variant price differs from main price | normalized escaped newlines in product info text | mobile visual QA; product image asset/variant pricing data needs business decision | `/home/zulfikar/.hermes/cache/screenshots/browser_screenshot_a6b1708f98bb414cb6fb8badc02cdc7a.png`, `/home/zulfikar/.hermes/cache/screenshots/browser_screenshot_b13b9240db03407c87e34230b08ede0c.png` |
| /account/cart | blocked | blocked by auth redirect | blocked by auth redirect | redirected to `/login` | code audit only | no authenticated session | earlier code confirms active `Checkout` link when items exist | needs login/session with cart items | none |
| /checkout | blocked | blocked by auth redirect | blocked by auth redirect | redirected to `/login` | code audit only | no authenticated session | none this pass | needs login/session/cart | none |
| /account/orders | blocked | blocked by auth redirect | blocked by auth redirect | redirected to `/login` | code audit only | no authenticated session | none this pass | needs login/session/orders | none |
| /account/orders/[existing-order-id] | blocked | blocked by auth redirect | blocked by auth redirect | not reachable | code audit only | no existing order id/session | none this pass | needs order id + login/session | none |
| /account/profile | blocked | blocked by auth redirect | blocked by auth redirect | redirected to `/login` | code audit only | no authenticated session | none this pass | needs login/session | none |
| /account/addresses | blocked | blocked by auth redirect | blocked by auth redirect | redirected to `/login` | code audit only | no authenticated session | none this pass | needs login/session | none |
| /account/wishlist | blocked | blocked by auth redirect | blocked by auth redirect | redirected to `/login` | code audit only | no authenticated session | none this pass | needs login/session | none |
| /login | yes | pass after fixes | not rechecked after fixes | pass | code audit only | page was unstyled/plain before fix | added branded AuthShell card, header/footer, labels, inputs, CTA, links | mobile visual QA | `/home/zulfikar/.hermes/cache/screenshots/browser_screenshot_138804edd43845d88c4f104803692b02.png`, `/home/zulfikar/.hermes/cache/screenshots/browser_screenshot_b1963bf576674200acdf8634d617b4bc.png` |
| /sign-up | code audited | uses new AuthShell | uses new AuthShell | code pass | code audit only | was plain/unstyled | added branded AuthShell form | browser screenshot still needed | none |
| /forgot-password | code audited | uses new AuthShell | uses new AuthShell | code pass | code audit only | was plain/unstyled | added branded AuthShell form | browser screenshot still needed | none |
| /reset-password | code audited | uses new AuthShell | uses new AuthShell | code pass | code audit only | was plain/unstyled | added branded AuthShell form | browser screenshot still needed | none |
| /403 | code audited | themed | themed | code pass | code audit only | was plain/unstyled | added StoreHeader/Footer and themed access-denied card | browser screenshot still needed | none |
| /admin/dashboard | blocked | blocked by auth redirect | blocked by auth redirect | redirected to `/login` | code audit only | no admin session | admin shell already themed/responsive from prior pass | needs admin login/session | none |
| /admin/products | blocked | blocked by auth redirect | blocked by auth redirect | redirected to `/login` | code audit only | no admin session | none this pass | needs admin login/session | none |
| /admin/products/[id] | blocked | blocked by auth redirect | blocked by auth redirect | not reachable | code audit only | no admin session/product id | none this pass | needs admin login/session/id | none |
| /admin/categories | blocked | blocked by auth redirect | blocked by auth redirect | redirected to `/login` | code audit only | no admin session | none this pass | needs admin login/session | none |
| /admin/variants | blocked | blocked by auth redirect | blocked by auth redirect | redirected to `/login` | code audit only | no admin session | none this pass | needs admin login/session | none |
| /admin/orders | blocked | blocked by auth redirect | blocked by auth redirect | redirected to `/login` | code audit only | no admin session | none this pass | needs admin login/session | none |
| /admin/customers | blocked | blocked by auth redirect | blocked by auth redirect | redirected to `/login` | code audit only | no admin session | none this pass | needs admin login/session | none |
| /admin/vouchers | blocked | blocked by auth redirect | blocked by auth redirect | redirected to `/login` | code audit only | no admin session | none this pass | needs admin login/session | none |
| /admin/settings | blocked | blocked by auth redirect | blocked by auth redirect | redirected to `/login` | code audit only | no admin session | none this pass | needs admin login/session | none |
| /admin/audit-logs | blocked | blocked by auth redirect | blocked by auth redirect | redirected to `/login` | code audit only | no admin session | none this pass | needs admin login/session | none |

## Findings

- Cart checkout button: code path still shows active `/checkout` link only when cart has items; real cart visual QA blocked by auth/session.
- Text contrast: auth pages fixed from plain browser-default to branded themed cards; product filters gained visible borders.
- Mobile header/nav: responsive CSS exists, but mobile browser viewport could not be visually captured with current tool.
- Checkout/order/admin tables: protected by auth; blocked without seeded credentials/session.
- Product detail: escaped newline rendering fixed. Product image/variant price mismatch remains data/content issue, not UI-only fix.

## Test result

- `npm run lint` passed.
- `npm run build` passed.


## Authenticated QA pass — 2026-07-07

Local app: `http://127.0.0.1:3001` production server.

Credentials used:
- Customer: `customer-runtime@example.com`
- Super Admin: `admin@example.com`

| route | audited | light mode status | dark mode status | desktop status | mobile status | issues found | fixes applied | remaining issues | screenshot path |
|---|---|---|---|---|---|---|---|---|---|
| /account | yes | pass | not rechecked | pass | code/CSS only | active account nav missing; overview sparse | none | active nav highlight/overview cards later | `/home/zulfikar/.hermes/cache/screenshots/browser_screenshot_4e2212f0c3ef4f6daa7d889fb6541320.png` |
| /account/cart | yes | pass | not rechecked | pass | code/CSS only | product image appears blank; cart was empty before adding product | added item through product flow; checkout button verified visible | image asset is 68-byte PNG; replace runtime asset later | `/home/zulfikar/.hermes/cache/screenshots/browser_screenshot_cc9373c8869e479c81f07ed203986875.png` |
| /checkout | yes | pass | not rechecked | pass | code/CSS only | product image blank | none | mobile visual QA; image asset replacement | `/home/zulfikar/.hermes/cache/screenshots/browser_screenshot_415c98440ca549ee8c3552a3f897f587.png` |
| /account/profile | login verified but not screenshot audited | unknown | unknown | not audited | code/CSS only | not enough pass time | none | browser screenshot needed | none |
| /account/addresses | login verified but not screenshot audited | unknown | unknown | not audited | code/CSS only | not enough pass time | none | browser screenshot needed | none |
| /account/wishlist | login verified but not screenshot audited | unknown | unknown | not audited | code/CSS only | not enough pass time | none | browser screenshot needed | none |
| /account/orders | login verified but not screenshot audited | unknown | unknown | not audited | code/CSS only | not enough pass time | none | browser screenshot needed | none |
| /account/orders/[id] | not audited | unknown | unknown | not audited | code/CSS only | existing order id not selected | none | need order id/screenshot | none |
| /admin/dashboard | yes | pass but sparse | not rechecked | pass | code/CSS only | empty dashboard, no active nav | global admin controls styling improved | dashboard content still sparse | `/home/zulfikar/.hermes/cache/screenshots/browser_screenshot_f48b690c564840eebbb7d3c1826ace12.png` |
| /admin/products | yes | readable after global CSS fix planned | not rechecked | visible issues found | code/CSS only | inputs looked plain; list/table row unstructured; buttons inconsistent | global input/table/list styling added | page-specific admin table markup still should be improved | `/home/zulfikar/.hermes/cache/screenshots/browser_screenshot_91ee32db42c241b2b47e6b6aa43ae15a.png` |
| /admin/products/[id] | not audited | unknown | unknown | not audited | code/CSS only | product id page not opened | none | needs browser QA | none |
| /admin/categories | not audited | unknown | unknown | not audited | code/CSS only | not enough pass time | global input/table/list styling applies | needs browser QA | none |
| /admin/variants | not audited | unknown | unknown | not audited | code/CSS only | not enough pass time | global input/table/list styling applies | needs browser QA | none |
| /admin/orders | not audited | unknown | unknown | not audited | code/CSS only | not enough pass time | global input/table/list styling applies | needs browser QA | none |
| /admin/customers | not audited | unknown | unknown | not audited | code/CSS only | not enough pass time | global input/table/list styling applies | needs browser QA | none |
| /admin/vouchers | not audited | unknown | unknown | not audited | code/CSS only | not enough pass time | global input/table/list styling applies | needs browser QA | none |
| /admin/settings | not audited | unknown | unknown | not audited | code/CSS only | not enough pass time | global input/table/list styling applies | needs browser QA | none |
| /admin/audit-logs | not audited | unknown | unknown | not audited | code/CSS only | not enough pass time | global input/table/list styling applies | needs browser QA | none |

### Authenticated QA results

- Customer login worked. No credential seeding needed.
- Admin login worked. No credential seeding needed.
- Cart checkout button verified with real item: active `Checkout` button visible, navigates to `/checkout` route.
- Checkout readable: address, voucher, totals, and `Place Order` visible.
- Product image investigation: `product_images` row exists, public URL returns `200 image/png`, but `content-length` is only `68` bytes. Blank UI comes from placeholder/tiny runtime asset, not container hiding image.
- Price clarity: product detail now labels variant products as `From Rp ...` and explains selected variant/cart price follows variant price.
- Admin products issue found: browser-default form/list/table. Added global input/table/list styling to improve baseline admin readability without rewriting business logic.
- Mobile remains code/CSS audited only because viewport resize proof unavailable.

## Migration update — 2026-07-07

Migrated now:
- Admin placeholder modules use `PageHeader` + `EmptyState`.
- Admin dashboard uses KPI cards, recent orders, no fake activity.
- Account overview uses dashboard cards.
- Checkout uses card-based two-column layout and shared `Button`/`Alert`/`PageHeader`.
- Order detail uses shared status badges and `OrderTimeline`.

Remaining migration:
- Deep CRUD forms/tables: products, categories, variants detail pages need full `Field`/`TableShell` pass.
- Customer profile/address/wishlist/cart/order list need deeper per-form card conversion.
- Real mobile viewport QA still required.

## Deep CRUD + customer pass — 2026-07-07

Migrated now:
- Admin products list/detail: shared headers, cards, fields, status/stock badges, table shell, product image fallback.
- Admin categories list/detail: shared headers, cards, fields, status badge, table shell, image upload card.
- Admin variants list/detail: shared headers, cards, fields, status/stock badges, table shell.
- Customer profile, wishlist, cart, orders list: shared account headers/cards/empty states/buttons.
- Product image fallback: `ProductImage` branded placeholder used in product cards, cart, admin product image grid, and related surfaces touched in this pass.

Audit status:
- Code/CSS audited only for mobile responsiveness in this pass.
- `npm run lint` and `npm run build` are verification gates.

Remaining:
- Address edit page deeper form polish.
- Account addresses action row polish.
- Product detail/checkout/order item image fallback can be expanded further.
- Real browser mobile screenshots still required.

## Final customer/public pass — 2026-07-07

Migrated now:
- Address list and edit flow use `PageHeader`, `Card`, `Field`, `Button`, `Badge`, `EmptyState`, and `Alert`.
- Product detail gallery uses `ProductImage` fallback for hero and thumbnails.
- Checkout cart item rows use `ProductImage` fallback.
- Order detail item rows use compact branded fallback blocks where stored image data is not available.

Mobile audit status:
- Code/CSS audited only in this pass. No real mobile screenshots captured by assistant tooling.
- Layouts use mobile-first grids, wrapped actions, table shells, and card stacking.

Remaining known gaps:
- Public product detail could still get richer tabs/reviews later.
- Order item real images would require query/data shape change, intentionally skipped.
- Real device/browser screenshots still recommended before portfolio handoff.

