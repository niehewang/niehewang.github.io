(()=>{
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const asArray=v=>Array.isArray(v)?v:(v==null?[]:(typeof v?.[Symbol.iterator]==='function'?Array.from(v):[]));
  const CFG=window.NHW_RESEARCH_CONFIG||{}, CCF_A=asArray(window.NHW_CCF_A);
  const K='nhw-radar-v5', LEGACY_K='nhw-radar-v4', SETTINGS='nhw-radar-settings-v5', FOLDER_KEY='nhw-radar-paper-folder-v1';
  const defaults={
    breadth:CFG.defaultBreadth||'balanced',
    core:'model watermarking\nmodel ownership verification\nmodel fingerprinting\nmodel attribution\nmodel provenance\nmodel copyright protection\nmodel intellectual property protection\nneural network ownership verification\nfoundation model ownership\ndiffusion model watermarking\nlarge language model watermarking\nAI-generated content provenance\ntraining data attribution\nmodel lineage',
    adjacent:'machine learning security\nAI security\nfoundation model security\ngenerative model security\nlarge language model security\ndiffusion model security\ntrustworthy artificial intelligence\nbackdoor and trojan detection\ndata poisoning\nmodel stealing and extraction\nmodel inversion\nmembership inference\nadversarial machine learning\nadversarial robustness\nprivacy leakage\ndifferential privacy\nmachine unlearning\nmodel editing\nAI forensics\ndeepfake detection\ndata provenance\nmodel supply chain security\nsoftware supply chain security\nsecure federated learning\nfederated learning security\nprompt injection\njailbreak detection\nAI authentication\ncontent authenticity',
    inspiration:'cryptographic commitment\nzero knowledge proof\nproof of provenance\nsecure multiparty computation\nverifiable computation\nconformal prediction\nconformal inference\nsequential hypothesis testing\nmultiple hypothesis testing\nchange point detection\nuncertainty quantification\ninformation theory\nerror correcting codes\ncausal inference\nanomaly detection\nout of distribution detection\nrepresentation similarity\nrepresentation alignment\nmetric learning\ncontrastive learning\nmechanistic interpretability\ninfluence functions\ndata valuation\ngraph matching\nset matching\nstatistical forensics\nrobust statistics\nactive learning\ncontinual learning\nknowledge tracing\nprovenance tracking\nsoftware provenance',
    negative:'audio broadcast watermark\nphysical document watermark\nwatermark removal from photographs\ndatabase watermarking only\nwireless channel watermark',
    googleClientId:CFG.googleClientId||''
  };
  let state=loadState(), prefs=loadPrefs(), driveToken=null, driveFiles=[], active='radar';
  let driveFolderId=safeGet(FOLDER_KEY)||'';

  function safeGet(k){try{return localStorage.getItem(k)||''}catch(_){return''}}
  function safeSet(k,v){try{localStorage.setItem(k,v)}catch(_){}}
  function loadState(){try{const raw=JSON.parse(localStorage.getItem(K)||localStorage.getItem(LEGACY_K)||'{}')||{};return {results:asArray(raw.results),ideas:asArray(raw.ideas),lastScan:raw.lastScan||null,driveNames:asArray(raw.driveNames)}}catch(_){return {results:[],ideas:[],lastScan:null,driveNames:[]}}}
  function loadPrefs(){try{return Object.assign({},defaults,JSON.parse(localStorage.getItem(SETTINGS)||'{}'))}catch(_){return {...defaults}}}
  function persist(){try{localStorage.setItem(K,JSON.stringify(state))}catch(_){}}
  function persistPrefs(){try{localStorage.setItem(SETTINGS,JSON.stringify(prefs))}catch(_){}}
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const norm=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/https?:\/\/doi\.org\//g,'').replace(/[^a-z0-9\u4e00-\u9fff]+/g,' ').trim();
  const toast=msg=>{const t=$('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(window.__radarToast);window.__radarToast=setTimeout(()=>t.classList.remove('show'),2600)};
  const today=()=>new Date().toISOString().slice(0,10), fmtDate=d=>d?String(d).slice(0,10):'日期未知';
  const laneLabel=v=>v==='core'?'核心相关':v==='adjacent'?'相邻安全':'跨域启发';
  const sourceLabel=p=>{const a=[];if(p.flags?.ieee)a.push('IEEE Trans');if(p.flags?.acm)a.push('ACM Trans');if(p.flags?.ccfa)a.push('CCF A');if(p.flags?.arxiv)a.push('arXiv');return a.join(' · ')||p.venue||'其他'};
  function setStatus(text,kind=''){const e=$('#connectionStatus');if(!e)return;e.className='statusline '+kind;e.innerHTML=text}
  function parseLines(id){return ($('#'+id)?.value||'').split(/\n+/).map(x=>x.trim()).filter(Boolean)}

  function renderNav(){
    $$('#nav [data-panel]').forEach(b=>b.classList.toggle('active',b.dataset.panel===active));
    $$('.panel').forEach(p=>p.classList.toggle('active',p.id==='panel-'+active));
    $('#navRadarCount').textContent=String(state.results.filter(x=>!x.inDrive).length||'·');
    $('#navLibraryCount').textContent=String(driveFiles.length||state.driveNames.length||'·');
    $('#navIdeasCount').textContent=String(state.ideas.length||0);
  }
  function renderMetrics(){
    const fresh=state.results.filter(x=>!x.inDrive), vals=[fresh.length,fresh.filter(x=>x.lane==='core').length,fresh.filter(x=>x.lane==='inspiration').length,state.results.filter(x=>x.inDrive).length];
    $$('#heroMetrics .metric b').forEach((b,i)=>b.textContent=state.lastScan?vals[i]:'—');
  }
  function filteredResults(){
    const q=norm($('#resultSearch')?.value||''), lane=$('#laneFilter')?.value||'all', src=$('#sourceFilter')?.value||'all', pdf=$('#pdfFilter')?.value||'all';
    return state.results.filter(p=>!p.inDrive).filter(p=>{
      const hay=norm([p.title,p.authors,p.venue,p.reason,(p.keywords||[]).join(' ')].join(' '));
      const srcOk=src==='all'||(src==='ieee'&&p.flags?.ieee)||(src==='acm'&&p.flags?.acm)||(src==='ccfa'&&p.flags?.ccfa)||(src==='arxiv'&&p.flags?.arxiv);
      const pdfOk=pdf==='all'||(pdf==='pdf'&&p.pdfAvailable)||(pdf==='nopdf'&&!p.pdfAvailable);
      return (!q||hay.includes(q))&&(lane==='all'||p.lane===lane)&&srcOk&&pdfOk;
    });
  }
  function card(p){
    const disabled=p.inDrive||!p.pdfAvailable, titleUrl=p.url||p.doi||p.arxivUrl||'#';
    return `<article class="paper-card ${p.selected?'selected':''} ${p.inDrive?'in-drive':''}" data-id="${esc(p.id)}"><div class="paper-top"><input class="paper-select" type="checkbox" ${p.selected?'checked':''} ${disabled?'disabled':''} aria-label="选择 ${esc(p.title)}"><div><h3 class="paper-title"><a href="${esc(titleUrl)}" target="_blank" rel="noopener">${esc(p.title)}</a></h3><div class="paper-authors">${esc(p.authors||'作者信息暂缺')}</div><div class="paper-meta"><span class="pill ${esc(p.lane)}">${laneLabel(p.lane)}</span><span class="pill">${esc(sourceLabel(p))}</span><span class="pill">${esc(fmtDate(p.date))}</span>${p.inDrive?'<span class="pill core">Drive 已有</span>':''}${p.pdfAvailable?'<span class="pill core">Open PDF</span>':'<span class="pill">仅元数据</span>'}${Number.isFinite(p.citations)?`<span class="pill">引用 ${p.citations}</span>`:''}</div><div class="why"><strong>推荐原因：</strong>${esc(p.reason||'与当前研究主题存在方法或问题层面的关联。')}</div><div class="paper-actions">${p.pdfAvailable?`<button class="mini" data-openpdf="${esc(p.id)}">打开 PDF</button>`:''}<button class="mini" data-idea="${esc(p.id)}">${state.ideas.some(x=>x.paperId===p.id)?'已加入灵感篮子':'加入灵感篮子'}</button>${p.doi?`<a class="mini" href="${esc(p.doi)}" target="_blank" rel="noopener">DOI</a>`:''}${p.arxivUrl?`<a class="mini" href="${esc(p.arxivUrl)}" target="_blank" rel="noopener">arXiv</a>`:''}</div></div></div></article>`;
  }
  function renderRadar(){
    const rows=filteredResults();
    $('#paperGrid').innerHTML=rows.length?rows.map(card).join(''):`<div class="empty" style="grid-column:1/-1">${state.lastScan?'当前筛选条件下没有候选论文。':'尚未扫描。现在论文搜索无需后端，直接点击“扫描最近一年”即可。'}</div>`;
    const selected=state.results.filter(x=>x.selected&&!x.inDrive&&x.pdfAvailable).length, available=state.results.filter(x=>!x.inDrive&&x.pdfAvailable).length;
    const stamp=state.lastScan?`上次扫描 ${new Date(state.lastScan).toLocaleString()} · `:'';
    $('#selectionStrip').textContent=`${stamp}${state.results.length} 条候选，Drive 已有 ${state.results.filter(x=>x.inDrive).length} 条；可归档 ${available} 条，已选择 ${selected} 条。`;
    $('#uploadBtn').disabled=selected===0||!driveToken;
    bindCards();
  }
  function renderLibrary(){
    const q=norm($('#librarySearch')?.value||'');
    const rows=(driveFiles.length?driveFiles:state.driveNames.map((name,i)=>({id:'cache-'+i,name}))).filter(f=>!q||norm(f.name).includes(q));
    $('#libraryList').innerHTML=rows.length?rows.slice(0,400).map(f=>`<div class="library-row"><div><strong>${esc(f.name)}</strong><br><span>${esc(f.modifiedTime?('更新 '+fmtDate(f.modifiedTime)):'缓存目录')}</span></div>${f.webViewLink?`<a class="mini" href="${esc(f.webViewLink)}" target="_blank" rel="noopener">Drive ↗</a>`:''}</div>`).join(''):'<div class="empty">尚未读取 Google Drive /paper。点击页面上方“连接 Google Drive”。</div>';
  }
  function renderIdeas(){
    $('#ideasList').innerHTML=state.ideas.length?state.ideas.map(x=>`<article class="idea-card"><h3>${esc(x.title)}</h3><div class="paper-meta"><span class="pill ${esc(x.lane||'inspiration')}">${laneLabel(x.lane||'inspiration')}</span><span class="pill">${esc(x.venue||'')}</span></div><textarea class="field" data-idea-note="${esc(x.id)}" placeholder="这篇论文能迁移到我的哪个问题？">${esc(x.note||'')}</textarea><div class="paper-actions">${x.url?`<a class="mini" href="${esc(x.url)}" target="_blank" rel="noopener">打开论文</a>`:''}<button class="mini" data-remove-idea="${esc(x.id)}">移除</button></div></article>`).join(''):'<div class="empty">灵感篮子为空。遇到“方向不完全相同，但方法值得借”的论文时再加入。</div>';
    $$('[data-idea-note]').forEach(t=>t.onchange=()=>{const x=state.ideas.find(i=>i.id===t.dataset.ideaNote);if(x){x.note=t.value;persist()}});
    $$('[data-remove-idea]').forEach(b=>b.onclick=()=>{state.ideas=state.ideas.filter(x=>x.id!==b.dataset.removeIdea);persist();renderAll();toast('已移除')});
  }
  function renderWatch(){if($('#coreTerms')){$('#coreTerms').value=prefs.core;$('#adjacentTerms').value=prefs.adjacent;$('#inspirationTerms').value=prefs.inspiration;$('#negativeTerms').value=prefs.negative}}
  function updateStatus(){
    if(driveToken){setStatus('论文搜索已就绪 · Google Drive /paper 已连接。','ok');return}
    if(prefs.googleClientId||CFG.googleClientId){setStatus('论文搜索已就绪 · 点击“连接 Google Drive”即可授权并启用去重/归档。','');return}
    setStatus('论文搜索已就绪（零后端配置） · Google Drive 首次使用时需要粘贴一次 OAuth Client ID。','warn');
  }
  function updateDriveButton(){const b=$('#connectDriveBtn');if(!b)return;b.textContent=driveToken?'Drive 已连接':'连接 Google Drive';b.classList.toggle('primary',!driveToken)}
  function renderAll(){renderNav();renderMetrics();renderRadar();renderLibrary();renderIdeas();renderWatch();updateStatus();updateDriveButton()}
  function bindCards(){
    $$('.paper-card .paper-select').forEach(cb=>cb.onchange=()=>{const p=state.results.find(x=>x.id===cb.closest('.paper-card').dataset.id);if(p){p.selected=cb.checked;persist();renderRadar()}});
    $$('[data-idea]').forEach(b=>b.onclick=()=>toggleIdea(b.dataset.idea));
    $$('[data-openpdf]').forEach(b=>b.onclick=()=>openPdf(b.dataset.openpdf));
  }
  function toggleIdea(id){const p=state.results.find(x=>x.id===id);if(!p)return;const old=state.ideas.find(x=>x.paperId===id);if(old){active='ideas';renderAll();return}state.ideas.unshift({id:'idea-'+Date.now(),paperId:p.id,title:p.title,lane:p.lane,venue:p.venue,url:p.url||p.doi||p.arxivUrl,note:''});persist();renderAll();toast('已加入灵感篮子')}

  /* ---------- Google Drive OAuth ---------- */
  async function connectDrive(){
    if(driveToken){active='library';renderAll();return}
    if(!(prefs.googleClientId||CFG.googleClientId)){openSettings(true);return}
    try{await ensureDrive();toast('Google Drive 已连接');renderAll()}catch(e){setStatus(esc(e.message),'warn');toast(e.message)}
  }
  async function ensureDrive(){
    if(driveToken)return true;
    const clientId=prefs.googleClientId||CFG.googleClientId;
    if(!clientId)throw new Error('首次使用请先粘贴 Google OAuth Client ID');
    if(!window.google?.accounts?.oauth2)throw new Error('Google 授权组件尚未加载，请刷新页面后重试');
    driveToken=await new Promise((resolve,reject)=>{
      const client=google.accounts.oauth2.initTokenClient({
        client_id:clientId,
        /* Full Drive scope is used only in-browser so the app can auto-find an existing /paper folder. */
        scope:'https://www.googleapis.com/auth/drive',
        callback:(resp)=>resp.error?reject(new Error(resp.error_description||resp.error)):resolve(resp.access_token),
        error_callback:()=>reject(new Error('Google 授权窗口被关闭或授权失败'))
      });
      client.requestAccessToken({prompt:'consent'});
    });
    try{await loadDriveLibrary()}catch(e){driveToken=null;throw e}
    return true;
  }
  async function driveFetch(url,options={}){
    if(!driveToken)throw new Error('Google Drive 尚未连接');
    const r=await fetch(url,{...options,headers:{Authorization:`Bearer ${driveToken}`,...(options.headers||{})}});
    if(r.status===401){driveToken=null;renderAll();throw new Error('Google Drive 授权已过期，请重新连接')}
    if(!r.ok)throw new Error((await r.text()).slice(0,320)||`Drive HTTP ${r.status}`);
    return r;
  }
  async function verifySavedFolder(id){
    if(!id)return false;
    try{const r=await driveFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?fields=id,name,mimeType,trashed`);const j=await r.json();return !j.trashed&&j.mimeType==='application/vnd.google-apps.folder'}catch(_){return false}
  }
  async function findPaperFolder(){
    if(driveFolderId&&await verifySavedFolder(driveFolderId))return driveFolderId;
    driveFolderId='';safeSet(FOLDER_KEY,'');
    const name=CFG.paperFolderName||'paper', q=`mimeType='application/vnd.google-apps.folder' and name='${name.replace(/'/g,"\\'")}' and trashed=false`;
    const j=await (await driveFetch('https://www.googleapis.com/drive/v3/files?'+new URLSearchParams({q,fields:'files(id,name,webViewLink)',pageSize:'50'}))).json();
    if(!j.files?.length)throw new Error(`Google Drive 中没有找到 “${name}” 文件夹。请先在 Drive 中创建该文件夹。`);
    driveFolderId=j.files[0].id;safeSet(FOLDER_KEY,driveFolderId);return driveFolderId;
  }
  async function loadDriveLibrary(){
    const folder=await findPaperFolder(), all=[];let token='';
    do{const params={q:`'${folder}' in parents and trashed=false`,fields:'nextPageToken,files(id,name,mimeType,modifiedTime,webViewLink,description,appProperties)',pageSize:'1000'};if(token)params.pageToken=token;const j=await (await driveFetch('https://www.googleapis.com/drive/v3/files?'+new URLSearchParams(params))).json();asArray(j.files).forEach(x=>all.push(x));token=j.nextPageToken||''}while(token);
    driveFiles=all;state.driveNames=all.map(x=>x.name);persist();renderAll();return all;
  }

  /* ---------- Search: direct OpenAlex + arXiv, no Worker ---------- */
  function termsPayload(){return {core:parseLines('coreTerms'),adjacent:parseLines('adjacentTerms'),inspiration:parseLines('inspirationTerms'),negative:parseLines('negativeTerms')}}
  const dateString=d=>d.toISOString().slice(0,10);
  const laneRank=x=>x==='core'?0:x==='adjacent'?1:2;
  function isCcfA(venue){
    const v=norm(venue);if(!v)return false;
    return CCF_A.some(x=>{const n=norm(x.name),a=norm(x.abbr);if(n&&(v.includes(n)||n.includes(v)))return true;if(a.length>=4&&new RegExp('(^| )'+a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'( |$)').test(v))return true;const A=new Set(v.split(' ')),B=new Set(n.split(' '));let inter=0;B.forEach(t=>{if(t.length>3&&A.has(t))inter++});return inter>=Math.min(4,Math.ceil(B.size*.65))})
  }
  function isAcmTransactions(venue){return /^acm transactions on\b/i.test(String(venue||'').trim())||/\bacm transactions on\b/i.test(String(venue||''))}
  function reason(lane,q){if(lane==='core')return `直接命中“${q}”，与模型确权、归因、水印或版权保护问题高度相关。`;if(lane==='adjacent')return `来自相邻安全问题“${q}”，其中的攻击模型、检测机制或鲁棒性设计可能迁移到模型版权研究。`;return `来自“${q}”等方法邻域，主题未必相同，但统计、密码、表示或推断机制可能带来新的研究思路。`}
  function abstractFromIndex(idx){if(!idx)return'';const a=[];for(const [word,pos] of Object.entries(idx))for(const p of pos)a[p]=word;return a.join(' ')}
  function openAlexPaper(w,seed){
    const locs=asArray(w.locations), sourceNames=[w.primary_location?.source?.display_name].concat(locs.map(x=>x?.source?.display_name)).filter(Boolean);
    const arxivLoc=locs.find(x=>/arxiv/i.test(x.source?.display_name||'')||/arxiv\.org/i.test(x.landing_page_url||''));
    const venue=sourceNames.find(v=>!/arxiv/i.test(v))||sourceNames[0]||'';
    const flags={ieee:sourceNames.some(v=>/^ieee transactions on\b/i.test(v)),acm:sourceNames.some(isAcmTransactions),ccfa:sourceNames.some(isCcfA),arxiv:!!arxivLoc||sourceNames.some(v=>/arxiv/i.test(v))};
    const doi=w.doi||w.ids?.doi||'', doiUrl=doi?String(doi).replace(/^https?:\/\/doi\.org\//i,'https://doi.org/'):'';
    const oaLoc=w.best_oa_location||locs.find(x=>x.pdf_url)||{}, pdf=oaLoc.pdf_url||'';
    const id=String(w.id||'').split('/').pop(), arxivUrl=arxivLoc?.landing_page_url||'';
    let arxivId='';const mm=arxivUrl.match(/(?:abs|pdf)\/([^?#/]+(?:v\d+)?)/);if(mm)arxivId=mm[1].replace(/\.pdf$/,'');
    return {id:'oa:'+id,openAlexId:id,title:w.title||w.display_name||'',authors:asArray(w.authorships).slice(0,8).map(a=>a?.author?.display_name).filter(Boolean).join(', ')+(asArray(w.authorships).length>8?' et al.':''),venue,date:w.publication_date||'',doi:doiUrl,url:doiUrl||w.primary_location?.landing_page_url||w.id||'',arxivId,arxivUrl,lane:seed.lane,reason:reason(seed.lane,seed.q),keywords:[seed.q],flags,pdfAvailable:!!pdf,pdfUrl:pdf,citations:Number(w.cited_by_count||0),abstract:abstractFromIndex(w.abstract_inverted_index)};
  }
  async function searchOpenAlex(seed,from,to){
    const u=new URL('https://api.openalex.org/works');u.searchParams.set('search',seed.q);u.searchParams.set('filter',`from_publication_date:${from},to_publication_date:${to}`);u.searchParams.set('sort','publication_date:desc');u.searchParams.set('per-page','100');if(CFG.openAlexMailto)u.searchParams.set('mailto',CFG.openAlexMailto);
    const r=await fetch(u);if(!r.ok)throw new Error(`OpenAlex ${r.status}`);const d=await r.json();return asArray(d?.results).map(w=>openAlexPaper(w||{},seed)).filter(x=>x.title&&(x.flags.ieee||x.flags.acm||x.flags.ccfa||x.flags.arxiv));
  }
  function xmlText(node,sel){return node.querySelector(sel)?.textContent?.replace(/\s+/g,' ').trim()||''}
  function arxivStamp(d){return d.toISOString().replace(/[-:T.Z]/g,'').slice(0,12)}
  async function searchArxiv(terms,lane,start,end){
    if(!terms.length)return[];
    const expr=terms.slice(0,8).map(t=>`all:"${t.replace(/"/g,'')}"`).join(' OR '), date=`submittedDate:[${arxivStamp(start)} TO ${arxivStamp(end)}]`;
    const u='https://export.arxiv.org/api/query?'+new URLSearchParams({search_query:`(${expr}) AND ${date}`,start:'0',max_results:'100',sortBy:'submittedDate',sortOrder:'descending'});
    const r=await fetch(u);if(!r.ok)throw new Error(`arXiv ${r.status}`);const text=await r.text(), doc=new DOMParser().parseFromString(text,'application/xml');
    return Array.from(doc.querySelectorAll('entry')).map(e=>{const idUrl=xmlText(e,'id'),id=(idUrl.match(/abs\/([^?#]+)/)||[])[1]||'',title=xmlText(e,'title'),summary=xmlText(e,'summary'),authors=Array.from(e.querySelectorAll('author > name')).map(x=>x.textContent.trim()),pub=xmlText(e,'published'),doiRaw=xmlText(e,'doi');return {id:'arxiv:'+id,title,authors:authors.slice(0,8).join(', ')+(authors.length>8?' et al.':''),venue:'arXiv',date:pub.slice(0,10),doi:doiRaw?'https://doi.org/'+doiRaw:'',url:idUrl,arxivId:id,arxivUrl:idUrl,lane,reason:reason(lane,terms.find(t=>norm(title+' '+summary).includes(norm(t)))||terms[0]),keywords:terms,flags:{ieee:false,acm:false,ccfa:false,arxiv:true},pdfAvailable:true,pdfUrl:id?`https://arxiv.org/pdf/${id}`:'',citations:0,abstract:summary}}).filter(x=>x.title&&x.arxivId);
  }
  function score(p){let s=p.lane==='core'?60:p.lane==='adjacent'?42:28;if(p.flags?.ccfa)s+=10;if(p.flags?.ieee)s+=7;if(p.flags?.acm)s+=7;if(p.flags?.arxiv)s+=3;if(p.pdfAvailable)s+=3;s+=Math.min(8,Math.log10(1+Number(p.citations||0))*3);const age=Math.max(0,(Date.now()-new Date(p.date||0).getTime())/86400000);return s+Math.max(0,6-age/70)}
  async function settleBatches(tasks,batchSize=4){
    const out=[];
    for(let i=0;i<tasks.length;i+=batchSize){
      const settled=await Promise.allSettled(tasks.slice(i,i+batchSize).map(fn=>fn()));
      settled.forEach(x=>{if(x.status==='fulfilled')asArray(x.value).forEach(v=>out.push(v))});
      if(i+batchSize<tasks.length)await new Promise(r=>setTimeout(r,450));
    }
    return out;
  }
  function spreadTerms(list,n){list=asArray(list);if(n<=0||!list.length)return[];if(n>=list.length)return list.slice();const out=[];for(let i=0;i<n;i++){const idx=n===1?0:Math.round(i*(list.length-1)/(n-1));if(!out.includes(list[idx]))out.push(list[idx])}return out}
  async function discoverClient(){
    const breadth=prefs.breadth, t=termsPayload();
    const counts=breadth==='focused'?[9,7,3]:breadth==='explore'?[13,18,15]:[12,15,11];
    const coreSeeds=spreadTerms(t.core,counts[0]),adjSeeds=spreadTerms(t.adjacent,counts[1]),inspSeeds=spreadTerms(t.inspiration,counts[2]);
    const seeds=coreSeeds.map(q=>({q,lane:'core'})).concat(adjSeeds.map(q=>({q,lane:'adjacent'})),inspSeeds.map(q=>({q,lane:'inspiration'})));
    const end=new Date(),start=new Date(end.getTime()-Number(CFG.radarLookbackDays||365)*86400000),from=dateString(start),to=dateString(end);
    const oaTasks=seeds.map(seed=>()=>searchOpenAlex(seed,from,to));
    const all=await settleBatches(oaTasks,4);
    const axTasks=[()=>searchArxiv(spreadTerms(t.core,Math.min(10,counts[0])),'core',start,end),()=>searchArxiv(spreadTerms(t.adjacent,Math.min(10,counts[1])),'adjacent',start,end)];
    if(counts[2])axTasks.push(()=>searchArxiv(spreadTerms(t.inspiration,Math.min(9,counts[2])),'inspiration',start,end));
    const axSettled=await Promise.allSettled(axTasks);axSettled.forEach(x=>{if(x.status==='fulfilled')asArray(x.value).forEach(v=>all.push(v))});
    if(!all.length)throw new Error('公开论文源暂时没有返回结果，请稍后重试');
    const negative=t.negative.map(norm), byKey=new Map();
    for(const p of all){
      const text=norm(p.title+' '+(p.abstract||''));
      if(negative.some(n=>n&&text.includes(n)))continue;
      if(!p.flags?.arxiv&&!p.flags?.ieee&&!p.flags?.acm&&!p.flags?.ccfa)continue;
      const key=p.doi?norm(p.doi):p.arxivId?'arxiv '+norm(p.arxivId):norm(p.title),old=byKey.get(key);
      if(!old){byKey.set(key,p);continue}
      old.flags={ieee:old.flags.ieee||p.flags.ieee,acm:old.flags.acm||p.flags.acm,ccfa:old.flags.ccfa||p.flags.ccfa,arxiv:old.flags.arxiv||p.flags.arxiv};
      if(!old.pdfUrl&&p.pdfUrl){old.pdfUrl=p.pdfUrl;old.pdfAvailable=true}
      if(laneRank(p.lane)<laneRank(old.lane)){old.lane=p.lane;old.reason=p.reason}
    }
    let list=Array.from(byKey.values());list.forEach(p=>{p.score=score(p);delete p.abstract});
    const quotas=breadth==='focused'?{core:48,adjacent:27,inspiration:8}:breadth==='explore'?{core:58,adjacent:62,inspiration:55}:{core:52,adjacent:43,inspiration:30},chosen=[];
    for(const lane of ['core','adjacent','inspiration'])list.filter(x=>x.lane===lane).sort((a,b)=>b.score-a.score).slice(0,quotas[lane]).forEach(v=>chosen.push(v));
    return chosen.sort((a,b)=>new Date(b.date||0)-new Date(a.date||0)||b.score-a.score).slice(0,breadth==='focused'?82:breadth==='explore'?175:125);
  }

  /* ---------- Drive dedup ---------- */
  function identifiers(p){const out=[];if(p.doi)out.push(norm(p.doi));if(p.arxivId)out.push(norm(p.arxivId));if(p.title)out.push(norm(p.title));return out.filter(Boolean)}
  function similarity(a,b){const A=new Set(a.split(' ').filter(x=>x.length>2)),B=new Set(b.split(' ').filter(x=>x.length>2));if(!A.size||!B.size)return 0;let i=0;A.forEach(x=>{if(B.has(x))i++});return i/Math.max(A.size,B.size)}
  function filenameDuplicate(p){const ids=identifiers(p),files=driveFiles.map(f=>({n:norm(f.name),d:norm(f.description||''),a:norm(JSON.stringify(f.appProperties||{}))}));return files.some(f=>ids.some(id=>id.length>7&&(f.n.includes(id)||f.d.includes(id)||f.a.includes(id)))||(norm(p.title).length>14&&similarity(norm(p.title),f.n)>0.9))}
  function rareTokens(title){return norm(title).split(' ').filter(x=>x.length>=5&&!['model','using','based','learning','neural','security','watermark','watermarking'].includes(x)).sort((a,b)=>b.length-a.length).slice(0,3)}
  async function fullTextDuplicate(p){const toks=rareTokens(p.title);if(toks.length<2)return false;const folder=await findPaperFolder(),clauses=toks.map(t=>`fullText contains '${t.replace(/'/g,"\\'")}'`).join(' and '),q=`'${folder}' in parents and trashed=false and ${clauses}`;try{const j=await (await driveFetch('https://www.googleapis.com/drive/v3/files?'+new URLSearchParams({q,fields:'files(id,name)',pageSize:'5'}))).json();return !!j.files?.length}catch(_){return false}}
  async function dedupeAgainstDrive(results){await ensureDrive();const unresolved=[];for(const p of results){p.inDrive=filenameDuplicate(p);if(!p.inDrive)unresolved.push(p)}const batch=unresolved;for(let i=0;i<batch.length;i+=5){const part=batch.slice(i,i+5),vals=await Promise.all(part.map(fullTextDuplicate));vals.forEach((v,k)=>part[k].inDrive=v);setStatus(`正在与 Drive /paper 做全文去重… ${Math.min(i+5,batch.length)}/${batch.length}`,'ok')}return results}

  async function scan(){
    try{
      prefs.breadth=$('#breadthSelect').value;persistPrefs();$('#scanBtn').disabled=true;$('#scanBtn').innerHTML='<span><i class="loading-dot"></i>正在扫描</span><small>OpenAlex + arXiv</small>';setStatus('正在直接查询 OpenAlex 与 arXiv…','ok');
      let results=asArray(await discoverClient()).map(x=>Object.assign({},x,{selected:false,inDrive:false}));
      if(prefs.googleClientId||CFG.googleClientId){try{setStatus(`发现 ${results.length} 条候选，正在请求 Google Drive 授权并去重…`,'ok');await dedupeAgainstDrive(results)}catch(e){setStatus(`已发现 ${results.length} 条候选；Drive 未连接，因此本次暂未去重。${esc(e.message)}`,'warn')}}
      state.results=results;state.lastScan=new Date().toISOString();persist();renderAll();const fresh=results.filter(x=>!x.inDrive).length;toast(`发现 ${fresh} 篇候选`);
    }catch(e){setStatus(esc(e.message),'warn');toast(e.message)}finally{$('#scanBtn').disabled=false;$('#scanBtn').innerHTML='<span>扫描最近一年</span><small>OpenAlex + arXiv · 无需后端</small>'}
  }
  function openPdf(id){const p=state.results.find(x=>x.id===id);if(!p?.pdfUrl)return toast('没有开放 PDF 链接');window.open(p.pdfUrl,'_blank','noopener')}
  async function fetchPdf(p){
    const urls=[p.pdfUrl];if(p.arxivId)urls.push(`https://export.arxiv.org/pdf/${p.arxivId}`);
    let last='';for(const u of Array.from(new Set(urls.filter(Boolean)))){try{const r=await fetch(u,{mode:'cors',credentials:'omit'});if(!r.ok){last=`HTTP ${r.status}`;continue}const blob=await r.blob();if(blob.size<10000){last='PDF 响应过小';continue}return blob}catch(e){last=e.message||'CORS'}}
    throw new Error(`${p.title}: 来源站点禁止浏览器跨域读取 PDF（${last}）。可以打开 PDF 后手动下载；论文搜索与 Drive 去重不受影响。`);
  }
  function safeFilename(p){return (`[${(p.venue||'paper').replace(/[^a-zA-Z0-9._-]+/g,'_').slice(0,35)}_${(p.date||'').slice(0,4)}] ${p.title}`).replace(/[\\/:*?"<>|]/g,' ').replace(/\s+/g,' ').trim().slice(0,180)+'.pdf'}
  async function uploadBlob(blob,p){const folder=await findPaperFolder(),meta={name:safeFilename(p),parents:[folder],description:`Research Radar\nTitle: ${p.title}\nDOI: ${p.doi||''}\narXiv: ${p.arxivId||''}\nSource: ${p.url||''}`,appProperties:{radar_id:p.id.slice(0,120),doi:(p.doi||'').slice(0,120),arxiv:(p.arxivId||'').slice(0,120)}},boundary='nhw_'+Math.random().toString(36).slice(2),head=`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${boundary}\r\nContent-Type: application/pdf\r\n\r\n`,tail=`\r\n--${boundary}--`,body=new Blob([head,blob,tail],{type:`multipart/related; boundary=${boundary}`});const r=await driveFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',{method:'POST',headers:{'Content-Type':`multipart/related; boundary=${boundary}`},body});return r.json()}
  async function uploadSelected(){
    const selected=state.results.filter(x=>x.selected&&!x.inDrive&&x.pdfAvailable);if(!selected.length)return;
    try{await ensureDrive();$('#uploadBtn').disabled=true;let ok=0,fail=[];for(let i=0;i<selected.length;i++){const p=selected[i];setStatus(`正在归档 ${i+1}/${selected.length}：${esc(p.title)}`,'ok');try{const blob=await fetchPdf(p);await uploadBlob(blob,p);p.inDrive=true;p.selected=false;ok++}catch(e){fail.push(e.message)}}await loadDriveLibrary();persist();renderAll();setStatus(`归档完成：成功 ${ok} 篇${fail.length?`，${fail.length} 篇因来源站点跨域限制未自动上传`:''}。`,fail.length?'warn':'ok');toast(`已归档 ${ok} 篇`);if(fail.length)console.warn(fail)}catch(e){setStatus(esc(e.message),'warn');toast(e.message)}finally{renderRadar()}
  }

  /* ---------- Settings ---------- */
  function openSettings(connectAfter=false){window.__connectAfterSettings=connectAfter;$('#googleClientIdInput').value=prefs.googleClientId||CFG.googleClientId||'';$('#settingsModal').classList.add('show');$('#settingsModal').setAttribute('aria-hidden','false');setTimeout(()=>$('#googleClientIdInput')?.focus(),50)}
  function closeSettings(){$('#settingsModal').classList.remove('show');$('#settingsModal').setAttribute('aria-hidden','true')}
  async function saveSettings(){const v=$('#googleClientIdInput').value.trim();if(v&&!/\.apps\.googleusercontent\.com$/.test(v)){toast('Client ID 格式看起来不正确');return}prefs.googleClientId=v;persistPrefs();const go=!!window.__connectAfterSettings;window.__connectAfterSettings=false;closeSettings();renderAll();toast('Client ID 已保存在此浏览器');if(go&&v)await connectDrive()}
  function exportIdeas(){const md=['# Research Inspiration Basket','',`Exported: ${today()}`,''];state.ideas.forEach((x,i)=>md.push(`## ${i+1}. ${x.title}`,'',`- Venue: ${x.venue||''}`,`- Link: ${x.url||''}`,`- Lane: ${laneLabel(x.lane||'inspiration')}`,'',x.note||'_尚未记录灵感_',''));const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([md.join('\n')],{type:'text/markdown'}));a.download=`research-inspiration-${today()}.md`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

  $('#nav').addEventListener('click',e=>{const b=e.target.closest('[data-panel]');if(!b)return;active=b.dataset.panel;renderAll()});
  $('#themeBtn').onclick=()=>{const d=document.documentElement;d.dataset.theme=d.dataset.theme==='dark'?'light':'dark';safeSet('nhw-radar-theme',d.dataset.theme)};
  $('#settingsBtn').onclick=()=>openSettings(false);$('#connectDriveBtn').onclick=connectDrive;$('#lockRadarBtn').onclick=()=>window.NHW_LOCK_RADAR?.();$('#closeSettingsBtn').onclick=closeSettings;$('#settingsModal').onclick=e=>{if(e.target.id==='settingsModal')closeSettings()};$('#saveSettingsBtn').onclick=saveSettings;
  $('#scanBtn').onclick=scan;$('#uploadBtn').onclick=uploadSelected;
  $('#refreshLibraryBtn').onclick=async()=>{try{await ensureDrive();await loadDriveLibrary();toast('Drive /paper 已刷新')}catch(e){toast(e.message)}};
  $('#selectAllBtn').onclick=()=>{const visible=new Set(filteredResults().filter(x=>!x.inDrive&&x.pdfAvailable).map(x=>x.id)),all=state.results.filter(x=>visible.has(x.id)),target=!all.every(x=>x.selected);all.forEach(x=>x.selected=target);persist();renderRadar()};
  ['resultSearch','laneFilter','sourceFilter','pdfFilter'].forEach(id=>$('#'+id).addEventListener(id==='resultSearch'?'input':'change',renderRadar));$('#librarySearch').addEventListener('input',renderLibrary);
  $('#breadthSelect').value=prefs.breadth;$('#breadthSelect').onchange=()=>{prefs.breadth=$('#breadthSelect').value;persistPrefs()};
  $('#saveWatchBtn').onclick=()=>{prefs.core=parseLines('coreTerms').join('\n');prefs.adjacent=parseLines('adjacentTerms').join('\n');prefs.inspiration=parseLines('inspirationTerms').join('\n');prefs.negative=parseLines('negativeTerms').join('\n');persistPrefs();toast('主题偏好已保存')};$('#exportIdeasBtn').onclick=exportIdeas;
  document.documentElement.dataset.theme=safeGet('nhw-radar-theme')||'light';renderAll();
})();
