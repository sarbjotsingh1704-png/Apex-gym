/**
 * APEX GYM — script.js
 * All interactive features for the gym website.
 */

/* ══════════════════════════════════════════════
   1. LOADING SCREEN
══════════════════════════════════════════════ */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  // Minimum display of 2 seconds for loader experience
  setTimeout(() => {
    loader.classList.add('hidden');
    // Once loader done, trigger scroll reveals for visible elements
    setTimeout(triggerInitialReveal, 300);
  }, 2000);
});

/* ══════════════════════════════════════════════
   2. NAVBAR — sticky + scroll highlight
══════════════════════════════════════════════ */
const navbar    = document.getElementById('navbar');
const navLinks  = document.querySelectorAll('.nav-link');
const sections  = document.querySelectorAll('section[id]');
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navLinks');

// Sticky navbar on scroll
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  updateActiveNavLink();
  toggleBackToTop();
  triggerScrollReveal();
});

// Active nav link on scroll
function updateActiveNavLink() {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 100;
    if (window.scrollY >= top) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

// Mobile hamburger menu
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMenu.classList.toggle('open');
});

// Close menu when a nav link is clicked
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
  });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
  }
});

/* ══════════════════════════════════════════════
   3. BACK TO TOP
══════════════════════════════════════════════ */
const backToTopBtn = document.getElementById('backToTop');

function toggleBackToTop() {
  if (window.scrollY > 500) {
    backToTopBtn.classList.add('show');
  } else {
    backToTopBtn.classList.remove('show');
  }
}

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ══════════════════════════════════════════════
   4. SCROLL REVEAL ANIMATIONS
══════════════════════════════════════════════ */
const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

function triggerScrollReveal() {
  const windowHeight = window.innerHeight;
  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < windowHeight - 80) {
      el.classList.add('visible');
      // Start counter if it's a stat
      checkCounter(el);
    }
  });
}

function triggerInitialReveal() {
  triggerScrollReveal();
}

/* ══════════════════════════════════════════════
   5. COUNTER ANIMATION
══════════════════════════════════════════════ */
const countersStarted = new Set();

function checkCounter(el) {
  const counter = el.querySelector?.('.stat-num') || (el.classList.contains('stat-num') ? el : null);
  if (!counter) return;
  if (countersStarted.has(counter)) return;
  countersStarted.add(counter);
  animateCounter(counter);
}

// Also watch stat cards directly
document.querySelectorAll('.stat-card').forEach(card => {
  const counter = card.querySelector('.stat-num');
  if (!counter) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersStarted.has(counter)) {
        countersStarted.add(counter);
        animateCounter(counter);
        observer.unobserve(card);
      }
    });
  }, { threshold: 0.5 });

  observer.observe(card);
});

function animateCounter(el) {
  const target    = parseInt(el.dataset.target, 10);
  const duration  = 1800;
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed  = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Eased progress (ease-out cubic)
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target.toLocaleString();
    }
  }
  requestAnimationFrame(step);
}

/* ══════════════════════════════════════════════
   6. TESTIMONIAL CAROUSEL
══════════════════════════════════════════════ */
const track      = document.getElementById('testimonialTrack');
const slides     = track ? track.querySelectorAll('.testimonial-slide') : [];
const dotsWrap   = document.getElementById('carouselDots');
const prevBtn    = document.getElementById('prevBtn');
const nextBtn    = document.getElementById('nextBtn');
let   currentSlide = 0;
let   autoplayTimer;

if (slides.length > 0) {
  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  });

  function goToSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    document.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentSlide);
    });
  }

  function nextSlide() { goToSlide(currentSlide + 1); }
  function prevSlide() { goToSlide(currentSlide - 1); }

  nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
  prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });

  // Touch swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSlide() : prevSlide();
      resetAutoplay();
    }
  });

  // Autoplay
  function startAutoplay() {
    autoplayTimer = setInterval(nextSlide, 5000);
  }
  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }
  startAutoplay();
}

/* ══════════════════════════════════════════════
   7. BMI CALCULATOR
══════════════════════════════════════════════ */
const calcBtn    = document.getElementById('calcBMI');
const heightInp  = document.getElementById('bmiHeight');
const weightInp  = document.getElementById('bmiWeight');
const bmiScore   = document.getElementById('bmiScore');
const bmiCatEl   = document.getElementById('bmiCategory');
const bmiMarker  = document.getElementById('bmiMarker');
const bmiCats    = document.querySelectorAll('.bmi-cat');

if (calcBtn) {
  calcBtn.addEventListener('click', calculateBMI);
  [heightInp, weightInp].forEach(inp => {
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') calculateBMI();
    });
  });
}

