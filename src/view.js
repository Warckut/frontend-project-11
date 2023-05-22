import _ from 'lodash';

const renderProcessState = (elements, processState) => {
  switch (processState) {
    case 'sending':
      elements.submitButton.disabled = true;
      break;

    case 'filling':
      elements.submitButton.disabled = false;
      break;

    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const renderErrors = (elements, errors, prevErrors, i18nInstance) => {
  Object.entries(elements.fields).forEach(([fieldName, fieldElement]) => {
    const fieldHadError = _.has(prevErrors, fieldName);
    const fieldHasError = _.has(errors, fieldName);

    if (fieldHadError && !fieldHasError) {
      elements.feedback.classList.remove('text-danger');
      elements.feedback.textContent = '';
      fieldElement.classList.remove('is-invalid');
      return;
    }

    if (fieldHasError) {
      elements.feedback.classList.add('text-danger');
      const textError = i18nInstance.t(`errors.${fieldName}.${errors[fieldName]}`);
      elements.feedback.textContent = textError;
      elements.fields.url.classList.add('is-invalid');
    }
  });
};

const render = (elements, i18nInstance) => {
  elements.submitButton.textContent = i18nInstance.t('buttons.add');
  document.querySelector('h1').textContent = i18nInstance.t('header');
  document.querySelector('p.lead').textContent = i18nInstance.t('desc');
  document.querySelector('#url-input')
    .nextElementSibling.textContent = i18nInstance.t('labels.forUrlInput');
};

export default (elements, i18nInstance) => {
  render(elements, i18nInstance);

  return (path, value, prev) => {
    switch (path) {
      case 'processState':
        renderProcessState(elements, value);
        break;

      case 'errors':
        renderErrors(elements, value, prev, i18nInstance);
        break;

      case 'lng':
        i18nInstance.changeLanguage(value).then(() => render(elements, i18nInstance));
        break;

      default:
        break;
    }
  };
};
