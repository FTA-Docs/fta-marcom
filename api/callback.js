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
  res.send(`<!doctype html><html><body><script>
    (function() {
      var msg = ${JSON.stringify(message)};
      var intervalId;

      function receiveMessage(e) {
        window.removeEventListener('message', receiveMessage, false);
        clearInterval(intervalId);
        window.opener.postMessage(msg, e.origin);
        setTimeout(function() { window.close(); }, 500);
      }

      window.addEventListener('message', receiveMessage, false);

      // Retry until the CMS listener is ready and responds
      intervalId = setInterval(function() {
        window.opener.postMessage('authorizing:github', '*');
      }, 500);
      window.opener.postMessage('authorizing:github', '*');
    })()
  </script></body></html>`);
}
