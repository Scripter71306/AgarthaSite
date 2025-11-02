// SHA256 hash helper
async function sha256Hex(s){
  const enc = new TextEncoder();
  const d = enc.encode(s);
  const h = await crypto.subtle.digest('SHA-256', d);
  return [...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('');
}

const input = document.getElementById('code');
const overlay = document.getElementById('overlay');
const frame = document.getElementById('embedFrame');
const guardian = document.getElementById('guardian');
const inputWrap = document.getElementById('inputWrap');

const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const helpClose = document.getElementById('helpClose');

helpBtn.addEventListener('click', ()=> {
  helpModal.style.display = 'block';
  helpModal.setAttribute('aria-hidden','false');
});
helpClose.addEventListener('click', ()=> {
  helpModal.style.display = 'none';
  helpModal.setAttribute('aria-hidden','true');
});
helpModal.addEventListener('click',(e)=> {
  if(e.target === helpModal) { helpModal.style.display='none'; }
});

// ENTER handler: send hash to function
input.addEventListener('keydown', async (e)=>{
  if(e.key !== 'Enter') return;
  const v = input.value.trim();
  if(!v) return;
  input.disabled = true;

  try {
    const hash = await sha256Hex(v);
    const res = await fetch('/.netlify/functions/check', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ hash })
    });
    const j = await res.json();
    if(j && j.ok === true){
      // unlocked: hide guardian + input, show overlay iframe
      guardian.style.display = 'none';
      inputWrap.style.display = 'none';
      // set iframe src to our proxy endpoint (no raw external URL in client)
      // the serverless embed function will proxy the real site.
      frame.src = '/.netlify/functions/embed';
      overlay.style.display = 'block';
      overlay.setAttribute('aria-hidden','false');
      // focus inside iframe not guaranteed; it's visible now
    } else {
      // do nothing visible on wrong code
      input.value = '';
    }
  } catch (err) {
    // silent fail
    input.value = '';
    console.error(err);
  } finally {
    input.disabled = false;
    input.focus();
  }
});
