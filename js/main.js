// R-Squared — shared site behavior

document.addEventListener("DOMContentLoaded", () => {
  // Mobile nav toggle
  const navbar = document.querySelector(".navbar");
  const toggle = document.querySelector(".nav-toggle");
  if (toggle && navbar) {
    toggle.addEventListener("click", () => {
      navbar.classList.toggle("open");
    });
    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => navbar.classList.remove("open"));
    });
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  // Hero stamp-line word cycle (typewriter effect)
  const cycleEl = document.querySelector(".cycle-word");
  if (cycleEl) {
    const words = ["Stats", "Analytics", "IT"];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      cycleEl.textContent = words[0];
    } else {
      let wordIndex = 0;
      let charIndex = 0;
      let deleting = false;

      const tick = () => {
        const current = words[wordIndex];
        if (!deleting) {
          charIndex++;
          cycleEl.textContent = current.slice(0, charIndex);
          if (charIndex === current.length) {
            deleting = true;
            setTimeout(tick, 1300);
            return;
          }
        } else {
          charIndex--;
          cycleEl.textContent = current.slice(0, charIndex);
          if (charIndex === 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % words.length;
          }
        }
        setTimeout(tick, deleting ? 55 : 90);
      };

      tick();
    }
  }

  // Logo marquee: repeat the logos until they span the screen, then loop seamlessly
  const SPEED = 50; // pixels per second
  const marquees = document.querySelectorAll("[data-marquee]");

  const buildMarquee = (marquee) => {
    const track = marquee.querySelector(".marquee-track");
    if (!track) return;
    track.querySelectorAll(".marquee-clone").forEach((c) => c.remove());

    const originals = [...track.children];
    const itemWidth = (el) => el.offsetWidth + parseFloat(getComputedStyle(el).marginRight || 0);
    const oneRound = originals.reduce((sum, el) => sum + itemWidth(el), 0);
    if (!oneRound) return;

    // one "set" must be at least as wide as the screen, then the set is doubled
    const reps = Math.max(1, Math.ceil(marquee.clientWidth / oneRound));
    const copy = (el) => {
      const c = el.cloneNode(true);
      c.classList.add("marquee-clone");
      c.setAttribute("aria-hidden", "true");
      c.querySelectorAll("a, button").forEach((n) => n.setAttribute("tabindex", "-1"));
      if (c.matches("a, button")) c.setAttribute("tabindex", "-1");
      return c;
    };
    for (let i = 0; i < reps * 2 - 1; i++) originals.forEach((el) => track.appendChild(copy(el)));

    track.style.setProperty("--marquee-duration", (oneRound * reps) / SPEED + "s");
    marquee.classList.add("is-ready");
  };

  if (marquees.length) {
    const buildAll = () => marquees.forEach(buildMarquee);
    if (document.readyState === "complete") buildAll();
    else window.addEventListener("load", buildAll); // wait for logo images to size themselves

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildAll, 200);
    });
  }

  // Footer year
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});
