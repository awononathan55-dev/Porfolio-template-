(function () {
  "use strict";

  /* ---------- Mobile nav ---------- */
  const burger = document.getElementById("burger");
  const menu = document.getElementById("menu");

  burger.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    burger.classList.toggle("is-open", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll(".menu__link").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      menu.querySelectorAll(".menu__link").forEach((l) => l.classList.remove("is-active"));
      link.classList.add("is-active");
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------- Animated stats counters ---------- */
  const statEls = document.querySelectorAll("[data-count]");
  const animateCount = (el) => {
    const target = parseInt(el.getAttribute("data-count"), 10);
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };
  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  statEls.forEach((el) => statsObserver.observe(el));

  /* ---------- Testimonials slider ---------- */
  const testimonials = [
    {
      text: "L'équipe de A.BÂT INGÉNIERIE a su concrétiser notre rêve. Professionnalisme, qualité et respect des délais. Je recommande vivement !",
      name: "Jean Pierre M.",
      role: "Client - Yaoundé",
      avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=100&q=80",
    },
    {
      text: "Un chantier livré dans les délais et un accompagnement impeccable du premier plan jusqu'à la remise des clés.",
      name: "Aïcha N.",
      role: "Cliente - Douala",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80",
    },
    {
      text: "Un vrai savoir-faire technique et une équipe à l'écoute. Notre immeuble commercial a dépassé nos attentes.",
      name: "Paul E.",
      role: "Client - Bafoussam",
      avatar: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?auto=format&fit=crop&w=100&q=80",
    },
  ];

  const testimonialText = document.getElementById("testimonialText");
  const testimonialName = document.getElementById("testimonialName");
  const testimonialRole = document.getElementById("testimonialRole");
  const testimonialAvatar = document.getElementById("testimonialAvatar");
  const dotsWrap = document.getElementById("testimonialDots");
  let activeIndex = 0;
  let autoTimer;

  function renderTestimonial(index) {
    const t = testimonials[index];
    testimonialText.textContent = t.text;
    testimonialName.textContent = t.name;
    testimonialRole.textContent = t.role;
    testimonialAvatar.src = t.avatar;
    dotsWrap.querySelectorAll("button").forEach((btn, i) => {
      btn.classList.toggle("is-active", i === index);
    });
  }

  function buildDots() {
    dotsWrap.innerHTML = "";
    testimonials.forEach((_, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", `Témoignage ${i + 1}`);
      btn.addEventListener("click", () => {
        activeIndex = i;
        renderTestimonial(activeIndex);
        restartAutoplay();
      });
      dotsWrap.appendChild(btn);
    });
  }

  function restartAutoplay() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      activeIndex = (activeIndex + 1) % testimonials.length;
      renderTestimonial(activeIndex);
    }, 6000);
  }

  buildDots();
  renderTestimonial(activeIndex);
  restartAutoplay();

  /* ---------- Devis modal ---------- */
  const devisModal = document.getElementById("devisModal");
  const openDevisBtn = document.getElementById("openDevisModal");

  function openModal(modal) {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeModal(modal) {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  openDevisBtn.addEventListener("click", () => openModal(devisModal));
  devisModal.querySelectorAll("[data-close-modal]").forEach((el) =>
    el.addEventListener("click", () => closeModal(devisModal))
  );

  /* ---------- Video modal ---------- */
  const videoModalBox = document.getElementById("videoModalBox");
  const playBtn = document.getElementById("playBtn");

  playBtn.addEventListener("click", () => openModal(videoModalBox));
  videoModalBox.querySelectorAll("[data-close-video]").forEach((el) =>
    el.addEventListener("click", () => closeModal(videoModalBox))
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal(devisModal);
      closeModal(videoModalBox);
    }
  });

  /* ---------- Devis form submission ---------- */
  const devisForm = document.getElementById("devisForm");
  const devisMsg = document.getElementById("devisMsg");

  devisForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = devisForm.querySelector(".devis-form__submit");
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = "Envoi en cours...";
    submitBtn.disabled = true;
    devisMsg.textContent = "";
    devisMsg.className = "form-msg";

    const payload = Object.fromEntries(new FormData(devisForm).entries());

    try {
      const res = await fetch("/api/devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");

      devisMsg.textContent = "Merci ! Votre demande a bien été envoyée.";
      devisMsg.classList.add("success");
      devisForm.reset();
      setTimeout(() => closeModal(devisModal), 1800);
    } catch (err) {
      devisMsg.textContent = err.message || "Impossible d'envoyer la demande. Réessayez.";
      devisMsg.classList.add("error");
    } finally {
      submitBtn.textContent = originalLabel;
      submitBtn.disabled = false;
    }
  });

  /* ---------- Newsletter form submission ---------- */
  const newsletterForm = document.getElementById("newsletterForm");
  const newsletterMsg = document.getElementById("newsletterMsg");

  newsletterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    newsletterMsg.textContent = "";
    newsletterMsg.className = "form-msg";
    const payload = Object.fromEntries(new FormData(newsletterForm).entries());

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");

      newsletterMsg.textContent = "Inscription réussie !";
      newsletterMsg.classList.add("success");
      newsletterForm.reset();
    } catch (err) {
      newsletterMsg.textContent = err.message || "Impossible de vous inscrire.";
      newsletterMsg.classList.add("error");
    }
  });

  /* ---------- Nav shadow / active link on scroll ---------- */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".menu__link");
  window.addEventListener("scroll", () => {
    let current = sections[0] ? sections[0].id : "";
    sections.forEach((section) => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) current = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${current}`);
    });
  });
})();
