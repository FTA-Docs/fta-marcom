export default async function handler(req, res) {
  const { code } = req.query;

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await tokenRes.json();
  const token = data.access_token;

  if (!token) {
    res.status(401).send('OAuth error: ' + (data.error || 'unknown'));
    return;
  }

  const message = `authorization:github:success:${JSON.stringify({ token, provider: 'github' })}`;

  res.setHeader('Content-Type', 'text/html');
  res.send(`<!doctype html><html><body>
  <pre id="log" style="font:12px monospace;padding:8px"></pre>
  <script>
    (function() {
      var msg = ${JSON.stringify(message)};
      var log = document.getElementById('log');
      var sent = 0;

      function addLog(s) { log.textContent += s + '\\n'; }

      window.addEventListener('message', function(e) {
        addLog('RECEIVED from ' + e.origin + ': ' + JSON.stringify(e.data));
      }, false);

      var intervalId = setInterval(function() {
        sent++;
        addLog('SENT authorizing:github (#' + sent + ')');
        window.opener.postMessage('authorizing:github', '*');
        if (sent >= 10) { clearInterval(intervalId); addLog('Gave up after 10 tries.'); }
      }, 800);
    })()
  </script></body></html>`);
}
