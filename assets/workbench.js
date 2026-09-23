(()=>{
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const asArray=v=>Array.isArray(v)?v:(v==null?[]:(typeof v?.[Symbol.iterator]==='function'?Array.from(v):[]));
  const CFG=window.NHW_RESEARCH_CONFIG||{}, CCF_A=asArray(window.NHW_CCF_A);
  const K='nhw-research-os-v6', LEGACY_KEYS=['nhw-radar-v5','nhw-radar-v4'];
  const SETTINGS='nhw-research-os-settings-v6', LEGACY_SETTINGS='nhw-radar-settings-v5';
  const FOLDER_KEY='nhw-radar-paper-folder-v1';

  const PROFILE_DEFAULTS={
    model:{
      name:'模型版权 / 模型安全',
      core:[
        'model watermarking','model ownership verification','model fingerprinting','model attribution','model provenance','model copyright protection','model intellectual property protection','neural network ownership verification','foundation model ownership','diffusion model watermarking','large language model watermarking','AI-generated content provenance','training data attribution','model lineage','model forensics','AI model authentication'
      ],
      adjacent:[
        'machine learning security','AI security','foundation model security','generative model security','large language model security','diffusion model security','trustworthy artificial intelligence','backdoor and trojan detection','data poisoning','model stealing and extraction','model inversion','membership inference','adversarial machine learning','adversarial robustness','privacy leakage','differential privacy','machine unlearning','model editing','AI forensics','deepfake detection','data provenance','model supply chain security','software supply chain security','secure federated learning','federated learning security','prompt injection','jailbreak detection','AI authentication','content authenticity','data attribution','dataset auditing','model auditing','safety evaluation','red teaming large language models','neural network verification'
      ],
      inspiration:[
        'cryptographic commitment','zero knowledge proof','proof of provenance','secure multiparty computation','verifiable computation','conformal prediction','conformal inference','sequential hypothesis testing','multiple hypothesis testing','change point detection','uncertainty quantification','information theory','error correcting codes','causal inference','anomaly detection','out of distribution detection','representation similarity','representation alignment','metric learning','contrastive learning','mechanistic interpretability','influence functions','data valuation','graph matching','set matching','statistical forensics','robust statistics','active learning','continual learning','provenance tracking','software provenance','program verification','property testing','optimal transport','game theory','mechanism design'
      ],
      negative:['audio broadcast watermark','physical document watermark','watermark removal from photographs','database watermarking only','wireless channel watermark']
    },
    embodied:{
      name:'具身智能 / 双臂抓取',
      core:[
        'bimanual grasping','bimanual dexterous grasping','dual arm grasping','dexterous grasp synthesis','robotic dexterous grasping','grasp affordance','affordance prediction for grasping','contact guided grasping','hand object interaction','dual arm manipulation','bimanual manipulation','task aware grasping','open vocabulary grasping','dexterous hand grasp generation','grasp diffusion','grasp generation'
      ],
      adjacent:[
        'robot manipulation','vision language action model','vision language model robot manipulation','humanoid manipulation','humanoid loco manipulation','whole body manipulation','diffusion policy robotics','flow matching robotics','3D affordance','affordance grounding','contact rich manipulation','motion planning manipulation','trajectory optimization robotics','imitation learning robotics','reinforcement learning manipulation','sim to real manipulation','tactile manipulation','object pose estimation grasping','human demonstration robot learning','behavior cloning manipulation','multimodal robot learning','robot foundation model','generalist robot policy'
      ],
      inspiration:[
        'contact mechanics','optimal control','model predictive control robotics','constraint satisfaction motion planning','geometric deep learning','equivariant neural networks','optimal transport','energy based models','score based generative models','flow matching','diffusion models','multimodal alignment','3D scene understanding','spatial reasoning','human motor control','biomechanics hand object interaction','physics informed learning','trajectory prediction','preference learning','inverse reinforcement learning','active perception','world models robotics','uncertainty aware planning'
      ],
      negative:['surgical grasp only','agricultural gripper design only','industrial fixture design only']
    },
    cross:{
      name:'跨域方法灵感',
      core:[
        'robust statistical inference','conformal inference','sequential testing','hypothesis testing high dimensional','information theoretic detection','cryptographic verification','verifiable computation','software provenance','anomaly detection representation learning','uncertainty quantification machine learning','causal representation learning','representation similarity analysis'
      ],
      adjacent:[
        'change point detection','error correcting codes','graph matching','set matching','optimal transport','data valuation','influence functions','mechanistic interpretability','program verification','property testing','formal methods machine learning','secure computation','privacy preserving computation','scientific machine learning','geometric deep learning','topological data analysis','metric learning','contrastive representation learning','active learning','continual learning','online learning','Bayesian experimental design','robust optimization'
      ],
      inspiration:[
        'game theory mechanism design','coding theory','statistical decision theory','causal inference','control theory','signal detection theory','forensic statistics','network science','graph signal processing','algorithmic information theory','computational topology','combinatorial optimization','multi armed bandit','active hypothesis testing','federated analytics','database provenance','data lineage systems','software supply chain provenance','formal verification','human factors decision support','scientific discovery machine learning'
      ],
      negative:[]
    }
  };

  let state=loadState(), prefs=loadPrefs(), driveToken=null, driveFiles=[], driveFolderId=safeGet(FOLDER_KEY)||'', rootFolderId='';
  let active='today', projectCandidates=[], organizerItems=[], organizerSelected=new Set(), organizerScopeInfo=null, currentNoteId='', lastExperimentReport=null;

  function safeGet(k){try{return localStorage.getItem(k)||''}catch(_){return''}}
  function safeSet(k,v){try{localStorage.setItem(k,v)}catch(_){}}
  function jsonGet(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}}
  function loadState(){
    let raw=jsonGet(K);
    if(!raw){for(const k of LEGACY_KEYS){raw=jsonGet(k);if(raw)break}}
    raw=raw||{};
    return {
      results:asArray(raw.results), ideas:asArray(raw.ideas), notes:asArray(raw.notes), projects:asArray(raw.projects),
      lastScan:raw.lastScan||null, driveNames:asArray(raw.driveNames), organizerLastScan:raw.organizerLastScan||null
    };
  }
  function cloneProfiles(){const o={};for(const [k,v] of Object.entries(PROFILE_DEFAULTS))o[k]={core:v.core.join('\n'),adjacent:v.adjacent.join('\n'),inspiration:v.inspiration.join('\n'),negative:v.negative.join('\n')};return o}
  function loadPrefs(){
    const base={breadth:CFG.defaultBreadth||'balanced',profile:'model',watchProfile:'model',googleClientId:CFG.googleClientId||'',profiles:cloneProfiles()};
    const raw=jsonGet(SETTINGS)||jsonGet(LEGACY_SETTINGS)||{};
    if(raw.profiles){for(const k of Object.keys(base.profiles))if(raw.profiles[k])base.profiles[k]=Object.assign({},base.profiles[k],raw.profiles[k])}
    else if(raw.core||raw.adjacent||raw.inspiration||raw.negative){base.profiles.model={core:raw.core||base.profiles.model.core,adjacent:raw.adjacent||base.profiles.model.adjacent,inspiration:raw.inspiration||base.profiles.model.inspiration,negative:raw.negative||base.profiles.model.negative}}
    if(raw.breadth)base.breadth=raw.breadth;if(raw.profile)base.profile=raw.profile;if(raw.watchProfile)base.watchProfile=raw.watchProfile;if(raw.googleClientId)base.googleClientId=raw.googleClientId;
    return base;
  }
  function persist(){try{localStorage.setItem(K,JSON.stringify(state))}catch(_){}}
  function persistPrefs(){try{localStorage.setItem(SETTINGS,JSON.stringify(prefs))}catch(_){}}
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const norm=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/https?:\/\/doi\.org\//g,'').replace(/[^a-z0-9\u4e00-\u9fff]+/g,' ').trim();
  const today=()=>new Date().toISOString().slice(0,10), fmtDate=d=>d?String(d).slice(0,10):'日期未知';
  const fileExt=n=>(String(n||'').match(/\.([^.]+)$/)||[])[1]?.toLowerCase()||'';
  const toast=msg=>{const t=$('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(window.__osToast);window.__osToast=setTimeout(()=>t.classList.remove('show'),2800)};
  function setStatus(text,kind=''){const e=$('#connectionStatus');if(!e)return;e.className='statusline '+kind;e.textContent=text}
  function downloadText(name,text,type='text/markdown'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1200)}
  function laneLabel(v){return v==='core'?'核心相关':v==='adjacent'?'相邻方向':'跨域启发'}
  function profileLabel(v){return PROFILE_DEFAULTS[v]?.name||v||'研究方向'}
  function sourceLabel(p){const a=[];if(p.flags?.ieee)a.push('IEEE Trans');if(p.flags?.acm)a.push('ACM Trans');if(p.flags?.ccfa)a.push('CCF A');if(p.flags?.arxiv)a.push('arXiv');return a.join(' · ')||p.venue||'其他'}
  function lines(s){return String(s||'').split(/\n+/).map(x=>x.trim()).filter(Boolean)}

  /* ---------- Drive OAuth + primitives ---------- */
  async function waitForGoogle(ms=8000){const end=Date.now()+ms;while(Date.now()<end){if(window.google?.accounts?.oauth2)return true;await new Promise(r=>setTimeout(r,120))}return false}
  async function connectDrive(){
    if(driveToken){active='today';renderAll();return}
    if(!(prefs.googleClientId||CFG.googleClientId)){openSettings(true);return}
    try{await ensureDrive();toast('Google Drive 已连接');active='today';renderAll();await refreshDashboard(false)}catch(e){setStatus(e.message,'warn');toast(e.message)}
  }
  async function ensureDrive(){
    if(driveToken)return true;
    const clientId=prefs.googleClientId||CFG.googleClientId;if(!clientId)throw new Error('首次使用请先设置 Google OAuth Client ID');
    if(!await waitForGoogle())throw new Error('Google 授权组件加载失败，请刷新页面后重试');
    driveToken=await new Promise((resolve,reject)=>{
      const client=google.accounts.oauth2.initTokenClient({client_id:clientId,scope:'https://www.googleapis.com/auth/drive',callback:r=>r.error?reject(new Error(r.error_description||r.error)):resolve(r.access_token),error_callback:()=>reject(new Error('Google 授权窗口被关闭或授权失败'))});
      client.requestAccessToken({prompt:'consent'});
    });
    try{await loadDriveLibrary()}catch(e){driveToken=null;throw e}
    return true;
  }
  async function driveFetch(url,options={}){
    if(!driveToken)throw new Error('Google Drive 尚未连接');
    const r=await fetch(url,{...options,headers:{Authorization:`Bearer ${driveToken}`,...(options.headers||{})}});
    if(r.status===401){driveToken=null;renderAll();throw new Error('Google Drive 授权已过期，请重新连接')}
    if(!r.ok)throw new Error((await r.text()).slice(0,380)||`Drive HTTP ${r.status}`);
    return r;
  }
  async function getRootId(){if(rootFolderId)return rootFolderId;const j=await (await driveFetch('https://www.googleapis.com/drive/v3/files/root?fields=id,name')).json();rootFolderId=j.id;return rootFolderId}
  async function verifySavedFolder(id){if(!id)return false;try{const j=await (await driveFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?fields=id,name,mimeType,trashed`)).json();return !j.trashed&&j.mimeType==='application/vnd.google-apps.folder'}catch(_){return false}}
  async function findPaperFolder(){
    if(driveFolderId&&await verifySavedFolder(driveFolderId))return driveFolderId;
    driveFolderId='';safeSet(FOLDER_KEY,'');const name=CFG.paperFolderName||'paper',q=`mimeType='application/vnd.google-apps.folder' and name='${name.replace(/'/g,"\\'")}' and trashed=false`;
    const j=await (await driveFetch('https://www.googleapis.com/drive/v3/files?'+new URLSearchParams({q,fields:'files(id,name,webViewLink)',pageSize:'50'}))).json();
    if(!asArray(j.files).length)throw new Error(`Google Drive 中没有找到 “${name}” 文件夹。`);
    driveFolderId=j.files[0].id;safeSet(FOLDER_KEY,driveFolderId);return driveFolderId;
  }
  async function listFolder(folderId){
    const all=[];let token='';
    do{
      const params={q:`'${folderId}' in parents and trashed=false`,fields:'nextPageToken,files(id,name,mimeType,size,md5Checksum,createdTime,modifiedTime,webViewLink,description,appProperties,parents)',pageSize:'1000'};if(token)params.pageToken=token;
      const j=await (await driveFetch('https://www.googleapis.com/drive/v3/files?'+new URLSearchParams(params))).json();asArray(j.files).forEach(x=>all.push(x));token=j.nextPageToken||'';
    }while(token);return all;
  }
  async function listFolderRecursive(folderId,depth=2,path='paper'){
    const direct=await listFolder(folderId), out=[];
    for(const f of direct){
      if(f.mimeType==='application/vnd.google-apps.folder'&&depth>0){const nested=await listFolderRecursive(f.id,depth-1,path+'/'+f.name);nested.forEach(x=>out.push(x))}
      else out.push(Object.assign({},f,{folderPath:path}));
    }
    return out;
  }
  async function loadDriveLibrary(){
    const folder=await findPaperFolder();driveFiles=await listFolderRecursive(folder,2,CFG.paperFolderName||'paper');state.driveNames=driveFiles.map(x=>x.name);persist();renderAll();return driveFiles;
  }
  async function searchFolders(query){
    const q=`mimeType='application/vnd.google-apps.folder' and name contains '${String(query||'').replace(/'/g,"\\'")}' and trashed=false`;
    const j=await (await driveFetch('https://www.googleapis.com/drive/v3/files?'+new URLSearchParams({q,fields:'files(id,name,modifiedTime,webViewLink,parents)',pageSize:'100'}))).json();return asArray(j.files);
  }
  async function patchFile(id,body={},query={}){const u=new URL(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}`);u.searchParams.set('fields','id,name,parents,webViewLink');for(const [k,v] of Object.entries(query))if(v)u.searchParams.set(k,v);return (await driveFetch(u.toString(),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})).json()}
  async function createDriveFolder(name,parentId){const body={name,mimeType:'application/vnd.google-apps.folder'};if(parentId)body.parents=[parentId];return (await (await driveFetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})).json())}
  async function uploadTextToFolder(name,text,parentId,mime='text/markdown'){
    const meta={name,parents:[parentId],mimeType:mime},boundary='nhw_'+Math.random().toString(36).slice(2),head=`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${boundary}\r\nContent-Type: ${mime}; charset=UTF-8\r\n\r\n`,tail=`\r\n--${boundary}--`,body=new Blob([head,text,tail],{type:`multipart/related; boundary=${boundary}`});
    return (await (await driveFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',{method:'POST',headers:{'Content-Type':`multipart/related; boundary=${boundary}`},body})).json());
  }
  async function readDriveText(id){return (await driveFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media`)).text()}

  /* ---------- Library health ---------- */
  function canonicalFileName(name){return norm(String(name||'').replace(/\.[^.]+$/,'').replace(/^\[[^\]]+\]\s*/,'').replace(/\s*\((?:copy|\d+)\)\s*$/i,'').replace(/\s+-\s+copy\s*$/i,'').replace(/\bv\d+\b$/i,'').replace(/\b(?:cvpr|iccv|eccv|neurips|icml|iclr|aaai|ijcai|iros|icra|ral|tpami|tmm|tifs|tcyb)[-_ ]?20\d{2}\b/ig,''))}
  function temporaryName(name){const b=String(name||'').replace(/\.[^.]+$/,'').trim();return /^(main|manuscript|document|untitled|new microsoft word document|新建 microsoft word 文档|paste\b|\d{6,}|\d{4}\.\d{4,}(?:v\d+)?|p\d{10,})/i.test(b)}
  function sensitiveName(name){return /(评审|reviewer|submission|不要传|保密|confidential|身份证|学位证|毕业证|成绩|推荐信|nsfc.*案例|基金.*案例|审稿)/i.test(String(name||''))}
  function readingNoteName(name){return /(阅读笔记|reading[_ -]?note|paper[_ -]?note)/i.test(String(name||''))}
  function isPdf(f){return f.mimeType==='application/pdf'||/\.pdf$/i.test(f.name||'')}
  function libraryHealth(files=driveFiles){
    const buckets=new Map();for(const f of files){const k=canonicalFileName(f.name);if(k.length<5)continue;if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(f)}
    const duplicates=Array.from(buckets.values()).filter(g=>g.length>1), temp=files.filter(f=>temporaryName(f.name)), arxiv=files.filter(f=>/^\d{4}\.\d{4,}(?:v\d+)?\.pdf$/i.test(f.name||'')), sensitive=files.filter(f=>sensitiveName(f.name));
    return {duplicates,temp,arxiv,sensitive,issueCount:duplicates.reduce((n,g)=>n+g.length,0)+temp.length+arxiv.length};
  }

  /* ---------- Project monitor ---------- */
  function projectById(id){return state.projects.find(p=>p.id===id)}
  function baseTitle(name){return canonicalFileName(String(name||'').replace(/阅读笔记/gi,'').replace(/reading[_ -]?note/gi,''))}
  function hasMatchingNote(pdf,notes){const p=baseTitle(pdf.name);if(p.length<5)return false;return notes.some(n=>{const q=baseTitle(n.name);if(!q)return false;if(p.includes(q)||q.includes(p))return true;const A=new Set(p.split(' ').filter(x=>x.length>2)),B=new Set(q.split(' ').filter(x=>x.length>2));let hit=0;A.forEach(x=>{if(B.has(x))hit++});return hit/Math.max(1,Math.min(A.size,B.size))>.62})}
  function analyzeProjectItems(items){
    const files=items.filter(x=>x.mimeType!=='application/vnd.google-apps.folder'),folders=items.filter(x=>x.mimeType==='application/vnd.google-apps.folder'),pdfs=files.filter(isPdf),notes=files.filter(x=>readingNoteName(x.name));
    const unread=pdfs.filter(p=>!hasMatchingNote(p,notes)), experiment=files.filter(x=>/(seed|retry|status|result|metric|log|checkpoint|gpu|eval|train)/i.test(x.name||''));
    const recent=items.slice().sort((a,b)=>new Date(b.modifiedTime||0)-new Date(a.modifiedTime||0)).slice(0,7);
    return {files:files.length,folders:folders.length,pdfs:pdfs.length,notes:notes.length,unread:unread.map(x=>({id:x.id,name:x.name,webViewLink:x.webViewLink})).slice(0,40),experiment:experiment.length,recent,latestModified:recent[0]?.modifiedTime||''};
  }
  async function scanProject(p,quiet=false){
    const items=await listFolder(p.id), snap=analyzeProjectItems(items);p.snapshot=Object.assign(snap,{scannedAt:new Date().toISOString()});persist();if(!quiet){renderAll();toast(`已扫描 ${p.name}`)}return p.snapshot;
  }
  async function searchProjectFolders(){try{await ensureDrive();const q=$('#projectQuery').value.trim();if(!q)return toast('请输入文件夹名称');projectCandidates=(await searchFolders(q)).filter(x=>x.id!==driveFolderId).slice(0,25);renderProjects()}catch(e){toast(e.message)}}
  async function discoverProjectCandidates(){
    try{await ensureDrive();const root=await getRootId(),items=await listFolder(root),cut=Date.now()-180*86400000;
      projectCandidates=items.filter(x=>x.mimeType==='application/vnd.google-apps.folder'&&x.id!==driveFolderId&&!/^\.|__pycache__|node_modules/i.test(x.name||'')).map(x=>{let score=0;const n=norm(x.name);if(/result|data|research|project|实验|论文|抓取|模型|具身|robot|grasp|watermark|security|study|paper/.test(n))score+=4;const mt=new Date(x.modifiedTime||0).getTime();if(mt>cut)score+=3;if(mt>Date.now()-30*86400000)score+=2;return Object.assign({},x,{score})}).sort((a,b)=>b.score-a.score||new Date(b.modifiedTime||0)-new Date(a.modifiedTime||0)).slice(0,16);renderProjects();toast(`发现 ${projectCandidates.length} 个候选文件夹`)
    }catch(e){toast(e.message)}
  }
  function addProject(id){const c=projectCandidates.find(x=>x.id===id);if(!c||projectById(id))return;state.projects.push({id:c.id,name:c.name,url:c.webViewLink||'',addedAt:new Date().toISOString(),snapshot:null});persist();renderAll();toast('已加入项目监视')}
  function removeProject(id){state.projects=state.projects.filter(x=>x.id!==id);persist();renderAll()}
  async function scanAllProjects(){try{await ensureDrive();for(let i=0;i<state.projects.length;i++){setStatus(`扫描项目 ${i+1}/${state.projects.length}：${state.projects[i].name}`,'ok');await scanProject(state.projects[i],true)}renderAll();toast('项目扫描完成')}catch(e){toast(e.message)}}
  function continuePackMarkdown(p){const s=p.snapshot||{},recent=asArray(s.recent),unread=asArray(s.unread);return [
    `# PROJECT CONTEXT — ${p.name}`,'',`Generated: ${new Date().toLocaleString()}`,'',
    '## 1. 项目状态','',`- Drive: ${p.url||''}`,`- 最近扫描: ${s.scannedAt||'未扫描'}`,`- 文件: ${s.files||0} · 子目录: ${s.folders||0} · PDF: ${s.pdfs||0} · 阅读笔记: ${s.notes||0}`,`- 可能的实验文件: ${s.experiment||0}`,'',
    '## 2. 最近修改','',...recent.map(x=>`- ${fmtDate(x.modifiedTime)} · ${x.name}`),'',
    '## 3. 尚未匹配阅读笔记的 PDF','',...(unread.length?unread.map(x=>`- ${x.name}`):['- 暂未发现']),'',
    '## 4. 下一步工作区提示','','- 检查最近修改文件是否形成了可验证的阶段结果。','- 对尚未做阅读笔记的关键论文建立阅读卡。','- 若包含 seed / retry / status / result / log，可在 Experiment Inspector 中继续体检。','',
    '## 5. 继续对话时建议','','将本文件与最新关键结果一并提供给新的工作会话，可快速恢复上下文。',''
  ].join('\n')}
  async function downloadContinuePack(id){const p=projectById(id);if(!p)return;if(!p.snapshot)await scanProject(p,true);downloadText(`PROJECT_CONTEXT_${String(p.name).replace(/[\\/:*?"<>|]/g,'_').slice(0,70)}_${today()}.md`,continuePackMarkdown(p));toast('继续包已下载')}
  async function uploadContinuePack(id){try{await ensureDrive();const p=projectById(id);if(!p)return;if(!p.snapshot)await scanProject(p,true);await uploadTextToFolder(`PROJECT_CONTEXT_${today()}.md`,continuePackMarkdown(p),p.id);toast('继续包已上传到项目目录')}catch(e){toast(e.message)}}

  /* ---------- Experiment inspector ---------- */
  function extractNums(names,re){const s=new Set();for(const n of names){const m=String(n||'').match(re);if(m)s.add(Number(m[1]))}return Array.from(s).sort((a,b)=>a-b)}
  async function inspectExperiment(){
    const id=$('#experimentProjectSelect').value,p=projectById(id);if(!p)return toast('请先添加一个项目');
    try{await ensureDrive();setStatus(`正在体检 ${p.name}…`,'ok');let items=await listFolder(p.id);const likelyFolders=items.filter(x=>x.mimeType==='application/vnd.google-apps.folder'&&/(seed|result|adapter|experiment|run|data|eval|train)/i.test(x.name||'')).slice(0,12);
      for(const f of likelyFolders){try{const sub=await listFolder(f.id);sub.slice(0,300).forEach(x=>items.push(Object.assign({},x,{parentName:f.name})))}catch(_){}}
      const names=items.map(x=>x.name),seeds=extractNums(names,/seed[_ -]?(\d+)/i),retries=extractNums(names,/retry[_ -]?(\d+)/i),logs=items.filter(x=>/\.log$/i.test(x.name||'')),statuses=items.filter(x=>/status.*\.json$/i.test(x.name||'')),results=items.filter(x=>/(result|metric|summary).*\.json$/i.test(x.name||''));
      const latestRetry=retries.length?retries[retries.length-1]:null,issues=[];
      if(logs.length&&!statuses.length)issues.push({kind:'bad',text:'发现运行日志，但没有识别到 status JSON。'});
      if(statuses.length>results.length+2)issues.push({kind:'warn',text:'status 文件明显多于 result/metric 文件，可能存在未产出最终结果的运行。'});
      if(latestRetry!=null&&!names.some(n=>new RegExp(`(result|status).*retry[_ -]?${latestRetry}`, 'i').test(n)))issues.push({kind:'warn',text:`最新 retry ${latestRetry} 没有同时识别到 status/result 文件。`});
      if(!issues.length)issues.push({kind:'good',text:'从文件命名和结果文件数量看，没有发现明显缺口。'});
      let statusPreview='';if(statuses.length){const latest=statuses.slice().sort((a,b)=>new Date(b.modifiedTime||0)-new Date(a.modifiedTime||0))[0];if(Number(latest.size||0)<2_000_000){try{const txt=await readDriveText(latest.id),j=JSON.parse(txt),keys=['status','state','complete','completed','exit_code','error','seed','progress'];const vals=keys.filter(k=>j[k]!==undefined).map(k=>`${k}=${typeof j[k]==='object'?JSON.stringify(j[k]).slice(0,100):j[k]}`);statusPreview=vals.join(' · ')}catch(_){}}}
      lastExperimentReport={projectId:p.id,projectName:p.name,seeds,retries,logs:logs.length,statuses:statuses.length,results:results.length,issues,statusPreview,scannedAt:new Date().toISOString()};renderExperiment();renderToday();setStatus('实验体检完成。','ok')
    }catch(e){toast(e.message)}
  }

  /* ---------- Reading notes ---------- */
  function noteDraft(p){const abs=String(p.abstract||'').slice(0,2200);return [
    `# ${p.title}`,'',`- Authors: ${p.authors||''}`,`- Venue: ${p.venue||''}`,`- Date: ${p.date||''}`,`- Source: ${p.url||p.doi||p.arxivUrl||''}`,`- Radar Profile: ${profileLabel(p.profile||prefs.profile)}`,`- Recommendation: ${p.reason||''}`,'',
    '## 1. 这篇论文解决什么问题？','','_待补充_','',
    '## 2. 核心方法','','_待补充_','',
    '## 3. 最值得记住的 3 个创新','','1. ','2. ','3. ','',
    '## 4. 实验与证据','','_待补充_','',
    '## 5. 局限与可能失效条件','','_待补充_','',
    '## 6. 与我的工作的关系','',p.reason||'_待补充_','',
    '## 7. 可以迁移到哪个问题？','','_把“能借什么”写成一句可执行的研究假设，而不是泛泛的总结。_','',
    '## 8. 是否值得复现？下一步是什么？','','- [ ] 只读即可','- [ ] 复现关键模块','- [ ] 加入实验对比','- [ ] 形成新 idea','',
    abs?'## Abstract / 自动摘录\n\n'+abs+'\n':'',''
  ].join('\n')}
  function openReadingNote(paperId){const p=state.results.find(x=>x.id===paperId);if(!p)return;let n=state.notes.find(x=>x.paperId===paperId);if(!n){n={id:'note-'+Date.now(),paperId:p.id,title:p.title,venue:p.venue,url:p.url||p.doi||p.arxivUrl,content:noteDraft(p),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};state.notes.unshift(n);persist()}currentNoteId=n.id;$('#noteModalTitle').textContent=n.title;$('#noteEditor').value=n.content;populateNoteDestinations();$('#noteModal').classList.add('show');$('#noteModal').setAttribute('aria-hidden','false');renderAll()}
  function closeNote(){if(currentNoteId){const n=state.notes.find(x=>x.id===currentNoteId);if(n){n.content=$('#noteEditor').value;n.updatedAt=new Date().toISOString();persist()}}$('#noteModal').classList.remove('show');$('#noteModal').setAttribute('aria-hidden','true');currentNoteId='';renderNotes()}
  function populateNoteDestinations(){const s=$('#noteDestination');if(!s)return;s.innerHTML='<option value="paper">Drive /paper</option>'+state.projects.map(p=>`<option value="project:${esc(p.id)}">${esc(p.name)}</option>`).join('')}
  async function uploadCurrentNote(){try{await ensureDrive();const n=state.notes.find(x=>x.id===currentNoteId);if(!n)return;n.content=$('#noteEditor').value;const v=$('#noteDestination').value,parent=v==='paper'?await findPaperFolder():v.startsWith('project:')?v.slice(8):await findPaperFolder();await uploadTextToFolder(`${String(n.title).replace(/[\\/:*?"<>|]/g,' ').slice(0,130)}_阅读笔记.md`,n.content,parent);n.updatedAt=new Date().toISOString();persist();toast('阅读笔记已上传到 Drive')}catch(e){toast(e.message)}}
  function exportAllNotes(){if(!state.notes.length)return toast('还没有阅读笔记');downloadText(`research-reading-notes-${today()}.md`,state.notes.map(n=>n.content).join('\n\n---\n\n'));}

  /* ---------- Organizer ---------- */
  function organizerIssue(file,type,detail,severity='warn'){return {fileId:file.id,name:file.name,mimeType:file.mimeType,webViewLink:file.webViewLink||'',parents:asArray(file.parents),modifiedTime:file.modifiedTime||'',size:Number(file.size||0),type,detail,severity,sensitive:sensitiveName(file.name)}}
  function organizerScopeValue(){return $('#organizerScope')?.value||'paper'}
  async function resolveOrganizerScope(){const v=organizerScopeValue();if(v==='paper')return {id:await findPaperFolder(),name:'Drive /paper',kind:'paper'};if(v==='root')return {id:await getRootId(),name:'My Drive 根目录',kind:'root'};if(v.startsWith('project:')){const p=projectById(v.slice(8));if(p)return {id:p.id,name:p.name,kind:'project',project:p}}throw new Error('整理范围无效')}
  async function scanOrganizer(){
    try{await ensureDrive();organizerScopeInfo=await resolveOrganizerScope();const items=await listFolder(organizerScopeInfo.id),issues=[],byCanon=new Map();
      for(const f of items){if(f.mimeType==='application/vnd.google-apps.folder')continue;const k=canonicalFileName(f.name);if(k.length>=5){if(!byCanon.has(k))byCanon.set(k,[]);byCanon.get(k).push(f)}}
      for(const g of byCanon.values())if(g.length>1)for(const f of g)issues.push(organizerIssue(f,'duplicate',`同一目录发现 ${g.length} 个高度相似版本：${g.map(x=>x.name).join(' ｜ ')}`,'warn'));
      for(const f of items){if(f.mimeType==='application/vnd.google-apps.folder')continue;if(temporaryName(f.name))issues.push(organizerIssue(f,'temporary','文件名过于通用或仅为编号，之后很难检索。建议先重命名。','warn'));if(sensitiveName(f.name))issues.push(organizerIssue(f,'sensitive','文件名显示这可能是评审、保密或个人材料。整理时请额外确认。','bad'));if(organizerScopeInfo.kind==='root'&&/(pdf|document|presentation|zip|json|text)/i.test(f.mimeType||fileExt(f.name)))issues.push(organizerIssue(f,'scattered','科研/文档文件直接散落在 My Drive 根目录，可考虑移动到 paper 或对应项目。','warn'))}
      if(organizerScopeInfo.kind==='project'){
        const pdfs=items.filter(isPdf),notes=items.filter(x=>readingNoteName(x.name));for(const p of pdfs.filter(x=>!hasMatchingNote(x,notes)))issues.push(organizerIssue(p,'unread','该 PDF 在当前项目目录中没有匹配到“阅读笔记”文件。','info'));
      }
      const merged=new Map();for(const it of issues){const key=it.fileId;if(!merged.has(key))merged.set(key,Object.assign({},it,{types:[it.type],details:[it.detail]}));else{const m=merged.get(key);if(!m.types.includes(it.type))m.types.push(it.type);m.details.push(it.detail);if(it.severity==='bad')m.severity='bad'}}
      organizerItems=Array.from(merged.values());organizerSelected=new Set();state.organizerLastScan=new Date().toISOString();persist();await populateOrganizerDestinations(items);renderOrganizer();renderToday();toast(`发现 ${organizerItems.length} 个待整理文件`)
    }catch(e){toast(e.message)}
  }
  async function populateOrganizerDestinations(currentItems=[]){const s=$('#organizerDestination');if(!s)return;const cur=organizerScopeInfo?.id||'';let opts='<option value="">仅重命名 / 暂不移动</option>';const paper=driveFolderId||await findPaperFolder();if(paper!==cur)opts+=`<option value="${esc(paper)}">Drive /paper</option>`;for(const p of state.projects)if(p.id!==cur)opts+=`<option value="${esc(p.id)}">项目：${esc(p.name)}</option>`;for(const f of currentItems.filter(x=>x.mimeType==='application/vnd.google-apps.folder'))opts+=`<option value="${esc(f.id)}">当前目录 / ${esc(f.name)}</option>`;s.innerHTML=opts}
  async function createOrganizerFolder(){try{await ensureDrive();organizerScopeInfo=await resolveOrganizerScope();const name=$('#newFolderName').value.trim();if(!name)return toast('请输入文件夹名称');const f=await createDriveFolder(name,organizerScopeInfo.id);$('#newFolderName').value='';const op=document.createElement('option');op.value=f.id;op.textContent=`当前目录 / ${f.name}`;$('#organizerDestination').appendChild(op);$('#organizerDestination').value=f.id;toast('文件夹已创建')}catch(e){toast(e.message)}}
  async function executeOrganizer(){
    const ids=Array.from(organizerSelected);if(!ids.length)return;const dest=$('#organizerDestination').value||'',selected=organizerItems.filter(x=>ids.includes(x.fileId)),sensitive=selected.filter(x=>x.sensitive);
    const renames=selected.map(x=>{const el=$(`[data-org-rename="${CSS.escape(x.fileId)}"]`);return {item:x,newName:(el?.value||x.name).trim()}}).filter(x=>x.newName&&x.newName!==x.item.name);
    if(!dest&&!renames.length)return toast('请先修改文件名，或选择“移动到”的目标目录');
    let msg=`将执行 ${selected.length} 个文件的整理操作。`;if(dest)msg+=`\n- 移动到选定目录`;if(renames.length)msg+=`\n- 重命名 ${renames.length} 个文件`;if(sensitive.length)msg+=`\n\n其中 ${sensitive.length} 个可能是敏感/评审材料，请确认目录无误。`;msg+='\n\n不会删除任何文件。继续吗？';if(!confirm(msg))return;
    try{await ensureDrive();organizerScopeInfo=await resolveOrganizerScope();let ok=0,fail=0;for(const it of selected){try{const el=$(`[data-org-rename="${CSS.escape(it.fileId)}"]`),newName=(el?.value||it.name).trim(),body={};if(newName&&newName!==it.name)body.name=newName;const q={};if(dest&&dest!==organizerScopeInfo.id){q.addParents=dest;const parent=it.parents[0]||organizerScopeInfo.id;if(parent)q.removeParents=parent}if(Object.keys(body).length||Object.keys(q).length)await patchFile(it.fileId,body,q);ok++}catch(_){fail++}}
      toast(`整理完成：成功 ${ok}${fail?`，失败 ${fail}`:''}`);if(organizerScopeInfo.kind==='paper'||dest===driveFolderId)await loadDriveLibrary();await scanOrganizer();
    }catch(e){toast(e.message)}
  }

  /* ---------- Radar ---------- */
  function isCcfA(venue){const v=norm(venue);if(!v)return false;return CCF_A.some(x=>{const n=norm(x.name),a=norm(x.abbr);if(n&&(v.includes(n)||n.includes(v)))return true;if(a.length>=4&&new RegExp('(^| )'+a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'( |$)').test(v))return true;const A=new Set(v.split(' ')),B=new Set(n.split(' '));let inter=0;B.forEach(t=>{if(t.length>3&&A.has(t))inter++});return inter>=Math.min(4,Math.ceil(B.size*.65))})}
  function isAcmTransactions(v){return /\bacm transactions on\b/i.test(String(v||''))}
  function termsForProfile(profile){
    const get=k=>prefs.profiles[k]||cloneProfiles()[k];if(profile!=='all'){const p=get(profile);return {core:lines(p.core),adjacent:lines(p.adjacent),inspiration:lines(p.inspiration),negative:lines(p.negative)}}
    const out={core:[],adjacent:[],inspiration:[],negative:[]};for(const k of ['model','embodied','cross']){const p=get(k);for(const lane of Object.keys(out))out[lane].push(...lines(p[lane]))}for(const lane of Object.keys(out))out[lane]=Array.from(new Set(out[lane]));return out;
  }
  function reason(lane,q,profile){const pr=profileLabel(profile);if(lane==='core')return `在“${pr}”中直接命中“${q}”，属于当前主干问题。`;if(lane==='adjacent')return `来自“${q}”这一相邻方向，问题设定、攻击/控制机制或实验方法可能迁移到“${pr}”。`;return `来自“${q}”的方法邻域，主题不必相同，但其中的统计、密码、表示、控制或优化机制可能提供新思路。`}
  function abstractFromIndex(idx){if(!idx||typeof idx!=='object')return'';const a=[];for(const [word,pos] of Object.entries(idx))for(const p of asArray(pos))a[p]=word;return a.join(' ')}
  function openAlexPaper(w,seed){
    const locs=asArray(w.locations),sourceNames=[w.primary_location?.source?.display_name].concat(locs.map(x=>x?.source?.display_name)).filter(Boolean),arxivLoc=locs.find(x=>/arxiv/i.test(x?.source?.display_name||'')||/arxiv\.org/i.test(x?.landing_page_url||'')),venue=sourceNames.find(v=>!/arxiv/i.test(v))||sourceNames[0]||'';
    const flags={ieee:sourceNames.some(v=>/^ieee transactions on\b/i.test(v)),acm:sourceNames.some(isAcmTransactions),ccfa:sourceNames.some(isCcfA),arxiv:!!arxivLoc||sourceNames.some(v=>/arxiv/i.test(v))};
    const doi=w.doi||w.ids?.doi||'',doiUrl=doi?String(doi).replace(/^https?:\/\/doi\.org\//i,'https://doi.org/'):'',oaLoc=w.best_oa_location||locs.find(x=>x?.pdf_url)||{},pdf=oaLoc?.pdf_url||'',id=String(w.id||'').split('/').pop(),arxivUrl=arxivLoc?.landing_page_url||'';let arxivId='';const m=arxivUrl.match(/(?:abs|pdf)\/([^?#/]+(?:v\d+)?)/);if(m)arxivId=m[1].replace(/\.pdf$/,'');const authors=asArray(w.authorships);
    return {id:'oa:'+id,openAlexId:id,title:w.title||w.display_name||'',authors:authors.slice(0,8).map(a=>a?.author?.display_name).filter(Boolean).join(', ')+(authors.length>8?' et al.':''),venue,date:w.publication_date||'',doi:doiUrl,url:doiUrl||w.primary_location?.landing_page_url||w.id||'',arxivId,arxivUrl,lane:seed.lane,profile:seed.profile,reason:reason(seed.lane,seed.q,seed.profile),keywords:[seed.q],flags,pdfAvailable:!!pdf,pdfUrl:pdf,citations:Number(w.cited_by_count||0),abstract:abstractFromIndex(w.abstract_inverted_index).slice(0,2400)};
  }
  async function searchOpenAlex(seed,from,to){const u=new URL('https://api.openalex.org/works');u.searchParams.set('search',seed.q);u.searchParams.set('filter',`from_publication_date:${from},to_publication_date:${to}`);u.searchParams.set('sort','publication_date:desc');u.searchParams.set('per-page','100');if(CFG.openAlexMailto)u.searchParams.set('mailto',CFG.openAlexMailto);const r=await fetch(u);if(!r.ok)throw new Error(`OpenAlex ${r.status}`);const d=await r.json();return asArray(d?.results).map(w=>openAlexPaper(w||{},seed)).filter(x=>x.title&&(x.flags.ieee||x.flags.acm||x.flags.ccfa||x.flags.arxiv))}
  function xmlText(n,s){return n.querySelector(s)?.textContent?.replace(/\s+/g,' ').trim()||''}
  function arxivStamp(d){return d.toISOString().replace(/[-:T.Z]/g,'').slice(0,12)}
  async function searchArxiv(terms,lane,profile,start,end){if(!terms.length)return[];const expr=terms.slice(0,9).map(t=>`all:"${t.replace(/"/g,'')}"`).join(' OR '),date=`submittedDate:[${arxivStamp(start)} TO ${arxivStamp(end)}]`,u='https://export.arxiv.org/api/query?'+new URLSearchParams({search_query:`(${expr}) AND ${date}`,start:'0',max_results:'120',sortBy:'submittedDate',sortOrder:'descending'});const r=await fetch(u);if(!r.ok)throw new Error(`arXiv ${r.status}`);const doc=new DOMParser().parseFromString(await r.text(),'application/xml');return Array.from(doc.querySelectorAll('entry')).map(e=>{const idUrl=xmlText(e,'id'),id=(idUrl.match(/abs\/([^?#]+)/)||[])[1]||'',title=xmlText(e,'title'),summary=xmlText(e,'summary'),authors=Array.from(e.querySelectorAll('author > name')).map(x=>x.textContent.trim()),pub=xmlText(e,'published'),doiRaw=xmlText(e,'doi'),q=terms.find(t=>norm(title+' '+summary).includes(norm(t)))||terms[0];return {id:'arxiv:'+id,title,authors:authors.slice(0,8).join(', ')+(authors.length>8?' et al.':''),venue:'arXiv',date:pub.slice(0,10),doi:doiRaw?'https://doi.org/'+doiRaw:'',url:idUrl,arxivId:id,arxivUrl:idUrl,lane,profile,reason:reason(lane,q,profile),keywords:terms,flags:{ieee:false,acm:false,ccfa:false,arxiv:true},pdfAvailable:true,pdfUrl:id?`https://arxiv.org/pdf/${id}`:'',citations:0,abstract:summary.slice(0,2400)}}).filter(x=>x.title&&x.arxivId)}
  function spreadTerms(list,n){list=asArray(list);if(n<=0||!list.length)return[];if(n>=list.length)return list.slice();const out=[];for(let i=0;i<n;i++){const idx=n===1?0:Math.round(i*(list.length-1)/(n-1));if(!out.includes(list[idx]))out.push(list[idx])}return out}
  async function settleBatches(tasks,batch=4){const out=[];for(let i=0;i<tasks.length;i+=batch){const s=await Promise.allSettled(tasks.slice(i,i+batch).map(fn=>fn()));s.forEach(x=>{if(x.status==='fulfilled')asArray(x.value).forEach(v=>out.push(v))});if(i+batch<tasks.length)await new Promise(r=>setTimeout(r,420))}return out}
  function score(p){let s=p.lane==='core'?64:p.lane==='adjacent'?44:30;if(p.flags?.ccfa)s+=11;if(p.flags?.ieee)s+=8;if(p.flags?.acm)s+=8;if(p.flags?.arxiv)s+=3;if(p.pdfAvailable)s+=3;s+=Math.min(9,Math.log10(1+Number(p.citations||0))*3.2);const age=Math.max(0,(Date.now()-new Date(p.date||0).getTime())/86400000);return s+Math.max(0,7-age/65)}
  async function discoverClient(){
    const breadth=prefs.breadth,profile=prefs.profile,t=termsForProfile(profile),counts=breadth==='focused'?[10,9,4]:breadth==='explore'?[18,23,22]:[14,18,14],core=spreadTerms(t.core,counts[0]),adj=spreadTerms(t.adjacent,counts[1]),insp=spreadTerms(t.inspiration,counts[2]);
    let seeds=core.map(q=>({q,lane:'core',profile})).concat(adj.map(q=>({q,lane:'adjacent',profile})),insp.map(q=>({q,lane:'inspiration',profile})));
    if(profile==='all'&&seeds.length>55)seeds=spreadTerms(seeds,55);
    const end=new Date(),start=new Date(end.getTime()-Number(CFG.radarLookbackDays||365)*86400000),from=start.toISOString().slice(0,10),to=end.toISOString().slice(0,10),all=await settleBatches(seeds.map(seed=>()=>searchOpenAlex(seed,from,to)),4);
    const axTasks=[()=>searchArxiv(spreadTerms(core,10),'core',profile,start,end),()=>searchArxiv(spreadTerms(adj,10),'adjacent',profile,start,end),()=>searchArxiv(spreadTerms(insp,9),'inspiration',profile,start,end)],ax=await Promise.allSettled(axTasks);ax.forEach(x=>{if(x.status==='fulfilled')asArray(x.value).forEach(v=>all.push(v))});if(!all.length)throw new Error('公开论文源暂时没有返回结果，请稍后重试');
    const negative=t.negative.map(norm),byKey=new Map();for(const p of all){const txt=norm(p.title+' '+(p.abstract||''));if(negative.some(n=>n&&txt.includes(n)))continue;const key=p.doi?norm(p.doi):p.arxivId?'arxiv '+norm(p.arxivId):norm(p.title),old=byKey.get(key);if(!old){byKey.set(key,p);continue}old.flags={ieee:old.flags.ieee||p.flags.ieee,acm:old.flags.acm||p.flags.acm,ccfa:old.flags.ccfa||p.flags.ccfa,arxiv:old.flags.arxiv||p.flags.arxiv};if(!old.pdfUrl&&p.pdfUrl){old.pdfUrl=p.pdfUrl;old.pdfAvailable=true}if((p.lane==='core'?0:p.lane==='adjacent'?1:2)<(old.lane==='core'?0:old.lane==='adjacent'?1:2)){old.lane=p.lane;old.reason=p.reason}}
    let list=Array.from(byKey.values());list.forEach(p=>p.score=score(p));const quotas=breadth==='focused'?{core:55,adjacent:28,inspiration:10}:breadth==='explore'?{core:80,adjacent:90,inspiration:80}:{core:65,adjacent:58,inspiration:42},chosen=[];for(const lane of ['core','adjacent','inspiration'])list.filter(x=>x.lane===lane).sort((a,b)=>b.score-a.score).slice(0,quotas[lane]).forEach(x=>chosen.push(x));const cap=breadth==='focused'?95:breadth==='explore'?250:165;return chosen.sort((a,b)=>new Date(b.date||0)-new Date(a.date||0)||b.score-a.score).slice(0,cap)
  }
  function identifiers(p){const o=[];if(p.doi)o.push(norm(p.doi));if(p.arxivId)o.push(norm(p.arxivId));if(p.title)o.push(norm(p.title));return o.filter(Boolean)}
  function similarity(a,b){const A=new Set(String(a).split(' ').filter(x=>x.length>2)),B=new Set(String(b).split(' ').filter(x=>x.length>2));if(!A.size||!B.size)return 0;let i=0;A.forEach(x=>{if(B.has(x))i++});return i/Math.max(A.size,B.size)}
  function filenameDuplicate(p){const ids=identifiers(p),files=driveFiles.map(f=>({n:norm(f.name),d:norm(f.description||''),a:norm(JSON.stringify(f.appProperties||{}))}));return files.some(f=>ids.some(id=>id.length>7&&(f.n.includes(id)||f.d.includes(id)||f.a.includes(id)))||(norm(p.title).length>14&&similarity(norm(p.title),f.n)>.9))}
  function rareTokens(t){return norm(t).split(' ').filter(x=>x.length>=5&&!['model','using','based','learning','neural','security','watermark','watermarking','robot','grasp','grasping'].includes(x)).sort((a,b)=>b.length-a.length).slice(0,3)}
  async function fullTextDuplicate(p){const toks=rareTokens(p.title);if(toks.length<2)return false;const folder=await findPaperFolder(),clauses=toks.map(t=>`fullText contains '${t.replace(/'/g,"\\'")}'`).join(' and '),q=`'${folder}' in parents and trashed=false and ${clauses}`;try{const j=await (await driveFetch('https://www.googleapis.com/drive/v3/files?'+new URLSearchParams({q,fields:'files(id,name)',pageSize:'5'}))).json();return asArray(j.files).length>0}catch(_){return false}}
  async function dedupeAgainstDrive(results){await ensureDrive();const pending=[];for(const p of results){p.inDrive=filenameDuplicate(p);if(!p.inDrive)pending.push(p)}for(let i=0;i<pending.length;i+=5){const part=pending.slice(i,i+5),vals=await Promise.all(part.map(fullTextDuplicate));vals.forEach((v,k)=>part[k].inDrive=!!v);setStatus(`正在与 Drive /paper 做全文去重… ${Math.min(i+5,pending.length)}/${pending.length}`,'ok')}return results}
  async function scanRadar(){try{prefs.profile=$('#profileSelect').value;prefs.breadth=$('#breadthSelect').value;persistPrefs();$('#scanBtn').disabled=true;setStatus(`正在扫描“${profileLabel(prefs.profile)}”…`,'ok');let results=asArray(await discoverClient()).map(x=>Object.assign({},x,{selected:false,inDrive:false}));if(prefs.googleClientId||CFG.googleClientId){try{await dedupeAgainstDrive(results)}catch(e){setStatus(`已发现 ${results.length} 条候选；Drive 未连接，本次暂未去重。${e.message}`,'warn')}}state.results=results;state.lastScan=new Date().toISOString();persist();renderAll();toast(`发现 ${results.filter(x=>!x.inDrive).length} 篇新候选`)}catch(e){setStatus(e.message,'warn');toast(e.message)}finally{$('#scanBtn').disabled=false}}
  async function fetchPdf(p){const urls=[p.pdfUrl,p.arxivId?`https://export.arxiv.org/pdf/${p.arxivId}`:''].filter(Boolean);let last='';for(const u of Array.from(new Set(urls))){try{const r=await fetch(u,{mode:'cors',credentials:'omit'});if(!r.ok){last=`HTTP ${r.status}`;continue}const b=await r.blob();if(b.size<10000){last='PDF 响应过小';continue}return b}catch(e){last=e.message||'CORS'}}throw new Error(`${p.title}: 来源站点禁止浏览器跨域读取 PDF（${last}）`)}
  function safeFilename(p){return (`[${(p.venue||'paper').replace(/[^a-zA-Z0-9._-]+/g,'_').slice(0,35)}_${(p.date||'').slice(0,4)}] ${p.title}`).replace(/[\\/:*?"<>|]/g,' ').replace(/\s+/g,' ').trim().slice(0,180)+'.pdf'}
  async function uploadPdfBlob(blob,p){const folder=await findPaperFolder(),meta={name:safeFilename(p),parents:[folder],description:`Research Radar\nTitle: ${p.title}\nDOI: ${p.doi||''}\narXiv: ${p.arxivId||''}\nSource: ${p.url||''}`,appProperties:{radar_id:String(p.id).slice(0,120),doi:String(p.doi||'').slice(0,120),arxiv:String(p.arxivId||'').slice(0,120)}},boundary='nhw_'+Math.random().toString(36).slice(2),head=`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${boundary}\r\nContent-Type: application/pdf\r\n\r\n`,tail=`\r\n--${boundary}--`,body=new Blob([head,blob,tail],{type:`multipart/related; boundary=${boundary}`});return (await (await driveFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',{method:'POST',headers:{'Content-Type':`multipart/related; boundary=${boundary}`},body})).json())}
  async function uploadSelected(){const sel=state.results.filter(x=>x.selected&&!x.inDrive&&x.pdfAvailable);if(!sel.length)return;try{await ensureDrive();let ok=0,fail=0;for(let i=0;i<sel.length;i++){setStatus(`归档 ${i+1}/${sel.length}：${sel[i].title}`,'ok');try{await uploadPdfBlob(await fetchPdf(sel[i]),sel[i]);sel[i].inDrive=true;sel[i].selected=false;ok++}catch(_){fail++}}await loadDriveLibrary();persist();renderAll();toast(`归档完成：${ok} 篇${fail?`，${fail} 篇需手动下载`:''}`)}catch(e){toast(e.message)}}

  /* ---------- Render ---------- */
  function filteredResults(){const q=norm($('#resultSearch')?.value||''),lane=$('#laneFilter')?.value||'all',src=$('#sourceFilter')?.value||'all',pdf=$('#pdfFilter')?.value||'all';return state.results.filter(p=>!p.inDrive).filter(p=>{const hay=norm([p.title,p.authors,p.venue,p.reason,asArray(p.keywords).join(' ')].join(' ')),srcOk=src==='all'||(src==='ieee'&&p.flags?.ieee)||(src==='acm'&&p.flags?.acm)||(src==='ccfa'&&p.flags?.ccfa)||(src==='arxiv'&&p.flags?.arxiv),pdfOk=pdf==='all'||(pdf==='pdf'&&p.pdfAvailable)||(pdf==='nopdf'&&!p.pdfAvailable);return (!q||hay.includes(q))&&(lane==='all'||p.lane===lane)&&srcOk&&pdfOk})}
  function radarCard(p){const disabled=!p.pdfAvailable,titleUrl=p.url||p.doi||p.arxivUrl||'#';return `<article class="paper-card ${p.selected?'selected':''}" data-id="${esc(p.id)}"><div class="paper-top"><input class="paper-select" type="checkbox" ${p.selected?'checked':''} ${disabled?'disabled':''}><div><h3 class="paper-title"><a href="${esc(titleUrl)}" target="_blank" rel="noopener">${esc(p.title)}</a></h3><div class="paper-authors">${esc(p.authors||'作者信息暂缺')}</div><div class="paper-meta"><span class="pill ${esc(p.lane)}">${laneLabel(p.lane)}</span><span class="pill ${esc(p.profile||'model')}">${esc(profileLabel(p.profile||prefs.profile))}</span><span class="pill">${esc(sourceLabel(p))}</span><span class="pill">${esc(fmtDate(p.date))}</span>${p.pdfAvailable?'<span class="pill core">Open PDF</span>':'<span class="pill">仅元数据</span>'}${Number.isFinite(p.citations)?`<span class="pill">引用 ${p.citations}</span>`:''}</div><div class="why"><strong>推荐原因：</strong>${esc(p.reason||'')}</div><div class="paper-actions">${p.pdfAvailable?`<button class="mini" data-openpdf="${esc(p.id)}">打开 PDF</button>`:''}<button class="mini" data-note-paper="${esc(p.id)}">生成阅读卡</button><button class="mini" data-idea="${esc(p.id)}">${state.ideas.some(x=>x.paperId===p.id)?'查看灵感':'加入灵感篮子'}</button>${p.doi?`<a class="mini" href="${esc(p.doi)}" target="_blank">DOI</a>`:''}</div></div></div></article>`}
  function renderRadar(){const rows=filteredResults();$('#paperGrid').innerHTML=rows.length?rows.map(radarCard).join(''):`<div class="empty" style="grid-column:1/-1">${state.lastScan?'当前筛选下没有新候选。':'选择研究 Profile 后扫描最近一年。'}</div>`;const selected=state.results.filter(x=>x.selected&&!x.inDrive&&x.pdfAvailable).length,available=state.results.filter(x=>!x.inDrive&&x.pdfAvailable).length;$('#selectionStrip').textContent=`${state.lastScan?`上次扫描 ${new Date(state.lastScan).toLocaleString()} · `:''}${state.results.length} 条候选；新论文 ${state.results.filter(x=>!x.inDrive).length}；可归档 ${available}；已选择 ${selected}。`;$('#uploadBtn').disabled=!selected||!driveToken;$$('.paper-card .paper-select').forEach(cb=>cb.onchange=()=>{const p=state.results.find(x=>x.id===cb.closest('.paper-card').dataset.id);if(p){p.selected=cb.checked;persist();renderRadar()}});$$('[data-openpdf]').forEach(b=>b.onclick=()=>{const p=state.results.find(x=>x.id===b.dataset.openpdf);if(p?.pdfUrl)window.open(p.pdfUrl,'_blank','noopener')});$$('[data-idea]').forEach(b=>b.onclick=()=>toggleIdea(b.dataset.idea));$$('[data-note-paper]').forEach(b=>b.onclick=()=>openReadingNote(b.dataset.notePaper))}
  function renderLibrary(){const q=norm($('#librarySearch')?.value||''),rows=(driveFiles.length?driveFiles:state.driveNames.map((name,i)=>({id:'cache-'+i,name}))).filter(f=>!q||norm(f.name).includes(q)),h=libraryHealth();$('#libraryHealth').innerHTML=driveFiles.length?`<div class="health-grid"><div class="health-card"><b>${driveFiles.length}</b><span>库内文件</span></div><div class="health-card"><b>${h.duplicates.length}</b><span>重复组</span></div><div class="health-card"><b>${h.temp.length}</b><span>临时命名</span></div><div class="health-card"><b>${h.arxiv.length}</b><span>仅 arXiv 编号</span></div></div><div class="setup-note">需要批量移动或重命名时，进入左侧“Drive 整理”。系统不会自动删除文件。</div>`:'<div class="empty">连接 Google Drive 后查看 /paper 健康状态。</div>';$('#libraryList').innerHTML=rows.length?rows.slice(0,500).map(f=>`<div class="library-row"><div><strong>${esc(f.name)}</strong><br><span>${esc(f.folderPath||'paper')} · ${f.modifiedTime?'更新 '+fmtDate(f.modifiedTime):'缓存目录'}</span></div>${f.webViewLink?`<a class="mini" href="${esc(f.webViewLink)}" target="_blank">Drive ↗</a>`:''}</div>`).join(''):'<div class="empty">没有匹配文件。</div>'}
  function renderProjects(){
    $('#projectCandidates').innerHTML=projectCandidates.length?projectCandidates.map(c=>`<div class="candidate"><strong>${esc(c.name)}</strong> <button class="mini" data-add-project="${esc(c.id)}">${projectById(c.id)?'已添加':'加入监视'}</button></div>`).join(''):'';
    $('#projectGrid').innerHTML=state.projects.length?state.projects.map(p=>{const s=p.snapshot||{};return `<article class="project-card"><div class="project-head"><div><h3>${esc(p.name)}</h3><p>${s.scannedAt?`扫描于 ${new Date(s.scannedAt).toLocaleString()}`:'尚未扫描'}</p></div><button class="mini" data-remove-project="${esc(p.id)}">移除</button></div><div class="project-stats"><div class="project-stat"><b>${s.files??'—'}</b><span>文件</span></div><div class="project-stat"><b>${s.pdfs??'—'}</b><span>PDF</span></div><div class="project-stat"><b>${s.notes??'—'}</b><span>阅读笔记</span></div><div class="project-stat"><b>${asArray(s.unread).length||0}</b><span>未匹配笔记</span></div></div><div class="recent-files">${asArray(s.recent).slice(0,4).map(x=>`<div class="recent-file"><strong>${esc(x.name)}</strong><span>${fmtDate(x.modifiedTime)}</span></div>`).join('')||'<span class="muted">扫描后显示最近文件</span>'}</div><div class="paper-actions"><button class="mini" data-scan-project="${esc(p.id)}">扫描项目</button><button class="mini" data-pack-project="${esc(p.id)}">下载继续包</button><button class="mini" data-upload-pack="${esc(p.id)}">上传继续包</button><button class="mini" data-organize-project="${esc(p.id)}">整理此项目</button>${p.url?`<a class="mini" target="_blank" href="${esc(p.url)}">Drive ↗</a>`:''}</div></article>`}).join(''):'<div class="empty" style="grid-column:1/-1">还没有监视项目。点击“自动发现常用项目”，或按名称查找 Drive 文件夹。</div>';
    $$('[data-add-project]').forEach(b=>b.onclick=()=>addProject(b.dataset.addProject));$$('[data-remove-project]').forEach(b=>b.onclick=()=>removeProject(b.dataset.removeProject));$$('[data-scan-project]').forEach(b=>b.onclick=()=>scanProject(projectById(b.dataset.scanProject)));$$('[data-pack-project]').forEach(b=>b.onclick=()=>downloadContinuePack(b.dataset.packProject));$$('[data-upload-pack]').forEach(b=>b.onclick=()=>uploadContinuePack(b.dataset.uploadPack));$$('[data-organize-project]').forEach(b=>b.onclick=()=>{active='organizer';renderAll();$('#organizerScope').value='project:'+b.dataset.organizeProject;scanOrganizer()});
    populateProjectSelects();
  }
  function populateProjectSelects(){const ex=$('#experimentProjectSelect'),scope=$('#organizerScope');if(ex){const old=ex.value;ex.innerHTML=state.projects.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')||'<option value="">请先添加项目</option>';if(old&&projectById(old))ex.value=old}if(scope){const old=scope.value;scope.querySelectorAll('option[data-project]').forEach(x=>x.remove());for(const p of state.projects){const o=document.createElement('option');o.value='project:'+p.id;o.dataset.project='1';o.textContent='项目：'+p.name;scope.appendChild(o)}if(Array.from(scope.options).some(o=>o.value===old))scope.value=old}}
  function renderExperiment(){const e=$('#experimentReport');if(!e)return;if(!lastExperimentReport){e.innerHTML='<div class="empty">选择一个项目并点击“体检选中项目”。</div>';return}const r=lastExperimentReport;e.innerHTML=`<div class="health-grid"><div class="health-card"><b>${r.seeds.length}</b><span>识别 seed</span></div><div class="health-card"><b>${r.retries.length}</b><span>识别 retry</span></div><div class="health-card"><b>${r.logs}</b><span>日志</span></div><div class="health-card"><b>${r.results}</b><span>结果 JSON</span></div></div>${r.statusPreview?`<div class="setup-note"><strong>最新 status 摘要：</strong>${esc(r.statusPreview)}</div>`:''}<div class="issue-list">${r.issues.map(x=>`<div class="issue ${x.kind==='good'?'good':x.kind==='bad'?'bad':''}">${esc(x.text)}</div>`).join('')}</div><div class="setup-note">Seeds: ${r.seeds.join(', ')||'未从文件名识别'} · Retries: ${r.retries.join(', ')||'未识别'}</div>`}
  function renderNotes(){const e=$('#notesList');e.innerHTML=state.notes.length?state.notes.map(n=>`<article class="note-card"><h3>${esc(n.title)}</h3><p>${esc(n.venue||'')} · 更新 ${fmtDate(n.updatedAt||n.createdAt)}</p><div class="paper-actions"><button class="mini" data-edit-note="${esc(n.id)}">编辑</button>${n.url?`<a class="mini" href="${esc(n.url)}" target="_blank">论文 ↗</a>`:''}<button class="mini danger" data-delete-note="${esc(n.id)}">删除本地卡片</button></div></article>`).join(''):'<div class="empty">还没有阅读卡。在论文雷达里点击“生成阅读卡”。</div>';$$('[data-edit-note]').forEach(b=>b.onclick=()=>{const n=state.notes.find(x=>x.id===b.dataset.editNote),p=state.results.find(x=>x.id===n?.paperId);if(n){currentNoteId=n.id;$('#noteModalTitle').textContent=n.title;$('#noteEditor').value=n.content;populateNoteDestinations();$('#noteModal').classList.add('show')}});$$('[data-delete-note]').forEach(b=>b.onclick=()=>{state.notes=state.notes.filter(x=>x.id!==b.dataset.deleteNote);persist();renderAll()})}
  function renderIdeas(){const e=$('#ideasList');e.innerHTML=state.ideas.length?state.ideas.map(x=>`<article class="idea-card"><h3>${esc(x.title)}</h3><div class="paper-meta"><span class="pill ${esc(x.lane||'inspiration')}">${laneLabel(x.lane||'inspiration')}</span><span class="pill">${esc(x.venue||'')}</span></div><textarea class="field" data-idea-note="${esc(x.id)}" placeholder="这个机制可以迁移到我的哪个问题？">${esc(x.note||'')}</textarea><div class="paper-actions">${x.url?`<a class="mini" href="${esc(x.url)}" target="_blank">论文 ↗</a>`:''}<button class="mini" data-remove-idea="${esc(x.id)}">移除</button></div></article>`).join(''):'<div class="empty">灵感库为空。只收藏真正能形成“可迁移研究假设”的论文。</div>';$$('[data-idea-note]').forEach(t=>t.onchange=()=>{const x=state.ideas.find(i=>i.id===t.dataset.ideaNote);if(x){x.note=t.value;persist()}});$$('[data-remove-idea]').forEach(b=>b.onclick=()=>{state.ideas=state.ideas.filter(x=>x.id!==b.dataset.removeIdea);persist();renderAll()})}
  function toggleIdea(id){const p=state.results.find(x=>x.id===id);if(!p)return;const old=state.ideas.find(x=>x.paperId===id);if(old){active='ideas';renderAll();return}state.ideas.unshift({id:'idea-'+Date.now(),paperId:p.id,title:p.title,lane:p.lane,venue:p.venue,url:p.url||p.doi||p.arxivUrl,note:''});persist();renderAll();toast('已加入灵感库')}
  function renderWatch(){const w=$('#watchProfileSelect');if(!w)return;w.innerHTML=['model','embodied','cross'].map(k=>`<option value="${k}">${PROFILE_DEFAULTS[k].name}</option>`).join('');w.value=prefs.watchProfile||'model';const p=prefs.profiles[w.value];$('#coreTerms').value=p.core;$('#adjacentTerms').value=p.adjacent;$('#inspirationTerms').value=p.inspiration;$('#negativeTerms').value=p.negative}
  function renderOrganizer(){
    const filter=$('#organizerFilter')?.value||'all',rows=organizerItems.filter(x=>filter==='all'||x.types.includes(filter));$('#navOrganizerCount').textContent=String(organizerItems.length||'·');$('#executeOrganizerBtn').disabled=!organizerSelected.size;
    const counts={duplicate:0,temporary:0,scattered:0,unread:0,sensitive:0};for(const x of organizerItems)for(const t of x.types)if(counts[t]!==undefined)counts[t]++;
    $('#organizerSummary').innerHTML=organizerItems.length?`<div class="health-grid"><div class="health-card"><b>${organizerItems.length}</b><span>待整理文件</span></div><div class="health-card"><b>${counts.duplicate}</b><span>重复相关</span></div><div class="health-card"><b>${counts.temporary}</b><span>临时命名</span></div><div class="health-card"><b>${counts.scattered}</b><span>根目录散落</span></div></div><div class="setup-note">当前范围：${esc(organizerScopeInfo?.name||'尚未扫描')}。系统不会删除任何文件；重命名/移动只有在勾选并确认后才执行。</div>`:'<div class="empty">选择扫描范围后点击“扫描整理建议”。</div>';
    $('#organizerList').innerHTML=rows.length?rows.map(x=>`<article class="organizer-row ${x.sensitive?'sensitive':''}" data-org-id="${esc(x.fileId)}"><input type="checkbox" class="org-check" ${organizerSelected.has(x.fileId)?'checked':''}><div class="org-main"><div class="org-title"><strong>${esc(x.name)}</strong>${x.types.map(t=>`<span class="pill">${({duplicate:'重复',temporary:'临时命名',scattered:'散落',unread:'缺笔记',sensitive:'敏感'})[t]||t}</span>`).join('')}</div><p>${esc(x.details.join('；'))}</p><input class="field full org-rename" data-org-rename="${esc(x.fileId)}" value="${esc(x.name)}" aria-label="新文件名"></div><div class="org-side"><span>${fmtDate(x.modifiedTime)}</span>${x.webViewLink?`<a class="mini" target="_blank" href="${esc(x.webViewLink)}">Drive ↗</a>`:''}</div></article>`).join(''):'<div class="empty">当前筛选下没有整理建议。</div>';
    $$('.organizer-row .org-check').forEach(c=>c.onchange=()=>{const id=c.closest('.organizer-row').dataset.orgId;c.checked?organizerSelected.add(id):organizerSelected.delete(id);$('#executeOrganizerBtn').disabled=!organizerSelected.size});
  }
  function renderToday(){const h=libraryHealth(),unread=state.projects.reduce((n,p)=>n+asArray(p.snapshot?.unread).length,0),fresh=state.results.filter(x=>!x.inDrive).length,issues=h.issueCount+organizerItems.length;$('#todaySummary').innerHTML=[['新论文候选',fresh],['监视项目',state.projects.length],['阅读待处理',unread],['Drive 整理问题',issues]].map(([l,v])=>`<div class="summary-card"><strong>${v}</strong><span>${l}</span></div>`).join('');const actions=[];if(fresh)actions.push(['R',`${fresh} 篇 Radar 新候选`,`进入论文雷达，优先看核心相关与跨域启发。`,'radar']);if(unread)actions.push(['N',`${unread} 篇项目 PDF 尚未匹配阅读笔记`,`可以从项目监视或论文雷达生成阅读卡。`,'notes']);if(h.duplicates.length||h.temp.length)actions.push(['D',`paper 库有 ${h.duplicates.length} 组重复、${h.temp.length} 个临时命名`,`进入 Drive 整理中心处理，不会自动删除。`,'organizer']);if(organizerItems.length)actions.push(['O',`${organizerItems.length} 个 Drive 整理建议等待处理`,`可批量移动或重命名。`,'organizer']);if(lastExperimentReport?.issues?.some(x=>x.kind!=='good'))actions.push(['E','最近一次实验体检发现提示项',lastExperimentReport.projectName,'experiments']);if(!state.projects.length)actions.push(['P','尚未登记长期项目','自动发现 Drive 中常用项目后，才能生成项目级下一步。','projects']);if(!actions.length)actions.push(['✓','当前没有明显积压','可以扫描新论文或刷新项目状态。','radar']);$('#todayActions').innerHTML=actions.slice(0,7).map(a=>`<div class="action-card"><div class="action-icon">${a[0]}</div><div><h4>${esc(a[1])}</h4><p>${esc(a[2])}</p></div><button class="mini" data-goto="${a[3]}">打开</button></div>`).join('');$$('[data-goto]').forEach(b=>b.onclick=()=>{active=b.dataset.goto;renderAll()});$('#recentProjectChanges').innerHTML=state.projects.length?`<div class="compact-list">${state.projects.slice().sort((a,b)=>new Date(b.snapshot?.latestModified||0)-new Date(a.snapshot?.latestModified||0)).slice(0,6).map(p=>`<div class="compact-row"><strong>${esc(p.name)}</strong><span>${p.snapshot?.latestModified?fmtDate(p.snapshot.latestModified):'未扫描'}</span></div>`).join('')}</div>`:'<div class="empty">尚未登记项目。</div>';$('#libraryHealthMini').innerHTML=driveFiles.length?`<div class="compact-list"><div class="compact-row"><strong>重复组</strong><span>${h.duplicates.length}</span></div><div class="compact-row"><strong>临时命名</strong><span>${h.temp.length}</span></div><div class="compact-row"><strong>arXiv 编号文件</strong><span>${h.arxiv.length}</span></div></div>`:'<div class="empty">连接 Drive 后显示。</div>';$('#dashboardStamp').textContent='更新 '+new Date().toLocaleTimeString()}
  function renderNav(){for(const b of $$('#nav [data-panel]'))b.classList.toggle('active',b.dataset.panel===active);for(const p of $$('.panel'))p.classList.toggle('active',p.id==='panel-'+active);$('#navTodayCount').textContent=String((state.results.filter(x=>!x.inDrive).length+organizerItems.length)||'·');$('#navRadarCount').textContent=String(state.results.filter(x=>!x.inDrive).length||'·');$('#navProjectCount').textContent=String(state.projects.length);$('#navExperimentCount').textContent=lastExperimentReport?String(lastExperimentReport.issues.length):'·';$('#navNotesCount').textContent=String(state.notes.length);$('#navLibraryCount').textContent=String(driveFiles.length||state.driveNames.length||'·');$('#navIdeasCount').textContent=String(state.ideas.length)}
  function renderMetrics(){const vals=[state.results.filter(x=>!x.inDrive).length,state.projects.length,state.projects.reduce((n,p)=>n+asArray(p.snapshot?.unread).length,0),libraryHealth().issueCount+organizerItems.length];$$('#heroMetrics .metric b').forEach((b,i)=>b.textContent=driveToken||state.lastScan?vals[i]:'—')}
  function updateStatus(){if(driveToken)setStatus('论文搜索已就绪 · Google Drive 已连接 · 项目监视与整理功能可用。','ok');else if(prefs.googleClientId||CFG.googleClientId)setStatus('论文搜索可直接使用；点击“连接 Google Drive”启用项目监视、去重、整理与上传。','');else setStatus('论文搜索可直接使用；Google Drive 首次使用需要 OAuth Client ID。','warn')}
  function updateDriveButton(){const b=$('#connectDriveBtn');b.textContent=driveToken?'Drive 已连接':'连接 Google Drive';b.classList.toggle('primary',!driveToken)}
  function renderAll(){renderNav();renderMetrics();renderToday();renderRadar();renderProjects();renderExperiment();renderNotes();renderLibrary();renderOrganizer();renderIdeas();renderWatch();updateStatus();updateDriveButton();$('#profileSelect').value=prefs.profile;$('#breadthSelect').value=prefs.breadth}

  async function refreshDashboard(showToast=true){try{await ensureDrive();await loadDriveLibrary();for(const p of state.projects)await scanProject(p,true);renderAll();if(showToast)toast('今日科研已刷新')}catch(e){toast(e.message)}}

  /* ---------- Settings ---------- */
  function openSettings(connectAfter=false){window.__connectAfterSettings=connectAfter;$('#googleClientIdInput').value=prefs.googleClientId||CFG.googleClientId||'';$('#settingsModal').classList.add('show');$('#settingsModal').setAttribute('aria-hidden','false')}
  function closeSettings(){$('#settingsModal').classList.remove('show');$('#settingsModal').setAttribute('aria-hidden','true')}
  async function saveSettings(){const v=$('#googleClientIdInput').value.trim();if(v&&!/\.apps\.googleusercontent\.com$/.test(v))return toast('Client ID 格式不正确');prefs.googleClientId=v;persistPrefs();const go=!!window.__connectAfterSettings;window.__connectAfterSettings=false;closeSettings();renderAll();if(go&&v)await connectDrive()}
  function exportIdeas(){downloadText(`research-inspiration-${today()}.md`,['# Research Inspiration Basket','',...state.ideas.flatMap((x,i)=>[`## ${i+1}. ${x.title}`,'',`- Venue: ${x.venue||''}`,`- Link: ${x.url||''}`,'',x.note||'_尚未记录灵感_',''])].join('\n'))}

  /* ---------- Events ---------- */
  $('#nav').addEventListener('click',e=>{const b=e.target.closest('[data-panel]');if(b){active=b.dataset.panel;renderAll()}});
  $('#themeBtn').onclick=()=>{const d=document.documentElement;d.dataset.theme=d.dataset.theme==='dark'?'light':'dark';safeSet('nhw-radar-theme',d.dataset.theme)};
  $('#connectDriveBtn').onclick=connectDrive;$('#settingsBtn').onclick=()=>openSettings(false);$('#lockRadarBtn').onclick=()=>window.NHW_LOCK_RADAR?.();$('#closeSettingsBtn').onclick=closeSettings;$('#saveSettingsBtn').onclick=saveSettings;$('#settingsModal').onclick=e=>{if(e.target.id==='settingsModal')closeSettings()};
  $('#profileSelect').onchange=()=>{prefs.profile=$('#profileSelect').value;persistPrefs()};$('#breadthSelect').onchange=()=>{prefs.breadth=$('#breadthSelect').value;persistPrefs()};$('#scanBtn').onclick=scanRadar;$('#quickScanBtn').onclick=()=>{active='radar';renderAll();scanRadar()};$('#uploadBtn').onclick=uploadSelected;
  $('#selectAllBtn').onclick=()=>{const vis=new Set(filteredResults().filter(x=>x.pdfAvailable).map(x=>x.id)),arr=state.results.filter(x=>vis.has(x.id)),target=!arr.every(x=>x.selected);arr.forEach(x=>x.selected=target);persist();renderRadar()};
  for(const id of ['resultSearch','laneFilter','sourceFilter','pdfFilter'])$('#'+id).addEventListener(id==='resultSearch'?'input':'change',renderRadar);
  $('#refreshLibraryBtn').onclick=async()=>{try{await ensureDrive();await loadDriveLibrary();toast('paper 库已刷新')}catch(e){toast(e.message)}};$('#librarySearch').oninput=renderLibrary;
  $('#autoDiscoverProjectsBtn').onclick=discoverProjectCandidates;$('#searchProjectBtn').onclick=searchProjectFolders;$('#scanAllProjectsBtn').onclick=scanAllProjects;$('#projectQuery').addEventListener('keydown',e=>{if(e.key==='Enter')searchProjectFolders()});$('#inspectExperimentBtn').onclick=inspectExperiment;
  $('#refreshDashboardBtn').onclick=()=>refreshDashboard(true);$('#refreshDashboardBtn2').onclick=()=>refreshDashboard(true);
  $('#exportAllNotesBtn').onclick=exportAllNotes;$('#closeNoteBtn').onclick=closeNote;$('#downloadNoteBtn').onclick=()=>{const n=state.notes.find(x=>x.id===currentNoteId);if(n){n.content=$('#noteEditor').value;persist();downloadText(`${String(n.title).replace(/[\\/:*?"<>|]/g,' ').slice(0,100)}_阅读笔记.md`,n.content)}};$('#uploadNoteBtn').onclick=uploadCurrentNote;$('#noteModal').onclick=e=>{if(e.target.id==='noteModal')closeNote()};
  $('#exportIdeasBtn').onclick=exportIdeas;
  $('#watchProfileSelect').onchange=()=>{prefs.watchProfile=$('#watchProfileSelect').value;persistPrefs();renderWatch()};$('#saveWatchBtn').onclick=()=>{const k=prefs.watchProfile||'model';prefs.profiles[k]={core:$('#coreTerms').value,adjacent:$('#adjacentTerms').value,inspiration:$('#inspirationTerms').value,negative:$('#negativeTerms').value};persistPrefs();toast('当前 Profile 偏好已保存')};$('#resetWatchBtn').onclick=()=>{const k=prefs.watchProfile||'model',d=PROFILE_DEFAULTS[k];prefs.profiles[k]={core:d.core.join('\n'),adjacent:d.adjacent.join('\n'),inspiration:d.inspiration.join('\n'),negative:d.negative.join('\n')};persistPrefs();renderWatch();toast('已恢复默认')};
  $('#scanOrganizerBtn').onclick=scanOrganizer;$('#organizerFilter').onchange=renderOrganizer;$('#organizerScope').onchange=()=>{organizerItems=[];organizerSelected.clear();organizerScopeInfo=null;renderOrganizer()};$('#createFolderBtn').onclick=createOrganizerFolder;$('#executeOrganizerBtn').onclick=executeOrganizer;$('#selectOrganizerBtn').onclick=()=>{const filter=$('#organizerFilter').value,rows=organizerItems.filter(x=>filter==='all'||x.types.includes(filter)),target=!rows.every(x=>organizerSelected.has(x.fileId));for(const x of rows)target?organizerSelected.add(x.fileId):organizerSelected.delete(x.fileId);renderOrganizer()};

  document.documentElement.dataset.theme=safeGet('nhw-radar-theme')||'light';populateProjectSelects();renderAll();
})();
