export default (xml) => {
  try {
    const parser = new DOMParser();
    const RSSDocument = parser.parseFromString(xml, 'text/xml');

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
  } catch (e) {
    const error = new Error();
    error.name = 'ParserError';
    error.message = 'invalidRSS';
    throw error;
  }
};
