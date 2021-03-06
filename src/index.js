
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import 'simplelightbox/dist/simple-lightbox.min.css';
import { GalleryApiService } from './js/galleryIP'
import { imageCreate } from './js/imageCreate';

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
        if (urlObj.totalHits < galleryApiService.per_page) {
            refs.loadMoreEl.classList.add('is-hidden');
            Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        } else {
            refs.divGallery.innerHTML = imageCreate(urlObj.hits);
            refs.loadMoreEl.classList.remove('is-hidden');
            simpleLightbox = new SimpleLightbox(".gallery a", optionsSL).refresh();
            Notiflix.Notify.success(`Hooray! We found ${urlObj.totalHits} images`);
            
        };

        } catch (error) {
            ifError();
        };
    };
};

async function onLoadMore() {
    simpleLightbox.destroy();
    try {
        galleryApiService.incrementPage();
        const urlObj = await galleryApiService.fetchGallery(galleryApiService.searchQuery);
        refs.loadMoreEl.classList.remove('is-hidden'); 
        refs.divGallery.insertAdjacentHTML('beforeend', imageCreate(urlObj.hits));
        simpleLightbox = new SimpleLightbox(".gallery a", optionsSL).refresh();
        
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
        Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    };
};

function clearHitsContainer() {
  refs.divGallery.innerHTML = '';
}

