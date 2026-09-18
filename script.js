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

const variantButtons = [...document.querySelectorAll('.variant-option')];
const quantityValue = document.querySelector('#quantity-value');
const orderTotal = document.querySelector('#order-total');
const checkoutButton = document.querySelector('#checkout-button');
const checkoutMessage = document.querySelector('#checkout-message');
const productImages = [...document.querySelectorAll('[data-product-image]')];
const mediaCaption = document.querySelector('#media-caption');
let selectedVariant = variantButtons[0];
let quantity = 1;

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function updateOrderSummary() {
  const price = Number(selectedVariant.dataset.price);
  quantityValue.textContent = String(quantity);
  orderTotal.textContent = currency.format(price * quantity);
}

variantButtons.forEach((button) => {
  button.addEventListener('click', () => {
    variantButtons.forEach((item) => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-checked', String(item === button));
    });
    selectedVariant = button;
    productImages.forEach((image) => {
      const isSelected = image.dataset.productImage === button.dataset.sku;
      image.classList.toggle('is-active', isSelected);
      image.setAttribute('aria-hidden', String(!isSelected));
    });
    mediaCaption.textContent = button.dataset.sku === 'SC-DB-1KG-GRAOS'
      ? '1 KG // TORRADO EM GRÃOS'
      : '250 G // TORRADO E MOÍDO';
    checkoutMessage.textContent = '';
    updateOrderSummary();
  });
});

document.querySelector('#quantity-minus').addEventListener('click', () => {
  quantity = Math.max(1, quantity - 1);
  updateOrderSummary();
});

document.querySelector('#quantity-plus').addEventListener('click', () => {
  quantity = Math.min(10, quantity + 1);
  updateOrderSummary();
});

checkoutButton.addEventListener('click', async () => {
  checkoutButton.disabled = true;
  checkoutButton.firstChild.textContent = 'Preparando pagamento ';
  checkoutMessage.textContent = '';

  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ sku: selectedVariant.dataset.sku, quantity }),
    });
    const result = await response.json();

    if (!response.ok || !result.checkout_url) {
      throw new Error(result.error || 'Não foi possível iniciar o pagamento.');
    }

    window.location.assign(result.checkout_url);
  } catch (error) {
    checkoutMessage.textContent = error.message;
    checkoutButton.disabled = false;
    checkoutButton.firstChild.textContent = 'Pagar com Mercado Pago ';
  }
});

updateOrderSummary();
