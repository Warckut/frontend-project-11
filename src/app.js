import _ from 'lodash';
import i18n from 'i18next';
import axios from 'axios';
import * as yup from 'yup';
import onChange from 'on-change';

import render from './view.js';
import resources from './locales/index.js';
import parserRSS from './parser.js';

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

const fetchData = (url) => axios.get(viaProxy(url))
  .then((response) => {
    if (response.statusText === 'OK') return response.data;
    throw new Error('Network response was not ok.');
  })
  .then((data) => {
    const parser = parserRSS(data.contents);
    return { feed: parser.getFeed(), posts: parser.getPosts() };
  });

const uploadPosts = (state) => {
  const promises = state.feeds
    .map(({ feedId, url }) => fetchData(url)
      .then(({ posts }) => {
        const namesloadedPosts = state.posts
          .filter((post) => post.feedId === feedId)
          .map((post) => post.title);
        const newPosts = posts
          .filter((post) => !namesloadedPosts.includes(post.title))
          .map((post) => ({ feedId, ...post }));
        if (newPosts.length > 0) state.posts = [...newPosts, ...state.posts];
      })
      .catch((error) => {
        state.error = error;
        state.processState = 'filling';
      }));
  Promise.all(promises).then(() => {
    setTimeout(uploadPosts, 5000, state);
  });
};

const submitFormHandler = (e, state) => {
  e.preventDefault();
  state.processState = 'loading';
  const formData = new FormData(e.target);
  const url = formData.get('url');
  validate(url, state.parsedURLs)
    .then(fetchData)
    .then(({ feed, posts }) => {
      state.feeds = [{ id: _.uniqueId(), url, ...feed }, ...state.feeds];
      state.posts = [...posts.map((post) => ({ feedId: feed.id, ...post })), ...state.posts];
      state.error = null;
      state.processState = 'loaded';
      state.parsedURLs.push(url);
    })
    .catch((error) => {
      console.log(error);
      state.error = error;
      state.processState = 'filling';
    });
};

const app = (i18nInstance) => {
  const elements = {
    form: document.querySelector('form'),
    submitButton: document.querySelector('form button'),
    fields: {
      url: document.querySelector('#url-input'),
    },
    feedback: document.querySelector('p.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
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
