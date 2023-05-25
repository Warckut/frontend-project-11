const renderProcessState = (elements, processState, i18nInstance) => {
  switch (processState) {
    case 'loading':
      elements.submitButton.disabled = true;
      break;

    case 'filling':
      elements.submitButton.disabled = false;
      break;

    case 'loaded':
      elements.feedback.textContent = i18nInstance.t('feedbackSuccess');
      elements.feedback.classList.add('text-success');
      elements.submitButton.disabled = false;
      break;

    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const renderError = (elements, error, prevError, i18nInstance) => {
  switch (error?.name) {
    case 'ValidationError':
      if (!prevError) {
        elements.feedback.classList.add('text-danger');
        elements.fields.url.classList.add('is-invalid');
      }
      elements.feedback.textContent = i18nInstance.t(`errors.ValidationError.${error.message}`);
      break;

    case 'ParserError':
      if (!prevError) {
        elements.feedback.classList.add('text-danger');
        elements.fields.url.classList.add('is-invalid');
      }
      elements.feedback.textContent = i18nInstance.t(`errors.ParserError.${error.message}`);
      break;

    default:
      if (prevError) {
        elements.feedback.classList.remove('text-danger');
        elements.feedback.textContent = '';
        elements.fields.url.classList.remove('is-invalid');
      }
      break;
  }
};

const initialRender = (elements, i18nInstance) => {
  elements.submitButton.textContent = i18nInstance.t('buttons.add');
  document.querySelector('h1').textContent = i18nInstance.t('header');
  document.querySelector('p.lead').textContent = i18nInstance.t('desc');
  document.querySelector('#url-input')
    .nextElementSibling.textContent = i18nInstance.t('labels.forUrlInput');
};

const renderPosts = (elements, value, i18nInstance) => {
  const headerContainer = document.createElement('div');
  headerContainer.classList.add('card-body');
  const header = document.createElement('h2');
  header.classList.add('h4', 'card-title');
  header.textContent = i18nInstance.t('posts.header');
  headerContainer.append(header);

  const postsElements = value.map(({
    title,
    link,
  }) => {
    const el = document.createElement('li');
    el.classList.add('posts__item', 'list-group-item', 'border-0', 'border-end-0');
    const titleEl = document.createElement('a');
    titleEl.textContent = title;
    titleEl.classList.add('fw-bold');
    titleEl.setAttribute('href', link);
    el.append(titleEl);
    return el;
  });
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  ul.append(...postsElements);
  elements.posts.replaceChildren(headerContainer, ul);
};

const renderFeeds = (elements, value, i18nInstance) => {
  const headerContainer = document.createElement('div');
  headerContainer.classList.add('card-body');
  const header = document.createElement('h2');
  header.classList.add('h4');
  header.textContent = i18nInstance.t('feeds.header');
  headerContainer.append(header);

  const feedsElements = value.map(({
    title,
    description,
  }) => {
    const el = document.createElement('li');
    el.classList.add('feeds__item', 'list-group-item', 'border-0', 'border-end-0');
    const titleEl = document.createElement('h4');
    titleEl.classList.add('h6');
    titleEl.textContent = title;
    const descEl = document.createElement('p');
    descEl.classList.add('small');
    descEl.textContent = description;
    el.append(titleEl, descEl);
    return el;
  });
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  ul.append(...feedsElements);
  elements.feeds.replaceChildren(headerContainer, ul);
};

export default (elements, i18nInstance) => {
  initialRender(elements, i18nInstance);

  return (path, value, prev) => {
    switch (path) {
      case 'lng':
        i18nInstance.changeLanguage(value).then(() => initialRender(elements, i18nInstance));
        break;

      case 'feeds':
        renderFeeds(elements, value, i18nInstance);
        break;

      case 'posts':
        renderPosts(elements, value, i18nInstance);
        break;

      case 'processState':
        renderProcessState(elements, value, i18nInstance);
        break;

      case 'error':
        renderError(elements, value, prev, i18nInstance);
        break;

      default:
        break;
    }
  };
};
