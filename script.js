const apiKey = "4e07419b"; // Replace with your API key

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

async function fetchDetails(id) {
  const url = `https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const popup = document.getElementById('popup');
    const content = document.getElementById('popupContent');

    content.innerHTML = `
      <h2>${data.Title}</h2>
      <p><strong>Year:</strong> ${data.Year}</p>
      <p><strong>Rated:</strong> ${data.Rated}</p>
      <p><strong>Released:</strong> ${data.Released}</p>
      <p><strong>Genre:</strong> ${data.Genre}</p>
      <p><strong>Director:</strong> ${data.Director}</p>
      <p><strong>Actors:</strong> ${data.Actors}</p>
      <p><strong>Plot:</strong> ${data.Plot}</p>
      <p><strong>IMDB Rating:</strong> ${data.imdbRating}</p>
    `;

    popup.classList.remove('hidden');
  } catch (err) {
    console.error(err);
  }
}

function closePopup() {
  document.getElementById('popup').classList.add('hidden');
}

// Theme toggle
document.getElementById('themeToggle').addEventListener('change', function () {
  document.body.classList.toggle('light');
  document.getElementById('themeLabel').textContent = this.checked ? 'Light Mode' : 'Dark Mode';
});
