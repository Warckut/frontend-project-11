import _ from 'lodash';
import i18n from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';

import render from './view.js';
import resources from './locales/index.js';

const schema = yup.object().shape({
  url: yup.string().url().required(),
});

const validate = (fields) => schema
  .validate(fields, { abortEarly: false });

export default () => {
  const elements = {
    form: document.querySelector('form'),
    submitButton: document.querySelector('form button'),
    fields: {
      url: document.querySelector('#url-input'),
    },
    feedback: document.querySelector('p.feedback'),
  };

  const initialState = {
    lng: 'ru',
    processState: 'filling',
    errors: {},
    fields: {
      url: '',
    },
  };

  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: initialState.lng,
    debug: false,
    resources,
  }).then(() => {
    const state = onChange(initialState, render(elements, i18nInstance));

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      state.processState = 'sending';
      validate(state.fields, state.errors)
        .then(() => {
          state.errors = {};
        })
        .catch((reason) => {
          state.errors = Object
            .entries(_.keyBy(reason.inner, 'path'))
            .reduce((acc, [path, error]) => ({ ...acc, [path]: error.name }), {});
        });
      setTimeout(() => { state.processState = 'filling'; }, 1000);
    });

    elements.fields.url.addEventListener('input', (e) => {
      state.fields.url = e.target.value;
    });
  });
};
