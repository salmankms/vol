(function () {
  var sb = window.volSb;
  var params = new URLSearchParams(window.location.search);
  var slug = params.get('slug');
  var statusEl = document.getElementById('postStatus');
  var article = document.getElementById('postArticle');
  var fmt = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Kolkata'
  });

  function notFound(msg) {
    statusEl.textContent = msg;
    statusEl.hidden = false;
    article.hidden = true;
  }

  if (!sb) return notFound('The blog is not connected yet.');
  if (!slug) return notFound('This post could not be found.');

  sb.from('posts').select('*').eq('slug', slug).maybeSingle().then(function (r) {
    if (r.error || !r.data) return notFound('This post could not be found.');

    var post = r.data;
    document.title = post.title + ' | Vows of Love';
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.content = post.description;

    var hero = document.getElementById('postHero');
    if (post.hero_image_url) {
      hero.src = post.hero_image_url;
      hero.alt = post.title;
    } else {
      hero.parentElement.hidden = true;
    }

    document.getElementById('postTitle').textContent = post.title;
    var date = document.getElementById('postDate');
    if (post.published_at) {
      date.dateTime = post.published_at;
      date.textContent = fmt.format(new Date(post.published_at));
    } else {
      date.hidden = true;
    }
    document.getElementById('postBody').innerHTML = DOMPurify.sanitize(post.body_html);
    article.hidden = false;
    statusEl.hidden = true;
  });
})();
