# ConveraFrontend — Full Redesign Plan

> **Status**: In Progress  
> **Started**: 2026-06-01  
> **Owner**: AI Agent (OpenCode)  
> **Goal**: Transform Convera from a cloned-Airbnb prototype into a polished, production-grade booking platform.

---

## 1. Executive Summary

### Current State
- Next.js 14 App Router with almost every page as `"use client"` (defeats SSR benefits)
- Tailwind config exists but is ignored; arbitrary values (`bg-[#FF385C]`, `text-[10px]`) duplicated everywhere
- No real design system, no toast/notification system, no skeletons, no modals
- Mobile experience is broken (4-column image grids, hidden table columns, cramped cards)
- Accessibility is critically poor (no `aria-label`s, no focus traps, no keyboard handling on toggles)
- Typography uses system fonts despite Geist font files being present but unused

### Target State
A **modern SaaS booking platform** inspired by Stripe, Linear, and Notion:
- **Soft neutral palette** with a refined primary accent
- **Generous whitespace** and strict 4/8/16/24/32/48/64 spacing scale
- **Geist font** activated globally for crisp readability
- **Clean card layouts** with subtle borders, not heavy shadows
- **Mobile-first** responsive behavior everywhere
- **Accessible by default**: ARIA labels, focus traps, keyboard navigation, screen-reader support
- **Smooth, purposeful animations** with skeleton loading states

---

## 2. Design Direction

### 2.1 Brand Color
We will evolve the Airbnb red into a **deeper, more premium rose/coral** (`#E11D48` → `rose-600`) that feels modern and less "clone." It maintains the warm hospitality feel while looking more unique.

### 2.2 Palette
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#E11D48` | CTAs, active states, badges, links |
| Primary Dark | `#BE123C` | Hover states |
| Primary Light | `#FDA4AF` | Subtle backgrounds, highlights |
| Neutral 900 | `#111827` | Primary text, headings |
| Neutral 700 | `#374151` | Secondary text |
| Neutral 500 | `#6B7280` | Muted text, placeholders |
| Neutral 200 | `#E5E7EB` | Borders, dividers |
| Neutral 100 | `#F3F4F6` | Subtle backgrounds |
| Neutral 50 | `#F9FAFB` | Page backgrounds, cards |
| Surface | `#FFFFFF` | Elevated cards |
| Success | `#10B981` | Confirmations, active status |
| Warning | `#F59E0B` | Pending states |
| Error | `#EF4444` | Errors, cancellations |

### 2.3 Typography
| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Display | 48–64px | 700 | 1.1 | Hero headlines |
| H1 | 32–40px | 700 | 1.2 | Page titles |
| H2 | 24–28px | 600 | 1.3 | Section headers |
| H3 | 18–20px | 600 | 1.4 | Card titles |
| Body | 15–16px | 400 | 1.6 | Paragraphs |
| Small | 13–14px | 500 | 1.5 | Labels, captions |
| Tiny | 12px | 500 | 1.4 | Metadata (minimum accessible size) |

**Rule**: Never use `text-[10px]`. Minimum is `text-xs` (12px).

### 2.4 Spacing Scale
Use Tailwind's default scale but enforce consistency:
- `p-4` (16px) — card padding base
- `p-6` (24px) — generous card padding
- `gap-4` (16px) — grid gaps
- `gap-6` (24px) — section gaps
- `py-12` (48px) — section vertical padding
- `py-16` (64px) — hero section padding

### 2.5 Shadows
| Token | Value | Usage |
|-------|-------|-------|
| shadow-sm | `0 1px 2px rgba(0,0,0,0.04)` | Subtle elevation |
| shadow | `0 1px 3px rgba(0,0,0,0.08)` | Cards |
| shadow-md | `0 4px 12px rgba(0,0,0,0.08)` | Hover elevation |
| shadow-lg | `0 8px 24px rgba(0,0,0,0.12)` | Modals, dropdowns |

### 2.6 Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| rounded-sm | 4px | Small buttons, tags |
| rounded-md | 6px | Inputs, small cards |
| rounded-lg | 8px | Buttons, badges |
| rounded-xl | 12px | Cards, panels |
| rounded-2xl | 16px | Large cards, modals |
| rounded-full | 9999px | Pills, avatars |

