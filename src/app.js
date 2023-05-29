import _ from 'lodash';
import i18n from 'i18next';
import axios from 'axios';
import * as yup from 'yup';
import onChange from 'on-change';

import { Modal } from 'bootstrap';
import render from './view.js';
import resources from './locales/index.js';
import parseRSS from './parser.js';

const viaProxy = (url) => {
  const proxy = new URL('get', 'https://allorigins.hexlet.app/');
  proxy.searchParams.append('url', url);
  proxy.searchParams.append('disableCache', 'true');
  return proxy;
};

const validate = (url, parsedURLs) => yup
  .string()
  .url('invalidURL')
  .required()
  .notOneOf(parsedURLs, 'alreadyAddedRSS')
  .validate(url);

const fetchData = (url) => axios.get(viaProxy(url), { timeout: 10000 })
  .then((response) => response.data);

const normalizePostCallback = (feedId) => (post) => ({
  id: _.uniqueId(),
  viewed: false,
  feedId,
  ...post,
});

const uploadPosts = (state) => {
  const promises = state.feeds
    .map(({ feedId, url }) => fetchData(url)
      .then((data) => {
        const { posts } = parseRSS(data.contents);
        state.posts = [_.differenceBy(posts, state.posts, 'title')
          .map(normalizePostCallback(feedId)), ...state.posts];
      })
      .catch((error) => {
        console.log(error);
      }));

  Promise.all(promises).finally(() => {
    setTimeout(uploadPosts, 5000, state);
  });
};

const submitFormHandler = (e, state) => {
  e.preventDefault();
  state.processState = 'loading';

  const formData = new FormData(e.target);
  const url = formData.get('url').trim();
  const parsedURLs = state.feeds.map((feed) => feed.url);

  validate(url, parsedURLs)
    .then(fetchData)
    .then((data) => {
      const { feed, posts } = parseRSS(data.contents);
      state.feeds = [{ id: _.uniqueId(), url, ...feed }, ...state.feeds];
      state.posts = [
        ...posts.map(normalizePostCallback(feed.id)),
        ...state.posts,
      ];
      state.error = null;
      state.processState = 'loaded';
    })
    .catch((error) => {
      state.error = error;
      state.processState = 'filling';
    });
};

const clickPostHandler = (e, state) => {
  if (e.target.getAttribute('data-bs-toogle') === 'modal') {
    const {
      id,
      title,
      description,
      link,
    } = state.posts.find((post) => post.id === e.target.parentElement.getAttribute('data-id'));

    state.modalData = { title, description, link };
    state.UIState.newViewedPost = id;

    const modal = new Modal(document.querySelector('#exampleModal'));
    modal.show();
  }
};

const app = (i18nInstance) => {
  const elements = {
    form: document.querySelector('form'),
    submitButton: document.querySelector('form button'),
    fields: { url: document.querySelector('#url-input') },
    feedback: document.querySelector('p.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modal: {
      modal: document.querySelector('#exampleModal'),
      title: document.querySelector('#exampleModalLabel'),
      description: document.querySelector('.modal-body'),
      btnPrimary: document.querySelector('a.btn-primary'),
      btnSecondary: document.querySelector('button.btn-secondary'),
    },
  };

  const initialState = {
    lng: 'ru',
    feeds: [],
    posts: [],
    error: null,
    processState: 'filling',
    UIState: {
      newViewedPost: null,
    },
    modalData: {
      title: '',
      description: '',
      link: '',
    },
  };

  const state = onChange(initialState, render(elements, i18nInstance));
  elements.form.addEventListener('submit', (e) => submitFormHandler(e, state));
  elements.posts.addEventListener('click', (e) => clickPostHandler(e, state, elements));

  setTimeout(uploadPosts, 5000, state);
};

export default () => {
  const i18nInstance = i18n.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources,
    })
    .then(() => app(i18nInstance));
};
