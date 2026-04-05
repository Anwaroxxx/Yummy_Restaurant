function toast(msg, type = 'success') {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.classList.add('show'), 10);
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

function animateCount(el, target) {
  const startTime = performance.now();
  const duration = 2000;
  function step(now) {
    const p = Math.min((now - startTime) / duration, 1);
    el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

const counters = document.querySelectorAll('.stats h2');
const statsSection = document.querySelector('.statistics');
let statsStarted = false;

if (statsSection) {
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !statsStarted) {
      statsStarted = true;
      counters.forEach(el => animateCount(el, parseInt(el.textContent)));
    }
  }, { threshold: 0.4 }).observe(statsSection);
}

const categoryBtns = document.querySelectorAll('.categories div');
const menuItems = document.querySelectorAll('.menuItems .items');
const categoryTitle = document.querySelector('.categoriesName span');

categoryBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const cat = btn.dataset.category;
    categoryTitle.textContent = cat === 'all' ? 'STARTERS' : cat.toUpperCase();

    menuItems.forEach(item => {
      const show = cat === 'all' || item.dataset.category === cat;
      if (show) {
        item.classList.remove('hide');
        item.style.display = 'flex';
      } else {
        item.classList.add('hide');
        setTimeout(() => { if (item.classList.contains('hide')) item.style.display = 'none'; }, 300);
      }
    });
  });
});

(function testimonialsCarousel() {
  const root = document.querySelector('.testimonials');
  if (!root) return;

  const track = root.querySelector('.track');
  const dots = root.querySelectorAll('.dot');
  const total = dots.length;
  let cur = 0, busy = false, timer;

  function go(n) {
    if (busy) return;
    busy = true;
    cur = (n + total) % total;
    track.style.transform = `translateX(-${cur * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === cur));
    setTimeout(() => { busy = false; }, 600);
  }

  function reset() {
    clearInterval(timer);
    timer = setInterval(() => go(cur + 1), 6000);
  }

  dots.forEach((d, i) => d.addEventListener('click', () => { go(i); reset(); }));
  root.addEventListener('mouseenter', () => clearInterval(timer));
  root.addEventListener('mouseleave', reset);
  
  // Initial state
  if (dots.length > 0) dots[0].classList.add('active');
  reset();
})();

function multiCarousel(selector, delay) {
  const root = document.querySelector(selector);
  if (!root) return;

  const track = root.querySelector('.track');
  const slides = root.querySelectorAll('.slide');
  const dots = root.querySelectorAll('.dot');
  let idx = 0;
  let timer;

  function getVisibleCount() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function update() {
    const visibleCount = getVisibleCount();
    const maxIdx = Math.max(0, slides.length - visibleCount);
    if (idx > maxIdx) idx = maxIdx;

    const slide = slides[0];
    if (!slide) return;
    
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const slideW = slide.offsetWidth + gap;
    
    track.style.transform = `translateX(-${idx * slideW}px)`;
    
    // Update dots - only highlight the one corresponding to current first visible slide
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === idx);
      // Hide dots that would lead to empty space at the end
      if (i > maxIdx) {
        d.style.display = 'none';
      } else {
        d.style.display = 'block';
      }
    });
  }

  function next() {
    const visibleCount = getVisibleCount();
    const maxIdx = Math.max(0, slides.length - visibleCount);
    idx = (idx >= maxIdx) ? 0 : idx + 1;
    update();
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(next, delay);
  }

  dots.forEach((d, i) => {
    d.addEventListener('click', () => {
      idx = i;
      update();
      startTimer();
    });
  });

  root.addEventListener('mouseenter', () => clearInterval(timer));
  root.addEventListener('mouseleave', startTimer);

  window.addEventListener('resize', update);
  
  // Initialize
  setTimeout(update, 100); // Small delay to ensure layout is ready
  startTimer();
}

multiCarousel('.events', 5000);
multiCarousel('.gallery', 3000);

document.querySelectorAll('.chefItems').forEach(card => {
  const socials = card.querySelector('.socials');
  card.addEventListener('mouseenter', () => socials.classList.add('show'));
  card.addEventListener('mouseleave', () => socials.classList.remove('show'));
});

const modal = document.getElementById('reservationModal');
const form = document.getElementById('reservationForm');
let reservations = [];

function openModal() {
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

document.querySelectorAll('.bookingBtn').forEach(btn => {
  btn.addEventListener('click', e => { e.preventDefault(); openModal(); });
});

document.querySelector('.close')?.addEventListener('click', closeModal);
window.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function hasConflict(s, e) {
  const ns = +new Date(`1970-01-01T${s}`);
  const ne = +new Date(`1970-01-01T${e}`);
  return reservations.some(r => {
    const rs = +new Date(`1970-01-01T${r.startTime}`);
    const re = +new Date(`1970-01-01T${r.endTime}`);
    return ns < re && ne > rs;
  });
}

form?.addEventListener('submit', e => {
  e.preventDefault();
  const data = {
    fullName: document.getElementById('fullName').value,
    foodOption: document.getElementById('foodOption').value,
    startTime: document.getElementById('startTime').value,
    endTime: document.getElementById('endTime').value,
    numPeople: document.getElementById('numPeople').value
  };

  if (data.startTime >= data.endTime) {
    toast('End time must be after start time.', 'error');
    return;
  }

  if (hasConflict(data.startTime, data.endTime)) {
    toast('Time slot already reserved. Pick a different time.', 'error');
    return;
  }

  reservations.push(data);
  toast(`Reservation confirmed for ${data.fullName}!`);
  form.reset();
  closeModal();
});

const scrollBtn = document.getElementById('scrollTop');
const nav = document.querySelector('nav');
const progressBar = document.getElementById('scrollProgress');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (scrollY / height) * 100;
  
  if (progressBar) progressBar.style.width = `${progress}%`;
  
  if (scrollBtn) {
    scrollBtn.classList.toggle('visible', scrollY > 400);
  }
  
  if (nav) {
    nav.classList.toggle('scrolled', scrollY > 50);
  }
});

if (scrollBtn) {
  scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => { 
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Once visible, no need to observe anymore for a smoother performance
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const allNavLinks = document.querySelectorAll('nav .links a[href^="#"]');
const allSections = document.querySelectorAll('section[id], main[id]');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      allNavLinks.forEach(l => l.classList.remove('default'));
      const active = document.querySelector(`nav .links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('default');
    }
  });
}, { threshold: 0.4 });

allSections.forEach(s => sectionObserver.observe(s));

const contactForm = document.querySelector('.contact .forms');
if (contactForm) {
  const sendBtn = contactForm.querySelector('.sendBtn');
  sendBtn?.addEventListener('click', e => {
    e.preventDefault();
    const name = contactForm.querySelector('.nameInput').value.trim();
    const email = contactForm.querySelector('.emailInput').value.trim();
    const subject = contactForm.querySelector('.subjectInput').value.trim();
    const message = contactForm.querySelector('textarea').value.trim();

    if (!name || !email || !subject || !message) {
      toast('Please fill in all fields.', 'error');
      return;
    }

    toast('Message sent successfully!');
    contactForm.querySelectorAll('input, textarea').forEach(el => el.value = '');
  });
}