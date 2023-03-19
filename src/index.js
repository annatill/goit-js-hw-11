import Notiflix from 'notiflix';
import debounce from 'lodash.debounce';
import axios, { isCancel, AxiosError } from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import ImagesApiClient from './js/fetchImages';

const formEl = document.querySelector('#search-form');
formEl.addEventListener('submit', onSearch);

const inputEl = document.querySelector('input[name="searchQuery"]');
inputEl.addEventListener('input', setButtonState);

const buttonEl = document.querySelector('button[type="submit"]');
const divEl = document.querySelector('.gallery');

window.addEventListener('scroll', debounce(onScroll, 300));

let searchQuery = '';
setButtonState();
const imagesApiClient = new ImagesApiClient();
let isLoaderVisible = false;

let gallery = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

async function onSearch(event) {
  event.preventDefault();
  clearGallery();
  searchQuery = event.currentTarget.elements.searchQuery.value.trim();

  try {
    imagesApiClient.resetPage();
    const { hits: response, totalHits } = await fetchImages(searchQuery);
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);

    makeImageMarkup(response);
  } catch (error) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

function makeImageMarkup(response) {
  const imageMarkup = response
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<a class="photo-card" href="${largeImageURL}"><div>
  <img src="${webformatURL}" alt="${tags}" loading="lazy" width="285px" height="200px" />
  <div class="info">
    <p class="info-item">
      <b>🖤 Likes ${likes}</b >
    </p>
    <p class="info-item">
      <b>👓 Views ${views}</b>
    </p>
    <p class="info-item">
      <b>💬 Comments ${comments}</b>
    </p>
    <p class="info-item">
      <b>📥 Downloads ${downloads}</b>
    </p>
  </div>
</div></a>`
    )
    .join('');
  divEl.insertAdjacentHTML('beforeend', imageMarkup);
  gallery.refresh();
}

function setButtonState() {
  if (inputEl.value.trim() === '') {
    buttonEl.setAttribute('disabled', true);
  } else {
    buttonEl.removeAttribute('disabled');
  }
}
function clearGallery() {
  divEl.innerHTML = '';
}

async function onScroll() {
  const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 5) {
    const { hits: response } = await fetchImages(searchQuery);
    makeImageMarkup(response);
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }
}

function renderLoader() {
  if (isLoaderVisible) {
    return;
  }
  const loader = `<span
        class="spinner-border spinner-border-sm spinner is-hidden"
        role="status"
        aria-hidden="true"
      ></span>`;
  divEl.insertAdjacentHTML('beforeend', loader);
  isLoaderVisible = true;
}

function removeLoader() {
  const loader = document.querySelector('.spinner');
  loader.remove();
  isLoaderVisible = false;
}

async function fetchImages(searchQuery) {
  renderLoader();
  const response = await imagesApiClient.fetchImages(searchQuery);
  removeLoader();
  return response;
}
