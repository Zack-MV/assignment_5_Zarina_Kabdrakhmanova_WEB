(() => {
'use strict';
// ---- constants ----
const ROWS = 6;
const COLS = 8;
const MAX_SEATS = 6;
const ZONES = [
  { name: 'VIP', rows: 2, price: 30, cls: 'z-vip', color: '#7c3aed' },
  { name: 'Standard', rows: 2, price: 20, cls: 'z-std', color: '#4f46e5' },
  { name: 'Economy', rows: 2, price: 10, cls: 'z-eco', color: '#0891b2' },
];
const $ = (id) => document.getElementById(id);

function zoneOf(row) {
  let acc = 0;
  for (const z of ZONES) {
    acc += z.rows;
    if (row < acc) return z;
  }
}

// 2D array of seat objects
const seats = [];
for (let r = 0; r < ROWS; r++) {
  const line = [];
  for (let c = 0; c < COLS; c++) {
    const z = zoneOf(r);
    line.push({
      id: r * COLS + c + 1, row: r, col: c,
      zone: z.name, cls: z.cls, price: z.price,
      taken: (r * 3 + c * 5) % 7 === 0, selected: false,
    });
  }
  seats.push(line);
}
const allSeats = seats.flat();
let zoneFilter = 'all';

function render(msg, cls) {
  const hall = $('hall');
  hall.replaceChildren();
  let freeInZone = 0;
  for (const line of seats) {
    const rowEl = document.createElement('div');
    rowEl.className = 'seat-row';
    for (const s of line) {
      const inZone = zoneFilter === 'all' || s.zone === zoneFilter;
      if (inZone && !s.taken) freeInZone++;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'seat ' + s.cls;
      b.textContent = s.col + 1;
      b.dataset.id = s.id;
      b.classList.toggle('taken', s.taken);
      b.classList.toggle('selected', s.selected);
      b.classList.toggle('dim', !inZone);
      b.setAttribute('aria-pressed', String(s.selected));
      b.setAttribute('aria-label',
        `Row ${s.row + 1}, seat ${s.col + 1}, ${s.zone}, $${s.price}${s.taken ? ', taken' : ''}`);
      rowEl.append(b);
    }
    hall.append(rowEl);
  }
  // own loop: total price and selected list
  let total = 0, count = 0;
  const labels = [];
  for (const s of allSeats) {
    if (s.selected) { total += s.price; count++; labels.push(`R${s.row + 1}-S${s.col + 1}`); }
  }
  $('count').textContent = `${count}/${MAX_SEATS}`;
  $('selList').textContent = count ? labels.join(', ') : 'nothing yet';
  $('total').textContent = total;
  $('bookBtn').disabled = count === 0;
  let text = msg;
  if (!text && freeInZone === 0) text = `No free seats in zone ${zoneFilter}.`;
  $('sMsg').textContent = text || '';
  $('sMsg').className = cls || (text ? 'bad' : '');
}

function clearSelection() {
  for (const s of allSeats) s.selected = false;
}

function toggle(id) {
  const s = allSeats.find((x) => x.id === id);
  if (s.taken) return render('This seat is already taken.');
  if (!s.selected && allSeats.filter((x) => x.selected).length >= MAX_SEATS) {
    return render(`You can select at most ${MAX_SEATS} seats.`);
  }
  s.selected = !s.selected;
  render();
}

function bestSeats() {
  const n = Number($('bestCount').value);
  let best = null, bestScore = Infinity;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c + n <= COLS; c++) {
      let ok = true;
      for (let k = 0; k < n; k++) if (seats[r][c + k].taken) { ok = false; break; }
      if (!ok) continue;
      // distance from the block center to the hall center
      const score = Math.abs(c + (n - 1) / 2 - (COLS - 1) / 2) + Math.abs(r - (ROWS - 1) / 2);
      if (score < bestScore) { bestScore = score; best = { r, c }; }
    }
  }
  if (!best) return render(`No ${n} free seats together.`);
  clearSelection();
  for (let k = 0; k < n; k++) seats[best.r][best.c + k].selected = true;
  render(`Best seats: row ${best.r + 1}, seats ${best.c + 1}–${best.c + n}.`, 'ok');
}

function book() {
  let n = 0, sum = 0;
  for (const s of allSeats) if (s.selected) { s.taken = true; s.selected = false; n++; sum += s.price; }
  render(`Booked ${n} seat(s) for $${sum}. Enjoy the movie!`, 'ok');
}

// event delegation: one listener for all seats
$('hall').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-id]');
  if (b) toggle(Number(b.dataset.id));
});
$('bestBtn').addEventListener('click', bestSeats);
$('clearBtn').addEventListener('click', () => { clearSelection(); render(); });
$('bookBtn').addEventListener('click', book);
$('zoneFilter').addEventListener('change', (e) => { zoneFilter = e.target.value; render(); });

// fill controls and legend
for (const name of ['all', ...ZONES.map((z) => z.name)]) {
  const o = document.createElement('option');
  o.value = name; o.textContent = name === 'all' ? 'All zones' : name;
  $('zoneFilter').append(o);
}
for (let n = 1; n <= MAX_SEATS; n++) {
  const o = document.createElement('option');
  o.value = n; o.textContent = n;
  $('bestCount').append(o);
}
for (const z of ZONES) {
  const sp = document.createElement('span');
  sp.textContent = `${z.name} $${z.price}`;
  sp.className = z.cls;
  $('legend').append(sp);
}
render();
})();
