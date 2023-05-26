export default ({ contents }) => {
  const parser = new DOMParser();
  const RSSDocument = parser.parseFromString(contents, 'text/xml');

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
