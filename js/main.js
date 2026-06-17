
const CART_KEY = 'svezhost_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'flex';
  });
}

function addToCart(id, name, price, img) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === id);
  if (idx > -1) {
    cart[idx].qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1, img: img || '' });
  }
  saveCart(cart);
  updateCartBadge();
  showToast('🛒 ' + name + ' добавлен в корзину');
}

function removeFromCart(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  updateCartBadge();
}

function changeQty(id, delta) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === id);
  if (idx === -1) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart(cart);
  updateCartBadge();
  if (typeof renderCart === 'function') renderCart();
}

/* ===== TOAST ===== */
let toastTimer = null;

function showToast(msg) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ===== NAVBAR SCROLL SHADOW ===== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ===== BURGER / MOBILE MENU ===== */
function initBurger() {
  const burger = document.querySelector('.burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!burger || !mobileMenu) return;

  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    mobileMenu.classList.toggle('visible', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      mobileMenu.classList.remove('visible');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!burger.contains(e.target) && !mobileMenu.contains(e.target)) {
      burger.classList.remove('open');
      mobileMenu.classList.remove('visible');
      document.body.style.overflow = '';
    }
  });
}

/* ===== SCROLL REVEAL ===== */
function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  // Inject style once
  if (!document.getElementById('revealStyle')) {
    const s = document.createElement('style');
    s.id = 'revealStyle';
    s.textContent = `
      [data-reveal] { opacity: 0; transform: translateY(28px); transition: opacity .6s ease, transform .6s ease; }
      [data-reveal].revealed { opacity: 1; transform: none; }
    `;
    document.head.appendChild(s);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || '0s';
        entry.target.style.transitionDelay = delay;
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(el => observer.observe(el));
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  initNavbar();
  initBurger();
  initReveal();
});


/* ====================================================
   DYNAMIC FEATURES — динамические объекты
   ==================================================== */