### 2.7 Animation Tokens
| Token | Duration | Usage |
|-------|----------|-------|
| duration-150 | 150ms | Hover states, micro-interactions |
| duration-200 | 200ms | UI changes, transitions |
| duration-300 | 300ms | Page transitions, modals |
| ease-out | cubic-bezier(0,0,0.2,1) | Entering elements |
| ease-in-out | cubic-bezier(0.4,0,0.2,1) | Standard transitions |

---

## 3. New Dependencies

```bash
# Accessible primitives (headless)
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tooltip @radix-ui/react-toast @radix-ui/react-slot

# Carousel for mobile galleries
npm install embla-carousel-react embla-carousel-autoplay

# Calendar for host availability
npm install react-day-picker date-fns

# Class variance authority + tailwind-merge (for component variants)
npm install class-variance-authority clsx tailwind-merge
```

> Note: `class-variance-authority` and `clsx` may already be present as transitive deps, but we will ensure they are direct deps.

---

## 4. Architecture Changes

### 4.1 Folder Structure
```
src/
├── app/
│   ├── (auth)/              # Route group: login, register, forgot-password
│   ├── (marketing)/         # Route group: homepage, about
│   ├── (dashboard)/         # Route group: host, admin, settings
│   ├── layout.tsx           # Root layout (Server Component)
│   └── globals.css
├── components/
│   ├── ui/                  # Primitive components (Button, Input, Badge, Skeleton, Toast, Dialog)
│   ├── layout/              # Navbar, Footer, Sidebar, Breadcrumb, MobileMenu
│   ├── forms/               # DateRangePicker, ToggleSwitch, SearchAutocomplete
│   ├── properties/          # PropertyCard, PropertyGallery, BookingWidget, SearchBar
│   ├── events/              # EventCard, EventGallery
│   ├── chat/                # ChatThread, MessageBubble, SessionList
│   ├── data-display/        # DataTable, Pagination, EmptyState, StatusBadge
│   └── providers/           # ClientProviders, ToastProvider, QueryProvider
├── hooks/
│   ├── use-leaflet-map.ts
│   ├── use-media-query.ts
│   ├── use-toast.ts
│   └── use-lock-body-scroll.ts
├── lib/
│   ├── api.ts
│   ├── types.ts
│   ├── utils.ts
│   └── design-tokens.ts     # Shared constants
├── store/
│   └── auth.ts
└── styles/
    └── animations.css       # Custom keyframes
```

### 4.2 Server Components Strategy
Reserve `"use client"` ONLY for:
- Forms with React Hook Form
- Interactive widgets (booking, chat, image uploaders, maps)
- Real-time sockets

Convert to Server Components where possible:
- Homepage shell, marketing pages
- Property listing initial data fetch
- Admin dashboard shell
- Static content in detail pages

---

## 5. Phase Breakdown

### Phase 1 — Design System Foundation
**Goal**: Tokens, utilities, font, and primitive components.

1. Update `tailwind.config.ts` with new color palette, font, shadows, radius, spacing utilities.
2. Activate **Geist font** in `layout.tsx` (load from existing `src/app/fonts/`).
3. Rewrite `globals.css`:
   - Remove unused `@layer components`
   - Add Firefox scrollbar support
   - Add selection theming
   - Import `animations.css`
4. Install new dependencies.
5. Build primitive UI components:
   - `Button` (CVA variants: primary, secondary, ghost, destructive; sizes: sm, md, lg)
   - `Input` (label, error, helperText, icon support)
   - `Badge` (unified role/status colors)
   - `Skeleton` (line, circle, card, text blocks)
   - `Toast` (Radix Toast with custom styling)
   - `Dialog` (Radix Dialog with focus trap)
   - `Avatar` (initials fallback, image support)
   - `EmptyState` (icon, title, description, CTA)
   - `ToggleSwitch` (accessible, keyboard, `role="switch"`)
6. Create `lib/design-tokens.ts` for shared constants.
7. Create `hooks/use-toast.ts` for global toast state.
8. Create `components/providers/ToastProvider.tsx`.

### Phase 2 — Global Shell & Navigation
**Goal**: Navbar, Footer, mobile menu, breadcrumbs.

1. **Navbar**:
   - Convert to partial Server Component (static links) with client auth state island.
   - Use `shadow-navbar` token.
   - Add `aria-label` to all icon buttons.
   - Mobile: slide-over panel with focus trap and Escape close.
   - Add global Command Palette search (Cmd+K) using a Dialog.
