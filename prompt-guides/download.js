function forceDownload(link, filename) {
  fetch(link.href)
    .then(function (res) {
      if (!res.ok) { throw new Error('fetch failed'); }
      return res.blob();
    })
    .then(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    })
    .catch(function () {
      window.location.href = link.href; // fallback: open the file normally if fetch fails
    });
  return false;
}

function obfuscateEmail(id, user, domain) {
  var el = document.getElementById(id);
  if (el) { el.href = 'mailto:' + user + '@' + domain; }
}
