
/* Blisspoint Holidays — Supabase public packages */

(async function () {
  "use strict";

  const SUPABASE_URL =
    "https://zqpqdlaeifktfdwajaou.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_jKd0t6fRhdHPgzYM_C2BQg_1Ij39Gph";

  const WHATSAPP_NUMBER = "917639968597";

  const grid = document.querySelector("#packages .package-grid");

  if (!grid || !window.supabase) {
    console.warn("Package grid or Supabase library not found.");
    return;
  }

  const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

  try {
    const { data, error } = await db
      .from("packages")
      .select(
        "id,title,slug,destination,duration,price,image_url,description,brochure_url"
      )
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Remove previously rendered live cards
    grid.querySelectorAll("[data-supabase-package]")
      .forEach(card => card.remove());

    (data || []).forEach(pkg => {
      const title = pkg.title || pkg.destination || "Tour package";

      const card = document.createElement("article");
      card.className = "package-card";
      card.dataset.supabasePackage = String(pkg.id);

      // Image area
      const art = document.createElement("div");
      art.className = "package-art";

      if (pkg.image_url) {
        art.style.backgroundImage =
          `linear-gradient(180deg,rgba(6,30,48,.08),rgba(6,30,48,.68)),url("${pkg.image_url.replace(/["\\]/g, "\\$&")}")`;

        art.style.backgroundPosition = "center";
        art.style.backgroundSize = "cover";
      }

      const destination = document.createElement("span");
      destination.className = "art-top";
      destination.textContent =
        pkg.destination || "BLISSPOINT Holidays";

      const heading = document.createElement("h3");
      heading.textContent = title;

      art.append(destination, heading);

      // Package information
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

      info.append(meta, description);

      // Brochure link
      if (pkg.brochure_url) {
        const brochure = document.createElement("a");
        brochure.className = "package-link";
        brochure.href = pkg.brochure_url;
        brochure.target = "_blank";
        brochure.rel = "noopener noreferrer";
        brochure.textContent = "View brochure ↗";
        info.append(brochure);
      }

      // WhatsApp enquiry
      const message =
        `Hi BLISSPOINT Holidays! I'm interested in the ${title} package. Please share more details.`;

      const enquiry = document.createElement("a");
      enquiry.className = "package-link";
      enquiry.style.display = "inline-block";
      enquiry.style.marginTop = "12px";
      enquiry.href =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      enquiry.target = "_blank";
      enquiry.rel = "noopener noreferrer";
      enquiry.textContent = "Enquire on WhatsApp ↗";

      info.append(enquiry);
      card.append(art, info);
      grid.appendChild(card);
    });

  } catch (error) {
    console.error(
      "Unable to load published packages:",
      error
    );
  }
})();
