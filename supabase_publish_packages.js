(async function () {
  "use strict";

  const SUPABASE_URL = "https://zqpqdlaeifktfdwajaou.supabase.co";
  const SUPABASE_KEY = "sb_publishable_jKd0t6fRhdHPgzYM_C2BQg_1Ij39Gph";

  const grid = document.querySelector("#packages .package-grid");
  if (!grid || !window.supabase) {
    console.error("Package grid or Supabase library not found.");
    return;
  }

  // Remove hardcoded homepage cards and any previous dynamic cards.
  grid.replaceChildren();

  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  function makeCard(pkg) {
    const card = document.createElement("a");
    card.className = "package-card";
    card.href = `package-details.html?slug=${encodeURIComponent(pkg.slug)}`;
    card.setAttribute("aria-label", `View ${pkg.title}`);

    const art = document.createElement("div");
    art.className = "package-art";

    if (pkg.image_url) {
      art.style.backgroundImage =
        `linear-gradient(180deg,#061e3020,#061e30a8),url("${pkg.image_url}")`;
      art.style.backgroundSize = "cover";
      art.style.backgroundPosition = "center";
    }

    const top = document.createElement("span");
    top.className = "art-top";
    top.textContent = [
      pkg.destination || "",
      pkg.duration || ""
    ].filter(Boolean).join(" · ");

    const heading = document.createElement("h3");
    heading.textContent = pkg.title || pkg.destination || "Tour package";

    art.append(top, heading);

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

    const link = document.createElement("span");
    link.className = "package-link";
    link.textContent = "Explore this package ↗";

    info.append(meta, description, link);
    card.append(art, info);

    return card;
  }

  try {
    const { data, error } = await db
      .from("packages")
      .select("id,title,slug,destination,duration,price,description,image_url")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    grid.replaceChildren();

    // Avoid duplicate records with the same slug.
    const unique = new Map();
    (data || []).forEach(pkg => {
      if (pkg.slug && !unique.has(pkg.slug)) {
        unique.set(pkg.slug, pkg);
      }
    });

    if (unique.size === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "New tour packages are coming soon.";
      grid.appendChild(empty);
      return;
    }

    unique.forEach(pkg => grid.appendChild(makeCard(pkg)));

  } catch (error) {
    console.error("Package loading error:", error);
    grid.replaceChildren();

    const message = document.createElement("p");
    message.className = "empty";
    message.textContent =
      "Packages are temporarily unavailable. Please contact us on WhatsApp.";
    grid.appendChild(message);
  }
})();
