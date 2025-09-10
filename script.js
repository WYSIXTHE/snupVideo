document.getElementById('add-video-button').addEventListener('click', function() {
    const videoLink = document.getElementById('video-link').value;
    const videoTitle = document.getElementById('video-title').value;

    if (videoLink && videoTitle) {
        // Poniższy kod tylko tworzy statyczny element.
        // Prawdziwa strona musiałaby zamienić link na wideo YouTube
        // i zapisać dane w bazie danych.
        const videoList = document.getElementById('video-list');
        const newVideoItem = document.createElement('div');
        newVideoItem.classList.add('video-item');
        newVideoItem.textContent = videoTitle;
        newVideoItem.dataset.link = videoLink; // Przechowujemy link w atrybucie danych

        newVideoItem.addEventListener('click', function() {
            // Tutaj logika do wyświetlenia wideo w "main-video-player"
            // Musiałbyś użyć linku (this.dataset.link) i wbudować odtwarzacz YouTube
            alert('Kliknięto wideo: ' + this.textContent);
        });

        videoList.appendChild(newVideoItem);

        // Aktualizacja liczby filmów
        const videoCount = document.querySelectorAll('.video-item').length;
        document.getElementById('video-count').textContent = videoCount;

        // Czyszczenie pól
        document.getElementById('video-link').value = '';
        document.getElementById('video-title').value = '';
    } else {
        alert('Proszę podać link i tytuł filmu.');
    }
});

document.getElementById('submit-comment-button').addEventListener('click', function() {
    const commentInput = document.getElementById('comment-input').value;

    if (commentInput) {
        // Tutaj logika do dodania komentarza do sekcji komentarzy
        // Komentarze nie zostaną zapisane po odświeżeniu strony
        const commentsSection = document.getElementById('comments-section');
        const newComment = document.createElement('p');
        newComment.textContent = 'Anonimowy: ' + commentInput;
        commentsSection.appendChild(newComment);

        // Czyszczenie pola komentarza
        document.getElementById('comment-input').value = '';
    } else {
        alert('Proszę wpisać komentarz.');
    }
});
