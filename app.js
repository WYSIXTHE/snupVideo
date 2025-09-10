const FILMS_KEY = "snupVideo_films";
const filmsList = document.getElementById("filmsList");
const modalBg = document.getElementById("modalBg");
const modalAddFilm = document.getElementById("modalAddFilm");
const openAddFilmBtn = document.getElementById("openAddFilm");
const closeModalBtn = document.getElementById("closeModal");
const addFilmForm = document.getElementById("addFilmForm");
const addFilmError = document.getElementById("addFilmError");
const filmTemplate = document.getElementById("filmTemplate");

const commentsDrawer = document.getElementById("commentsDrawer");
const closeDrawerBtn = document.getElementById("closeDrawer");
const drawerTitle = document.getElementById("drawerTitle");
const drawerFilmInfo = document.getElementById("drawerFilmInfo");
const drawerComments = document.getElementById("drawerComments");
const drawerCommentForm = document.getElementById("drawerCommentForm");

let films = [];
let currentDrawerIdx = null;

function saveFilms() {
  localStorage.setItem(FILMS_KEY, JSON.stringify(films));
}
function loadFilms() {
  const data = localStorage.getItem(FILMS_KEY);
  films = data ? JSON.parse(data) : [];
}
function filmExists(url) {
  url = url.trim().toLowerCase();
  return films.some(f => f.url.trim().toLowerCase() === url);
}

function openModal() {
  modalBg.classList.remove("hidden");
  modalAddFilm.classList.remove("hidden");
  addFilmError.textContent = "";
  addFilmForm.reset();
}
function closeModal() {
  modalBg.classList.add("hidden");
  modalAddFilm.classList.add("hidden");
}
openAddFilmBtn.onclick = openModal;
closeModalBtn.onclick = closeModal;
modalBg.onclick = function() {
  closeModal();
  closeDrawer();
};

function renderFilms() {
  filmsList.innerHTML = "";
  if (films.length === 0) {
    filmsList.innerHTML = "<p style='color:#aaa;font-size:1.09rem'>Brak dodanych filmów. Dodaj pierwszy!</p>";
    return;
  }
  films.forEach((film, idx) => {
    const node = filmTemplate.content.cloneNode(true);
    const videoCont = node.querySelector('.video-container');
    if (film.url.includes("youtube.com") || film.url.includes("youtu.be")) {
      const ytID = getYouTubeId(film.url);
      if (ytID) {
        videoCont.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${ytID}" frameborder="0" allowfullscreen></iframe>`;
      } else {
        videoCont.textContent = "Nieprawidłowy link YT";
      }
    } else if (film.url.endsWith(".mp4")) {
      videoCont.innerHTML = `<video width="100%" height="100%" controls src="${film.url}"></video>`;
    } else {
      videoCont.textContent = "Nieobsługiwany link";
    }
    node.querySelector('.film-title').textContent = film.title;
    node.querySelector('.film-desc').textContent = film.desc || '';
    node.querySelector('.comments-btn').onclick = () => openDrawer(idx);

    filmsList.appendChild(node);
  });
}

function getYouTubeId(url) {
  try {
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1].split(/[?&]/)[0];
    } else if (url.includes('youtube.com')) {
      const params = new URL(url).searchParams;
      return params.get('v');
    }
  } catch (e) {}
  return null;
}

function escapeHtml(text) {
  return text.replace(/[<>"'&]/g, s => ({
    '<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;','&':'&amp;'
  }[s]));
}

addFilmForm.onsubmit = (e) => {
  e.preventDefault();
  const title = addFilmForm.title.value.trim();
  let url = addFilmForm.url.value.trim();
  const desc = addFilmForm.desc.value.trim();
  if (!title || !url) return;
  if (filmExists(url)) {
    addFilmError.textContent = "Ten film już istnieje w galerii!";
    return;
  }
  if (!url.match(/^https?:\/\/.+/i) || (!url.includes("youtube.com") && !url.includes("youtu.be") && !url.endsWith(".mp4"))) {
    addFilmError.textContent = "Link musi prowadzić do YouTube lub pliku mp4!";
    return;
  }
  films.push({ title, url, desc, comments: [] });
  saveFilms();
  closeModal();
  renderFilms();
};

function openDrawer(idx) {
  currentDrawerIdx = idx;
  const film = films[idx];
  commentsDrawer.classList.remove("hidden");
  setTimeout(() => commentsDrawer.classList.add("visible"), 10);

  drawerTitle.textContent = "Komentarze";
  drawerFilmInfo.innerHTML = `<b>${escapeHtml(film.title)}</b><br><span style="color:#d2bcff">${escapeHtml(film.desc||'')}</span>`;
  renderDrawerComments();

  drawerCommentForm.nick.value = "";
  drawerCommentForm.comment.value = "";
}
function closeDrawer() {
  commentsDrawer.classList.remove("visible");
  setTimeout(() => {
    commentsDrawer.classList.add("hidden");
  }, 320);
  currentDrawerIdx = null;
}
closeDrawerBtn.onclick = closeDrawer;

function renderDrawerComments() {
  if (currentDrawerIdx === null) return;
  const film = films[currentDrawerIdx];
  drawerComments.innerHTML = "";
  (film.comments||[]).forEach(c => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="nick">${escapeHtml(c.nick)}:</span> ${escapeHtml(c.text)}`;
    drawerComments.appendChild(li);
  });
}
drawerCommentForm.onsubmit = e => {
  e.preventDefault();
  if (currentDrawerIdx === null) return;
  const nick = drawerCommentForm.nick.value.trim();
  const comment = drawerCommentForm.comment.value.trim();
  if (!nick || !comment) return;
  films[currentDrawerIdx].comments = films[currentDrawerIdx].comments || [];
  films[currentDrawerIdx].comments.push({nick, text: comment});
  saveFilms();
  renderDrawerComments();
  drawerCommentForm.comment.value = "";
};

// Zamknij drawer ESC
document.addEventListener('keydown', e => {
  if (e.key === "Escape") {
    closeModal();
    closeDrawer();
  }
});

// ========== INIT
loadFilms();
renderFilms();
