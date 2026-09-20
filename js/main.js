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

  // Newsletter form -> mailto fallback (no backend required)
  const nlForm = document.getElementById("newsletter-form");
  if (nlForm) {
    nlForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = nlForm.email.value.trim();
      const body = `Please add this email to the R-Squared newsletter:\n\n${email}`;
      window.location.href = `mailto:rsquared@iimsambalpur.ac.in?subject=${encodeURIComponent(
        "Newsletter subscription"
      )}&body=${encodeURIComponent(body)}`;

      const status = document.getElementById("newsletter-status");
      if (status) {
        status.textContent = "Opening your email client to send this request…";
      }
    });
  }

  // Contact form -> mailto fallback (no backend required)
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const subject = form.subject.value.trim() || "Message from R-Squared website";
      const message = form.message.value.trim();

      const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
      const mailto = `mailto:rsquared@iimsambalpur.ac.in?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;

      window.location.href = mailto;

      const status = document.getElementById("form-status");
      if (status) {
        status.textContent = "Opening your email client to send this message…";
      }
    });
  }
});
