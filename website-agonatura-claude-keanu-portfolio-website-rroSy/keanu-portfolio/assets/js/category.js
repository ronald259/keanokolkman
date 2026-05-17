/* Category overzichtspagina logica */
(function () {
  window.renderCategory = function (categoryKey) {
    if (!KKAuth.requireAuth()) return;
    KKHeader.mount(categoryKey);
    KKFooter.mount();

    const cat = window.CATEGORIES[categoryKey];
    const items = KK.byCategory(categoryKey);
    const main = document.getElementById("main");
    const isPhotos = categoryKey === "fotos";

    main.innerHTML = `
      <section class="container page-head">
        <span class="eyebrow">Categorie</span>
        <h1>${KKUtil.escapeHTML(cat.label)}</h1>
        <p>${KKUtil.escapeHTML(cat.desc)}</p>
        <div class="filterbar">
          <div class="searchbar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted)">
              <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input id="search" type="search" placeholder="Zoek in ${cat.label.toLowerCase()}…" />
          </div>
          <button class="chip is-active" data-sort="newest">Nieuwste eerst</button>
          <button class="chip" data-sort="oldest">Oudste eerst</button>
          <button class="chip" data-sort="az">A → Z</button>
        </div>
      </section>

      <section class="container">
        <div id="grid" class="grid ${isPhotos ? 'grid--photos' : ''}"></div>
        <div id="empty" style="display:none; padding:60px 0; text-align:center; color:var(--text-muted);">
          Geen resultaten gevonden.
        </div>
      </section>
    `;

    const grid = document.getElementById("grid");
    const empty = document.getElementById("empty");
    const search = document.getElementById("search");
    let sortKey = "newest";

    function paint() {
      const q = (search.value || "").trim().toLowerCase();
      let arr = items.slice();
      if (q) {
        arr = arr.filter(m =>
          m.title.toLowerCase().includes(q) ||
          (m.tags || []).some(t => t.toLowerCase().includes(q)) ||
          m.description.toLowerCase().includes(q)
        );
      }
      if (sortKey === "newest") arr.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (sortKey === "oldest") arr.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
      if (sortKey === "az")     arr.sort((a,b) => a.title.localeCompare(b.title));

      grid.innerHTML = arr.map(KKCard.html).join("");
      empty.style.display = arr.length ? "none" : "block";
    }

    document.querySelectorAll("[data-sort]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-sort]").forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        sortKey = btn.getAttribute("data-sort");
        paint();
      });
    });
    search.addEventListener("input", paint);

    paint();
  };
})();
