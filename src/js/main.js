import anime from "animejs/lib/anime.es.js";

// DOM elements
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const results = document.getElementById("results");
const player = document.getElementById("player");

// YouTube API key
const YT_API_KEY = 'AIzaSyBxLS9otx4tpg5Suk3OdYppTanL1gLJykI';
let ytPlayer;

// Search function
async function searchYouTube(query) {
  results.innerHTML = '';
  if (!query) return;

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}&key=${YT_API_KEY}`);
    const data = await res.json();

    data.items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'column is-4';
      card.innerHTML = `
        <div class="song-card">
          <img src="${item.snippet.thumbnails.default.url}" alt="thumb">
          <div>
            <div class="song-title">${item.snippet.title}</div>
            <div class="song-artist">${item.snippet.channelTitle}</div>
          </div>
        </div>
      `;
      card.addEventListener('click', () => loadVideo(item.id.videoId));
      results.appendChild(card);

      // cute hover animation
      anime({
        targets: card.querySelector('.song-card'),
        scale: [0.9, 1],
        duration: 500,
        easing: 'spring(1, 80, 10, 0)'
      });
    });
  } catch (err) {
    results.innerHTML = 'Error fetching results';
    console.error(err);
  }
}

// Load video in iframe
function loadVideo(videoId) {
  player.innerHTML = `
    <iframe width="320" height="180"
      src="https://www.youtube.com/embed/${videoId}?autoplay=1"
      title="YouTube video player"
      frameborder="0"
      allow="autoplay; encrypted-media"
      allowfullscreen>
    </iframe>
  `;
}

// Event listener
searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  searchYouTube(query);
});
