# Lumina Design System

Lumina uses a small theme-token design system for premium beauty ecommerce UI.

## Theme tokens

Defined in `src/app/globals.css`:

- `--background`: page background
- `--foreground`: default text
- `--surface`: cards, header, footer
- `--surface-muted`: soft blush/muted panels
- `--surface-soft`: secondary sections
- `--text`: primary text
- `--text-muted`: secondary text
- `--brand`: interactive accent
- `--brand-strong`: headings/primary brand
- `--border`: soft border
- `--shadow`: card elevation

Use utility classes:

- `theme-surface`
- `theme-muted`
- `theme-soft`
- `theme-text`
- `theme-text-muted`
- `theme-brand`
- `theme-heading`
- `theme-border`
- `theme-button`
- `theme-button-soft`

Avoid hardcoded colors except intentional accents.

## Component inventory

Shared components live in `src/components/ui.tsx`.

- `Button`
- `ButtonLink`
- `IconButton`
- `Card`
- `Section`
- `Badge`
- `StatusBadge`
- `Alert`
- `Field`
- `EmptyState`
- `Skeleton`
- `Divider`
- `PageHeader`
- `TableShell`
- `PaginationNote`
- `ModalShell`
- `ConfirmDialog`

Storefront shared components live in `src/components/storefront.tsx`:

- `StoreHeader`
- `StoreFooter`
- `ProductCard`
- storefront `EmptyState` compatibility wrapper

Auth shared component:

- `AuthShell` in `src/components/auth-card.tsx`

## Typography scale

- Page title: `text-4xl font-semibold theme-heading`
- Section title: `text-3xl md:text-4xl font-semibold theme-heading`
- Card title: `text-xl font-semibold theme-heading`
- Body: default `theme-text`
- Muted body: `theme-text-muted`
- Caption/eyebrow: `text-xs uppercase tracking-[0.3em] theme-brand`
- Price: `text-lg` or `text-2xl font-semibold theme-heading`
- Badge: `text-xs font-medium`

## Spacing scale

Prefer Tailwind scale:

- Page gutters: `px-4`
- Page vertical rhythm: `py-10` / `py-12` / `py-16`
- Card padding: `p-6` or `p-8`
- Section gap: `gap-6` / `gap-8` / `gap-10`
- Form gap: `gap-3` / `gap-4`

Avoid random one-off spacing unless layout needs it.

## Button variants

- `primary`: main commerce action (`theme-button`)
- `secondary`: soft secondary action (`theme-button-soft`)
- `ghost`: low-emphasis link-like action
- `danger`: destructive confirmation

Buttons must have visible focus, disabled state, and clear labels.

## Tables

Wrap wide tables in `TableShell` or `.table-scroll`.

Rules:

- visible headers
- padded cells
- border separators
- hover optional
- action column for edit/delete
- badges for status
- empty state if no rows

## Product cards

Cards use:

- consistent `4/5` image ratio
- hover elevation
- subtle image zoom
- category chip
- wishlist affordance
- price hierarchy
- sale badge when discounted

## Forms

Inputs/selects/textarea use tokenized borders, background, and focus ring.

Rules:

- every input has label or `aria-label`
- placeholders are not labels
- errors use `Alert`
- primary submit uses `Button variant="primary"`

## Accessibility rules

- keep text contrast token-based
- use `focus-visible`
- do not use icon-only controls without `aria-label`
- disabled controls must look disabled
- links must look interactive
- forms must be keyboard reachable

## Motion rules

Use subtle motion only:

- button hover lift
- card hover lift/shadow
- image hover zoom
- focus ring
- skeleton pulse

Do not add heavy animation or page-transition libraries.

## Remaining opportunities

- Convert each admin CRUD page to `PageHeader`, `Card`, `TableShell`, `StatusBadge`, `Button`.
- Add real modal/confirmation flows where server actions already require confirmation.
- Add route-level loading skeletons where Next `loading.tsx` is useful.
- Replace runtime product image asset with real product image.

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