2. **Footer**:
   - Use `bg-neutral-900` token.
   - Clean 3-column layout with proper vertical rhythm.
   - Add legal links.
3. **Breadcrumb**:
   - Build reusable `Breadcrumb` component.
   - Add to detail pages and admin pages.
4. **Auth redirect logic**:
   - Remove `useEffect` redirects from pages; rely on middleware or route guards.

### Phase 3 — Public Pages (Homepage, Properties, Events)
**Goal**: Redesign the core user-facing experience.

1. **Homepage (`/`)**:
   - Hero: subtle dark overlay for text safety. Larger typography.
   - SearchBar: collapsible on mobile (icon opens overlay).
   - Property/Event grids: Skeleton loaders, better card spacing.
   - CTA Banner: richer background.
2. **Property Listing (`/properties`)**:
   - Sticky sidebar filters on desktop, slide-over on mobile.
   - Infinite scroll with skeleton placeholders.
   - EmptyState component for no results.
3. **Property Detail (`/properties/[id]`)**:
   - Image Gallery: Desktop = featured hero + thumbnail strip. Mobile = Embla Carousel.
   - Booking Widget: sticky on desktop, cleaner date picker.
   - Reviews: real avatars (initials), skeleton loading.
   - Map: rounded container, more height, directions button.
4. **Event Pages (`/events`, `/events/[id]`)**:
   - Cover image with gradient overlay for text safety.
   - Gallery carousel on mobile.
5. **Auth Pages (`/login`, `/register`, `/forgot-password`)**:
   - Centered card layout with cleaner forms.
   - Role selection with clear active states.
   - Add "Resend code" to forgot-password step 2.

### Phase 4 — Dashboards (Host, Admin, Bookings, Chat)
**Goal**: Fix tables, add calendars, improve data display.

1. **Host Dashboard (`/host/properties`)**:
   - Tables: Desktop = clean table with horizontal scroll if needed.
   - Mobile = card layout (never hide data columns).
2. **Availability (`/host/properties/[id]/availability`)**:
   - Replace date inputs with `react-day-picker` calendar.
   - Visually show blocked dates.
3. **Admin Dashboard (`/admin`)**:
   - Softer metric card colors.
   - Add charts (recharts) for trends if data supports it.
   - Mobile card layout for tables.
4. **Bookings (`/bookings`)**:
   - Status legend with icons + color (colorblind safe).
   - Mobile timeline cards.
5. **Chat (`/chat`)**:
   - Replace booking IDs with meaningful names.
   - Cleaner message bubbles.
   - Fixed input bar.

### Phase 5 — Accessibility & Polish
**Goal**: Audit and refine.

1. **Accessibility Audit**:
   - All icon-only buttons have `aria-label`.
   - All toggles use `role="switch"` with `aria-checked`.
   - Image `alt` text is descriptive.
   - Form errors linked via `aria-describedby`.
   - Focus visible states on all interactive elements.
   - Mobile menu focus trap + Escape handler.
2. **Responsive Audit**:
   - Test at 320px, 375px, 768px, 1024px, 1440px.
   - Touch targets ≥ 44×44px.
   - No horizontal overflow on tables/galleries.
3. **Performance**:
   - Convert static pages to Server Components.
   - Use Next.js `<Image>` with blur placeholders.
   - Add route transition indicator.
4. **Micro-interactions**:
   - Card hover: subtle lift + shadow.
   - Button hover: scale + color shift.
   - Link hover: underline animation.
   - Skeleton shimmer effect.

---

## 6. Component Specifications

### 6.1 Button
```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```
- Primary: `bg-primary text-white hover:bg-primary-dark`
- Secondary: `border border-neutral-200 bg-white hover:bg-neutral-50`
- Ghost: `hover:bg-neutral-100`
- Destructive: `bg-error text-white hover:bg-red-700`
- Loading state shows spinner, disables interaction.

### 6.2 Input
```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}
```
- Label always associated with input (`htmlFor`).
- Error text has `aria-live="polite"` and `aria-describedby` linking.
- Focus: `ring-2 ring-primary/20 border-primary`

