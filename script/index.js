import { KEY as OMDB_API_KEY } from "../ignore/ignore.js";

const searchForm = document.getElementById("search-form");
const search = document.getElementById("search");
const searchIcon = document.getElementById("search-icon");
const result = document.getElementById("result");
const loader = document.getElementById("loader");
const error = document.getElementById("error");
const themeSwitcher = document.getElementById("theme-switcher");

function cancelErrorAnimations() {
  error.getAnimations().forEach((anim) => anim.cancel());
}

const slideIn = [
  {
    opacity: 0,
    transform: "translateX(200px)",
  },
  {
    opacity: 1,
    transform: "translateX(0)",
  },
];

const slideOut = [
  {
    opacity: 1,
    transform: "translateX(0)",
  },
  {
    opacity: 0,
    transform: "translateX(200px)",
  },
];

const animationOptions = { duration: 500, easing: "ease", fill: "forwards" };

result.addEventListener("click", (e) => {
  const card = e.target.closest(".movie-card");
  const imdbID = card.querySelector(".imdb-id").textContent;
  console.log(imdbID);
});

async function _fetchApi(url = "") {
  const res = await fetch(url);
  const data = await res.json();
  if (data.Response === "False") {
    result.innerHTML = "";
    error.innerText = `Error: ${data.Error}`;
    animateError(slideIn);
    setTimeout(() => {
      animateError(slideOut);
    }, 4000);
    return;
  }
  error.innerHTML = "";
}

function animateError(anim = []) {
  cancelErrorAnimations();
  error.animate(anim, animationOptions);
}

async function handleSearch() {
  const value = search.value.trim();
  if (!value) return;

  result.innerHTML = "";
  loader.style.display = "inline";
  const movies = await searchMovies(value);
  loader.style.display = "none";
  if (movies) {
    console.log("Found results:\n", movies);
    await displayMovies(movies);
  }
}

searchForm.onsubmit = async (e) => {
  e.preventDefault();
  handleSearch();
};
searchIcon.addEventListener("click", () => handleSearch());

themeSwitcher.addEventListener("click", () => {
  document.documentElement.classList.toggle("light");
  localStorage.setItem(
    "theme",
    document.documentElement.classList.contains("light") ? "light" : "dark",
  );
});

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") 
  document.documentElement.classList.add("light");


async function searchMovies(name = "") {
  let searchArray = [];

  try {
    const res = await fetch(
      `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${name}`,
    );
    const data = await res.json();
    if (data.Response === "False") {
      result.innerHTML = "";
      error.innerText = `Error: ${data.Error}`;
      animateError(slideIn);
      setTimeout(() => {
        animateError(slideOut);
      }, 4000);
      return;
    }
    error.innerHTML = "";
    searchArray = data.Search;
  } catch (e) {
    result.innerHTML = "";
    error.innerText = `Error: ${e.message}`;
    animateError(slideIn);
    setTimeout(() => {
      animateError(slideOut);
    }, 4000);

    return;
  }

  return searchArray;
}

async function displayMovies(movies = [{}]) {
  result.innerHTML = movies
    .map((obj) => {
      let poster = "";
      if (obj.Poster === "" || obj.Poster === "N/A")
        poster = "../assets/no-poster.svg";
      else poster = obj.Poster;

      return `<div class= "movie-card">
    <img src='${poster}' class='movie-poster' alt="poster of movie ${obj.Title}"
      onerror="this.onerror=null;this.src='../assets/no-poster.svg'" 
        >
        <div class="details-wrapper">
        <div class="movie-title">${obj.Title}</div>
        <div class="type">${obj.Type}</div>
        <div class="movie-year">${obj.Year}</div>
        <span class="imdb-id">${obj.imdbID}</span>
    </div>
      </div>`;
    })
    .join("");
}
