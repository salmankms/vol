(function () {
  var sb = window.volSb;
  var statusEl = document.getElementById('blogStatus');
  var grid = document.getElementById('postList');
  var headerImg = document.getElementById('blogHeaderImg');
  var headingEl = document.getElementById('blogHeading');
  var descEl = document.getElementById('blogDesc');
  var DEFAULT_HEADER = 'images/hero_image.avif';
  var fmt = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Kolkata'
  });

  headerImg.src = DEFAULT_HEADER;

  if (!sb) {
    statusEl.textContent = 'The blog is not connected yet.';
    return;
  }

  sb.from('blog_settings').select('*').eq('id', 1).maybeSingle().then(function (r) {
    if (!r.data) return;
    if (r.data.heading) headingEl.textContent = r.data.heading;
    descEl.textContent = r.data.description || '';
    if (r.data.header_image_url) headerImg.src = r.data.header_image_url;
  });

  sb.from('posts')
    .select('slug,title,description,thumbnail_url,hero_image_url,published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .then(function (r) {
      if (r.error) {
        statusEl.textContent = 'Could not load posts. Please refresh the page.';
        return;
      }
      if (!r.data.length) {
        statusEl.textContent = 'No posts yet. Check back soon.';
        return;
      }
      statusEl.hidden = true;
      r.data.forEach(function (post) { grid.appendChild(card(post)); });
    });

  function card(post) {
    var a = document.createElement('a');
    a.className = 'post-card';
    a.href = 'post.html?slug=' + encodeURIComponent(post.slug);

    var img = document.createElement('img');
    img.className = 'post-card__thumb';
    img.src = post.thumbnail_url || post.hero_image_url || DEFAULT_HEADER;
    img.alt = post.title;
    img.loading = 'lazy';

    var body = document.createElement('div');
    body.className = 'post-card__body';

    var date = document.createElement('time');
    date.className = 'post-date';
    if (post.published_at) date.dateTime = post.published_at;
    date.textContent = post.published_at ? fmt.format(new Date(post.published_at)) : '';

    var h2 = document.createElement('h2');
    h2.textContent = post.title;

    var p = document.createElement('p');
    p.className = 'post-card__desc';
    p.textContent = post.description;

    body.appendChild(date);
    body.appendChild(h2);
    body.appendChild(p);
    a.appendChild(img);
    a.appendChild(body);
    return a;
  }
})();
