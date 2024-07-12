const express = require('express');
const movies = require('./movies.json');
const crypto = require('node:crypto');
const cors = require('cors');
const { validateMOvies, validatePartialMovies } = require('./schemas/movies');

const app = express();
app.use(express.json()); // Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        'http://localhost:8080',
        'http://localhost:1234',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://solidsnk86.github.io/REST_API_DEPLOY/',
      ];

      if (ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      if (!origin) {
        return callback(null, true);
      }
    },
  })
);
app.disable('x-powered-by'); // Desabilitar el header X-Powered-By: Express

app.get('/movies', (req, res) => {
  const { genre } = req.query;
  if (genre) {
    const filteredMovies = movies.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
    return res.json(filteredMovies);
  }
  res.json(movies);
});

app.get('/movies/:id', (req, res) => {
  // path-to-regexp
  const { id } = req.params;
  const movie = movies.find((movie) => movie.id === id);
  if (movie) return res.json(movie);
  res.status(404).json({ message: 'Movie not found' });
});

app.post('/movies', (req, res) => {
  const result = validateMOvies(req.body);

  if (result.error) {
    // Podría usarse el 422
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  const newMovie = {
    id: crypto.randomUUID(), // uuid v4
    ...result.data,
  };
  // Esto no sería REST porque estamos guardando
  // el estado de la aplicación en memoria
  movies.push(newMovie);
  res.status(201).json(newMovie);
});

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  movies.splice(movieIndex, 1);
  return res.json({ message: 'Movie Deleted' });
});

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovies(req.body);

  if (!result.success) {
    return res.status(200).json({ error: JSON.parse(result.error.message) });
  }

  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (!movieIndex === -1)
    return res.status(404).json({ message: 'Movie not found' });

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data,
  };

  return res.json(updateMovie);
});

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`);
});
