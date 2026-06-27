
---

## 2026-06-27 — Day 5 (continued): Portal switcher (coach is also a member)

### Need
A coach is also a customer who books other coaches, but the Navbar derived a single
dashboard from the single `role`, so a coach only ever saw the Coach Portal.

### Approach (lightweight, no schema change)
`/member/*` is already open to any authenticated user (middleware only gates /coach and
/admin) and the member layout has no role check — so a coach can already use member
features; only the navigation was missing.

Added a "Switch portal" section to the Navbar dropdown + mobile menu listing every portal
the user holds:
- admin → Admin Dashboard + Member View
- coach → Coach Portal + Member View
- student → single Dashboard (unchanged) + Become a Coach

Single `role` still decides the primary portal and elevated access; the switcher just
surfaces the member view everyone already has. A true multi-role model (roles array +
JWT + guards) was considered and deferred as unnecessary for MVP.

### Deploy
Frontend only — Vercel (git push). No backend, no db push.
