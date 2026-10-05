/* BLISSPOINT Holidays — package cards and details modal */
(() => {
  "use strict";

  // Prevent this version from initializing more than once.
  if (window.blisspointPackagesLoaded) return;
  window.blisspointPackagesLoaded = true;

  const SUPABASE_URL = "https://zqpqdlaeifktfdwajaou.supabase.co";
  const SUPABASE_KEY = "sb_publishable_jKd0t6fRhdHPgzYM_C2BQg_1Ij39Gph";
  const WHATSAPP = "917639968597";

  const grid =
    document.querySelector("#packages .package-grid") ||
    document.querySelector(".package-grid");

  if (!grid) {
    console.error("Package grid not found.");
    return;
  }

  // Clear the old hardcoded cards immediately.
  grid.replaceChildren();

  if (!window.supabase) {
    grid.textContent = "Packages are temporarily unavailable.";
    console.error("Supabase library is missing.");
    return;
  }

  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  function addModalStyles() {
    if (document.getElementById("bp-modal-style")) return;

    const style = document.createElement("style");
    style.id = "bp-modal-style";
    style.textContent = `
      .bp-modal-overlay {
        display: none;
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: rgba(5, 20, 30, .75);
        padding: 16px;
        align-items: center;
        justify-content: center;
        overflow-y: auto;
      }
      .bp-modal-overlay.is-open { display: flex; }
      .bp-modal {
        width: min(720px, 100%);
        max-height: 92vh;
        overflow-y: auto;
        position: relative;
        background: #fffdf7;
        color: #102b45;
        border-radius: 18px;
        box-shadow: 0 20px 70px #0004;
      }
      .bp-modal-close {
        position: absolute;
        z-index: 2;
        top: 12px;
        right: 12px;
        width: 40px;
        height: 40px;
        border: 0;
        border-radius: 50%;
        background: white;
        color: #102b45;
        font-size: 26px;
        cursor: pointer;
      }
      .bp-modal-image {
        display: block;
        width: 100%;
        max-height: 330px;
        object-fit: cover;
      }
      .bp-modal-body { padding: 24px; }
      .bp-modal-body h2 {
        font: 700 30px Georgia, serif;
        margin: 0 0 12px;
      }
      .bp-modal-meta {
        color: #087b78;
        font-weight: 700;
        margin-bottom: 16px;
      }
      .bp-modal-body p {
        white-space: pre-line;
        line-height: 1.7;
        color: #526771;
      }
      .bp-modal-body h3 {
        font: 700 21px Georgia, serif;
        margin-top: 24px;
      }
      .bp-modal-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 22px;
      }
      .bp-modal-actions a {
        display: inline-block;
        border-radius: 30px;
        padding: 12px 18px;
        background: #07545a;
        color: white;
        text-decoration: none;
        font-weight: 700;
      }
      .bp-modal-actions a.secondary {
        background: #eaf3ed;
        color: #07545a;
      }
      .bp-package-card { cursor: pointer; }
      .bp-package-card:focus-visible,
      .bp-package-card button:focus-visible {
        outline: 3px solid #087b78;
        outline-offset: 3px;
      }
    `;
    document.head.appendChild(style);
  }

  function createModal() {
    addModalStyles();

    let overlay = document.getElementById("bp-package-modal");
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "bp-package-modal";
    overlay.className = "bp-modal-overlay";
    overlay.innerHTML = `
      <section class="bp-modal" role="dialog"
        aria-modal="true" aria-labelledby="bp-modal-title">
        <button class="bp-modal-close" type="button"
          aria-label="Close details">×</button>
        <img class="bp-modal-image" alt="" hidden>
        <div class="bp-modal-body">
          <h2 id="bp-modal-title"></h2>
          <div class="bp-modal-meta"></div>
          <p class="bp-modal-description"></p>
          <div class="bp-modal-itinerary" hidden>
            <h3>Tour itinerary</h3>
            <p></p>
          </div>
          <div class="bp-modal-actions"></div>
        </div>
      </section>
    `;
    document.body.appendChild(overlay);

    const close = () => {
      overlay.classList.remove("is-open");
    };

    overlay.querySelector(".bp-modal-close")
      .addEventListener("click", close);

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });

    return overlay;
  }

  function itineraryToText(value) {
    if (!value) return "";

    if (typeof value === "string") return value;

    if (Array.isArray(value)) {
      return value.map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          return Object.entries(item)
            .map(([key, val]) => `${key}: ${val}`)
            .join("\n");
        }
        return String(item);
      }).join("\n\n");
    }

    if (typeof value === "object") {
      return Object.entries(value)
        .map(([key, val]) => `${key}: ${
          typeof val === "object" ? JSON.stringify(val) : val
        }`)
        .join("\n\n");
    }

    return String(value);
  }

  function openDetails(pkg) {
    const modal = createModal();
    const title = pkg.title || pkg.destination || "Tour package";

    const image = modal.querySelector(".bp-modal-image");
    image.hidden = !pkg.image_url;
    image.removeAttribute("src");

    if (pkg.image_url) {
      image.src = pkg.image_url;
      image.alt = title;
      image.onerror = () => {
        image.hidden = true;
      };
    }

    modal.querySelector("#bp-modal-title").textContent = title;

    modal.querySelector(".bp-modal-meta").textContent = [
      pkg.destination,
      pkg.duration,
      pkg.price != null ? `₹${pkg.price}` : null
    ].filter(Boolean).join(" · ");

    modal.querySelector(".bp-modal-description").textContent =
      pkg.description || "Contact us for more package details.";

    const itinerary = itineraryToText(pkg.itinerary);
    const itineraryBox = modal.querySelector(".bp-modal-itinerary");
    itineraryBox.hidden = !itinerary;
    itineraryBox.querySelector("p").textContent = itinerary;

    const actions = modal.querySelector(".bp-modal-actions");
    actions.replaceChildren();

    if (pkg.brochure_url) {
      const brochure = document.createElement("a");
      brochure.href = pkg.brochure_url;
      brochure.target = "_blank";
      brochure.rel = "noopener noreferrer";
      brochure.className = "secondary";
      brochure.textContent = "View brochure";
      actions.appendChild(brochure);
    }

    const enquiry = document.createElement("a");
    const message =
      `Hi BLISSPOINT Holidays! I'm interested in ${title}. Please share more details.`;

    enquiry.href =
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
    enquiry.target = "_blank";
    enquiry.rel = "noopener noreferrer";
    enquiry.textContent = "Enquire on WhatsApp";
    actions.appendChild(enquiry);

    modal.classList.add("is-open");
  }

  function createCard(pkg) {
    const card = document.createElement("article");
    card.className = "package-card bp-package-card";

    const title = pkg.title || pkg.destination || "Tour package";

    const art = document.createElement("div");
    art.className = "package-art";

    if (pkg.image_url) {
      const image = document.createElement("img");
      image.src = pkg.image_url;
      image.alt = title;
      image.loading = "lazy";
      image.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;";
      image.onerror = () => image.remove();
      art.appendChild(image);
    }

    const destination = document.createElement("span");
    destination.className = "art-top";
    destination.textContent =
      `${pkg.destination || "Kerala"}${pkg.duration ? " · " + pkg.duration : ""}`;

    const heading = document.createElement("h3");
    heading.textContent = title;

    art.append(destination, heading);

    const info = document.createElement("div");
    info.className = "package-info";

    const meta = document.createElement("div");
    meta.className = "package-meta";
    meta.textContent = [
      pkg.duration,
      pkg.price != null ? `₹${pkg.price}` : null
    ].filter(Boolean).join(" · ");

    const description = document.createElement("p");
    description.textContent =
      pkg.description || "Contact us for package details.";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "package-link";
    button.textContent = "Explore this package ↗";
    button.addEventListener("click", () => openDetails(pkg));

    info.append(meta, description, button);
    card.append(art, info);

    // Clicking the card itself also opens details.
    card.addEventListener("click", (event) => {
      if (event.target.closest("a, button")) return;
      openDetails(pkg);
    });

    return card;
  }

  async function loadPackages() {
    try {
      const { data, error } = await db
        .from("packages")
        .select(
          "id,title,slug,destination,duration,price,description,itinerary,image_url,brochure_url"
        )
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      grid.replaceChildren();

      if (!data || data.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "No packages are available right now.";
        grid.appendChild(empty);
        return;
      }

      // Prevent duplicates if the database has repeated titles/slugs.
      const seen = new Set();

      data.forEach((pkg) => {
        const key = pkg.slug || pkg.title;
        if (seen.has(key)) return;
        seen.add(key);
        grid.appendChild(createCard(pkg));
      });
    } catch (error) {
      console.error("Package loading failed:", error);
      grid.replaceChildren();

      const message = document.createElement("p");
      message.textContent =
        "Packages are temporarily unavailable. Please contact us on WhatsApp.";
      grid.appendChild(message);
    }
  }

  loadPackages();
})();
