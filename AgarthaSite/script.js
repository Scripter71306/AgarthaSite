// Hash input with SHA-256, send only hash to serverless function
async function sha256Hex(s){
  const data = new TextEncoder().encode(s);
  const buf  = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('');
}

const input = document.getElementById('code');

input.addEventListener('keydown', async (e)=>{
  if(e.key !== 'Enter') return;
  const v = input.value.trim();
  if(!v) return;
  input.disabled = true;

  try{
    const hash = await sha256Hex(v);
    const res = await fetch('/.netlify/functions/check', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ hash })
    });
    const j = await res.json();
    if(j && j.ok === true){
      // Success: open the real website (no messages)
      window.location.href = '/real/';
    } else {
      // Wrong code: do nothing visible
      input.value = '';
    }
  }catch(_e){
    // On errors: also do nothing visible
    input.value = '';
  }finally{
    input.disabled = false;
    input.focus();
  }
});
