const apiKey = "4e07419b";

// Handle Enter key press
function handleEnterKey(event) {
  if (event.key === 'Enter') {
    searchMovies();
  }
}

// Recent searches functions
function saveRecentSearch(query) {
  let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
  
  // Remove if already exists to avoid duplicates
  recentSearches = recentSearches.filter(search => search !== query);
  
  // Add to beginning of array
  recentSearches.unshift(query);
  
  // Keep only last 5 searches
  if (recentSearches.length > 5) {
    recentSearches = recentSearches.slice(0, 5);
  }
  
  localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  displayRecentSearches();
}

function displayRecentSearches() {
  const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
  const recentDiv = document.getElementById('recentSearches');
  const recentList = document.getElementById('recentList');
  
  if (recentSearches.length > 0) {
    recentDiv.classList.remove('hidden');
    recentList.innerHTML = '';
    
    recentSearches.forEach(search => {
      const item = document.createElement('span');
      item.classList.add('recent-item');
      item.textContent = search;
      item.onclick = () => {
        document.getElementById('searchInput').value = search;
        searchMovies();
      };
      recentList.appendChild(item);
    });
  } else {
    recentDiv.classList.add('hidden');
  }
}

function clearRecentSearches() {
  localStorage.removeItem('recentSearches');
  document.getElementById('recentSearches').classList.add('hidden');
}

async function searchMovies() {
  const query = document.getElementById('searchInput').value.trim();
  const resultsDiv = document.getElementById('results');
  const loader = document.getElementById('loader');
  resultsDiv.innerHTML = '';
  loader.style.display = 'block';

  if (!query) {
    alert("Please enter a movie or TV show name.");
    loader.style.display = 'none';
    return;
  }

  // Save to recent searches
  saveRecentSearch(query);

  const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    loader.style.display = 'none';

    if (data.Response === "True") {
      data.Search.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.onclick = () => fetchDetails(item.imdbID);

        card.innerHTML = `
          <img src="${item.Poster !== "N/A" ? item.Poster : 'https://via.placeholder.com/200x300?text=No+Image'}" alt="${item.Title}">
          <div class="card-content">
            <h3>${item.Title}</h3>
            <p>Year: ${item.Year}</p>
            <p>Type: ${item.Type}</p>
          </div>
        `;
        resultsDiv.appendChild(card);
      });
    } else {
      resultsDiv.innerHTML = `<p>No results found for "${query}".</p>`;
    }
  } catch (err) {
    console.error(err);
    loader.style.display = 'none';
    resultsDiv.innerHTML = `<p>Error occurred while fetching data.</p>`;
  }
}

// Load recent searches on page load
window.addEventListener('DOMContentLoaded', () => {
  displayRecentSearches();
});

let currentMovieData = null; // Store current movie data for sharing

async function fetchDetails(id) {
  const url = `https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    currentMovieData = data; // Store for sharing

    const popup = document.getElementById('popup');
    const content = document.getElementById('popupContent');

    content.innerHTML = `
      <h2>${data.Title}</h2>
      <div style="display: flex; gap: 15px; margin-bottom: 15px;">
        <img src="${data.Poster !== "N/A" ? data.Poster : 'https://via.placeholder.com/150x200?text=No+Image'}" 
             alt="${data.Title}" style="width: 150px; border-radius: 8px;">
        <div>
          <p><strong>Year:</strong> ${data.Year}</p>
          <p><strong>Rated:</strong> ${data.Rated}</p>
          <p><strong>Released:</strong> ${data.Released}</p>
          <p><strong>Genre:</strong> ${data.Genre}</p>
          <p><strong>Director:</strong> ${data.Director}</p>
          <p><strong>Actors:</strong> ${data.Actors}</p>
          <p><strong>IMDB Rating:</strong> ${data.imdbRating} ⭐</p>
        </div>
      </div>
      <p><strong>Plot:</strong> ${data.Plot}</p>
      
      <!-- Only Share button now -->
      <div class="popup-actions">
        <button class="share-btn" onclick="shareMovie()">📤 Share</button>
      </div>
    `;

    popup.classList.remove('hidden');
  } catch (err) {
    console.error(err);
  }
}

function closePopup() {
  document.getElementById('popup').classList.add('hidden');
}

// Theme toggle - FIX: Check if element exists before adding listener
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('change', function () {
    document.body.classList.toggle('light');
    const themeLabel = document.getElementById('themeLabel');
    if (themeLabel) {
      themeLabel.textContent = this.checked ? 'Light Mode' : 'Dark Mode';
    }
  });
}

function shareMovie() {
  if (!currentMovieData) return;

  const movie = currentMovieData;
  const shareText = `Check out "${movie.Title}" (${movie.Year})!\n\nIMDB: ${movie.imdbRating} ⭐\nGenre: ${movie.Genre}\n\n${movie.Plot}`;
  const shareUrl = `https://www.imdb.com/title/${movie.imdbID}/`;

  // Create share modal
  const shareModal = document.createElement('div');
  shareModal.className = 'share-modal';
  shareModal.innerHTML = `
    <div class="share-modal-content">
      <h3>Share "${movie.Title}"</h3>
      
      <div class="share-options">
        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}" 
           target="_blank" class="share-option">🐦 Twitter</a>
        
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}" 
           target="_blank" class="share-option">📘 Facebook</a>
        
        <a href="https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}" 
           target="_blank" class="share-option">💬 WhatsApp</a>
        
        <button onclick="copyToClipboard('${shareUrl.replace(/'/g, "\\'")}'); event.stopPropagation();" class="share-option">📋 Copy Link</button>
      </div>
      
      <input type="text" value="${shareUrl}" class="copy-link-input" readonly onclick="this.select()">
      
      <button onclick="closeShareModal(); event.stopPropagation();" style="margin-top: 15px; background: #666; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer;">Close</button>
    </div>
  `;

  document.body.appendChild(shareModal);
}

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      fallbackCopyTextToClipboard(text);
    });
  } else {
    fallbackCopyTextToClipboard(text);
  }
}

// Fallback copy function
function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    alert('Link copied to clipboard!');
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
    alert('Could not copy text');
  }
  document.body.removeChild(textArea);
}

function closeShareModal() {
  const modal = document.querySelector('.share-modal');
  if (modal) {
    modal.remove();
  }
}

// Close modals when clicking outside - FIX: More specific targeting
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('share-modal')) {
    closeShareModal();
  }
});
