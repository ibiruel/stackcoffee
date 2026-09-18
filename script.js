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

const marketplaceButton = document.querySelector('#mercado-livre-buy');
const marketplaceUrl = marketplaceButton?.dataset.marketplaceUrl?.trim();

if (marketplaceButton && marketplaceUrl) {
  marketplaceButton.href = marketplaceUrl;
  marketplaceButton.target = '_blank';
  marketplaceButton.rel = 'noreferrer';
  marketplaceButton.classList.remove('is-disabled');
  marketplaceButton.removeAttribute('aria-disabled');
  marketplaceButton.firstChild.textContent = 'Comprar no Mercado Livre ';
} else if (marketplaceButton) {
  marketplaceButton.addEventListener('click', (event) => event.preventDefault());
}
