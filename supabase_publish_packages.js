
/* BLISSPOINT Holidays — Supabase public packages */

(async function () {
  "use strict";

  const SUPABASE_URL =
    "https://zqpqdlaeifktfdwajaou.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_jKd0t6fRhdHPgzYM_C2BQg_1Ij39Gph";

  const WHATSAPP_NUMBER = "917639968597";

  const grid = document.querySelector("#packages .package-grid");

  if (!grid || !window.supabase) {
    console.error("Package grid or Supabase library not found.");
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

    // Remove previous live cards
    grid.querySelectorAll("[data-supabase-package]")
      .forEach(card => card.remove());

    // Show a message if there are no published packages
    if (!data || data.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "New tour packages are coming soon.";
      grid.appendChild(empty);
      return;
    }

    data.forEach(pkg => {
      const title =
        pkg.title || pkg.destination || "Tour package";

      const card = document.createElement("article");
      card.className = "package-card";
      card.dataset.supabasePackage = String(pkg.id);

      // Package image
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
        info.appendChild(brochure);
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

      info.appendChild(enquiry);

      card.append(art, info);
      grid.appendChild(card);
    });

    console.log(
      `Successfully loaded ${data.length} published packages.`
    );

  } catch (error) {
    console.error(
      "Unable to load published packages:",
      error
    );

    const message = document.createElement("p");
    message.className = "empty";
    message.textContent =
      "Our latest packages are temporarily unavailable. Please contact us on WhatsApp.";

    grid.appendChild(message);
  }
})();
