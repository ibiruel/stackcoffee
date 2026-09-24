const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.main-nav');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 28);
}, { passive: true });

menuButton.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

menu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
document.querySelector('#year').textContent = new Date().getFullYear();

function trackEvent(name, parameters = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, parameters);
  }
}

document.querySelectorAll('[data-store-link]').forEach((link) => {
  link.addEventListener('click', () => {
    trackEvent('select_content', {
      content_type: 'store_link',
      item_id: 'nuvemshop_stack_coffee',
      destination: 'https://loja.stackcoffee.com.br/'
    });
  });
});

document.querySelectorAll('.button-whatsapp').forEach((link) => {
  link.addEventListener('click', () => {
    trackEvent('generate_lead', {
      method: 'whatsapp',
      campaign: 'coffee_as_a_service',
      value: 0,
      currency: 'BRL',
    });
  });
});

document.querySelectorAll('a[href*="instagram.com"]').forEach((link) => {
  link.addEventListener('click', () => {
    trackEvent('select_content', {
      content_type: 'social_profile',
      item_id: 'instagram_stack_coffee',
    });
  });
});
