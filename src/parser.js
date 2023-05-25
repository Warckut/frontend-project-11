export default (xml) => {
  const parser = new DOMParser();
  const RSSDocument = parser.parseFromString(xml, 'text/xml');

  const parserError = RSSDocument.querySelector('parsererror');

  if (parserError) {
    const error = new Error(parserError.textContent);
    error.name = 'ParserError';
    error.message = 'invalidRSS';
    throw error;
  }

  const getFeed = () => ({
    title: RSSDocument.querySelector('title').textContent,
    description: RSSDocument.querySelector('description').textContent,
  });

  const getPosts = () => (Array.from(RSSDocument.querySelectorAll('item'))
    .map((el) => ({
      title: el.querySelector('title').textContent,
      link: el.querySelector('link').textContent,
      description: el.querySelector('description').textContent,
    })));

  return { getFeed, getPosts };
};
