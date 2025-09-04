// ============================
// CuteTube Ultimate JS
// ============================

const API_KEY = 'AIzaSyBxLS9otx4tpg5Suk3OdYppTanL1gLJykI';
const VIDEO_COUNT = 12; // videos per batch

let nextPageToken = '';
let currentQuery = '';
const videoGrid = document.querySelector('.video-grid');
const loader = document.querySelector('.loader');
const searchInput = document.querySelector('#search-input');
const searchBtn = document.querySelector('#search-btn');

// Create embedded player container with sidebar
const playerContainer = document.createElement('div');
playerContainer.classList.add('video-player-container');
document.body.appendChild(playerContainer);

playerContainer.innerHTML = `
  <div id="video-player">
    <iframe src="" frameborder="0" allowfullscreen></iframe>
    <div id="video-details">
      <h2></h2>
      <p><span>Channel:</span> <span class="channel-name"></span></p>
      <p><span>Description:</span> <span class="video-desc"></span></p>
    </div>
  </div>
  <div id="playlist-sidebar"></div>
`;

const playerIframe = playerContainer.querySelector('iframe');
const videoTitleEl = playerContainer.querySelector('#video-details h2');
const channelNameEl = playerContainer.querySelector('.channel-name');
const videoDescEl = playerContainer.querySelector('.video-desc');
const playlistSidebar = playerContainer.querySelector('#playlist-sidebar');

// Show player container
function showPlayer(video) {
  const videoId = video.id.videoId || video.id;
  playerIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  videoTitleEl.textContent = video.snippet.title;
  channelNameEl.textContent = video.snippet.channelTitle;
  videoDescEl.textContent = video.snippet.description || 'No description available.';
  playerContainer.classList.add('active');
}

// Display video cards
function displayVideos(videos) {
  videos.forEach(video => {
    const videoId = video.id.videoId || video.id;
    const card = document.createElement('div');
    card.classList.add('video-card');
    card.innerHTML = `
      <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
      <div class="video-info">
        <div class="video-title">${video.snippet.title}</div>
        <div class="video-channel">${video.snippet.channelTitle}</div>
      </div>
    `;

    card.addEventListener('click', () => {
      showPlayer(video);
    });

    videoGrid.appendChild(card);

    // Add to playlist sidebar
    const sidebarCard = card.cloneNode(true);
    sidebarCard.addEventListener('click', () => {
      showPlayer(video);
    });
    playlistSidebar.appendChild(sidebarCard);
  });
}

// Initial preview videos
function loadInitialVideos() {
  fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=${VIDEO_COUNT}&regionCode=MY&key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      displayVideos(data.items);
      nextPageToken = data.nextPageToken || '';
    })
    .catch(err => console.error(err));
}

// Search videos
function searchVideos(query) {
  currentQuery = query;
  videoGrid.innerHTML = '';
  playlistSidebar.innerHTML = '';
  loader.style.display = 'block';

  fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&maxResults=${VIDEO_COUNT}&type=video&key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      displayVideos(data.items);
      nextPageToken = data.nextPageToken || '';
      loader.style.display = 'none';
    })
    .catch(err => console.error(err));
}

// Infinite scroll
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && nextPageToken) {
    loader.style.display = 'block';
    const url = currentQuery 
      ? `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${currentQuery}&maxResults=${VIDEO_COUNT}&type=video&pageToken=${nextPageToken}&key=${API_KEY}`
      : `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=${VIDEO_COUNT}&regionCode=MY&pageToken=${nextPageToken}&key=${API_KEY}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        displayVideos(data.items);
        nextPageToken = data.nextPageToken || '';
        loader.style.display = 'none';
      });
  }
});

// Search button click
searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) searchVideos(query);
});

// Enter key press on search input
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const query = searchInput.value.trim();
    if (query) searchVideos(query);
  }
});

// Load initial popular videos
loadInitialVideos();
