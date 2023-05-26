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
  if (error) {
    if (!prevError) {
      elements.feedback.classList.add('text-danger');
      elements.fields.url.classList.add('is-invalid');
    }
    elements.feedback.textContent = i18nInstance.t(`errors.${error.name}.${error.message}`);
    return;
  }

  if (prevError) {
    elements.feedback.classList.remove('text-danger');
    elements.feedback.textContent = '';
    elements.fields.url.classList.remove('is-invalid');
  }
};

const initialRender = (elements, i18nInstance) => {
  elements.submitButton.textContent = i18nInstance.t('buttons.add');
  document.querySelector('h1').textContent = i18nInstance.t('header');
  document.querySelector('p.lead').textContent = i18nInstance.t('desc');
  document.querySelector('#url-input')
    .nextElementSibling.textContent = i18nInstance.t('labels.forUrlInput');

  elements.modal.btnPrimary.textContent = i18nInstance.t('modal.btnPrimary');
  elements.modal.btnSecondary.textContent = i18nInstance.t('modal.btnSecondary');
};

const renderPosts = (elements, value, i18nInstance) => {
  const headerContainer = document.createElement('div');
  headerContainer.classList.add('card-body');
  const header = document.createElement('h2');
  header.classList.add('h4', 'card-title');
  header.textContent = i18nInstance.t('posts.header');
  headerContainer.append(header);

  const postsElements = value.map(({
    id,
    title,
    link,
    viewed,
  }) => {
    const el = document.createElement('li');
    const classListForListGroupItem = [
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'posts__item',
      'list-group-item',
      'border-0', 'border-end-0',
    ];
    el.classList.add(...classListForListGroupItem);

    const titleEl = document.createElement('a');
    titleEl.textContent = title;
    titleEl.classList.add('fw-bold');
    if (viewed) titleEl.classList.add('fw-normal', 'link-secondary');
    titleEl.setAttribute('href', link);

    const btn = document.createElement('button');
    btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    btn.setAttribute('data-bs-toogle', 'modal');
    btn.setAttribute('data-bs-target', '#exampleModal');
    btn.setAttribute('data-id', id);
    btn.textContent = i18nInstance.t('buttons.viewing');

    el.append(titleEl, btn);
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
