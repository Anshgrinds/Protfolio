/**
 * Ansh Jha Portfolio - Interactive Engine
 * Pure Vanilla JavaScript: Canvas Particles, Interactive 3D Slider, Filter Tabs, Lightbox, Copy Email Toast
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dynamic Canvas Background (Constellation Nodes with Mouse Interaction)
  initInteractiveCanvas();

  // 2. Typing Role Rotator
  initTypewriter();

  // 3. Interactive 3D Viewport vs Render Slider
  initComparisonSlider();

  // 4. Portfolio Filter Tabs
  initPortfolioFilters();

  // 5. Lightbox Modal
  initLightbox();

  // 6. Copy Email Button with Toast
  initEmailCopy();

  // 7. Mobile Navigation Drawer
  initMobileNav();

  // 8. Card 3D Tilt Effect
  initTiltEffect();

  // 9. Smooth Scroll for Nav Links
  initSmoothScroll();
});

/* ========================================================
   1. Interactive Canvas Background
======================================================== */
function initInteractiveCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const particleCount = window.innerWidth < 768 ? 35 : 70;
  const maxDistance = 120;
  const mouse = { x: null, y: null, radius: 140 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.radius = Math.random() * 2 + 1;
      this.baseColor = Math.random() > 0.4 ? 'rgba(0, 242, 254, ' : 'rgba(79, 172, 254, ';
      this.alpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse collision repulsion
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const dirX = dx / dist;
          const dirY = dy / dist;
          this.x -= dirX * force * 2.5;
          this.y -= dirY * force * 2.5;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.baseColor + this.alpha + ')';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00f2fe';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const lineAlpha = (1 - dist / maxDistance) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 242, 254, ${lineAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Connect to mouse
    if (mouse.x !== null && mouse.y !== null) {
      for (let i = 0; i < particles.length; i++) {
        const dx = mouse.x - particles[i].x;
        const dy = mouse.y - particles[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const lineAlpha = (1 - dist / mouse.radius) * 0.35;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(138, 43, 226, ${lineAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ========================================================
   2. Typewriter Effect
======================================================== */
function initTypewriter() {
  const target = document.getElementById('typed-role');
  if (!target) return;

  const roles = [
    'Brand & Logo Designer',
    'Creative Web Developer',
    '3D Blender Modeler & Artist',
    'C++ & Robotics Enthusiast',
    'Unreal Game Systems Creator'
  ];

  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let speed = 90;

  function type() {
    const current = roles[roleIdx];
    if (isDeleting) {
      target.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      speed = 45;
    } else {
      target.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      speed = 90;
    }

    if (!isDeleting && charIdx === current.length) {
      isDeleting = true;
      speed = 1800; // Pause at full word
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      speed = 350; // Pause before new word
    }

    setTimeout(type, speed);
  }

  type();
}

/* ========================================================
   3. Interactive 3D Render vs Viewport Comparison Slider
======================================================== */
function initComparisonSlider() {
  const container = document.querySelector('.comparison-container');
  const slider = document.querySelector('.comparison-slider');
  const overlay = document.querySelector('.comparison-overlay');
  if (!container || !slider || !overlay) return;

  let isDragging = false;

  function updateSlider(x) {
    const rect = container.getBoundingClientRect();
    let pos = (x - rect.left) / rect.width;
    if (pos < 0.02) pos = 0.02;
    if (pos > 0.98) pos = 0.98;
    const percentage = pos * 100;
    overlay.style.width = `${percentage}%`;
    slider.style.left = `${percentage}%`;
  }

  slider.addEventListener('mousedown', () => (isDragging = true));
  window.addEventListener('mouseup', () => (isDragging = false));
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updateSlider(e.clientX);
  });

  // Touch support for mobile
  slider.addEventListener('touchstart', () => (isDragging = true));
  window.addEventListener('touchend', () => (isDragging = false));
  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    updateSlider(e.touches[0].clientX);
  });

  // Click anywhere on container to jump
  container.addEventListener('click', (e) => {
    updateSlider(e.clientX);
  });
}

/* ========================================================
   4. Portfolio Category Filter Tabs
======================================================== */
function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category.includes(filter)) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 30);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px) scale(0.96)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });
}

/* ========================================================
   5. Lightbox Modal for Artworks & Previews
======================================================== */
function initLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-image');
  const modalTitle = document.getElementById('lightbox-title');
  const modalDesc = document.getElementById('lightbox-desc');
  const closeBtn = document.querySelector('.lightbox-close');
  if (!modal || !modalImg) return;

  document.querySelectorAll('[data-lightbox]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const imgSrc = item.getAttribute('data-lightbox-src') || item.getAttribute('src');
      const title = item.getAttribute('data-lightbox-title') || 'Artwork Preview';
      const desc = item.getAttribute('data-lightbox-desc') || '';

      modalImg.src = imgSrc;
      if (modalTitle) modalTitle.textContent = title;
      if (modalDesc) modalDesc.textContent = desc;

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('lightbox-overlay')) {
      closeModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ========================================================
   6. Copy Email with Toast Notification
======================================================== */
function initEmailCopy() {
  const copyBtn = document.getElementById('copy-email-btn');
  const toast = document.getElementById('toast');
  const emailStr = 'anshgrind@gmail.com';
  if (!copyBtn) return;

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(emailStr).then(() => {
      showToast('Email copied to clipboard! 📋');
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = emailStr;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Email copied to clipboard! 📋');
    });
  });

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }
}

/* ========================================================
   7. Mobile Navigation Drawer
======================================================== */
function initMobileNav() {
  const toggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    toggle.classList.toggle('active');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.classList.remove('active');
    });
  });
}

/* ========================================================
   8. Subtle 3D Card Tilt on Mouse Move
======================================================== */
function initTiltEffect() {
  if (window.innerWidth < 992) return; // Skip on mobile for battery / performance

  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
}

/* ========================================================
   9. Smooth Scroll for Anchor Links
======================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
