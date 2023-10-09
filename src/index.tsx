import { Elysia, t } from 'elysia';
import { MoviesDatabase, Movie } from './db';
import { html } from '@elysiajs/html';
import * as elements from 'typed-html';

const app = new Elysia().decorate('db', new MoviesDatabase());

app.use(html()).get('/', ({ html }) =>
  html(
    <BaseHtml>
      <main hx-get="/movies" hx-trigger="load" hx-swap="innerHTML" />
    </BaseHtml>
  )
);
app.post(
  '/movies',
  async ({ db, body }) => {
    const { title, director, id } = await db.addMovie(body);
    return <MovieItem title={title} director={director} id={id} />;
  },
  {
    body: t.Object({
      title: t.String(),
      director: t.String(),
    }),
  }
);
app.get('/movies', async ({ db }) => {
  const movies = await db.getMovies();

  return <MovieList movies={movies} />;
});
app
  .delete('/movies/:id', ({ db, params }) =>
    db.deleteMovie(parseInt(params.id))
  )
  .get('/styles.css', () => Bun.file('./tailwind-gen/styles.css'))
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

const BaseHtml = ({ children }: elements.Children | any) => `
  <!DOCTYPE html>
  <html lang="en">
  
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Favorite Movies</title>
    <script src="https://unpkg.com/htmx.org@1.9.6" integrity="sha384-FhXw7b6AlE/jyjlZH5iHa/tTe9EpJ1Y55RjcgPbjeWMskSxZt1v9qkxLJWNJaGni" crossorigin="anonymous"></script>
    <script src="https://unpkg.com/hyperscript.org@0.9.11"></script>
    <link href="/styles.css" rel="stylesheet">
  </head>

  <body>
    ${children}
  </body>

  </html>
`;

const MovieItem = ({ title, director, id }: Movie) => {
  return (
    <li class="col-span-1 flex rounded-md shadow-sm">
      <div class="flex flex-1 items-center justify-between truncate rounded-md border border-gray-200 bg-white">
        <div class="flex-1 truncate px-4 py-2 text-sm">
          <p class="font-medium text-gray-900 hover:text-gray-600">{title}</p>
          <p class="text-gray-500">{director}</p>
        </div>
        <div class="flex-shrink-0 pr-2">
          <button
            type="button"
            hx-delete={`/movies/${id}`}
            hx-target="closest li"
            hx-swap="outerHTML"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span class="sr-only">Delete movie</span>
            <TrashIcon />
          </button>
        </div>
      </div>
    </li>
  );
};

const MovieList = ({ movies }: { movies: Movie[] }) => {
  return (
    <div class="p-10">
      <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
        Favorite Movies
      </h1>
      <ul
        role="list"
        class="movie-list grid mt-8 grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
      >
        {movies.map((movie) => (
          <MovieItem {...movie} />
        ))}
      </ul>
      <MovieForm />
    </div>
  );
};

const MovieForm = () => {
  return (
    <form
      class="space-y-6 mt-10 max-w-md"
      hx-post="/movies"
      hx-target=".movie-list"
      hx-swap="beforeend"
      _="on submit target.reset()"
    >
      <h2 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        Add movie
      </h2>
      <div>
        <label
          for="title"
          class="block text-sm font-medium leading-6 text-gray-900"
        >
          Title
        </label>
        <div class="mt-2">
          <input
            name="title"
            type="text"
            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      <div>
        <label
          for="director"
          class="block text-sm font-medium leading-6 text-gray-900"
        >
          Director
        </label>
        <div class="mt-2">
          <input
            name="director"
            type="text"
            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      <div>
        <button
          type="submit"
          class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Add
        </button>
      </div>
    </form>
  );
};

const TrashIcon = () => {
  return (
    <svg
      class="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke-width="1.5"
      viewBox="0 0 20 20"
      color="currentColor"
    >
      <path
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M6.758 17.243 12.001 12m5.243-5.243L12 12m0 0L6.758 6.757M12.001 12l5.243 5.243"
      ></path>
    </svg>
  );
};
