export default {
  translation: {
    modal: {
      btnPrimary: 'Read completely',
      btnSecondary: 'Close',
    },
    buttons: {
      add: 'Add',
      viewing: 'Viewing',
    },
    header: 'RSS aggregator',
    desc: 'Start reading RSS today! It\'s easy, it\'s beautiful.',
    labels: {
      forUrlInput: 'RSS Link',
    },
    feedbackSuccess: 'RSS uploaded successfully',
    errors: {
      ParserError: {
        invalidRSS: 'The resource does not contain valid RSS',
      },
      ValidationError: {
        invalidURL: 'The link must be a valid URL',
        alreadyAddedRSS: 'RSS already exists',
      },
      HttpError: {
        NOTFOUND: 'URL not found',
      },
    },
    posts: {
      header: 'Posts',
    },
    feeds: {
      header: 'Feeds',
    },
  },
};
