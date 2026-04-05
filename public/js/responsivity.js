const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('nav .links');
const navBooking = document.querySelector('nav .booking');
const body = document.body;

if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    navBooking.classList.toggle('active');
    body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
  });

  document.querySelectorAll('nav .links a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
      navBooking.classList.remove('active');
      body.style.overflow = 'auto';
    });
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('nav') && navLinks.classList.contains('active')) {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
      navBooking.classList.remove('active');
      body.style.overflow = 'auto';
    }
  });
}