import _ from 'lodash';
import i18n from 'i18next';
import axios from 'axios';
import * as yup from 'yup';
import onChange from 'on-change';

import { Modal } from 'bootstrap';
import render from './view.js';
import resources from './locales/index.js';
import parseRSS from './parser.js';

const getError = (name, message) => {
  const error = new Error();
  error.name = name;
  error.message = message;
  return error;
};

const viaProxy = (url) => {
  const proxy = new URL('https://allorigins.hexlet.app/get');
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
  .then((response) => {
    const { error } = response.data.status;
    if (error) throw getError(error.name, error.code.slice(1));
    return response.data;
  })
  .then((data) => {
    try {
      return parseRSS(data);
    } catch (e) {
      throw getError('ParserError', 'invalidRSS');
    }
  });

const normalizePostCallback = (feedId) => (post) => ({
  id: _.uniqueId(),
  viewed: false,
  feedId,
  ...post,
});

const selectNewPosts = (posts, state, currFeedId) => {
  const namesloadedPosts = state.posts
    .filter((post) => post.feedId === currFeedId)
    .map((post) => post.title);
  return posts
    .filter((post) => !namesloadedPosts.includes(post.title))
    .map((post) => ({ feedId: currFeedId, viewed: false, ...post }));
};

const uploadPosts = (state) => {
  const promises = state.feeds
    .map(({ feedId, url }) => fetchData(url)
      .then(({ posts }) => {
        const newPosts = selectNewPosts(posts, state, feedId)
          .map(normalizePostCallback(feedId));
        if (newPosts.length > 0) state.posts = [...newPosts, ...state.posts];
      })
      .catch((error) => {
        state.error = error;
        state.processState = 'filling';
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
    .then(({ feed, posts }) => {
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

const clickPostHandler = (e, state, elements) => {
  if (e.target.getAttribute('data-bs-toogle') === 'modal') {
    const viewedPost = state.posts.find(({ id }) => id === e.target.getAttribute('data-id'));
    elements.modal.title.textContent = viewedPost.title;
    elements.modal.description.textContent = viewedPost.description;
    elements.modal.btnPrimary.setAttribute('href', viewedPost.link);

    state.posts = state.posts.map((el) => {
      if (el.id === viewedPost.id) el.viewed = true;
      return el;
    });

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
    parsedURLs: [],
    feeds: [],
    posts: [],
    error: null,
    processState: 'filling',
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
