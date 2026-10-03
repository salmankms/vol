(function () {
  var sb = window.volSb;
  var $ = function (id) { return document.getElementById(id); };
  var loginView = $('loginView');
  var dashView = $('dashView');
  var editor = $('editorCard');
  var currentId = null;
  var fmtDate = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata'
  });

  if (!sb) {
    loginView.hidden = false;
    flash($('loginMsg'), 'Supabase is not configured yet. Add your project URL and key in js/supabase-config.js.', false);
    $('loginForm').hidden = true;
    return;
  }

  function flash(el, text, ok) {
    el.textContent = text;
    el.className = 'admin-msg ' + (ok ? 'admin-msg--ok' : 'admin-msg--err');
    el.hidden = false;
  }

  function slugify(s) {
    return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function toLocalInput(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    var p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
      'T' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function show(session) {
    loginView.hidden = !!session;
    dashView.hidden = !session;
    if (session) {
      loadSettings();
      loadPosts();
    }
  }

  sb.auth.getSession().then(function (r) { show(r.data.session); });
  sb.auth.onAuthStateChange(function (_event, session) { show(session); });

  $('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = e.submitter || this.querySelector('button');
    btn.disabled = true;
    sb.auth.signInWithPassword({
      email: $('loginEmail').value.trim(),
      password: $('loginPassword').value
    }).then(function (r) {
      btn.disabled = false;
      if (r.error) flash($('loginMsg'), 'Login failed: ' + r.error.message, false);
      else $('loginPassword').value = '';
    });
  });

  $('logoutBtn').addEventListener('click', function () { sb.auth.signOut(); });

  // Blog page header
  function loadSettings() {
    sb.from('blog_settings').select('*').eq('id', 1).maybeSingle().then(function (r) {
      if (!r.data) return;
      $('setImage').value = r.data.header_image_url || '';
      $('setHeading').value = r.data.heading || '';
      $('setDesc').value = r.data.description || '';
    });
  }

  $('settingsForm').addEventListener('submit', function (e) {
    e.preventDefault();
    sb.from('blog_settings').update({
      header_image_url: $('setImage').value.trim() || null,
      heading: $('setHeading').value.trim() || 'Blog',
      description: $('setDesc').value.trim()
    }).eq('id', 1).then(function (r) {
      if (r.error) flash($('globalMsg'), 'Could not save header: ' + r.error.message, false);
      else flash($('globalMsg'), 'Blog page header saved.', true);
    });
  });

  // Posts list
  function loadPosts() {
    sb.from('posts')
      .select('id,slug,title,status,published_at')
      .order('updated_at', { ascending: false })
      .then(function (r) {
        var tbody = $('postRows');
        tbody.innerHTML = '';
        if (r.error) return flash($('globalMsg'), 'Could not load posts: ' + r.error.message, false);
        if (!r.data.length) {
          var tr = document.createElement('tr');
          var td = document.createElement('td');
          td.colSpan = 4;
          td.textContent = 'No posts yet. Click “New post” to write one.';
          tr.appendChild(td);
          tbody.appendChild(tr);
          return;
        }
        r.data.forEach(function (post) {
          var tr = document.createElement('tr');
          var cells = [];

          var t = document.createElement('td');
          t.textContent = post.title;
          cells.push(t);

          var s = document.createElement('td');
          var badge = document.createElement('span');
          badge.className = 'badge badge--' + post.status;
          badge.textContent = post.status;
          s.appendChild(badge);
          cells.push(s);

          var d = document.createElement('td');
          d.textContent = post.published_at ? fmtDate.format(new Date(post.published_at)) : '—';
          cells.push(d);

          var a = document.createElement('td');
          var edit = document.createElement('button');
          edit.type = 'button';
          edit.className = 'btn';
          edit.textContent = 'Edit';
          edit.addEventListener('click', function () { openEditor(post.id); });
          a.appendChild(edit);
          cells.push(a);

          cells.forEach(function (c) { tr.appendChild(c); });
          tbody.appendChild(tr);
        });
      });
  }

  // Editor
  var f = {
    title: $('fTitle'), slug: $('fSlug'), desc: $('fDesc'), thumb: $('fThumb'),
    hero: $('fHero'), date: $('fDate'), body: $('fBody')
  };
  var slugTouched = false;

  f.title.addEventListener('input', function () {
    if (!slugTouched) f.slug.value = slugify(f.title.value);
  });
  f.slug.addEventListener('input', function () { slugTouched = true; });
  f.body.addEventListener('input', renderPreview);

  function renderPreview() {
    $('fPreview').innerHTML = DOMPurify.sanitize(f.body.value);
  }

  function resetEditor() {
    currentId = null;
    slugTouched = false;
    Object.keys(f).forEach(function (k) { f[k].value = ''; });
    $('fStatus').textContent = 'Not saved yet';
    $('fView').hidden = true;
    $('btnDelete').hidden = true;
    $('editorTitle').textContent = 'New post';
    renderPreview();
  }

  function openEditor(id) {
    sb.from('posts').select('*').eq('id', id).single().then(function (r) {
      if (r.error) return flash($('globalMsg'), 'Could not open post: ' + r.error.message, false);
      var p = r.data;
      currentId = p.id;
      slugTouched = true;
      f.title.value = p.title;
      f.slug.value = p.slug;
      f.desc.value = p.description || '';
      f.thumb.value = p.thumbnail_url || '';
      f.hero.value = p.hero_image_url || '';
      f.date.value = toLocalInput(p.published_at);
      f.body.value = p.body_html || '';
      $('fStatus').textContent = 'Current status: ' + p.status;
      $('fView').href = 'post.html?slug=' + encodeURIComponent(p.slug);
      $('fView').hidden = p.status !== 'published';
      $('btnDelete').hidden = false;
      $('editorTitle').textContent = 'Edit post';
      renderPreview();
      editor.hidden = false;
      editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  $('newPostBtn').addEventListener('click', function () {
    resetEditor();
    editor.hidden = false;
    editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  $('cancelBtn').addEventListener('click', function () { editor.hidden = true; });

  function save(publish) {
    var title = f.title.value.trim();
    var slug = slugify(f.slug.value || title);
    if (!title) return flash($('editorMsg'), 'Please add a title.', false);
    if (!slug) return flash($('editorMsg'), 'Please add a URL slug.', false);

    var publishedAt = f.date.value ? new Date(f.date.value).toISOString() : null;
    if (publish && !publishedAt) publishedAt = new Date().toISOString();

    var row = {
      slug: slug,
      title: title,
      description: f.desc.value.trim(),
      thumbnail_url: f.thumb.value.trim() || null,
      hero_image_url: f.hero.value.trim() || null,
      body_html: f.body.value,
      status: publish ? 'published' : 'draft',
      published_at: publishedAt,
      updated_at: new Date().toISOString()
    };

    var req = currentId
      ? sb.from('posts').update(row).eq('id', currentId).select('id').single()
      : sb.from('posts').insert(row).select('id').single();

    req.then(function (r) {
      if (r.error) return flash($('editorMsg'), 'Could not save: ' + r.error.message, false);
      currentId = r.data.id;
      $('fStatus').textContent = 'Current status: ' + row.status;
      $('fView').href = 'post.html?slug=' + encodeURIComponent(slug);
      $('fView').hidden = row.status !== 'published';
      $('btnDelete').hidden = false;
      $('editorTitle').textContent = 'Edit post';
      f.date.value = toLocalInput(row.published_at);
      flash($('editorMsg'), publish ? 'Published.' : 'Saved as draft.', true);
      loadPosts();
    });
  }

  $('saveDraftBtn').addEventListener('click', function () { save(false); });
  $('publishBtn').addEventListener('click', function () { save(true); });

  $('btnDelete').addEventListener('click', function () {
    if (!currentId || !confirm('Delete this post permanently?')) return;
    sb.from('posts').delete().eq('id', currentId).then(function (r) {
      if (r.error) return flash($('editorMsg'), 'Could not delete: ' + r.error.message, false);
      editor.hidden = true;
      flash($('globalMsg'), 'Post deleted.', true);
      loadPosts();
    });
  });

  resetEditor();
})();
