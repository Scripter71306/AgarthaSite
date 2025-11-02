async function sha256Hex(s) {
  const data = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)]
         .map(b => b.toString(16).padStart(2,'0'))
         .join('');
}

const input = document.getElementById('code');

input.addEventListener('keydown', async e => {
  if (e.key !== 'Enter') return;
  const v = input.value.trim();
  if (!v) return;
  input.disabled = true;
  try {
    const hash = await sha256Hex(v);
    const res = await fetch('/.netlify/functions/check', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ hash })
    });
    const j = await res.json();
    if (j && j.ok === true) {
      window.location.href = '/real/';
    } else {
      input.value = '';
    }
  } catch {
    input.value = '';
  } finally {
    input.disabled = false;
  }
});
