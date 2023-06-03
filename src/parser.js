export default (xml) => {
  const parser = new DOMParser();
  const RSSDocument = parser.parseFromString(xml, 'text/xml');

  const errorNode = RSSDocument.querySelector('parsererror');

  if (errorNode) {
    const error = new Error();
    error.name = 'ParserError';
    error.message = 'invalidRSS';
    throw error;
  }

  return {
    feed: {
      title: RSSDocument.querySelector('title').textContent,
      description: RSSDocument.querySelector('description').textContent,
    },
    posts: Array.from(RSSDocument.querySelectorAll('item'))
      .map((el) => ({
        title: el.querySelector('title').textContent,
        link: el.querySelector('link').textContent,
        description: el.querySelector('description').textContent,
      })),
  };
};
