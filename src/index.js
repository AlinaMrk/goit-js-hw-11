
// import './sass/main.scss';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import 'simplelightbox/dist/simple-lightbox.min.css';
import { GalleryApiService } from './js/galleryIP'
import { imageCreate } from './js/imageCreate';
// import {galleryTpl} from './templates/gallery.hbs';

const refs = {
    formEl: document.querySelector('.search-form'),
    btnSubmit: document.querySelector('.btn-submit'),
    divGallery: document.querySelector('.gallery'),
    loadMoreEl: document.querySelector('.loadmore'),
};

refs.formEl.addEventListener('submit', onClickSubmit);
refs.loadMoreEl.addEventListener('click', onLoadMore);

const galleryApiService = new GalleryApiService();

const optionsSL = {
    overlayOpacity: 0.5,
    captionsData: "alt",
    captionDelay: 250,
};
let simpleLightbox;

async function onClickSubmit(e) {
    e.preventDefault();
    clearHitsContainer();
    galleryApiService.searchQuery = e.currentTarget.elements.searchQuery.value.trim();
    if (galleryApiService.searchQuery === '') {    
        refs.loadMoreEl.classList.add('is-hidden');
        Notiflix.Notify.info('Please enter something');
        return;
    } else {
        try {
            galleryApiService.resetPage();
            const urlObj = await galleryApiService.fetchGallery(galleryApiService.searchQuery);
            refs.divGallery.innerHTML = imageCreate(urlObj.hits);
            refs.loadMoreEl.classList.remove('is-hidden'); // скрыть кнопку при пустом поиске    
            Notiflix.Notify.success(`Hooray! We found ${urlObj.totalHits} images`);
            simpleLightbox = new SimpleLightbox(".gallery a", optionsSL).refresh();
            //lightbox.refresh(); //вызов лайтбокса
        if (urlObj.totalHits < galleryApiService.per_page) {
            refs.loadMoreEl.classList.add('is-hidden');
            Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
            };
        } catch (error) {
            //Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
            ifError();
        };
    };
};

async function onLoadMore() {
    simpleLightbox.destroy();
    try {
        galleryApiService.incrementPage();
        const urlObj = await galleryApiService.fetchGallery(galleryApiService.searchQuery);
        refs.loadMoreEl.classList.remove('is-hidden'); // возвращает кнопку
        refs.divGallery.insertAdjacentHTML('beforeend', imageCreate(urlObj.hits));
        simpleLightbox = new SimpleLightbox(".gallery a", optionsSL).refresh();
        //lightbox.refresh();
        const { height: cardHeight } = refs.divGallery.firstElementChild.getBoundingClientRect();    
        window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
        if (galleryApiService.page > urlObj.totalHits / galleryApiService.per_page) {
            refs.loadMoreEl.classList.add('is-hidden');
            return Notiflix.Notify.success('Your search has come to an end');
        }
    } catch (error) {      
        //refs.loadMoreEl.classList.add('is-hidden'); // добавить кнопку при пустом поиске
        Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    };
};

// function appendHitsMarkup(hits) {
//   refs.divGallery.insertAdjacentHTML('beforeend', galleryTpl(hits));
// }

function clearHitsContainer() {
  refs.divGallery.innerHTML = '';
}

// const lightbox = new SimpleLightbox('.gallery a', {
//   captionsData: 'alt',
//   captionDelay: 250,
// });