// ========== LOCALSTORAGE KEYS
const FILMS_KEY = "snupVideo_films";

// ========== ELEMENTS
const filmsList = document.getElementById("filmsList");
const modalBg = document.getElementById("modalBg");
const modalAddFilm = document.getElementById("modalAddFilm");
const openAddFilmBtn = document.getElementById("openAddFilm");
const closeModalBtn = document.getElementById("closeModal");
const addFilmForm = document.getElementById("addFilmForm");
const addFilmError = document.getElementById("addFilmError");
const filmTemplate = document.getElementById("filmTemplate");

// ========== STATE
let films = [];

// ========== UTILS
function saveFilms() {
  localStorage.setItem(FILMS_KEY, JSON.stringify(films));
}

function loadFilms() {
  const data = localStorage.getItem(FILMS_KEY);
  films = data ? JSON.parse(data) : [];
}

// Check duplicate by url (case-insensitive, trimmed)
function filmExists(url) {
  url = url.trim().toLowerCase();
  return films.some(f => f.url.trim().toLowerCase() === url);
}

// ========== MODAL HANDLING
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
modalBg.onclick = closeModal;

// ========== FILM RENDERING
function renderFilms() {
  filmsList.innerHTML = "";
  if (films.length === 0) {
    filmsList.innerHTML = "<p style='color:#aaa;font-size:1.09rem'>Brak dodanych filmów. Dodaj pierwszy!</p>";
    return;
  }
  films.forEach((film, idx) => {
    const node = filmTemplate.content.cloneNode(true);
    // Video
    const videoCont = node.querySelector('.video-container');
    if (film.url.includes("youtube.com") || film.url.includes("youtu.be")) {
      // YouTube embed
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
    // Info
    node.querySelector('.film-title').textContent = film.title;
    node.querySelector('.film-desc').textContent = film.desc || '';
    // Komentarze
    renderComments(node, film, idx);
    // Dodaj do listy
    filmsList.appendChild(node);
  });
}

function getYouTubeId(url) {
  // Obsługa różnych formatów YT
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

// ========== KOMENTARZE
function renderComments(node, film, idx) {
  const commentsList = node.querySelector('.comments-list');
  film.comments = film.comments || [];
  film.comments.forEach(c => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="nick">${escapeHtml(c.nick)}:</span> ${escapeHtml(c.text)}`;
    commentsList.appendChild(li);
  });

  const form = node.querySelector('.add-comment-form');
  form.onsubmit = (e) => {
    e.preventDefault();
    const nick = form.nick.value.trim();
    const comment = form.comment.value.trim();
    if (!nick || !comment) return;
    film.comments.push({nick, text: comment});
    saveFilms();
    renderFilms();
  };
}

// ========== FORMULARZ DODAWANIA FILMU
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
  // Minimalna walidacja YT/mp4
  if (!url.match(/^https?:\/\/.+/i) || (!url.includes("youtube.com") && !url.includes("youtu.be") && !url.endsWith(".mp4"))) {
    addFilmError.textContent = "Link musi prowadzić do YouTube lub pliku mp4!";
    return;
  }
  films.push({ title, url, desc, comments: [] });
  saveFilms();
  closeModal();
  renderFilms();
};

// ========== XSS ESCAPE
function escapeHtml(text) {
  return text.replace(/[<>"'&]/g, s => ({
    '<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;','&':'&amp;'
  }[s]));
}

// ========== INIT
loadFilms();
renderFilms();