### 6.3 Skeleton
```tsx
interface SkeletonProps {
  variant?: "text" | "circle" | "rect" | "card";
  lines?: number; // for text
  width?: string;
  height?: string;
  className?: string;
}
```
- Uses `animate-pulse` with `bg-neutral-200`.
- Card skeleton mimics real card dimensions.

### 6.4 Toast
```tsx
interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning";
  duration?: number;
}
```
- Position: bottom-right on desktop, top-center on mobile.
- Auto-dismiss with progress bar.
- Stacked notifications with `animate-slide-in`.

### 6.5 Dialog
```tsx
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```
- Built on Radix Dialog (focus trap, scroll lock, Escape close).
- Backdrop blur + `bg-neutral-900/40`.
- Entrance: `scale-95 opacity-0` → `scale-100 opacity-100`.

### 6.6 Avatar
```tsx
interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}
```
- Fallback: initials from name (e.g., "John Doe" → "JD").
- Sizes: sm(24px), md(32px), lg(40px), xl(64px).
- Background: `bg-primary/10 text-primary`.

### 6.7 EmptyState
```tsx
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}
```
- Centered layout with icon, bold title, muted description, optional CTA button.

### 6.8 ToggleSwitch
```tsx
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}
```
- `role="switch"`, `aria-checked`, keyboard handling (Space/Enter).
- Visual: pill track with sliding knob. Checked = `bg-primary`.

---

## 7. Page-by-Page UX Fixes

| Page | Key Fixes |
|------|-----------|
| `/` | Hero overlay, SearchBar mobile overlay, Skeleton loaders, better card spacing |
| `/properties` | Sticky filter sidebar, infinite scroll skeletons, EmptyState |
| `/properties/[id]` | Responsive gallery carousel, sticky booking widget, real avatars, rounded map |
| `/events` | Same filter pattern as properties, card improvements |
| `/events/[id]` | Cover gradient overlay, mobile gallery carousel |
| `/login` | Cleaner centered card, no `text-[10px]`, visible focus states |
| `/register` | Role cards with `aria-pressed`, better active state |
| `/forgot-password` | Add "Resend code", clearer step indicator |
| `/bookings` | Status legend with icons, mobile card layout |
| `/chat` | Meaningful session names, message bubbles, fixed input |
| `/host/properties` | Table → cards on mobile, horizontal scroll on desktop |
| `/host/properties/new` | Form grouping, step indicator if needed |
| `/host/properties/[id]/availability` | `react-day-picker` calendar, visual blocked dates |
| `/admin` | Softer metric colors, charts, breadcrumb |
| `/admin/users` | Mobile card layout, search/filter |
| `/admin/properties` | Same table → card treatment |
| `/admin/events` | Replace `alert()` with Toast |
| `/admin/activity-logs` | Date range filter, card layout on mobile |

---

## 8. Critical Accessibility Checklist

- [ ] All `<img>` have meaningful `alt` (not empty unless decorative)
- [ ] All icon-only `<button>` have `aria-label`
- [ ] Custom toggles have `role="switch"` + `aria-checked`
- [ ] Mobile menu has focus trap + Escape close + focus restoration
- [ ] Form errors linked via `aria-describedby`
- [ ] Color is never the sole means of conveying information (icons + text)
- [ ] Touch targets minimum 44×44px
- [ ] Focus visible states on all interactive elements
- [ ] `text-xs` (12px) is the smallest font size used
- [ ] Tables have `scope="col"` on headers
- [ ] Dialogs trap focus and lock scroll

---

## 9. Performance Checklist

- [ ] Convert static marketing content to Server Components
- [ ] Use Next.js `<Image>` with `priority` on hero images
- [ ] Add blur placeholders for images
- [ ] Implement route transition indicator
- [ ] Use `Suspense` boundaries around client components
- [ ] Lazy load Leaflet maps (already dynamic import; keep it)
- [ ] Code-split admin dashboard chunks

---

## 10. Migration Notes

- **Do not delete existing API logic** (`lib/api.ts`, `store/auth.ts`). Only refactor UI layer.
- **Preserve all route URLs** to avoid breaking bookmarks.
- **Preserve all mutation logic** (reviews, bookings, auth). Wrap with Toast feedback.
- **Incremental rollout**: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5.
- After each phase, verify build compiles (`next build`) with zero errors.

---

*This plan is a living document. Update it as decisions change during implementation.*
