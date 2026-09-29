function obfuscateEmail(id, user, domain) {
  var el = document.getElementById(id);
  if (el) { el.href = 'mailto:' + user + '@' + domain; }
}

(function () {
  var btn = document.getElementById('guide-download');
  if (!btn) return;
  var params = new URLSearchParams(window.location.search);
  var sessionId = params.get('session_id');
  if (sessionId) {
    btn.href = '/api/download?s=' + encodeURIComponent(sessionId);
  } else {
    btn.textContent = 'No purchase detected, please get in touch';
    btn.removeAttribute('href');
    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.6';
  }
})();
