/* =========================================================
   KEANO KOLKMAN — Shared app behavior
   Auth gate, header behavior, components, utilities.
   ========================================================= */

(function () {
  // ---------- DEMO AUTH ----------
  // In productie wordt dit een server-side sessie (PHP / Next.js).
  const AUTH_KEY = "kk_session";
  const DEMO_PASSWORDS = {
    admin:   "keano",   // demo: admin-wachtwoord
    visitor: "kijken",  // demo: bezoekerswachtwoord
  };

  function getSession() {
    try { return JSON.parse(sessionStorage.getItem(AUTH_KEY) || "null"); }
    catch { return null; }
  }
  function setSession(role) {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify({ role, at: Date.now() }));
  }
  function clearSession() { sessionStorage.removeItem(AUTH_KEY); }

  function requireAuth(opts = {}) {
    const s = getSession();
    if (!s) { window.location.href = "index.html"; return null; }
    if (opts.adminOnly && s.role !== "admin") { window.location.href = "home.html"; return null; }
    return s;
  }

  window.KKAuth = { getSession, setSession, clearSession, requireAuth, DEMO_PASSWORDS };

  // ---------- HEADER ----------
  function mountHeader(activeKey) {
    const host = document.getElementById("site-header");
    if (!host) return;
    const session = getSession();
    const isAdmin = session && session.role === "admin";

    host.innerHTML = `
      <header class="site-header" id="hdr">
        <div class="container site-header__inner">
          <a href="home.html" class="logo" aria-label="Keano Kolkman home">
            <span class="logo__mark">K</span>
            <span class="logo__text">
              Keano Kolkman
              <small>FILM · ANIMATIE · FOTO</small>
            </span>
          </a>
          <nav class="site-nav" aria-label="Hoofdmenu">
            ${navLink("home", "Home", "home.html", activeKey)}
            ${navLink("films", "Films", "films.html", activeKey)}
            ${navLink("animaties", "Animaties", "animaties.html", activeKey)}
            ${navLink("fotos", "Foto's", "fotos.html", activeKey)}
            ${navLink("projecten", "Projecten", "projecten.html", activeKey)}
          </nav>
          <div class="header-right">
            <button class="icon-btn" aria-label="Zoeken" data-search-btn>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </button>
            ${isAdmin ? `
              <a href="admin.html" class="btn btn--sm btn--outline" title="Adminomgeving">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20a8 8 0 1 0-8-8"/><path d="m12 12 4-2"/><circle cx="12" cy="12" r="2"/>
                </svg>
                Admin
              </a>` : ``}
            <div class="profile-chip" title="${isAdmin ? "Admin" : "Bezoeker"}">
              <span class="avatar">${isAdmin ? "KK" : "B"}</span>
              <span>${isAdmin ? "Keano" : "Bezoeker"}</span>
            </div>
            <button class="icon-btn" id="logout-btn" aria-label="Uitloggen" title="Uitloggen">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </header>
    `;
    const hdr = document.getElementById("hdr");
    const onScroll = () => {
      if (window.scrollY > 12) hdr.classList.add("is-scrolled");
      else hdr.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    document.getElementById("logout-btn").addEventListener("click", () => {
      clearSession();
      window.location.href = "index.html";
    });
  }
  function navLink(key, label, href, active) {
    return `<a href="${href}" class="${active === key ? "is-active" : ""}">${label}</a>`;
  }
  window.KKHeader = { mount: mountHeader };

  // ---------- FOOTER ----------
  function mountFooter() {
    const host = document.getElementById("site-footer");
    if (!host) return;
    host.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <span>© ${new Date().getFullYear()} Keano Kolkman — privé portfolioplatform</span>
          <span><a href="#">Privacy</a> · <a href="#">Contact</a></span>
        </div>
      </footer>
    `;
  }
  window.KKFooter = { mount: mountFooter };

  // ---------- CARD ----------
  function cardHTML(m) {
    const typeLabel = (window.CATEGORIES[m.category]?.label || "").toUpperCase();
    const isPhoto = m.category === "fotos";
    return `
      <a class="card card--${m.category.replace('fotos','foto').replace('animaties','animatie').replace('projecten','project').replace('films','film')}" href="media.html?id=${m.id}">
        <img class="card__img" loading="lazy" src="${m.thumb}" alt="${escapeHTML(m.title)}" />
        <div class="card__shade"></div>
        <button class="card__play" tabindex="-1" aria-hidden="true">
          ${isPhoto
            ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>`
            : `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`}
        </button>
        <div class="card__body">
          <span class="card__type"><span class="dot"></span> ${typeLabel} · ${escapeHTML(m.type)}</span>
          <h3 class="card__title">${escapeHTML(m.title)}</h3>
          <div class="card__meta">
            <span>${m.year}</span>
            <span>·</span>
            <span>${escapeHTML(m.duration)}</span>
          </div>
        </div>
      </a>
    `;
  }
  window.KKCard = { html: cardHTML };

  // ---------- CAROUSEL ----------
  function mountCarousel(rootEl) {
    const track = rootEl.querySelector(".carousel__track");
    const prev = rootEl.querySelector(".carousel__nav--prev");
    const next = rootEl.querySelector(".carousel__nav--next");
    if (!track || !prev || !next) return;
    const scrollBy = () => Math.round(track.clientWidth * 0.85);
    prev.addEventListener("click", () => track.scrollBy({ left: -scrollBy(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left:  scrollBy(), behavior: "smooth" }));
  }
  function rowHTML(opts) {
    const { title, count, moreHref, items, variant } = opts;
    return `
      <section class="row">
        <div class="container row__head">
          <div class="row__title">
            <h2>${escapeHTML(title)}</h2>
            <span class="count">${count ?? items.length}</span>
          </div>
          ${moreHref ? `<a class="row__more" href="${moreHref}">Bekijk alles →</a>` : ``}
        </div>
        <div class="carousel${variant ? " carousel--" + variant : ""}">
          <button class="carousel__nav carousel__nav--prev" aria-label="Vorige">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="carousel__track container">
            ${items.map(window.KKCard.html).join("")}
          </div>
          <button class="carousel__nav carousel__nav--next" aria-label="Volgende">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </section>
    `;
  }
  window.KKRow = { html: rowHTML, mount: mountCarousel };

  // ---------- UTIL ----------
  function escapeHTML(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  }
  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }
  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  }
  window.KKUtil = { escapeHTML, qs, formatDate };
})();
