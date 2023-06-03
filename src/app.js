import _ from 'lodash';
import i18n from 'i18next';
import axios from 'axios';
import * as yup from 'yup';
import onChange from 'on-change';

import render from './view.js';
import resources from './locales/index.js';
import parseRSS from './parser.js';

const timeoutRequest = 5000;

const viaProxy = (url) => {
  const proxy = new URL('get', 'https://allorigins.hexlet.app/');
  proxy.searchParams.append('url', url);
  proxy.searchParams.append('disableCache', 'true');
  return proxy;
};

yup.setLocale({
  mixed: {
    notOneOf: 'alreadyAddedRSS',
  },
  string: {
    url: 'invalidURL',
  },
});

const validate = (url, parsedURLs) => yup
  .string()
  .notOneOf(parsedURLs)
  .url()
  .required()
  .validate(url);

const fetchData = (url) => axios.get(viaProxy(url), { timeout: 10000 });

const normalizePostCallback = (feedId) => (post) => ({
  id: _.uniqueId(),
  viewed: false,
  feedId,
  ...post,
});

const uploadPosts = (state) => {
  const promises = state.feeds
    .map(({ feedId, url }) => fetchData(url)
      .then(({ data }) => {
        const { posts } = parseRSS(data.contents);
        state.posts = [..._.differenceBy(posts, state.posts, 'title')
          .map(normalizePostCallback(feedId)), ...state.posts];
      })
      .catch((error) => {
        console.log(error);
      }));

  Promise.all(promises).finally(() => {
    setTimeout(uploadPosts, timeoutRequest, state);
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
    .then(({ data }) => {
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
      console.log(error.errors);
      state.error = error;
      state.processState = 'notLoaded';
    });
};

const clickPostHandler = (e, state) => {
  if (e.target.getAttribute('data-bs-toogle') === 'modal') {
    const postId = e.target.parentElement.dataset.id;
    state.modalData = postId;
    state.UIState.viewedPosts = [...state.UIState.viewedPosts, postId];
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
      window: document.querySelector('#exampleModal'),
      title: document.querySelector('#exampleModalLabel'),
      description: document.querySelector('.modal-body'),
      btnPrimary: document.querySelector('a.btn-primary'),
      btnSecondary: document.querySelector('button.btn-secondary'),
    },
  };

  const initialState = {
    feeds: [],
    posts: [],
    error: null,
    processState: 'notLoaded',
    UIState: {
      newViewedPost: null,
      viewedPosts: [],
    },
    modalData: {
      id: null,
    },
  };

  const state = onChange(initialState, render(elements, i18nInstance, initialState));
  elements.form.addEventListener('submit', (e) => submitFormHandler(e, state));
  elements.posts.addEventListener('click', (e) => clickPostHandler(e, state, elements));

  setTimeout(uploadPosts, timeoutRequest, state);
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