/* ===== 1. SCROLL ANIMATIONS (расширенные) ===== */
function initScrollAnimations() {
  // Staggered children animation
  const staggerParents = document.querySelectorAll('[data-stagger]');
  staggerParents.forEach(parent => {
    const children = parent.children;
    Array.from(children).forEach((child, i) => {
      child.style.transitionDelay = (i * 0.1) + 's';
      child.setAttribute('data-reveal', '');
    });
  });

  // Parallax on hero blobs
  const blobs = document.querySelectorAll('.hero-blob');
  if (blobs.length) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      blobs.forEach((b, i) => {
        b.style.transform = `translateY(${y * (i === 0 ? 0.08 : -0.05)}px)`;
      });
    }, { passive: true });
  }

  // Counter animation for hero stats
  function animateCounter(el, target, duration = 1200) {
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + (el.dataset.suffix || '');
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Animate hero stats when they appear
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const strong = entry.target.querySelector('strong[data-count]');
        if (strong) {
          animateCounter(strong, parseInt(strong.dataset.count), 1400);
        }
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.hero-stat').forEach(el => statObserver.observe(el));

  // Card hover tilt effect
  document.querySelectorAll('.product-card, .why-card, .cat-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ===== 2. PRODUCT CONFIGURATOR ===== */
function initConfigurator() {
  const el = document.getElementById('productConfigurator');
  if (!el) return;

  const products = {
    vegetables: [
      { id: 'beer1', name: 'Пиво «Жигулёвское»', price: 149, unit: '0.5л', emoji: '🍺' },
      { id: 'beer2', name: 'Пиво крафтовое IPA', price: 189, unit: '0.5л', emoji: '🍻' },
      { id: 'cider', name: 'Сидр яблочный', price: 79, unit: '0.5л', emoji: '🍏' },
      { id: 'beer0', name: 'Пиво безалкогольное', price: 129, unit: '0.5л', emoji: '🍺' },
    ],
    fruits: [
      { id: 'lemonade', name: 'Лимонад «Дюшес»', price: 95, unit: '1л', emoji: '🥤' },
      { id: 'energy', name: 'Энергетик «Заряд»', price: 89, unit: '0.5л', emoji: '⚡' },
      { id: 'water', name: 'Вода минеральная', price: 89, unit: '1л', emoji: '💧' },
      { id: 'kvas', name: 'Квас «Хлебный»', price: 99, unit: '1л', emoji: '🌾' },
    ],
    dairy: [
      { id: 'chips', name: 'Чипсы сметана-лук', price: 95, unit: '150г', emoji: '🍟' },
      { id: 'nuts', name: 'Орешки кешью', price: 185, unit: '150г', emoji: '🥜' },
      { id: 'crackers', name: 'Сухарики ржаные', price: 75, unit: '100г', emoji: '🥖' },
      { id: 'cheesebites', name: 'Сырные шарики', price: 185, unit: '150г', emoji: '🧀' },
    ],
  };

  let selected = {};
  let promoApplied = false;

  function renderConfigurator() {
    const total = Object.values(selected).reduce((s, item) => s + item.price * item.qty, 0);
    const discount = promoApplied ? Math.round(total * 0.15) : 0;
    const finalTotal = Math.max(0, total - discount);

    el.innerHTML = `
      <div class="cfg-wrap">
        <div class="cfg-header">
          <div class="cfg-icon">🛒</div>
          <div>
            <h3 class="cfg-title">Собери свою корзину</h3>
            <p class="cfg-sub">Выбери продукты — цена обновится мгновенно</p>
          </div>
        </div>

        <div class="cfg-categories">
          ${Object.entries(products).map(([cat, items]) => `
            <div class="cfg-cat">
              <div class="cfg-cat-title">${cat === 'vegetables' ? '🍺 Пиво и сидр' : cat === 'fruits' ? '🥤 Напитки' : '🍿 Снеки и закуски'}</div>
              <div class="cfg-items">
                ${items.map(item => {
                  const qty = selected[item.id]?.qty || 0;
                  return `
                    <div class="cfg-item ${qty > 0 ? 'cfg-item-active' : ''}">
                      <span class="cfg-emoji">${item.emoji}</span>
                      <div class="cfg-item-info">
                        <span class="cfg-item-name">${item.name}</span>
                        <span class="cfg-item-unit">${item.unit} · ${item.price} ₽</span>
                      </div>
                      <div class="cfg-qty">
                        <button class="cfg-btn-qty" onclick="cfgChange('${item.id}', ${item.price}, '${item.name}', -1)">−</button>
                        <span class="cfg-count">${qty}</span>
                        <button class="cfg-btn-qty" onclick="cfgChange('${item.id}', ${item.price}, '${item.name}', 1)">+</button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="cfg-promo">
          <input class="cfg-promo-input" id="cfgPromoInput" type="text" placeholder="Промокод (СВЕЖЕСТЬ15)" value="${promoApplied ? 'СВЕЖЕСТЬ15' : ''}" ${promoApplied ? 'disabled' : ''}>
          <button class="cfg-promo-btn" onclick="cfgApplyPromo()" ${promoApplied ? 'disabled' : ''}>${promoApplied ? '✅ Применён' : 'Применить'}</button>
        </div>

        <div class="cfg-summary">
          <div class="cfg-summary-row"><span>Товары (${Object.values(selected).reduce((s,i)=>s+i.qty,0)} шт):</span><span>${total} ₽</span></div>
          ${promoApplied ? `<div class="cfg-summary-row cfg-discount"><span>Скидка 15%:</span><span>−${discount} ₽</span></div>` : ''}
          <div class="cfg-summary-total"><span>Итого:</span><span class="cfg-total-price">${finalTotal} ₽</span></div>
          <button class="cfg-order-btn" onclick="cfgAddToCart()" ${total === 0 ? 'disabled' : ''}>
            ${total === 0 ? 'Выберите товары' : '🛍️ Добавить в корзину'}
          </button>
        </div>
      </div>
    `;
  }

  window.cfgChange = function(id, price, name, delta) {
    if (!selected[id]) selected[id] = { price, name, qty: 0 };
    selected[id].qty = Math.max(0, selected[id].qty + delta);
    if (selected[id].qty === 0) delete selected[id];
    renderConfigurator();
  };

  window.cfgApplyPromo = function() {
    const val = document.getElementById('cfgPromoInput')?.value.trim().toUpperCase();
    if (val === 'СВЕЖЕСТЬ15') {
      promoApplied = true;
      showToast('🎉 Промокод применён! Скидка 15%');
      renderConfigurator();
    } else {
      showToast('❌ Неверный промокод');
    }
  };

  window.cfgAddToCart = function() {
    Object.values(selected).forEach(item => {
      addToCart('cfg_' + item.name, item.name, item.price);
    });
    selected = {};
    promoApplied = false;
    renderConfigurator();
  };

  renderConfigurator();
}

/* ===== 3. BEFORE/AFTER SLIDER ===== */
function initBeforeAfterSlider() {
  const el = document.getElementById('beforeAfterSlider');
  if (!el) return;

  el.innerHTML = `
    <div class="ba-wrap">
      <div class="ba-header">
        <div class="ba-icon">🔍</div>
        <div>
          <h3 class="ba-title">Сравни качество</h3>
          <p class="ba-sub">Потяни ползунок, чтобы увидеть разницу между обычным и нашим товаром</p>
        </div>
      </div>
      <div class="ba-slider-container" id="baContainer">
        <div class="ba-side ba-after">
          <div class="ba-image ba-image-after">
            <div class="ba-produce-grid">
              ${['🍺','🥤','🍿','🥨','🍫','🥜','🧃','🍻'].map(e => 
                `<span class="ba-produce fresh">${e}</span>`).join('')}
            </div>
            <div class="ba-label-overlay ba-label-right">✨ Наши товары</div>
            <div class="ba-stars">⭐⭐⭐⭐⭐ Всегда холодное и свежее</div>
          </div>
        </div>
        <div class="ba-side ba-before" id="baBefore">
          <div class="ba-image ba-image-before">
            <div class="ba-produce-grid">
              ${['🍺','🥤','🍿','🥨','🍫','🥜','🧃','🍻'].map(e => 
                `<span class="ba-produce stale">${e}</span>`).join('')}
            </div>
            <div class="ba-label-overlay ba-label-left">😕 Обычный магазин</div>
            <div class="ba-stars muted">⭐⭐ Неизвестное происхождение</div>
          </div>
        </div>
        <div class="ba-handle" id="baHandle">
          <div class="ba-handle-line"></div>
          <div class="ba-handle-circle">
            <span>◀</span><span>▶</span>
          </div>
          <div class="ba-handle-line"></div>
        </div>
      </div>
      <div class="ba-hint">← Потяни ползунок →</div>
    </div>
  `;

  const container = document.getElementById('baContainer');
  const before = document.getElementById('baBefore');
  const handle = document.getElementById('baHandle');
  let dragging = false;
  let pct = 50;

  function setPosition(x) {
    const rect = container.getBoundingClientRect();
    pct = Math.max(5, Math.min(95, ((x - rect.left) / rect.width) * 100));
    before.style.width = pct + '%';
    handle.style.left = pct + '%';
  }

  handle.addEventListener('mousedown', () => dragging = true);
  handle.addEventListener('touchstart', () => dragging = true, { passive: true });
  window.addEventListener('mouseup', () => dragging = false);
  window.addEventListener('touchend', () => dragging = false);
  window.addEventListener('mousemove', e => { if (dragging) setPosition(e.clientX); });
  window.addEventListener('touchmove', e => { if (dragging) setPosition(e.touches[0].clientX); }, { passive: true });
  container.addEventListener('click', e => setPosition(e.clientX));

  setPosition(container.getBoundingClientRect().left + container.offsetWidth * 0.5);
}

/* ===== 4. FORM CHAT HINTS ===== */
function initFormChatHints() {
  const form = document.getElementById('contForm');
  if (!form) return;

  const hints = {
    fName: [
      { delay: 600, text: '👋 Привет! Как вас зовут? Мы ответим лично.' },
      { delay: 2500, text: '💡 Напишите имя и фамилию — так удобнее обращаться.' },
    ],
    fContact: [
      { delay: 400, text: '📞 Укажите телефон или email — выбирайте удобный способ.' },
      { delay: 2800, text: '🔒 Ваши данные в безопасности — мы не передаём их третьим лицам.' },
    ],
    fTopic: [
      { delay: 300, text: '📋 Выберите тему — направим ваш вопрос нужному специалисту.' },
    ],
    fMsg: [
      { delay: 500, text: '✍️ Опишите вопрос подробнее — ответим точнее и быстрее.' },
      { delay: 3000, text: '💬 Обычно отвечаем в течение 2 часов в рабочее время.' },
    ],
  };

  // Create chat bubble container
  let chatBox = document.getElementById('formChatBox');
  if (!chatBox) {
    chatBox = document.createElement('div');
    chatBox.id = 'formChatBox';
    chatBox.className = 'form-chat-box';
    form.insertAdjacentElement('beforebegin', chatBox);
  }

  chatBox.innerHTML = `
    <div class="fcb-header">
      <div class="fcb-avatar">🌿</div>
      <div>
        <div class="fcb-name">Помощник Свежести</div>
        <div class="fcb-status">● Онлайн</div>
      </div>
    </div>
    <div class="fcb-messages" id="fcbMessages">
      <div class="fcb-msg fcb-msg-bot">Здравствуйте! Заполните форму — я подскажу на каждом шаге 😊</div>
    </div>
  `;

  const msgArea = document.getElementById('fcbMessages');
  let hintTimers = [];

  function clearTimers() {
    hintTimers.forEach(t => clearTimeout(t));
    hintTimers = [];
  }

  function addBotMessage(text) {
    const typing = document.createElement('div');
    typing.className = 'fcb-msg fcb-msg-bot fcb-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    msgArea.appendChild(typing);
    msgArea.scrollTop = msgArea.scrollHeight;

    setTimeout(() => {
      typing.remove();
      const msg = document.createElement('div');
      msg.className = 'fcb-msg fcb-msg-bot';
      msg.textContent = text;
      msg.style.animation = 'fcbSlideIn 0.3s ease';
      msgArea.appendChild(msg);
      msgArea.scrollTop = msgArea.scrollHeight;
    }, 800);
  }

  function showHints(fieldId) {
    clearTimers();
    const fieldHints = hints[fieldId];
    if (!fieldHints) return;

    fieldHints.forEach(hint => {
      const t = setTimeout(() => addBotMessage(hint.text), hint.delay);
      hintTimers.push(t);
    });
  }

  // Field validation feedback
  function addUserFeedback(fieldId, value) {
    if (!value || value.length < 2) return;
    const msgs = {
      fName: `Отлично, ${value.split(' ')[0]}! 👍`,
      fContact: value.includes('@') ? '✉️ Email принят!' : '📱 Номер зафиксирован!',
      fTopic: `📂 Тема «${value}» выбрана`,
      fMsg: value.length > 20 ? '📝 Подробное описание — отлично!' : '📝 Сообщение получено',
    };
    if (msgs[fieldId]) {
      setTimeout(() => addBotMessage(msgs[fieldId]), 400);
    }
  }

  ['fName', 'fContact', 'fTopic', 'fMsg'].forEach(id => {
    const field = document.getElementById(id);
    if (!field) return;

    field.addEventListener('focus', () => showHints(id));
    field.addEventListener('blur', () => {
      clearTimers();
      const val = field.value.trim();
      if (val) addUserFeedback(id, val);
    });
  });

  // Success message
  form.addEventListener('submit', () => {
    setTimeout(() => addBotMessage('🎉 Отлично! Ваше сообщение отправлено. Ответим в течение 2 часов!'), 200);
  });
}

/* ===== INIT ALL DYNAMIC FEATURES ===== */
document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initConfigurator();
  initBeforeAfterSlider();
  initFormChatHints();
});


/* ===== PROMO SLIDER ===== */
function initPromoSlider() {
  const slider = document.getElementById('promoSlider');
  if (!slider) return;

  const track = document.getElementById('promoTrack');
  const slides = track.querySelectorAll('.promo-slide');
  const dots = document.querySelectorAll('.promo-dot');
  const prevBtn = document.getElementById('promoPrev');
  const nextBtn = document.getElementById('promoNext');
  const total = slides.length;
  let current = 0;
  let autoTimer = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragDelta = 0;

  function goTo(index, instant) {
    current = (index + total) % total;
    track.style.transition = instant ? 'none' : 'transform .5s cubic-bezier(.4,0,.2,1)';
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', i === current);
    });
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, 5000);
  }
  function stopAuto() {
    clearInterval(autoTimer);
  }

  // Button clicks
  nextBtn?.addEventListener('click', () => { next(); startAuto(); });
  prevBtn?.addEventListener('click', () => { prev(); startAuto(); });

  // Dot clicks
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); startAuto(); });
  });

  // Keyboard navigation (arrow keys when slider focused)
  slider.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); next(); startAuto(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prev(); startAuto(); }
  });

  // Touch / swipe
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    stopAuto();
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
    }
    startAuto();
  }, { passive: true });

  // Mouse drag
  track.addEventListener('mousedown', e => {
    isDragging = true;
    dragStartX = e.clientX;
    dragDelta = 0;
    track.style.transition = 'none';
    stopAuto();
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    dragDelta = e.clientX - dragStartX;
    const base = -current * 100;
    const pct = (dragDelta / slider.offsetWidth) * 100;
    track.style.transform = `translateX(calc(${base}% + ${dragDelta}px))`;
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    if (Math.abs(dragDelta) > 60) {
      dragDelta < 0 ? next() : prev();
    } else {
      goTo(current); // snap back
    }
    startAuto();
  });

  // Pause on hover
  slider.addEventListener('mouseenter', stopAuto);
  slider.addEventListener('mouseleave', startAuto);

  // Pause when tab not visible
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopAuto() : startAuto();
  });

  goTo(0, true);
  startAuto();
}

