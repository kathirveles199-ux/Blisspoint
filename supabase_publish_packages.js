
/* BLISSPOINT Holidays — live published packages with details modal
   Include after Supabase JS:
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script src="supabase_publish_packages.js"></script>
*/
(async function () {
  "use strict";

  const SUPABASE_URL = "https://zqpqdlaeifktfdwajaou.supabase.co";
  const SUPABASE_KEY = "sb_publishable_jKd0t6fRhdHPgzYM_C2BQg_1Ij39Gph";
  const WHATSAPP_NUMBER = "917639968597";
  const grid = document.querySelector("#packages .package-grid");

  if (!grid || !window.supabase) {
    console.error("Package grid or Supabase library not found.");
    return;
  }

  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  function ensureDetailsModal() {
    if (document.getElementById("packageDetailsModal")) return;

    const style = document.createElement("style");
    style.textContent = `
      .bp-details-backdrop {
        display: none;
        position: fixed;
        inset: 0;
        z-index: 100;
        background: #071d27c9;
        padding: 18px;
        overflow: auto;
        align-items: center;
        justify-content: center;
      }
      .bp-details-backdrop.show { display: flex; }
      .bp-details {
        position: relative;
        background: #fffdf7;
        color: #102b45;
        border-radius: 18px;
        width: min(760px, 100%);
        max-height: 92vh;
        overflow: auto;
        box-shadow: 0 25px 90px #0005;
      }
      .bp-details-close {
        position: sticky;
        float: right;
        top: 10px;
        margin: 10px 10px -48px 0;
        z-index: 2;
        border: 0;
        border-radius: 50%;
        width: 38px;
        height: 38px;
        background: #fff;
        font-size: 25px;
        cursor: pointer;
        box-shadow: 0 2px 12px #0002;
      }
      .bp-details-image {
        width: 100%;
        height: 260px;
        object-fit: cover;
        display: block;
        background: linear-gradient(135deg,#275d48,#9bbd8b,#214d58);
      }
      .bp-details-content { padding: 24px; }
      .bp-details-content h2 {
        font: 700 32px Georgia,serif;
        margin: 0 0 10px;
      }
      .bp-details-meta {
        font-size: 13px;
        font-weight: 750;
        color: #087b78;
        margin-bottom: 15px;
      }
      .bp-details-content p {
        white-space: pre-line;
        color: #526771;
        line-height: 1.7;
      }
      .bp-details-content h3 {
        font: 700 20px Georgia;
        margin: 22px 0 8px;
      }
      .bp-details-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 20px;
      }
      .bp-details-actions a {
        display: inline-flex;
        padding: 12px 17px;
        border-radius: 999px;
        background: #064e52;
        color: white;
        font-weight: 750;
      }
      .bp-details-actions a.secondary {
        background: #eaf3ed;
        color: #064e52;
      }
      .package-card[data-supabase-package] { cursor: pointer; }
      .package-card[data-supabase-package]:focus-visible {
        outline: 3px solid #087b78;
        outline-offset: 3px;
      }
      @media(max-width:600px) {
        .bp-details-backdrop { padding: 8px; }
        .bp-details-image { height: 190px; }
        .bp-details-content { padding: 19px; }
        .bp-details-content h2 { font-size: 27px; }
      }
    `;
    document.head.appendChild(style);

    const backdrop = document.createElement("div");
    backdrop.id = "packageDetailsModal";
    backdrop.className = "bp-details-backdrop";
    backdrop.innerHTML = `
      <section class="bp-details" role="dialog" aria-modal="true"
        aria-labelledby="bpDetailsTitle">
        <button type="button" class="bp-details-close"
          aria-label="Close details">×</button>
        <img class="bp-details-image" alt="" hidden>
        <div class="bp-details-content">
          <div class="kicker">BLISSPOINT Holidays</div>
          <h2 id="bpDetailsTitle"></h2>
          <div class="bp-details-meta"></div>
          <p class="bp-details-description"></p>
          <div class="bp-details-itinerary-wrap" hidden>
            <h3>Itinerary</h3>
            <p class="bp-details-itinerary"></p>
          </div>
          <div class="bp-details-actions"></div>
        </div>
      </section>
    `;
    document.body.appendChild(backdrop);

    const close = () => backdrop.classList.remove("show");

    backdrop.querySelector(".bp-details-close")
      .addEventListener("click", close);

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  function showDetails(pkg) {
    ensureDetailsModal();

    const modal = document.getElementById("packageDetailsModal");
    const title = pkg.title || pkg.destination || "Tour package";
    const img = modal.querySelector(".bp-details-image");

    img.hidden = !pkg.image_url;
    img.src = pkg.image_url || "";
    img.alt = title;
    img.onerror = () => { img.hidden = true; };

    modal.querySelector("#bpDetailsTitle").textContent = title;

    modal.querySelector(".bp-details-meta").textContent =
      [pkg.destination, pkg.duration, pkg.price]
        .filter(Boolean)
        .join(" · ") || "Customisable tour package";

    modal.querySelector(".bp-details-description").textContent =
      pkg.description ||
      "Contact us for package details and availability.";

    const itineraryWrap =
      modal.querySelector(".bp-details-itinerary-wrap");

    itineraryWrap.hidden = !pkg.itinerary;

    const itineraryText = Array.isArray(pkg.itinerary)
      ? pkg.itinerary.map((item) =>
          typeof item === "string"
            ? item
            : Object.values(item || {}).join(" — ")
        ).join("\n")
      : typeof pkg.itinerary === "object" && pkg.itinerary !== null
        ? JSON.stringify(pkg.itinerary, null, 2)
        : pkg.itinerary || "";

    modal.querySelector(".bp-details-itinerary").textContent =
      itineraryText;

    const actions = modal.querySelector(".bp-details-actions");
    actions.replaceChildren();

    if (pkg.brochure_url) {
      const brochure = document.createElement("a");
      brochure.className = "secondary";
      brochure.href = pkg.brochure_url;
      brochure.target = "_blank";
      brochure.rel = "noopener noreferrer";
      brochure.textContent = "View brochure ↗";
      actions.appendChild(brochure);
    }

    const message =
      `Hi BLISSPOINT Holidays! I'm interested in the ${title} package. Please share more details.`;

    const enquiry = document.createElement("a");
    enquiry.href =
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    enquiry.target = "_blank";
    enquiry.rel = "noopener noreferrer";
    enquiry.textContent = "Enquire on WhatsApp ↗";
    actions.appendChild(enquiry);

    modal.classList.add("show");
  }

  try {
    const { data, error } = await db
      .from("packages")
      .select(
        "id,title,slug,destination,duration,price,image_url,description,itinerary,brochure_url"
      )
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Use Supabase as the authoritative package list.
    // The original packages should already be migrated into the table.
    grid.replaceChildren();

    (data || []).forEach((pkg) => {
      const title = pkg.title || pkg.destination || "Tour package";

      const card = document.createElement("article");
      card.className = "package-card";
      card.dataset.supabasePackage = String(pkg.id);
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `View details for ${title}`);

      const art = document.createElement("div");
      art.className = "package-art";

      if (pkg.image_url) {
        const img = document.createElement("img");
        img.src = pkg.image_url;
        img.alt = title;
        img.loading = "lazy";
        img.style.cssText =
          "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;";
        img.onerror = () => img.remove();
        art.appendChild(img);
      }

      const overlay = document.createElement("div");
      overlay.style.cssText =
        "position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,30,48,.08),rgba(6,30,48,.68));z-index:0;pointer-events:none;";

      const destination = document.createElement("span");
      destination.className = "art-top";
      destination.textContent =
        pkg.destination || "BLISSPOINT Holidays";

      const heading = document.createElement("h3");
      heading.textContent = title;

      art.append(overlay, destination, heading);

      const info = document.createElement("div");
      info.className = "package-info";

      const meta = document.createElement("div");
      meta.className = "package-meta";
      meta.textContent =
        [pkg.duration, pkg.price]
          .filter(Boolean)
          .join(" · ") || "Customisable tour package";

      const description = document.createElement("p");
      description.textContent =
        pkg.description ||
        "Contact us for package details and availability.";

      const details = document.createElement("button");
      details.type = "button";
      details.className = "package-link";
      details.style.cssText =
        "border:0;background:none;padding:0;text-align:left;cursor:pointer;font:inherit;margin-top:10px;";
      details.textContent = "View full details ↗";

      info.append(meta, description, details);
      card.append(art, info);

      const open = () => showDetails(pkg);

      card.addEventListener("click", open);

      card.addEventListener("keydown", (e) => {
        if (
          e.target === card &&
          (e.key === "Enter" || e.key === " ")
        ) {
          e.preventDefault();
          open();
        }
      });

      details.addEventListener("click", (e) => {
        e.stopPropagation();
        open();
      });

      grid.appendChild(card);
    });
  } catch (error) {
    console.error("Unable to load published packages:", error);

    const message = document.createElement("p");
    message.className = "empty";
    message.textContent =
      "Our latest packages are temporarily unavailable. Please contact us on WhatsApp.";

    grid.appendChild(message);
  }
})();
