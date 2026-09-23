(()=>{
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const CFG=window.NHW_RESEARCH_CONFIG||{};
  const K='nhw-radar-v3', SETTINGS='nhw-radar-settings-v3';
  const defaults={
    breadth:CFG.defaultBreadth||'balanced',
    core:'model watermarking\nmodel ownership verification\nmodel fingerprinting\nmodel attribution\nmodel provenance\nmodel copyright protection\nmodel extraction detection\nAI-generated content provenance',
    adjacent:'backdoor and trojan detection\nmodel stealing and extraction\nmachine unlearning\nmodel editing\nadversarial robustness\nprivacy leakage\nAI forensics\ndata attribution\ntraining data provenance\nmodel supply-chain security',
    inspiration:'cryptographic proof and commitment\nconformal inference\nsequential hypothesis testing\ninformation theory\nerror-correcting codes\ncausal inference\nanomaly detection\nrepresentation similarity\nmechanism design\nstatistical forensics',
    negative:'audio watermarking for broadcast\nphysical watermark removal\ndatabase watermarking only',
    workerUrl:CFG.workerUrl||'',
    googleClientId:CFG.googleClientId||''
  };
  let state=loadState();
  let prefs=loadPrefs();
  let driveToken=null, driveFolderId=null, driveFiles=[];
  let active='radar';

  function loadState(){try{return Object.assign({results:[],ideas:[],lastScan:null,driveNames:[]},JSON.parse(localStorage.getItem(K)||'{}'))}catch(_){return {results:[],ideas:[],lastScan:null,driveNames:[]}}}
  function loadPrefs(){try{return Object.assign({},defaults,JSON.parse(localStorage.getItem(SETTINGS)||'{}'))}catch(_){return {...defaults}}}
  function persist(){localStorage.setItem(K,JSON.stringify(state));}
  function persistPrefs(){localStorage.setItem(SETTINGS,JSON.stringify(prefs));}
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const norm=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/https?:\/\/doi\.org\//g,'').replace(/[^a-z0-9\u4e00-\u9fff]+/g,' ').trim();
  const toast=msg=>{const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.__radarToast);window.__radarToast=setTimeout(()=>t.classList.remove('show'),2200)};
  const worker=()=>String(prefs.workerUrl||CFG.workerUrl||'').replace(/\/$/,'');
  const today=()=>new Date().toISOString().slice(0,10);
  const fmtDate=d=>d?String(d).slice(0,10):'日期未知';
  function laneLabel(v){return v==='core'?'核心相关':v==='adjacent'?'相邻安全':'跨域启发'}
  function sourceLabel(p){const a=[];if(p.flags?.ieee)a.push('IEEE Trans');if(p.flags?.ccfa)a.push('CCF A');if(p.flags?.arxiv)a.push('arXiv');return a.join(' · ')||p.venue||'其他'}
  function setStatus(text,kind=''){const e=$('#connectionStatus');e.className='statusline '+kind;e.innerHTML=text}
  function parseLines(id){return $('#'+id).value.split(/\n+/).map(x=>x.trim()).filter(Boolean)}

  function renderNav(){
    $$('#nav [data-panel]').forEach(b=>b.classList.toggle('active',b.dataset.panel===active));
    $$('.panel').forEach(p=>p.classList.toggle('active',p.id==='panel-'+active));
    $('#navRadarCount').textContent=String(state.results.filter(x=>!x.inDrive).length||'·');
    $('#navLibraryCount').textContent=String(driveFiles.length||state.driveNames.length||'·');
    $('#navIdeasCount').textContent=String(state.ideas.length||0);
  }
  function renderMetrics(){
    const fresh=state.results.filter(x=>!x.inDrive);
    const core=fresh.filter(x=>x.lane==='core').length;
    const insp=fresh.filter(x=>x.lane==='inspiration').length;
    const dup=state.results.filter(x=>x.inDrive).length;
    const vals=[fresh.length,core,insp,dup];
    $$('#heroMetrics .metric b').forEach((b,i)=>b.textContent=state.lastScan?vals[i]:'—');
  }
  function filteredResults(){
    const q=norm($('#resultSearch')?.value||''), lane=$('#laneFilter')?.value||'all', src=$('#sourceFilter')?.value||'all', pdf=$('#pdfFilter')?.value||'all';
    return state.results.filter(p=>{
      const hay=norm([p.title,p.authors,p.venue,p.reason,(p.keywords||[]).join(' ')].join(' '));
      const srcOk=src==='all'||(src==='ieee'&&p.flags?.ieee)||(src==='ccfa'&&p.flags?.ccfa)||(src==='arxiv'&&p.flags?.arxiv);
      const pdfOk=pdf==='all'||(pdf==='pdf'&&p.pdfAvailable)||(pdf==='nopdf'&&!p.pdfAvailable);
      return (!q||hay.includes(q))&&(lane==='all'||p.lane===lane)&&srcOk&&pdfOk;
    });
  }
  function card(p){
    const checked=!!p.selected, disabled=p.inDrive||!p.pdfAvailable;
    const titleUrl=p.url||p.doi||p.arxivUrl||'#';
    return `<article class="paper-card ${checked?'selected':''} ${p.inDrive?'in-drive':''}" data-id="${esc(p.id)}">
      <div class="paper-top"><input class="paper-select" type="checkbox" ${checked?'checked':''} ${disabled?'disabled':''} aria-label="选择 ${esc(p.title)}"><div>
        <h3 class="paper-title"><a href="${esc(titleUrl)}" target="_blank" rel="noopener">${esc(p.title)}</a></h3>
        <div class="paper-authors">${esc(p.authors||'作者信息暂缺')}</div>
        <div class="paper-meta"><span class="pill ${esc(p.lane)}">${laneLabel(p.lane)}</span><span class="pill">${esc(sourceLabel(p))}</span><span class="pill">${esc(fmtDate(p.date))}</span>${p.inDrive?'<span class="pill core">Drive 已有</span>':''}${p.pdfAvailable?'<span class="pill core">Open PDF</span>':'<span class="pill">仅元数据</span>'}</div>
        <div class="why"><strong>推荐原因：</strong>${esc(p.reason||'与当前研究主题存在方法或问题层面的关联。')}</div>
        <div class="paper-actions">${p.pdfAvailable?`<button class="mini" data-openpdf="${esc(p.id)}">打开 PDF</button>`:''}<button class="mini" data-idea="${esc(p.id)}">${state.ideas.some(x=>x.paperId===p.id)?'已加入灵感篮子':'加入灵感篮子'}</button>${p.doi?`<a class="mini" href="${esc(p.doi)}" target="_blank" rel="noopener">DOI</a>`:''}${p.arxivUrl?`<a class="mini" href="${esc(p.arxivUrl)}" target="_blank" rel="noopener">arXiv</a>`:''}</div>
      </div></div></article>`;
  }
  function renderRadar(){
    const rows=filteredResults();
    $('#paperGrid').innerHTML=rows.length?rows.map(card).join(''):`<div class="empty" style="grid-column:1/-1">${state.lastScan?'当前筛选条件下没有候选论文。':'尚未扫描。完成连接设置后点击“扫描最近一年”。'}</div>`;
    const selected=state.results.filter(x=>x.selected&&!x.inDrive&&x.pdfAvailable).length;
    const available=state.results.filter(x=>!x.inDrive&&x.pdfAvailable).length;
    const stamp=state.lastScan?`上次扫描 ${new Date(state.lastScan).toLocaleString()} · `:'';
    $('#selectionStrip').textContent=`${stamp}${state.results.length} 条候选，过滤 Drive 已有 ${state.results.filter(x=>x.inDrive).length} 条；当前可归档 ${available} 条，已选择 ${selected} 条。`;
    $('#uploadBtn').disabled=selected===0||!driveToken;
    bindCards();
  }
  function renderLibrary(){
    const q=norm($('#librarySearch')?.value||'');
    const rows=(driveFiles.length?driveFiles:state.driveNames.map((name,i)=>({id:'cache-'+i,name}))).filter(f=>!q||norm(f.name).includes(q));
    $('#libraryList').innerHTML=rows.length?rows.slice(0,300).map(f=>`<div class="library-row"><div><strong>${esc(f.name)}</strong><br><span>${esc(f.modifiedTime?('更新 '+fmtDate(f.modifiedTime)):'缓存目录')}</span></div>${f.webViewLink?`<a class="mini" href="${esc(f.webViewLink)}" target="_blank" rel="noopener">Drive ↗</a>`:''}</div>`).join(''):'<div class="empty">尚未读取 Drive /paper。连接 Google Drive 后点击“刷新目录”。</div>';
  }
  function renderIdeas(){
    $('#ideasList').innerHTML=state.ideas.length?state.ideas.map(x=>`<article class="idea-card" data-idea-card="${esc(x.id)}"><h3>${esc(x.title)}</h3><div class="paper-meta"><span class="pill ${esc(x.lane||'inspiration')}">${laneLabel(x.lane||'inspiration')}</span><span class="pill">${esc(x.venue||'')}</span></div><textarea class="field" data-idea-note="${esc(x.id)}" placeholder="这篇论文能迁移到我的哪个问题？可以借用什么机制 / 统计方法 / 实验设计？">${esc(x.note||'')}</textarea><div class="paper-actions">${x.url?`<a class="mini" href="${esc(x.url)}" target="_blank" rel="noopener">打开论文</a>`:''}<button class="mini" data-remove-idea="${esc(x.id)}">移除</button></div></article>`).join(''):'<div class="empty">灵感篮子为空。论文雷达中遇到“也许不是本领域，但方法值得借”的论文时再加入这里。</div>';
    $$('[data-idea-note]').forEach(t=>t.onchange=()=>{const x=state.ideas.find(i=>i.id===t.dataset.ideaNote);if(x){x.note=t.value;persist()}});
    $$('[data-remove-idea]').forEach(b=>b.onclick=()=>{state.ideas=state.ideas.filter(x=>x.id!==b.dataset.removeIdea);persist();renderAll();toast('已从灵感篮子移除')});
  }
  function renderWatch(){
    $('#coreTerms').value=prefs.core;$('#adjacentTerms').value=prefs.adjacent;$('#inspirationTerms').value=prefs.inspiration;$('#negativeTerms').value=prefs.negative;
  }
  function renderAll(){renderNav();renderMetrics();renderRadar();renderLibrary();renderIdeas();renderWatch();updateStatus()}
  function bindCards(){
    $$('.paper-card .paper-select').forEach(cb=>cb.onchange=()=>{const p=state.results.find(x=>x.id===cb.closest('.paper-card').dataset.id);if(p){p.selected=cb.checked;persist();renderRadar()}});
    $$('[data-idea]').forEach(b=>b.onclick=()=>toggleIdea(b.dataset.idea));
    $$('[data-openpdf]').forEach(b=>b.onclick=()=>openPdf(b.dataset.openpdf));
  }
  function toggleIdea(id){
    const p=state.results.find(x=>x.id===id);if(!p)return;
    const old=state.ideas.find(x=>x.paperId===id);
    if(old){active='ideas';renderAll();return}
    state.ideas.unshift({id:'idea-'+Date.now(),paperId:p.id,title:p.title,lane:p.lane,venue:p.venue,url:p.url||p.doi||p.arxivUrl,note:''});persist();renderAll();toast('已加入灵感篮子')
  }
  function updateStatus(){
    const w=worker();
    if(!w){setStatus('尚未配置 Research Worker；论文扫描与 Scholar 同步不可用。','warn');return}
    if(!prefs.googleClientId){setStatus('Research Worker 已配置；Google OAuth Client ID 尚未配置，Drive 去重与归档不可用。','warn');return}
    setStatus(driveToken?'Research Worker 与 Google Drive 已连接。':'Research Worker 已配置；扫描时会提示连接 Google Drive。',driveToken?'ok':'');
  }

  async function api(path,options={}){
    if(!worker())throw new Error('请先在连接设置中填写 Research Worker URL');
    const r=await fetch(worker()+path,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});
    if(!r.ok)throw new Error((await r.text()).slice(0,240)||`HTTP ${r.status}`);
    return r.json();
  }
  function termsPayload(){return {core:parseLines('coreTerms'),adjacent:parseLines('adjacentTerms'),inspiration:parseLines('inspirationTerms'),negative:parseLines('negativeTerms')}}

  async function ensureDrive(){
    if(driveToken)return true;
    const clientId=prefs.googleClientId||CFG.googleClientId;
    if(!clientId)throw new Error('请先配置 Google OAuth Client ID');
    if(!window.google?.accounts?.oauth2)throw new Error('Google Identity Services 尚未加载，请刷新页面后重试');
    driveToken=await new Promise((resolve,reject)=>{
      const client=google.accounts.oauth2.initTokenClient({
        client_id:clientId,
        scope:'https://www.googleapis.com/auth/drive',
        callback:(resp)=>resp.error?reject(new Error(resp.error)):resolve(resp.access_token),
        error_callback:()=>reject(new Error('Google Drive 授权窗口被关闭或失败'))
      });
      client.requestAccessToken({prompt:'consent'});
    });
    await loadDriveLibrary();
    return true;
  }
  async function driveFetch(url,options={}){
    if(!driveToken)throw new Error('Google Drive 尚未连接');
    const r=await fetch(url,{...options,headers:{Authorization:`Bearer ${driveToken}`,...(options.headers||{})}});
    if(r.status===401){driveToken=null;throw new Error('Google Drive 授权已过期，请重新连接')}
    if(!r.ok)throw new Error((await r.text()).slice(0,300)||`Drive HTTP ${r.status}`);
    return r;
  }
  async function findPaperFolder(){
    if(driveFolderId)return driveFolderId;
    const name=CFG.paperFolderName||'paper';
    const q=`mimeType='application/vnd.google-apps.folder' and name='${name.replace(/'/g,"\\'")}' and trashed=false`;
    const u='https://www.googleapis.com/drive/v3/files?'+new URLSearchParams({q,fields:'files(id,name,webViewLink)',pageSize:'50'});
    const j=await (await driveFetch(u)).json();
    if(!j.files?.length)throw new Error(`Google Drive 中没有找到 “${name}” 文件夹`);
    driveFolderId=j.files[0].id;return driveFolderId;
  }
  async function loadDriveLibrary(){
    const folder=await findPaperFolder();
    const all=[];let token='';
    do{
      const params={q:`'${folder}' in parents and trashed=false`,fields:'nextPageToken,files(id,name,mimeType,modifiedTime,webViewLink,description,appProperties)',pageSize:'1000'};
      if(token)params.pageToken=token;
      const j=await (await driveFetch('https://www.googleapis.com/drive/v3/files?'+new URLSearchParams(params))).json();
      all.push(...(j.files||[]));token=j.nextPageToken||'';
    }while(token);
    driveFiles=all;state.driveNames=all.map(x=>x.name);persist();renderAll();return all;
  }
  function identifiers(p){
    const out=[];
    if(p.doi)out.push(norm(p.doi.replace(/^https?:\/\/doi\.org\//,'')));
    if(p.arxivId)out.push(norm(p.arxivId));
    if(p.title)out.push(norm(p.title));
    return out.filter(Boolean);
  }
  function filenameDuplicate(p){
    const ids=identifiers(p);const files=driveFiles.map(f=>({n:norm(f.name),d:norm(f.description||''),a:norm(JSON.stringify(f.appProperties||{}))}));
    return files.some(f=>ids.some(id=>id.length>7&&(f.n.includes(id)||f.d.includes(id)||f.a.includes(id)))|| (norm(p.title).length>14 && similarity(norm(p.title),f.n)>0.9));
  }
  function similarity(a,b){
    const A=new Set(a.split(' ').filter(x=>x.length>2)),B=new Set(b.split(' ').filter(x=>x.length>2));if(!A.size||!B.size)return 0;let i=0;A.forEach(x=>B.has(x)&&i++);return i/Math.max(A.size,B.size);
  }
  function rareTokens(title){return norm(title).split(' ').filter(x=>x.length>=5&&!['model','using','based','learning','neural','security','watermark','watermarking'].includes(x)).sort((a,b)=>b.length-a.length).slice(0,3)}
  async function fullTextDuplicate(p){
    const toks=rareTokens(p.title);if(toks.length<2)return false;
    const folder=await findPaperFolder();
    const clauses=toks.map(t=>`fullText contains '${t.replace(/'/g,"\\'")}'`).join(' and ');
    const q=`'${folder}' in parents and trashed=false and ${clauses}`;
    const u='https://www.googleapis.com/drive/v3/files?'+new URLSearchParams({q,fields:'files(id,name)',pageSize:'5'});
    try{const j=await (await driveFetch(u)).json();return !!j.files?.length}catch(_){return false}
  }
  async function dedupeAgainstDrive(results){
    await ensureDrive();
    const unresolved=[];
    for(const p of results){p.inDrive=filenameDuplicate(p);if(!p.inDrive)unresolved.push(p)}
    const batch=unresolved.slice(0,60);
    for(let i=0;i<batch.length;i+=5){
      const part=batch.slice(i,i+5);const vals=await Promise.all(part.map(fullTextDuplicate));vals.forEach((v,k)=>part[k].inDrive=v);
      setStatus(`正在与 Drive /paper 做全文去重… ${Math.min(i+5,batch.length)}/${batch.length}`,'ok');
    }
    return results;
  }

  async function scan(){
    try{
      prefs.breadth=$('#breadthSelect').value;persistPrefs();
      $('#scanBtn').disabled=true;$('#scanBtn').innerHTML='<span><i class="loading-dot"></i>正在扫描</span><small>检索 + Drive 去重</small>';
      setStatus('正在从 IEEE Transactions、CCF A 与 arXiv 获取最近一年的候选…','ok');
      const payload={breadth:prefs.breadth,days:Number(CFG.radarLookbackDays||365),terms:termsPayload()};
      const data=await api('/discover',{method:'POST',body:JSON.stringify(payload)});
      let results=(data.results||[]).map(x=>({...x,selected:false,inDrive:false}));
      setStatus(`发现 ${results.length} 条候选，正在连接 Google Drive 去重…`,'ok');
      await dedupeAgainstDrive(results);
      state.results=results;state.lastScan=new Date().toISOString();persist();renderAll();
      const fresh=results.filter(x=>!x.inDrive).length;setStatus(`扫描完成：${results.length} 条候选，其中 ${fresh} 条不在 Drive /paper。`,'ok');toast(`发现 ${fresh} 篇新候选`);
    }catch(e){setStatus(esc(e.message),'warn');toast(e.message)}finally{$('#scanBtn').disabled=false;$('#scanBtn').innerHTML='<span>扫描最近一年</span><small>自动与 Drive /paper 去重</small>'}
  }

  async function openPdf(id){
    const p=state.results.find(x=>x.id===id);if(!p?.downloadId)return toast('没有可用的开放 PDF');
    const u=worker()+'/pdf?id='+encodeURIComponent(p.downloadId);
    window.open(u,'_blank','noopener');
  }
  async function fetchPdf(p){
    const r=await fetch(worker()+'/pdf?id='+encodeURIComponent(p.downloadId));
    if(!r.ok)throw new Error(`${p.title}: PDF 下载失败`);
    const type=r.headers.get('content-type')||'';if(!type.includes('pdf'))throw new Error(`${p.title}: 未获得 PDF`);
    return r.blob();
  }
  function safeFilename(p){return (`[${(p.venue||'paper').replace(/[^a-zA-Z0-9._-]+/g,'_').slice(0,35)}_${(p.date||'').slice(0,4)}] ${p.title}`).replace(/[\\/:*?"<>|]/g,' ').replace(/\s+/g,' ').trim().slice(0,180)+'.pdf'}
  async function uploadBlob(blob,p){
    const folder=await findPaperFolder();
    const meta={name:safeFilename(p),parents:[folder],description:`Research Radar\nTitle: ${p.title}\nDOI: ${p.doi||''}\narXiv: ${p.arxivId||''}\nSource: ${p.url||''}`,appProperties:{radar_id:p.id.slice(0,120),doi:(p.doi||'').slice(0,120),arxiv:(p.arxivId||'').slice(0,120)}};
    const boundary='nhw_'+Math.random().toString(36).slice(2);
    const head=`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${boundary}\r\nContent-Type: application/pdf\r\n\r\n`;
    const tail=`\r\n--${boundary}--`;
    const body=new Blob([head,blob,tail],{type:`multipart/related; boundary=${boundary}`});
    const r=await driveFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',{method:'POST',headers:{'Content-Type':`multipart/related; boundary=${boundary}`},body});
    return r.json();
  }
  async function uploadSelected(){
    const selected=state.results.filter(x=>x.selected&&!x.inDrive&&x.pdfAvailable);
    if(!selected.length)return;
    try{
      await ensureDrive();$('#uploadBtn').disabled=true;
      let ok=0,fail=[];
      for(let i=0;i<selected.length;i++){
        const p=selected[i];setStatus(`正在归档 ${i+1}/${selected.length}：${esc(p.title)}`,'ok');
        try{const blob=await fetchPdf(p);await uploadBlob(blob,p);p.inDrive=true;p.selected=false;ok++}catch(e){fail.push(e.message)}
      }
      await loadDriveLibrary();persist();renderAll();setStatus(`归档完成：成功 ${ok} 篇${fail.length?`，失败 ${fail.length} 篇`:''}。`,fail.length?'warn':'ok');toast(`已归档 ${ok} 篇论文`);
      if(fail.length)console.warn('Upload failures',fail);
    }catch(e){setStatus(esc(e.message),'warn');toast(e.message)}finally{renderRadar()}
  }

  function openSettings(){
    $('#backendUrlInput').value=prefs.workerUrl||CFG.workerUrl||'';$('#googleClientIdInput').value=prefs.googleClientId||CFG.googleClientId||'';$('#settingsModal').classList.add('show');$('#settingsModal').setAttribute('aria-hidden','false')
  }
  function closeSettings(){$('#settingsModal').classList.remove('show');$('#settingsModal').setAttribute('aria-hidden','true')}
  async function testConnection(){
    const old=prefs.workerUrl;prefs.workerUrl=$('#backendUrlInput').value.trim().replace(/\/$/,'');
    try{const x=await api('/health');toast(`Worker 正常 · ${x.status||'ok'}`)}catch(e){toast('连接失败：'+e.message)}finally{prefs.workerUrl=old}
  }
  function saveSettings(){prefs.workerUrl=$('#backendUrlInput').value.trim().replace(/\/$/,'');prefs.googleClientId=$('#googleClientIdInput').value.trim();persistPrefs();closeSettings();updateStatus();toast('连接设置已保存')}
  function exportIdeas(){
    const md=['# Research Inspiration Basket','',`Exported: ${today()}`,''];state.ideas.forEach((x,i)=>{md.push(`## ${i+1}. ${x.title}`,'',`- Venue: ${x.venue||''}`,`- Link: ${x.url||''}`,`- Lane: ${laneLabel(x.lane||'inspiration')}`,'',x.note||'_尚未记录灵感_','')});
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([md.join('\n')],{type:'text/markdown'}));a.download=`research-inspiration-${today()}.md`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
  }

  $('#nav').addEventListener('click',e=>{const b=e.target.closest('[data-panel]');if(!b)return;active=b.dataset.panel;renderAll()});
  $('#themeBtn').onclick=()=>{const d=document.documentElement;d.dataset.theme=d.dataset.theme==='dark'?'light':'dark';localStorage.setItem('nhw-radar-theme',d.dataset.theme)};
  $('#settingsBtn').onclick=openSettings;$('#closeSettingsBtn').onclick=closeSettings;$('#settingsModal').onclick=e=>{if(e.target.id==='settingsModal')closeSettings()};
  $('#saveSettingsBtn').onclick=saveSettings;$('#testConnectionBtn').onclick=testConnection;
  $('#scanBtn').onclick=scan;$('#uploadBtn').onclick=uploadSelected;
  $('#refreshLibraryBtn').onclick=async()=>{try{await ensureDrive();await loadDriveLibrary();toast('Drive /paper 已刷新')}catch(e){toast(e.message)}};
  $('#selectAllBtn').onclick=()=>{const visible=new Set(filteredResults().filter(x=>!x.inDrive&&x.pdfAvailable).map(x=>x.id));const all=state.results.filter(x=>visible.has(x.id));const target=!all.every(x=>x.selected);all.forEach(x=>x.selected=target);persist();renderRadar()};
  ['resultSearch','laneFilter','sourceFilter','pdfFilter'].forEach(id=>$('#'+id).addEventListener(id==='resultSearch'?'input':'change',renderRadar));
  $('#librarySearch').addEventListener('input',renderLibrary);
  $('#breadthSelect').value=prefs.breadth;$('#breadthSelect').onchange=()=>{prefs.breadth=$('#breadthSelect').value;persistPrefs()};
  $('#saveWatchBtn').onclick=()=>{prefs.core=parseLines('coreTerms').join('\n');prefs.adjacent=parseLines('adjacentTerms').join('\n');prefs.inspiration=parseLines('inspirationTerms').join('\n');prefs.negative=parseLines('negativeTerms').join('\n');persistPrefs();toast('主题偏好已保存')};
  $('#exportIdeasBtn').onclick=exportIdeas;
  document.documentElement.dataset.theme=localStorage.getItem('nhw-radar-theme')||'light';
  renderAll();
})();