document.addEventListener('DOMContentLoaded', initPromoSlider);


/* ============================================================
   POPUPS, MODALS, TOOLTIPS, DROPDOWNS
   ============================================================ */

/* ===== NAV DROPDOWN ===== */
function initNavDropdown() {
  const items = document.querySelectorAll('.nav-has-dropdown');
  items.forEach(item => {
    const trigger = item.querySelector('.nav-dropdown-trigger');
    const dropdown = item.querySelector('.nav-dropdown');
    if (!trigger || !dropdown) return;

    let closeTimer;

    const open = () => {
      clearTimeout(closeTimer);
      item.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    };
    const close = () => {
      closeTimer = setTimeout(() => {
        item.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      }, 120);
    };

    item.addEventListener('mouseenter', open);
    item.addEventListener('mouseleave', close);
    dropdown.addEventListener('mouseenter', () => clearTimeout(closeTimer));
    dropdown.addEventListener('mouseleave', close);

    // Keyboard toggle
    trigger.addEventListener('click', e => {
      e.preventDefault();
      const isOpen = item.classList.toggle('open');
      trigger.setAttribute('aria-expanded', isOpen);
    });
    trigger.addEventListener('keydown', e => {
      if (e.key === 'Escape') { item.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); }
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!item.contains(e.target)) {
        item.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

/* ===== QUICK-VIEW BUTTONS ===== */
function initQuickView() {
  const cards = document.querySelectorAll('.product-card[data-modal-id]');
  cards.forEach(card => {
    // Inject quick-view button
    const btn = document.createElement('button');
    btn.className = 'btn-quickview';
    btn.textContent = '👁 Быстрый просмотр';
    btn.setAttribute('data-tooltip', 'Открыть карточку товара');
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openProductModal(card.dataset);
    });
    card.appendChild(btn);

    // Also open on card click (not on add-to-cart btn)
    card.addEventListener('click', e => {
      if (e.target.closest('.btn-add') || e.target.closest('.btn-quickview')) return;
      openProductModal(card.dataset);
    });
    card.style.cursor = 'pointer';
  });
}

/* ===== PRODUCT MODAL ===== */
let modalQty = 1;
let currentModalData = null;

function openProductModal(data) {
  const overlay = document.getElementById('productModal');
  if (!overlay) return;
  currentModalData = data;
  modalQty = 1;

  document.getElementById('modalImg').src = data.img;
  document.getElementById('modalImg').alt = data.name;
  document.getElementById('modalTitle').textContent = data.name;
  document.getElementById('modalWeight').textContent = data.weight;
  document.getElementById('modalDesc').textContent = data.desc;
  document.getElementById('modalPrice').textContent = data.price + ' ₽';

  const badge = document.getElementById('modalBadge');
  if (data.badge && data.badge !== '') {
    badge.textContent = data.badge;
    badge.className = 'modal-badge ' + (data.badgeCls || '');
  } else {
    badge.className = 'modal-badge empty';
  }

  updateModalQty();
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('modalClose').focus();

  // Trap focus
  trapFocus(overlay);
}

function closeProductModal() {
  const overlay = document.getElementById('productModal');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function updateModalQty() {
  document.getElementById('modalQty').textContent = modalQty;
  const price = currentModalData ? parseInt(currentModalData.price) : 0;
  document.getElementById('modalTotal').textContent = '= ' + (price * modalQty) + ' ₽';
}

function initProductModal() {
  const overlay = document.getElementById('productModal');
  if (!overlay) return;

  document.getElementById('modalClose')?.addEventListener('click', closeProductModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeProductModal(); });

  document.getElementById('modalMinus')?.addEventListener('click', () => {
    if (modalQty > 1) { modalQty--; updateModalQty(); }
  });
  document.getElementById('modalPlus')?.addEventListener('click', () => {
    if (modalQty < 99) { modalQty++; updateModalQty(); }
  });

  document.getElementById('modalAddBtn')?.addEventListener('click', () => {
    if (!currentModalData) return;
    for (let i = 0; i < modalQty; i++) {
      addToCart('modal_' + currentModalData.modalId, currentModalData.name, parseInt(currentModalData.price));
    }
    const btn = document.getElementById('modalAddBtn');
    btn.textContent = '✅ Добавлено!';
    btn.style.background = '#16a34a';
    setTimeout(() => {
      btn.textContent = '🛒 Добавить в корзину';
      btn.style.background = '';
      closeProductModal();
    }, 1200);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeProductModal();
  });
}

function trapFocus(el) {
  const focusable = el.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const first = focusable[0], last = focusable[focusable.length - 1];
  el.addEventListener('keydown', function handler(e) {
    if (e.key !== 'Tab') return;
    if (!el.classList.contains('open')) { el.removeEventListener('keydown', handler); return; }
    if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
    else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
  });
}

/* ===== COOKIE BANNER ===== */
function initCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;
  if (localStorage.getItem('cookieConsent')) return;

  setTimeout(() => banner.classList.add('show'), 1500);

  document.getElementById('cookieAccept')?.addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'accepted');
    banner.classList.remove('show');
  });
  document.getElementById('cookieDecline')?.addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'declined');
    banner.classList.remove('show');
  });
}

/* ===== STICKY CTA ===== */
function initStickyCta() {
  const cta = document.getElementById('stickyCta');
  if (!cta) return;
  if (localStorage.getItem('stickyCtaClosed')) return;

  let shown = false;
  window.addEventListener('scroll', () => {
    if (!shown && window.scrollY > 600) {
      cta.classList.add('show');
      shown = true;
    }
  }, { passive: true });

  document.getElementById('stickyCtaClose')?.addEventListener('click', () => {
    cta.classList.remove('show');
    localStorage.setItem('stickyCtaClosed', '1');
  });
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  initNavDropdown();
  initQuickView();
  initProductModal();
  initCookieBanner();
  initStickyCta();
});
