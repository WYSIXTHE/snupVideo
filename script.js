// KONFIGURACJA FIREBASE
const firebaseConfig = {
  apiKey: "1:346817626388:web:4392536d75afabad728201",
  authDomain: "gvideo-e3622.firebaseapp.com",
  projectId: "gvideo-e3622",
  storageBucket: "gvideo-e3622.appspot.com",
  messagingSenderId: "346817626388",
  appId: "1:346817626388:web:4392536d75afabad728201"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DODAWANIE FILMU
function addVideo() {
  const title = document.getElementById('title').value.trim();
  const url = document.getElementById('url').value.trim();
  const description = document.getElementById('description').value.trim();
  const comments = document.getElementById('comments').value.trim().split('\n').filter(c => c);

  if (!title || !url) {
    alert('Wypełnij tytuł i link!');
    return;
  }

  db.collection('videos').add({
    title,
    url,
    description,
    comments,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    alert('Film dodany pomyślnie!');
    document.getElementById('title').value = '';
    document.getElementById('url').value = '';
    document.getElementById('description').value = '';
    document.getElementById('comments').value = '';
  }).catch(err => alert(err.message));
}

// GENEROWANIE EMBED VIDEO
function generateVideoEmbed(url) {
  try {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = url.includes('youtu.be') ? url.split('/').pop() : new URL(url).searchParams.get('v');
      return `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    } else if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      return `<iframe src="https://player.vimeo.com/video/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    } else {
      return `<video controls src="${url}"></video>`;
    }
  } catch(e) {
    return `<a href="${url}" target="_blank">Otwórz film</a>`;
  }
}

// ŁADOWANIE FILMÓW
function loadVideos() {
  db.collection('videos').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
    const list = document.getElementById('videoList');
    list.innerHTML = '';
    if (snapshot.empty) {
      list.innerHTML = '<p>Brak filmów.</p>';
      return;
    }
    snapshot.forEach(doc => {
      const v = doc.data();
      const div = document.createElement('div');
      div.className = 'video';
      div.innerHTML = `
        <strong>${v.title}</strong>
        <button onclick="deleteVideo('${doc.id}')">Usuń</button>
        <div>${generateVideoEmbed(v.url)}</div>
        <em>${v.description}</em>
        <strong>Komentarze:</strong>
        <ul>${v.comments.map(c => `<li>${c}</li>`).join('')}</ul>
      `;
      list.appendChild(div);
    });
  });
}

// USUWANIE FILMU
function deleteVideo(id) {
  if(confirm('Na pewno chcesz usunąć ten film?')) {
    db.collection('videos').doc(id).delete().catch(err => alert(err.message));
  }
}

// Inicjalizacja
loadVideos();
