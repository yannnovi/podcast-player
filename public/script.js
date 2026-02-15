document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('list');
  const playBtn = document.getElementById('playSelected');
  const stopBtn = document.getElementById('stop');
  const player = document.getElementById('player');
  const now = document.getElementById('now');

  let playlist = [];
  let currentIndex = -1;

  function formatName(name) {
    try { return decodeURIComponent(name); } catch(e){ return name; }
  }

  function renderList(items) {
    if (!items.length) {
      listEl.innerHTML = '<div class="empty">No Podcasts files found in the <code>podcasts/</code> folder</div>';
      return;
    }

    const frag = document.createDocumentFragment();
    items.forEach((it, i) => {
      const row = document.createElement('div');
      row.className = 'row';

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.id = 'cb-' + i;
      cb.dataset.url = it.url;

      const label = document.createElement('label');
      label.htmlFor = cb.id;
      label.textContent = it.name;

      // keep label state in sync for browsers where CSS sibling selectors may be inconsistent
      cb.addEventListener('change', () => {
        label.classList.toggle('checked', cb.checked);
      });

      const playSingle = document.createElement('button');
      playSingle.textContent = '▶';
  playSingle.title = 'Play only this file';
      playSingle.addEventListener('click', () => {
        playlist = [it.url];
        startPlaylist(0);
      });

      row.appendChild(cb);
      row.appendChild(label);
      row.appendChild(playSingle);
      frag.appendChild(row);
    });

    listEl.innerHTML = '';
    listEl.appendChild(frag);
  }

  async function loadList() {
    listEl.textContent = 'Loading...';
    try {
      const res = await fetch('/api/podcasts');
      const items = await res.json();
      renderList(items);
    } catch (err) {
      listEl.textContent = 'Error while fetching files.';
      console.error(err);
    }
  }

  function startPlaylist(startIndex = 0) {
    const boxes = Array.from(document.querySelectorAll('#list input[type=checkbox]'));
    if (playlist.length === 0) {
      // build playlist from checked boxes
      playlist = boxes.filter(b => b.checked).map(b => b.dataset.url);
    }

    if (!playlist || playlist.length === 0) {
      alert('No files selected.');
      return;
    }

    currentIndex = startIndex >= 0 ? startIndex : 0;
    playIndex(currentIndex);
    stopBtn.disabled = false;
  }

  function playIndex(i) {
    if (i < 0 || i >= playlist.length) {
      now.textContent = 'Lecture terminée.';
      player.src = '';
      currentIndex = -1;
      stopBtn.disabled = true;
      return;
    }

    const url = playlist[i];
    player.src = url;
    player.play().catch(err => console.warn('Impossible de jouer:', err));
    now.textContent = 'Now playing: ' + (formatName(url.replace('/podcasts/','')));
  }

  player.addEventListener('ended', () => {
    if (currentIndex === -1) return;
    currentIndex += 1;
    playIndex(currentIndex);
  });

  stopBtn.addEventListener('click', () => {
    player.pause();
    player.currentTime = 0;
    playlist = [];
    currentIndex = -1;
    now.textContent = 'Stopped.';
    stopBtn.disabled = true;
  });

  playBtn.addEventListener('click', () => {
    playlist = []; // force rebuild from selected
    startPlaylist(0);
  });

  // initial load
  loadList();
});
