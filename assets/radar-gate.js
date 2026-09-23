(()=>{
  'use strict';
  const SESSION_KEY='nhw-radar-unlocked-v1';
  const PASSWORD_SHA256='fef4f0b3fb40f6349bc7c42b4e9d2b22ccb086866010f834f263823c08f3ec80';
  const enc=new TextEncoder();
  async function sha256(v){const b=await crypto.subtle.digest('SHA-256',enc.encode(v));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')}
  function unlock(){document.body.classList.remove('radar-locked');document.body.classList.add('radar-unlocked');try{sessionStorage.setItem(SESSION_KEY,'1')}catch(_){}}
  function lock(){try{sessionStorage.removeItem(SESSION_KEY)}catch(_){};location.reload()}
  function init(){
    try{if(sessionStorage.getItem(SESSION_KEY)==='1'){unlock();return}}catch(_){}
    const form=document.getElementById('gateForm'), input=document.getElementById('gatePassword'), error=document.getElementById('gateError');
    form?.addEventListener('submit',async e=>{e.preventDefault();const v=input?.value||'';if(await sha256(v)===PASSWORD_SHA256){if(error)error.textContent='';if(input)input.value='';unlock();return}if(error)error.textContent='密码不正确';if(input){input.select();input.focus()}});
    setTimeout(()=>input?.focus(),60);
  }
  window.NHW_LOCK_RADAR=lock;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
