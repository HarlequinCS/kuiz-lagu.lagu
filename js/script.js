// ==============================
// HELLO KITTY MUSIC GAME – FINAL JS (YT INTEGRATION)
// ==============================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const landing = $('#landing');
const game = $('#game');
const startBtn = $('#startBtn');
const customizeBtn = $('#customizeBtn');
const howToBtn = $('#howToBtn');
const howToModal = $('#howToModal');
const themeModal = $('#themeModal');
const themeToggle = $('#themeToggle');

const progressFill = $('#progressFill');
const comboFill = $('#comboFill');
const statusText = $('#statusText');
const scoreEl = $('#score');
const smoothEl = $('#smooth');
const results = $('#results');

const YT_API_KEY = 'AIzaSyBxLS9otx4tpg5Suk3OdYppTanL1gLJykI';
let player; // YouTube Iframe Player instance

// ==============================
// GAME ENTRY + UI
// ==============================
startBtn.addEventListener('click', () => {
  landing.classList.add('hidden');
  game.classList.remove('hidden');
  pulseStatus('Ready', 'ok');
});

howToBtn.addEventListener('click', (e) => {
  e.preventDefault();
  howToModal.showModal();
});

customizeBtn.addEventListener('click', () => themeModal.showModal());
themeModal.addEventListener('click', (e) => {
  if (e.target.matches('button.swatch')) {
    document.documentElement.setAttribute('data-theme', e.target.dataset.theme);
  }
});

themeToggle.addEventListener('click', () => {
  const pressed = themeToggle.getAttribute('aria-pressed') === 'true';
  themeToggle.setAttribute('aria-pressed', String(!pressed));
  if (!pressed){
    document.body.style.filter = 'contrast(1.02) brightness(.98)';
    themeToggle.textContent = '🌞 Light';
  } else {
    document.body.style.filter = '';
    themeToggle.textContent = '🌙 Dark';
  }
});

// ==============================
// FAKE UI FEEDBACK
// ==============================
let fakeProgress = 0;
setInterval(() => {
  if (!game.classList.contains('hidden')) {
    fakeProgress = (fakeProgress + 1.2) % 100;
    progressFill.style.width = fakeProgress + '%';
  }
}, 120);

let fakeCombo = 0;
function addCombo(n=10){
  fakeCombo = Math.min(100, fakeCombo + n);
  comboFill.style.width = fakeCombo + '%';
  setTimeout(() => {
    fakeCombo = Math.max(0, fakeCombo - 5);
    comboFill.style.width = fakeCombo + '%';
  }, 1200);
}

function bumpScore(n){
  const val = Math.max(0, Number(scoreEl.textContent) + n);
  scoreEl.textContent = String(val);
  const smoothNow = Math.max(0, Math.min(100, 100 - Math.floor((10000 - val) / 200)));
  smoothEl.textContent = smoothNow + '%';
}

function pulseStatus(text, type){
  statusText.textContent = text;
  const dot = document.querySelector('.dot');
  if (type === 'ok'){
    dot.style.background = getComputedStyle(document.documentElement).getPropertyValue('--ok');
    dot.style.boxShadow = '0 0 0 4px #33c48b22';
  } else {
    dot.style.background = 'var(--warn)';
    dot.style.boxShadow = '0 0 0 4px #ffb84d33';
  }
  statusText.animate([{opacity:.6},{opacity:1}], {duration:280});
}

// ==============================
// OPTIONS (MOCK)
// ==============================
$$('.option').forEach(btn => {
  btn.addEventListener('click', () => {
    const ok = Math.random() > 0.4;
    if (ok){
      bumpScore(100);
      addCombo(20);
      pulseStatus('Perfect!', 'ok');
    } else {
      bumpScore(-50);
      fakeCombo = Math.max(0, fakeCombo - 30);
      comboFill.style.width = fakeCombo + '%';
      pulseStatus('Oops!', 'warn');
    }
  });
});

// ==============================
// YOUTUBE SEARCH & PLAYER
// ==============================
function createYouTubePlayer(videoId){
  const container = document.getElementById('player');
  container.innerHTML = ''; // reset
  player = new YT.Player('player', {
    height: '180',
    width: '100%',
    videoId: videoId,
    playerVars: { rel: 0, modestbranding: 1 },
    events: {
      onReady: (e) => e.target.playVideo(),
    },
  });
}

// Single listener for search + results
$('#searchBtn').addEventListener('click', async () => {
  const query = $('#searchInput').value.trim();
  results.innerHTML = '';
  if (!query) return;

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}&key=${YT_API_KEY}`
    );
    const data = await res.json();

    data.items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'song-item';
      row.innerHTML = `
        <img src="${item.snippet.thumbnails.default.url}" alt="thumb" style="width:48px;height:48px;border-radius:8px;">
        <div>
          <div style="font-weight:800;color:var(--text-strong)">${item.snippet.title}</div>
          <div class="muted">${item.snippet.channelTitle}</div>
        </div>
      `;
      row.addEventListener('click', () => {
        $('#songTitle').textContent = item.snippet.title;
        $('#songArtist').textContent = item.snippet.channelTitle;
        pulseStatus('Selected', 'ok');
        createYouTubePlayer(item.id.videoId);
      });
      results.appendChild(row);
    });
  } catch(err){
    console.error(err);
    results.innerHTML = '<div style="color:red">Error fetching results</div>';
  }
});