function calculateBMI() {
  const h = parseFloat(heightInp.value);
  const w = parseFloat(weightInp.value);

  if (!h || !w || h <= 0 || w <= 0 || h > 300 || w > 500) {
    bmiScore.textContent   = '!';
    bmiCatEl.textContent   = 'Enter valid values';
    bmiScore.style.color   = 'var(--red)';
    return;
  }

  const hm  = h / 100;
  const bmi = w / (hm * hm);
  const rounded = Math.round(bmi * 10) / 10;

  bmiScore.textContent = rounded.toFixed(1);

  let category, color, range, markerPct;

  if (bmi < 18.5) {
    category  = 'Underweight';
    color     = '#4fc3f7';
    range     = 'underweight';
    markerPct = Math.min((bmi / 18.5) * 22, 22);
  } else if (bmi < 25) {
    category  = 'Normal Weight';
    color     = 'var(--accent)';
    range     = 'normal';
    markerPct = 22 + ((bmi - 18.5) / 6.5) * 26;
  } else if (bmi < 30) {
    category  = 'Overweight';
    color     = 'var(--orange)';
    range     = 'overweight';
    markerPct = 48 + ((bmi - 25) / 5) * 26;
  } else {
    category  = 'Obese';
    color     = 'var(--red)';
    range     = 'obese';
    markerPct = Math.min(74 + ((bmi - 30) / 10) * 26, 96);
  }

  bmiCatEl.textContent    = category;
  bmiScore.style.color    = color;
  bmiCatEl.style.color    = color;
  bmiMarker.style.left    = `${markerPct}%`;

  // Highlight category card
  bmiCats.forEach(cat => {
    cat.classList.toggle('active', cat.dataset.range === range);
  });
}

/* ══════════════════════════════════════════════
   8. CONTACT FORM
══════════════════════════════════════════════ */
const contactForm   = document.getElementById('contactForm');
const formSuccess   = document.getElementById('formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name    = contactForm.querySelector('[name="name"]').value.trim();
    const email   = contactForm.querySelector('[name="email"]').value.trim();
    const message = contactForm.querySelector('[name="message"]').value.trim();

    if (!name || !email) {
      // Simple validation shake
      contactForm.querySelectorAll('input').forEach(inp => {
        if (!inp.value.trim()) {
          inp.style.borderColor = 'var(--red)';
          inp.style.animation   = 'shake 0.3s ease';
          setTimeout(() => {
            inp.style.animation = '';
            inp.style.borderColor = '';
          }, 600);
        }
      });
      return;
    }

    // Simulate submit
    const submitBtn = contactForm.querySelector('[type="submit"]');
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled    = true;

    setTimeout(() => {
      contactForm.reset();
      submitBtn.textContent = 'Send Message';
      submitBtn.innerHTML   = 'Send Message <i class="fa-solid fa-paper-plane"></i>';
      submitBtn.disabled    = false;
      formSuccess.classList.add('show');
      setTimeout(() => formSuccess.classList.remove('show'), 5000);
    }, 1200);
  });
}

/* ══════════════════════════════════════════════
   9. PARALLAX SCROLLING (subtle)
══════════════════════════════════════════════ */
const heroGridLines = document.querySelector('.hero-grid-lines');

window.addEventListener('scroll', () => {
  if (!heroGridLines) return;
  const scrolled = window.scrollY;
  // Parallax for hero elements
  if (scrolled < window.innerHeight) {
    const factor = scrolled * 0.3;
    document.querySelector('.hero-content').style.transform = `translateY(${factor}px)`;
  }
}, { passive: true });

/* ══════════════════════════════════════════════
   10. SMOOTH SCROLLING for anchor links
══════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ══════════════════════════════════════════════
   11. GALLERY ITEM hover ripple
══════════════════════════════════════════════ */
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const label = item.querySelector('.gallery-placeholder span')?.textContent || 'Gallery';
    // Visual feedback
    item.style.outline = '3px solid var(--accent)';
    setTimeout(() => { item.style.outline = ''; }, 600);
  });
});

/* ══════════════════════════════════════════════
   12. PROGRAM CARD mouse-track tilt effect
══════════════════════════════════════════════ */
document.querySelectorAll('.program-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect   = card.getBoundingClientRect();
    const cx     = rect.left + rect.width / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) / (rect.width / 2);
    const dy     = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `translateY(-4px) rotateX(${-dy * 3}deg) rotateY(${dx * 3}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ══════════════════════════════════════════════
   13. PRICING CARDS — hover scale (already CSS,
       but add glitter burst on hover)
══════════════════════════════════════════════ */
document.querySelectorAll('.pricing-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.boxShadow = '0 24px 80px rgba(200,245,62,0.08)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.boxShadow = '';
  });
});

/* ══════════════════════════════════════════════
   14. CSS KEYFRAME injection for shake
══════════════════════════════════════════════ */
(function injectKeyframes() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);
})();

/* ══════════════════════════════════════════════
   15. INIT — run once on DOMContentLoaded
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Set up initial reveal check after a short delay
  // (loader is still showing; main reveal happens in load event)
  setTimeout(triggerScrollReveal, 100);
});
