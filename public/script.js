document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('list');
  const playBtn = document.getElementById('playSelected');
  const stopBtn = document.getElementById('stop');
  const player = document.getElementById('player');
  const now = document.getElementById('now');
  const fileCount = document.getElementById('fileCount');
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');
  const ITEMS_PER_PAGE = 5;
  
  // Modal elements
  const modal = document.getElementById('detailsModal');
  const closeBtn = document.querySelector('.close');
  const detailsTitle = document.getElementById('detailsTitle');
  const detailsBody = document.getElementById('detailsBody');

  let playlist = [];
  let currentIndex = -1;
  let currentPage = 1;
  let totalPages = 1;
  let totalFiles = 0;

  function formatName(name) {
    try { return decodeURIComponent(name); } catch(e){ return name; }
  }

  function formatFileSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function showModal(title, content) {
    detailsTitle.textContent = title;
    detailsBody.textContent = content;
    modal.classList.add('show');
    // Prevent body scroll on mobile when modal is open
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('show');
    // Restore body scroll
    document.body.style.overflow = '';
  }

  async function fetchDetails(filename) {
    const nameWithoutExt = filename.replace(/\.[^.]+$/, '');
    const descFilename = nameWithoutExt + '.desc';
    
    try {
      const response = await fetch(`/podcasts/${descFilename}`);
      if (!response.ok) {
        return 'No details available for this file.';
      }
      const content = await response.text();
      return content;
    } catch (err) {
      console.error('Error loading .desc file:', err);
      return 'Error loading content.'
    }
  }

  function renderList(data) {
    const items = data.files;
    const pagination = data.pagination;
    
    // Update pagination info
    currentPage = pagination.page;
    totalPages = pagination.totalPages;
    totalFiles = pagination.totalFiles;
    
    // Update UI elements
    fileCount.textContent = `${totalFiles} podcast files total`;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = !pagination.hasPrev;
    nextPageBtn.disabled = !pagination.hasNext;

    if (!items.length) {
      listEl.innerHTML = '<div class="empty">No Podcast files found in the <code>podcasts/</code> folder</div>';
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
      
      const title = document.createElement('div');
      title.className = 'file-title';
      title.textContent = it.name;
      
      const meta = document.createElement('div');
      meta.className = 'file-meta';
      meta.textContent = `Modified ${formatDate(it.mtime)} • ${formatFileSize(it.size)}`;
      
      label.appendChild(title);
      label.appendChild(meta);

      const playSingle = document.createElement('button');
      playSingle.textContent = '▶';
      playSingle.title = 'Play only this file';
      playSingle.className = 'action-btn play-btn';
      playSingle.addEventListener('click', () => {
        playlist = [it.url];
        startPlaylist(0);
      });

      const detailsBtn = document.createElement('button');
      detailsBtn.textContent = 'ℹ';
      detailsBtn.title = 'Show details';
      detailsBtn.className = 'action-btn details-btn';
      detailsBtn.addEventListener('click', async () => {
        const content = await fetchDetails(it.name);
        showModal(it.name, content);
      });
      
      // Create button wrapper for better mobile layout
      const buttonWrapper = document.createElement('div');
      buttonWrapper.className = 'button-wrapper';
      buttonWrapper.appendChild(playSingle);
      buttonWrapper.appendChild(detailsBtn);

      // keep label state in sync for browsers where CSS sibling selectors may be inconsistent
      cb.addEventListener('change', () => {
        label.classList.toggle('checked', cb.checked);
      });

      row.appendChild(cb);
      row.appendChild(label);
      row.appendChild(buttonWrapper);
      frag.appendChild(row);
    });

    listEl.innerHTML = '';
    listEl.appendChild(frag);
  }

  async function loadList() {
    listEl.textContent = 'Loading...';
    try {
      const res = await fetch(`/api/podcasts?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
      const data = await res.json();
      renderList(data);
    } catch (err) {
      listEl.textContent = 'Error loading files.';
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
      now.textContent = 'Playback finished.';
      player.src = '';
      currentIndex = -1;
      stopBtn.disabled = true;
      return;
    }

    const url = playlist[i];
    player.src = url;
    player.play().catch(err => console.warn('Unable to play:', err));
    now.textContent = 'Now playing: ' + (formatName(url.replace('/podcasts/','')));
  }

  // Event listeners for pagination
  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadList();
    }
  });

  nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadList();
    }
  });



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

  // Modal event listeners
  closeBtn.addEventListener('click', closeModal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    
    if (e.key === 'ArrowLeft' && !prevPageBtn.disabled) {
      e.preventDefault();
      prevPageBtn.click();
    } else if (e.key === 'ArrowRight' && !nextPageBtn.disabled) {
      e.preventDefault();
      nextPageBtn.click();
    }
  });

  // initial load
  loadList();
});

