// Paste your Supabase project URL and anon (public) key here.
// Both are safe to be public: row-level security in supabase/schema.sql protects the data.
(function () {
  var url = 'https://vbppbsdktsnveikqmequ.supabase.co';
  var anonKey = 'sb_publishable_U_dW6zQDtv5Fkg6B2pxDrQ_elukvqeX';
  var configured = url.indexOf('YOUR-') === -1 && anonKey.indexOf('YOUR-') === -1;
  window.volSb = configured && window.supabase
    ? window.supabase.createClient(url, anonKey, { auth: { persistSession: true } })
    : null;
})();
