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
      function receiveMessage(e) {
        window.opener.postMessage(${JSON.stringify(message)}, e.origin);
      }
      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:github", "*");
    })()
  </script></body></html>`);
}
