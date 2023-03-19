import axios from 'axios';

const paramsSearch = {
  url: 'https://pixabay.com/api/',
  key: '34476272-8eefbecdf655f62236187bd3a',
  q: '',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
  per_page: 40,
};

export default class ImagesApiClient {
  constructor() {
    this.page = 1;
  }

  async fetchImages(searchQuery) {
    const urlParams = [
      `key=${paramsSearch.key}`,
      `q=${searchQuery}`,
      `image_type=${paramsSearch.image_type}`,
      `orientation=${paramsSearch.orientation}`,
      `safesearch=${paramsSearch.safesearch}`,
      `page=${this.page}`,
      `per_page=${paramsSearch.per_page}`,
    ];
    const url = `${paramsSearch.url}?${urlParams.join('&')}`;
    try {
      const response = await axios.get(url);
      this.incrementPage();
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
  incrementPage() {
    this.page += 1;
  }
  resetPage() {
    this.page = 1;
  }
}
