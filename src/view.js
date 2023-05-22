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

const renderErrors = (elements, errors, prevErrors) => {
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
      elements.feedback.textContent = errors[fieldName].message;
      elements.fields.url.classList.add('is-invalid');
    }
  });
};

export default (elements) => (path, value, prev) => {
  switch (path) {
    case 'processState':
      renderProcessState(elements, value);
      break;

    case 'errors':
      renderErrors(elements, value, prev);
      break;

    default:
      break;
  }
};
