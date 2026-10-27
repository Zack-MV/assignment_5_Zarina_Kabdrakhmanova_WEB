(() => {
'use strict';
// ---- constants ----
const MAX_LIVES = 3;
const WIN_STREAK = 8;
const ITEMS = [
  { name: 'Inception', value: 88 }, { name: 'Titanic', value: 79 },
  { name: 'Interstellar', value: 87 }, { name: 'The Room', value: 37 },
  { name: 'Avatar', value: 78 }, { name: 'Joker', value: 84 },
  { name: 'Cats', value: 28 }, { name: 'Parasite', value: 86 },
  { name: 'Shrek', value: 79 }, { name: 'Tenet', value: 73 },
];

const $ = (id) => document.getElementById(id);
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

let lives, streak, best = 0, over;

function pickNext(exceptIdx) {
  let i;
  do { i = randInt(0, ITEMS.length - 1); } while (i === exceptIdx);
  return i;
}
let curIdx, nextIdx;

function render(msg, cls) {
  $('lives').textContent = '❤'.repeat(lives) || '0';
  $('streak').textContent = streak;
  $('best').textContent = best;
  $('curName').textContent = ITEMS[curIdx].name;
  $('curVal').textContent = ITEMS[curIdx].value;
  $('nextName').textContent = ITEMS[nextIdx].name;
  $('btnHigher').disabled = over;
  $('btnLower').disabled = over;
  const m = $('gMsg');
  m.textContent = msg;
  m.className = cls || '';
}

function start() {
  lives = MAX_LIVES; streak = 0; over = false;
  curIdx = randInt(0, ITEMS.length - 1);
  nextIdx = pickNext(curIdx);
  render('Will the next movie have a higher or lower rating?');
}

function guess(dir) {
  if (over) { render('Game is over. Press Restart.', 'bad'); return; }
  if (dir !== 'higher' && dir !== 'lower') { render('Invalid move.', 'bad'); return; }
  const a = ITEMS[curIdx].value, b = ITEMS[nextIdx].value;
  // equal values count as a right guess
  const right = (dir === 'higher' && b >= a) || (dir === 'lower' && b <= a);
  const info = `${ITEMS[nextIdx].name} = ${b}. `;
  if (right) {
    streak++;
    if (streak > best) best = streak;
  } else {
    lives--;
  }
  curIdx = nextIdx;
  nextIdx = pickNext(curIdx);
  if (streak === WIN_STREAK) {
    over = true; render(info + `You win! Streak ${WIN_STREAK}!`, 'win');
  } else if (lives === 0) {
    over = true; render(info + 'Wrong. No lives left – game over.', 'lose');
  } else if (right) {
    render(info + 'Correct!', 'ok');
  } else {
    render(info + 'Wrong! You lose a life.', 'bad');
  }
}

$('btnHigher').addEventListener('click', () => guess('higher'));
$('btnLower').addEventListener('click', () => guess('lower'));
$('btnRestart').addEventListener('click', start);
start();
})();
