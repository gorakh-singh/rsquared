// Team + Alumni pages: optionally load people from a published Google Sheet (CSV).
// Set window.SHEET_URL in js/config.js to enable it. If it's empty, or the
// sheet can't be loaded, the cards already written in the HTML are left alone.
//
// Sheet columns (row 1 = headers): Group, Name, Role, LinkedIn, Photo, Batch
//   Group    Faculty | Executive | BS | Junior | Alumni
//   Photo    a filename inside assets/team/ (optional; initials are used if blank)
//   Batch    optional, shown after the role for alumni (e.g. "2023-25")

(function () {
  const CONTAINERS = {
    faculty: "team-faculty",
    executive: "team-exec",
    bs: "team-bs",
    junior: "team-junior",
    alumni: "alumni-list",
  };

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else inQuotes = false;
        } else field += c;
      } else if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field); rows.push(row); row = []; field = "";
      } else field += c;
    }
    if (field !== "" || row.length) { row.push(field); rows.push(row); }
    return rows.filter((r) => r.some((f) => f.trim() !== ""));
  }

  function groupKey(value) {
    const g = (value || "").trim().toLowerCase();
    if (g.startsWith("fac")) return "faculty";
    if (g.startsWith("exec")) return "executive";
    if (g.startsWith("bs")) return "bs";
    if (g.startsWith("jun")) return "junior";
    if (g.startsWith("alu")) return "alumni";
    return null;
  }

  function toPeople(rows) {
    if (rows.length < 2) return [];
    const header = rows[0].map((h) => h.trim().toLowerCase());
    const col = (name) => header.indexOf(name);
    const c = { group: col("group"), name: col("name"), role: col("role"), linkedin: col("linkedin"), photo: col("photo"), batch: col("batch") };
    if (c.group < 0 || c.name < 0) return [];
    return rows.slice(1).map((r) => ({
      group: groupKey(r[c.group]),
      name: (r[c.name] || "").trim(),
      role: c.role >= 0 ? (r[c.role] || "").trim() : "",
      linkedin: c.linkedin >= 0 ? (r[c.linkedin] || "").trim() : "",
      photo: c.photo >= 0 ? (r[c.photo] || "").trim() : "",
      batch: c.batch >= 0 ? (r[c.batch] || "").trim() : "",
    })).filter((p) => p.group && p.name);
  }

  function initials(name) {
    const words = name.split(/\s+/).filter(Boolean);
    return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function makeCard(p) {
    const card = el("div", "team-card");

    const avatar = el("div", "avatar", initials(p.name));
    const photo = p.photo.split(/[\\/]/).pop();
    if (photo) {
      const img = document.createElement("img");
      img.src = "assets/team/" + encodeURIComponent(photo);
      img.alt = p.name;
      img.addEventListener("error", () => { avatar.textContent = initials(p.name); });
      avatar.textContent = "";
      avatar.appendChild(img);
    }
    card.appendChild(avatar);

    card.appendChild(el("h4", "", p.name));
    if (p.role) card.appendChild(el("p", "role", p.role));

    if (/^https?:\/\//i.test(p.linkedin)) {
      const socials = el("div", "socials");
      const a = el("a", "", "in");
      a.href = p.linkedin;
      a.target = "_blank";
      a.rel = "noopener";
      a.setAttribute("aria-label", "LinkedIn");
      socials.appendChild(a);
      card.appendChild(socials);
    }
    return card;
  }

  function makeAlumniRow(p) {
    const row = el("div", "alumni-item");
    const info = document.createElement("div");
    info.appendChild(el("h4", "", p.name));
    const detail = [p.role, p.batch].filter(Boolean).join(", ");
    if (detail) info.appendChild(el("span", "role", detail));
    row.appendChild(info);

    if (/^https?:\/\//i.test(p.linkedin)) {
      const a = el("a", "li-link", "LinkedIn ↗");
      a.href = p.linkedin;
      a.target = "_blank";
      a.rel = "noopener";
      row.appendChild(a);
    }
    return row;
  }

  function render(people) {
    Object.keys(CONTAINERS).forEach((key) => {
      const container = document.getElementById(CONTAINERS[key]);
      if (!container) return;
      const members = people.filter((p) => p.group === key);
      if (!members.length) {
        const section = container.closest("section");
        if (section) section.hidden = true;
        return;
      }
      container.replaceChildren(...members.map(key === "alumni" ? makeAlumniRow : makeCard));
    });
  }

  async function loadTeamFromSheet(url) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const people = toPeople(parseCsv(await res.text()));
      if (!people.length) throw new Error("no valid rows (need Group and Name columns)");
      render(people);
    } catch (err) {
      console.warn("Team sheet not loaded, keeping static cards:", err.message);
    }
  }

  window.loadTeamFromSheet = loadTeamFromSheet;

  document.addEventListener("DOMContentLoaded", () => {
    if (window.SHEET_URL) loadTeamFromSheet(window.SHEET_URL);
  });
})();
