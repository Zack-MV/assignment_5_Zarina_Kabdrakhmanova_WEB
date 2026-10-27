(() => {
'use strict';
const TYPES = [
  { id: 'std', label: 'Standard', price: 50, seats: 20 },
  { id: 'vip', label: 'VIP', price: 120, seats: 5 },
  { id: 'stu', label: 'Student', price: 25, seats: 8 },
];
const SOLD_OUT_DATES = ['2026-11-15', '2026-12-01'];
const PROMOS = { SAVE10: 10, STUDENT20: 20 };
const FIELDS = ['event', 'date', 'type', 'qty', 'name', 'email', 'promo'];

const $ = (id) => document.getElementById(id);
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const form = $('tform');
form.noValidate = true;
const touched = new Set();

function fillTypes() {
  const sel = form.elements.type;
  const keep = sel.value;
  sel.replaceChildren();
  const first = document.createElement('option');
  first.value = ''; first.textContent = 'Choose…';
  sel.append(first);
  for (const t of TYPES) {
    const o = document.createElement('option');
    o.value = t.id;
    o.textContent = `${t.label} – $${t.price} (${t.seats} left)`;
    sel.append(o);
  }
  sel.value = keep;
}

// returns an error message or '' if valid
function check(name) {
  const el = form.elements[name];
  const v = el.value.trim();
  if (name !== 'promo' && el.validity.valueMissing) return 'This field is required.';
  switch (name) {
    case 'date': {
      if (SOLD_OUT_DATES.includes(v)) return 'This date is sold out.';
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (new Date(v) < today) return 'Date cannot be in the past.';
      return '';
    }
    case 'qty': {
      const n = Number(v);
      if (!Number.isInteger(n) || n < 1) return 'Enter a whole number, 1 or more.';
      const t = TYPES.find((x) => x.id === form.elements.type.value);
      if (t && n > t.seats) return `Only ${t.seats} ${t.label} seats left.`;
      return '';
    }
    case 'name':
      if (v.length < 2) return 'At least 2 characters.';
      return /^[A-Za-zА-Яа-яЁё\s'-]+$/.test(v) ? '' : 'Letters, spaces and - only.';
    case 'email': {
      if (el.validity.typeMismatch) return 'Enter a valid email like name@mail.com.';
      return /@[^@\s]+\.[a-z]{2,}$/i.test(v) ? '' : 'Email domain must contain a dot, e.g. mail.com.';
    }
    case 'promo':
      return v === '' || PROMOS[v.toUpperCase()] !== undefined ? '' : 'Unknown promo code.';
  }
  return '';
}

function show(name) {
  const msg = check(name);
  const el = form.elements[name];
  const wrap = el.closest('.field');
  $('err-' + name).textContent = msg;
  el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  if (msg) el.setAttribute('aria-describedby', 'err-' + name); else el.removeAttribute('aria-describedby');
  wrap.classList.toggle('invalid', !!msg);
  wrap.classList.toggle('valid', !msg && el.value.trim() !== '');
  return msg;
}

function preview() {
  const f = form.elements;
  const set = (id, txt) => { $('pv-' + id).textContent = txt || '–'; };
  set('event', f.event.value); set('date', f.date.value);
  const t = TYPES.find((x) => x.id === f.type.value);
  set('type', t ? t.label : ''); set('qty', f.qty.value);
  set('name', f.name.value.trim()); set('email', f.email.value.trim());
  const disc = PROMOS[f.promo.value.trim().toUpperCase()] || 0;
  const qty = Number(f.qty.value);
  const total = t && qty > 0 ? t.price * qty * (1 - disc / 100) : 0;
  $('pv-disc').textContent = disc + '%';
  $('pv-total').textContent = total.toFixed(2);
}

for (const name of FIELDS) {
  const el = form.elements[name];
  el.addEventListener('blur', () => { touched.add(name); show(name); });
  const live = () => {
    preview();
    if (touched.has(name)) show(name);
    if (name === 'type' && touched.has('qty')) show('qty'); // seats depend on type
  };
  el.addEventListener('input', live);
  el.addEventListener('change', live);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const bad = FIELDS.filter((n) => { touched.add(n); return show(n) !== ''; });
  const sum = $('summary');
  if (bad.length) {
    sum.hidden = false;
    sum.textContent = `Please fix ${bad.length} error${bad.length > 1 ? 's' : ''} below.`;
    sum.focus();
    form.elements[bad[0]].focus();
    return;
  }
  sum.hidden = true;
  const f = form.elements;
  const t = TYPES.find((x) => x.id === f.type.value);
  const qty = Number(f.qty.value);
  const disc = PROMOS[f.promo.value.trim().toUpperCase()] || 0;
  t.seats -= qty;
  const code = 'TK-' + randInt(100000, 999999).toString(36).toUpperCase() + randInt(10, 99);
  const box = document.createElement('div');
  box.className = 'ticket';
  const h = document.createElement('h4'); h.textContent = '🎟 Ticket ' + code;
  const p = document.createElement('p');
  p.textContent = `${f.event.value}, ${f.date.value} · ${t.label} × ${qty} · ${f.name.value.trim()} · total $${(t.price * qty * (1 - disc / 100)).toFixed(2)}`;
  box.append(h, p);
  $('result').replaceChildren(box);
  form.reset();
  touched.clear();
  for (const n of FIELDS) {
    $('err-' + n).textContent = '';
    form.elements[n].removeAttribute('aria-invalid');
    form.elements[n].closest('.field').classList.remove('invalid', 'valid');
  }
  fillTypes();
  preview();
});

fillTypes();
preview();
})();
