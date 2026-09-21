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

  // Footer year
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});
