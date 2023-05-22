import _ from 'lodash';
import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';

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
      url: document.querySelector('form input[type=text]'),
    },
    feedback: document.querySelector('p.feedback'),
  };

  const initialState = {
    processState: 'filling',
    errors: [],
    fields: {
      url: '',
    },
  };

  const state = onChange(initialState, render(elements));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.processState = 'sending';
    validate(state.fields, state.errors)
      .then(() => {
        state.errors = {};
      })
      .catch((reason) => {
        const errors = _.keyBy(reason.inner, 'path');
        state.errors = errors;
      });
    setTimeout(() => { state.processState = 'filling'; }, 1000);
  });

  elements.fields.url.addEventListener('input', (e) => {
    state.fields.url = e.target.value;
  });
};
