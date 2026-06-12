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
  <p id="status">Authenticating...</p>
  <script>
    (function() {
      var msg = ${JSON.stringify(message)};
      var s = document.getElementById('status');
      if (!window.opener) {
        s.textContent = 'ERROR: window.opener is null — COOP issue. Token obtained OK.';
        return;
      }
      try {
        window.opener.postMessage(msg, '*');
        s.textContent = 'Token sent to CMS. This window should close.';
        setTimeout(function() { window.close(); }, 1500);
      } catch(e) {
        s.textContent = 'ERROR posting message: ' + e.message;
      }
    })()
  </script></body></html>`);
}
