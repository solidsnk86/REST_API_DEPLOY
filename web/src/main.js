const $ = (selector) => document.querySelector(selector);

const ids = [
  'id',
  'title',
  'year',
  'director',
  'duration',
  'poster',
  'genre',
  'rate',
];

const api = {
  url: 'https://rest-api-deploy-dun.vercel.app/movies',
  reader: async (data) => {
    return data.map((movie) => ({
      id: movie.id,
      title: movie.title,
      poster: movie.poster,
      year: 'Year: ' + movie.year,
      duration: movie.duration + ' Min.',
      director: 'Director: ' + movie.director,
      genre: movie.genre,
      rate: movie.rate.toFixed(1),
    }));
  },
};

function movieRateColor(rate) {
  if (rate >= 9.0) {
    return 'green';
  } else if (rate >= 8.0) {
    return 'yellow';
  } else if (rate >= 7.0) {
    return 'goldenrod';
  } else if (rate <= 5.0) {
    return 'red';
  }
  return 'orange';
}

async function populateMovies(movies) {
  const container = document.querySelector('main');
  container.innerHTML = '';

  movies.forEach((movie) => {
    const article = document.createElement('article');
    article.dataset.id = movie.id;
    article.id = 'article-id';

    const div = document.createElement('div');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Eliminar';
    deleteButton.id = 'delete-article';

    ids.forEach((id) => {
      let element;

      if (id === 'title') {
        element = document.createElement('h2');
        element.innerText = movie[id];
      } else if (id === 'poster') {
        element = document.createElement('img');
        element.src = movie[id];
        element.alt = movie[id].title;
      } else if (id === 'id') {
        return null;
      } else {
        element = document.createElement('p');
        element.innerText = movie[id];
      }

      if (id === 'rate') {
        element = document.createElement('span');
        element.innerHTML = movie[id];
        element.style.background = movieRateColor(movie[id]);
      }

      div.appendChild(element);
    });

    article.appendChild(div);
    div.appendChild(deleteButton);
    container.appendChild(article);

    deleteButton.onclick = async () => {
      await fetch(
        `https://rest-api-deploy-dun.vercel.app/movies/${article.dataset.id}`,
        {
          mode: 'cors',
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      ).then((res) => {
        if (res.ok) {
          article.remove();
        }
      });
    };
  });
}

async function handleCreateMovie(event) {
  event.preventDefault();

  const titleInput = $('#title');
  const posterInput = $('#poster');
  const directorInput = $('#director');
  const yearInput = $('#year');
  const genreInput = $('#genre');
  const durationInput = $('#duration');
  const rateInput = $('#rate');

  const movieData = {
    title: titleInput.value,
    year: Number(yearInput.value),
    director: directorInput.value,
    duration: Number(durationInput.value),
    poster: posterInput.value,
    genre: [genreInput.value],
    rate: Number(rateInput.value),
  };

  await fetch(api.url, {
    mode: 'cors',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(movieData),
  }).then((response) => {
    if (response.ok) {
      Movies.getAll();
    } else {
      console.error('Error creating movie:', response);
    }
  });
  titleInput.value = '';
  yearInput.value = '';
  directorInput.value = '';
  durationInput.value = '';
  posterInput.value = '';
  genreInput.value = '';
  rateInput.value = '';
}

class Movies {
  static async getAll() {
    await fetch(api.url, {
      mode: 'cors',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => api.reader(data))
      .then((movies) => populateMovies(movies))
      .catch((error) => console.error('Error fetching movies:', error));
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  Movies.getAll();

  const form = $('form');
  form.addEventListener('submit', handleCreateMovie);
});
