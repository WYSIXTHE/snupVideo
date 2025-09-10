const videos = [
  {
    id: 1,
    title: "Tytuł 1",
    thumb: "",
    yt: "https://www.youtube.com/watch?v=ysz5S6PUM-U"
  },
  {
    id: 2,
    title: "Tytuł 2",
    thumb: "",
    yt: "https://www.youtube.com/watch?v=ScMzIvxBSi4"
  }
];

function renderVideos() {
  const grid = document.getElementById('videos-grid');
  grid.innerHTML = '';
  videos.forEach(video => {
    const card = document.createElement('div');
    card.className = 'video-card';

    // Miniatura placeholder (ciemny kwadrat) jeśli brak thumb
    card.innerHTML = `
      <div class="video-thumb" style="background:#232323"></div>
      <div class="video-footer">
        <div class="video-title">${video.title}</div>
        <button class="play-btn" onclick="window.open('${video.yt}', '_blank')">PLAY</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

renderVideos();
