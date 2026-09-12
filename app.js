const iconPaths = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  spark: '<path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z"/><path d="m18.5 14 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"/><path d="m5 14 .7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z"/>',
  bag: '<path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',
  box: '<path d="m21 8-9 5-9-5 9-5 9 5Z"/><path d="m3 8 9 5v9l-9-5V8Zm18 0-9 5v9l9-5V8Z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14v-3Z"/><path d="m7 15 2 6h4l-2-5"/>',
  chart: '<path d="M4 20V10m6 10V4m6 16v-7m6 7H2"/>',
  flask: '<path d="M9 3h6m-5 0v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/><path d="M7.5 15h9"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  dollar: '<circle cx="12" cy="12" r="9"/><path d="M16 8.5c-.8-1-2-1.5-4-1.5-2.2 0-3.5 1.1-3.5 2.5 0 3.8 7 1.7 7 5.2 0 1.4-1.2 2.3-3.5 2.3-1.8 0-3.3-.6-4.2-1.7M12 5v14"/>',
  cart: '<circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M3 4h2l2.5 11h11l2-7H6"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  repeat: '<path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  tag: '<path d="M20 13 13 20l-9-9V4h7l9 9Z"/><circle cx="8.5" cy="8.5" r="1"/>',
  truck: '<path d="M3 6h11v11H3zM14 10h4l3 3v4h-7v-7Z"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  play: '<path d="m8 5 11 7-11 7V5Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M5 21h14"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',
  upload: '<path d="M12 16V4m-5 5 5-5 5 5M5 20h14"/>'
};

function icon(name) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name] || iconPaths.grid}</svg>`;
}

document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));

const app = document.getElementById('app');
const crumb = document.getElementById('pageCrumb');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalContent = document.getElementById('modalContent');

const money = n => `NT$ ${Number(n).toLocaleString('zh-TW')}`;
const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

const orders = [
  ['#MP-10482','陳怡安','yi.an@email.com','手錶 × 1','799','已付款','green'],
  ['#MP-10481','王柏凱','kai.w@email.com','耳機 × 1','799','待出貨','orange'],
  ['#MP-10480','林書妤','shuyu@email.com','上衣 × 2','298','配送中','blue'],
  ['#MP-10479','張家豪','hao.z@email.com','手錶 × 1','799','已完成','gray'],
  ['#MP-10478','許雅婷','yating@email.com','耳機 × 1','799','已完成','gray'],
  ['#MP-10477','黃冠宇','kuan@email.com','上衣 × 1','149','待付款','orange']
];

const products = [
  ['📦','上衣','AI-163C99BC','149','50','販售中','green'],
  ['📦','耳機','AI-6C86F661','799','100','販售中','green'],
  ['📦','手錶','AI-3FD44584','799','50','販售中','green']
];

function lineChart(data, color = 'var(--green)') {
  const width = 720, height = 190, px = 35, py = 18;
  const min = Math.min(...data) * .88, max = Math.max(...data) * 1.07;
  const pts = data.map((v,i) => [px + i*(width-px*1.5)/(data.length-1), height-py-(v-min)/(max-min)*(height-py*2)]);
  const line = pts.map(p => p.join(',')).join(' ');
  const area = `M ${pts[0][0]} ${height-py} L ${line.replaceAll(',', ' ')} L ${pts.at(-1)[0]} ${height-py} Z`;
  return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
    <defs><linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a8a6c" stop-opacity=".18"/><stop offset="1" stop-color="#3a8a6c" stop-opacity="0"/></linearGradient></defs>
    ${[.15,.4,.65,.9].map(n=>`<line class="chart-grid" x1="${px}" y1="${height*n}" x2="${width-8}" y2="${height*n}"/>`).join('')}
    <path class="chart-area" d="${area}"/><polyline class="chart-line" style="stroke:${color}" points="${line}"/>
    ${pts.map((p,i)=> i === pts.length-1 ? `<circle class="chart-dot" style="stroke:${color}" cx="${p[0]}" cy="${p[1]}" r="4"/>`:'').join('')}
    ${['8/14','8/18','8/22','8/26','8/30','9/03','9/07','9/12'].map((d,i)=>`<text class="axis-label" x="${px+i*(width-px*1.5)/7}" y="188" text-anchor="middle">${d}</text>`).join('')}
  </svg>`;
}

function sparkline(values, color='#1d6b52') {
  const max=Math.max(...values), min=Math.min(...values), pts=values.map((v,i)=>`${i*100/(values.length-1)},${40-(v-min)/(max-min)*34}`).join(' ');
  return `<svg viewBox="0 0 100 45" preserveAspectRatio="none"><polyline fill="none" stroke="${color}" stroke-width="2" points="${pts}"/></svg>`;
}

function metric(title, value, change, note, iconName, tone='') {
  return `<article class="card metric-card"><div class="metric-top"><span>${title}</span><span class="metric-icon ${tone}">${icon(iconName)}</span></div><div class="metric-value">${value}</div><div class="metric-foot"><span class="trend ${change.startsWith('-')?'down':''}">${change}</span><span>${note}</span></div></article>`;
}

function pageHead(eyebrow, title, desc, actions='') {
  return `<div class="page-head"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${desc}</p></div><div class="head-actions">${actions}</div></div>`;
}

function overviewPage() { return operationalPage('overview'); }

function orderTable(rows) {
  return `<table><thead><tr><th>訂單</th><th>顧客</th><th>商品</th><th>金額</th><th>狀態</th></tr></thead><tbody>${rows.map(o=>`<tr><td class="order-id">${o[0]}</td><td><div class="customer-cell"><span class="mini-avatar">${o[1].slice(-2)}</span><div><strong>${o[1]}</strong><small>${o[2]}</small></div></div></td><td>${o[3]}</td><td>NT$ ${o[4]}</td><td><span class="pill ${o[6]}">${o[5]}</span></td></tr>`).join('')}</tbody></table>`;
}

function managerPage() {
  return `${pageHead('AI STORE MANAGER','AI 店長','把每日市場訊號轉成可以理解、可以控制的營運決策。',`<button class="ghost-button ai-connect-button"><span class="connection-dot" id="aiConnection"></span><span id="aiConnectionText">檢查連線</span></button><button class="primary-button" disabled>${icon('spark')} 每日分析一次</button>`)}
  <section class="manager-hero"><article class="card manager-main"><span class="manager-label" id="aiAnalysisLabel"><i></i>正在讀取今日分析</span><h1 id="aiSummary">正在準備市場分析</h1><p id="aiSummaryNote">系統每天只會呼叫 GPT 一次，分析完成後自動執行策略並留下紀錄。</p><div class="decision-metrics"><div><small>分析模型</small><strong id="analysisModel">—</strong></div><div><small>資料來源</small><strong id="analysisSource">—</strong></div><div><small>自動執行</small><strong id="analysisCount">—</strong></div></div><div class="manager-actions"><button class="primary-button" id="executionSummary" disabled>等待今日自動執行</button><button class="ghost-button" disabled>明日自動更新</button></div></article>
  </section>
  <div class="card-head"><div><h2>今日執行紀錄</h2><p>AI 策略會自動套用，缺貨風險會通知賣家</p></div><span class="pill gray" id="recommendationCount">0 項</span></div>
  <section class="recommendation-grid" id="recommendationGrid"><article class="card empty-state ai-empty"><span class="metric-icon">${icon('spark')}</span><h3>等待每日分析</h3><p>分析完成後會顯示實際執行與補貨通知。</p></article></section>
  <section class="dashboard-grid"><article class="card timeline-card"><div class="card-head"><div><h2>自動執行時間軸</h2><p>今日實際套用與通知紀錄</p></div></div><div class="timeline" id="decisionTimeline"><div class="empty-inline">尚未產生執行紀錄</div></div></article><article class="card context-card"><div class="card-head"><div><h2>市場資料</h2><p id="marketSourceLabel">等待資料來源</p></div><span class="status-pill" id="marketStatus"><i></i>尚未分析</span></div><div id="marketRows"><div class="empty-inline">完成 GPT 分析後顯示實際輸入資料</div></div></article></section>`;
}

function recommendation(iconName,title,to,result,status,index) {
  return `<article class="card recommendation"><div class="rec-top"><span class="rec-icon">${icon(iconName)}</span><span class="rec-impact">執行紀錄</span></div><h3>${title}</h3><p>${status==='seller_notified'?'補貨通知內容':'AI 店長套用內容'}</p><div class="rec-change"><span>${to}</span></div><div class="execution-status ${status==='seller_notified'?'notified':''}"><span>${status==='seller_notified'?icon('bell'):icon('check')}</span><strong>${escapeHTML(result)}</strong></div><button class="ghost-button reason-button" data-reason-index="${index}">${icon('eye')} 查看 AI 判斷原因</button></article>`;
}

function openExecutionReason(item, execution) {
  openModal(`<h2>AI 判斷原因</h2><p>${escapeHTML(item.title)}</p><div class="reason-summary"><span class="pill ${execution?.status==='seller_notified'?'orange':''}">${escapeHTML(execution?.result || '已自動套用')}</span><strong>信心分數 ${Number(item.confidence || 0)}%</strong></div><div class="reason-block"><small>判斷依據</small><p>${escapeHTML(item.rationale || item.description)}</p></div><div class="reason-block"><small>執行內容</small><div class="rec-change"><b>${escapeHTML(item.current_value)}</b>${icon('arrow')}<span>${escapeHTML(item.suggested_value)}</span></div></div><div class="reason-block"><small>預期影響</small><p>${escapeHTML(item.expected_impact)}</p></div><div class="modal-footer"><button class="primary-button modal-cancel">關閉</button></div>`);
  modalContent.querySelector('.modal-cancel').onclick=closeModal;
}

function listPage(type) {
  const configs = {
    orders: ['訂單管理','追蹤付款、出貨與退貨狀態。',['今日訂單','待出貨','配送中','退貨申請'],['12','8','19','2']],
    products: ['商品與庫存','管理商品資料、AI 自動售價與即時庫存。',['販售中商品','低庫存','已售罄','庫存總值'],['3','0','0','NT$ 80K']],
    customers: ['顧客','了解顧客輪廓與長期價值。',['總顧客數','本月新客','回購顧客','平均終身價值'],['8,426','384','2,308','NT$ 4,820']],
    marketing: ['促銷活動','規劃折扣、免運與會員回購活動。',['進行中活動','折價券使用','平均轉換率','帶來營收'],['3','186 張','5.2%','NT$ 142K']]
  };
  const c=configs[type];
  let body='';
  if(type==='orders') body=orderTable(orders);
  else if(type==='products') body=`<table><thead><tr><th>商品</th><th>SKU</th><th>成本 / AI 售價</th><th>可售庫存</th><th>狀態</th><th></th></tr></thead><tbody id="productRows"></tbody></table>`;
  else if(type==='customers') body=`<table><thead><tr><th>顧客</th><th>訂單數</th><th>累積消費</th><th>最近購買</th><th>分群</th></tr></thead><tbody>${[['陳怡安','12','35,680','今天','高價值顧客'],['王柏凱','5','12,460','今天','活躍顧客'],['林書妤','8','21,840','今天','回購顧客'],['張家豪','2','5,830','昨天','新顧客'],['許雅婷','16','48,210','昨天','高價值顧客'],['黃冠宇','1','880','09/10','新顧客']].map((x,i)=>`<tr><td><div class="customer-cell"><span class="mini-avatar">${x[0].slice(-2)}</span><div><strong>${x[0]}</strong><small>member${1048+i}@email.com</small></div></div></td><td>${x[1]}</td><td>NT$ ${x[2]}</td><td>${x[3]}</td><td><span class="pill ${i%3===0?'':'gray'}">${x[4]}</span></td></tr>`).join('')}</tbody></table>`;
  else body=`<table><thead><tr><th>活動名稱</th><th>類型</th><th>期間</th><th>優惠內容</th><th>使用次數</th><th>狀態</th></tr></thead><tbody>${[['週末滿額免運','免運','09/13 – 09/15','滿 NT$ 999','—','草稿'],['新品限時折扣','折價券','09/13 – 09/20','9 折','82','進行中'],['九月會員回購禮','會員優惠','09/01 – 09/30','折 NT$ 100','64','進行中']].map((x,i)=>`<tr><td><strong>${x[0]}</strong></td><td>${x[1]}</td><td>${x[2]}</td><td>${x[3]}</td><td>${x[4]}</td><td><span class="pill ${i===0?'gray':''}">${x[5]}</span></td></tr>`).join('')}</tbody></table>`;
  return `${pageHead('STORE MANAGEMENT',c[0],c[1],`<button class="primary-button open-create">＋ ${type==='orders'?'建立訂單':type==='products'?'新增商品':type==='customers'?'匯入顧客':'建立活動'}</button>`)}<section class="stat-strip">${c[2].map((x,i)=>`<article class="card stat-box"><small>${x}</small><strong>${c[3][i]}</strong><div class="delta">${i===1?'今日更新':'較上月 +'+(i+3)+'.'+i+'%'}</div></article>`).join('')}</section><div class="card toolbar"><div class="toolbar-left"><input class="field" type="search" placeholder="搜尋${c[0]}…"><select class="field"><option>全部狀態</option><option>進行中</option><option>待處理</option></select></div><div class="toolbar-right"><button class="ghost-button">${icon('filter')} 篩選</button><button class="ghost-button">${icon('download')} 匯出</button></div></div><article class="card data-card">${body}<div class="table-footer"><span>顯示 1–${type==='products'?'3':'6'}，共 ${type==='customers'?'8,426':type==='products'?'3':'286'} 筆</span><div class="pagination"><button>‹</button><button class="active">1</button><button>2</button><button>3</button><button>›</button></div></div></article>`;
}

function analyticsPage() { return operationalPage('analytics'); }

function experimentsPage() {
  return `${pageHead('STRATEGY LAB','策略評測','讓不同營運策略在相同市場條件下公平比較。',`<button class="ghost-button">${icon('download')} 匯出結果</button>`)}<article class="card experiment-hero"><div><h2>9 月策略評測已完成</h2><p>50 組市場情境、每組 90 天。三種策略使用完全相同的需求波動、競品價格與隨機事件，以配對統計比較長期獲利和恢復能力。</p></div><button class="primary-button run-experiment">${icon('play')} 執行新評測</button></article><section class="strategy-cards"><article class="card strategy-card"><div class="strategy-name"><h3>AI 店長</h3><span>勝率 64%</span></div><div class="strategy-profit">NT$ 428,620</div><small>平均累積淨利 · 50 組情境</small><div class="mini-spark">${sparkline([8,11,10,14,16,15,19,22,21,25,28])}</div></article><article class="card strategy-card rule"><div class="strategy-name"><h3>規則策略</h3><span style="color:#628d7b">勝率 24%</span></div><div class="strategy-profit">NT$ 393,480</div><small>平均累積淨利 · 50 組情境</small><div class="mini-spark">${sparkline([7,9,11,10,13,14,16,17,19,20,22],'#6c9f89')}</div></article><article class="card strategy-card fixed"><div class="strategy-name"><h3>固定策略</h3><span style="color:#b56b44">勝率 12%</span></div><div class="strategy-profit">NT$ 354,190</div><small>平均累積淨利 · 50 組情境</small><div class="mini-spark">${sparkline([6,8,9,11,10,12,13,14,16,17,18],'#c98a67')}</div></article></section><section class="split-grid"><article class="card large-card"><div class="card-head"><div><h2>策略累積淨利</h2><p>50 組情境平均 · 90 天</p></div><div class="segmented"><button class="active">平均值</button><button>單一情境</button></div></div><div class="chart-wrap">${lineChart([72,83,91,105,119,128,145,159,171,194,208,229,247,268])}</div><div style="display:flex;gap:20px;justify-content:center;color:var(--muted);font-size:9px"><span>● <b style="color:var(--green)">AI 店長</b></span><span>● 規則策略</span><span>● 固定策略</span></div></article><article class="card large-card"><div class="card-head"><div><h2>評測摘要</h2><p>AI 店長相對基準策略</p></div><span class="pill">表現穩定</span></div>${[['相較規則策略','+8.9%','平均淨利提升'],['相較固定策略','+21.0%','平均淨利提升'],['缺貨天數','-3.2 天','每 90 天'],['事件恢復時間','-1.8 天','相較規則策略'],['AI 推論成本','NT$ 386','50 組完整評測']].map(x=>`<div class="market-row"><span>${x[0]}</span><div><strong>${x[1]}</strong><em>${x[2]}</em></div></div>`).join('')}</article></section>`;
}

function settingsPage() {
  return `${pageHead('SETTINGS','商店設定','管理基本資訊、AI 店長權限與通知偏好。')}<section class="split-grid"><article class="card large-card"><div class="card-head"><div><h2>商店基本資料</h2><p>顯示於訂單與顧客通知</p></div></div><div class="form-grid"><div class="form-group"><label>商店名稱</label><input value="森日選物"></div><div class="form-group"><label>預設幣別</label><select><option>新台幣（TWD）</option></select></div><div class="form-group"><label>客服信箱</label><input value="hello@senri.tw"></div><div class="form-group"><label>營運時區</label><select><option>台北（GMT+8）</option></select></div><div class="form-group full"><label>商店簡介</label><textarea>選擇耐用、簡約且對生活友善的日常用品。</textarea></div></div><div class="modal-footer"><button class="primary-button save-settings">儲存變更</button></div></article><article class="card large-card"><div class="card-head"><div><h2>AI 店長權限</h2><p>控制建議可以執行到什麼程度</p></div></div>${[['商品售價','AI 自動執行'],['最低毛利','永遠強制保護'],['促銷策略','AI 自動執行'],['庫存補貨','通知賣家確認'],['顧客訊息','需要人工確認']].map(x=>`<div class="market-row"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('')}</article></section><article class="card large-card ai-settings-card"><div class="card-head"><div><h2>GPT 連線</h2><p>API key 僅儲存在本機伺服器的 .env，不會寫入瀏覽器儲存空間。</p></div><span class="pill gray" id="settingsAIStatus">檢查中</span></div><div class="market-row"><span>目前模型</span><strong id="settingsAIModel">gpt-4o-mini</strong></div><div class="modal-footer"><button class="primary-button ai-connect-button">設定 OpenAI API</button></div></article>`;
}

let operationsRange = 'all';
const percent = value => value == null ? '—' : `${(value * 100).toFixed(1)}%`;

function operationalPage(kind) {
  return `${pageHead(kind==='analytics'?'INSIGHTS':'STORE OVERVIEW',kind==='analytics'?'營運分析':'營運總覽','與前台市場使用同一份已完成日的成交資料。')}<section id="operationalReport" data-kind="${kind}" aria-live="polite"><p class="empty-inline">正在同步市場資料…</p></section>`;
}

function operationalChart(days) {
  if(!days.length)return '<div class="empty-inline">尚未完成模擬日，開始交易後會顯示趨勢。</div>';
  const width=720,height=240,left=65,right=18,top=15,bottom=36;
  const values=days.flatMap(day=>[day.revenue,day.profit]),low=Math.min(0,...values),high=Math.max(1,...values),span=high-low;
  const x=index=>days.length===1?(left+width-right)/2:left+index*(width-left-right)/(days.length-1);
  const y=value=>height-bottom-(value-low)/span*(height-top-bottom);
  const lines=['revenue','profit'].map((key,index)=>`<polyline fill="none" stroke="${index?'#c98945':'#247258'}" stroke-width="2.5" points="${days.map((day,i)=>`${x(i)},${y(day[key])}`).join(' ')}"/>${days.map((day,i)=>`<circle cx="${x(i)}" cy="${y(day[key])}" r="3" fill="${index?'#c98945':'#247258'}"><title>第 ${day.day} 天 · ${key==='revenue'?'營收':'毛利'} ${money(day[key])}</title></circle>`).join('')}`).join('');
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="模擬每日營收與毛利趨勢">${[0,.25,.5,.75,1].map(ratio=>{const v=low+ratio*span;return `<line x1="${left}" x2="${width-right}" y1="${y(v)}" y2="${y(v)}" class="chart-grid"/><text x="${left-10}" y="${y(v)+4}" text-anchor="end" class="axis-label">${Math.round(v).toLocaleString()}</text>`}).join('')}${lines}${days.map((day,i)=>i===0||i===days.length-1||i%Math.max(1,Math.ceil(days.length/7))===0?`<text x="${x(i)}" y="${height-8}" text-anchor="middle" class="axis-label">第 ${day.day} 天</text>`:'').join('')}</svg>`;
}

function actualOrderTable(orders) {
  return `<div class="report-table"><table><thead><tr><th>訂單</th><th>模擬日</th><th>買家</th><th>商品</th><th>數量</th><th>實付金額</th></tr></thead><tbody>${orders.length?orders.map(order=>`<tr><td>${escapeHTML(order.id)}</td><td>第 ${Number(order.day)} 天</td><td>${escapeHTML(order.buyer)}</td><td>${escapeHTML(order.productName)}</td><td>${Number(order.quantity)}</td><td>${money(order.total)}</td></tr>`).join(''):'<tr><td colspan="6">尚無成交訂單</td></tr>'}</tbody></table></div>`;
}

function renderOperationalReport(root,report) {
  const t=report.totals,overview=root.dataset.kind==='overview';
  const dayLabel=report.day?`第 1–${report.day} 天累計`:'尚未開始模擬';
  const coverage=report.coverage.orders_complete?'所有已完成的本店訂單':`已保存 ${report.coverage.recorded_orders} 筆本店訂單；舊版未保存的明細不納入顧客統計`;
  root.innerHTML=`<div class="report-status"><span id="reportSyncStatus"></span><button class="ghost-button" id="exportOperationalReport">${icon('download')} 匯出報表</button></div><p id="reportError" role="alert" hidden></p>
    <section class="stat-strip">${[['實收營收',money(t.revenue),'revenue'],['累計毛利',money(t.profit),'profit'],['毛利率',percent(t.gross_margin),'gross_margin'],['銷量',`${t.units} 件`,'units']].map(([label,value,key])=>`<article class="card stat-box"><small>${label}</small><strong data-report-metric="${key}">${value}</strong><div class="delta">${dayLabel}</div></article>`).join('')}</section>
    <section class="split-grid"><article class="card large-card"><div class="card-head"><div><h2>每日營收與毛利</h2><p>當日成交金額 · 已扣除折扣 · 單位 NT$</p></div><select id="operationsRange" class="field" aria-label="趨勢期間"><option value="all">全部模擬日</option><option value="7">最近 7 天</option><option value="30">最近 30 天</option></select></div><div id="operationsChart" class="chart-wrap report-chart"></div><div class="report-legend"><span>● 營收</span><span>● 毛利</span></div></article>
    <article class="card large-card"><div class="card-head"><div><h2>${overview?'營運提醒':'市場銷量占比'}</h2><p>${overview?'最新完成日的店長通知':'本店與競品 · 全部模擬日'}</p></div></div>${overview?(report.notifications.length?report.notifications.map(notice=>`<div class="market-row"><div><strong>${escapeHTML(notice.name)}</strong><p>${escapeHTML(notice.reason)}</p></div></div>`).join(''):'<p class="empty-inline">目前沒有需要處理的通知</p>'):report.sellers.map(seller=>`<div class="market-row"><span>${escapeHTML(seller.name)}</span><div><strong>${percent(seller.share)}</strong><em>${seller.units} 件</em></div></div>`).join('')}<div class="market-row"><span>MarketPilot 市占率</span><strong data-report-metric="market_share">${percent(t.market_share)}</strong></div></article></section>
    <article class="card large-card report-section"><div class="card-head"><div><h2>商品營收排行</h2><p>歷史毛利依成交當時成本計算；目前價格與庫存即時同步</p></div><button class="text-link" data-go="products">管理商品</button></div><div class="report-table"><table><thead><tr><th>商品</th><th>營收</th><th>毛利</th><th>營收占比</th><th>銷量</th><th>目前售價</th><th>庫存</th></tr></thead><tbody>${report.products.length?report.products.map(product=>`<tr><td><strong>${escapeHTML(product.name)}</strong><small>${escapeHTML(product.sku)}</small></td><td>${money(product.revenue)}</td><td>${money(product.profit)}</td><td>${percent(product.revenue_share)}</td><td>${product.units} 件</td><td>${money(product.price)}</td><td><span class="pill ${product.low_stock?'orange':''}">${product.inventory} 件${product.low_stock?' · 需補貨':''}</span></td></tr>`).join(''):'<tr><td colspan="7">尚無商品</td></tr>'}</tbody></table></div></article>
    <section class="split-grid report-section"><article class="card large-card"><div class="card-head"><div><h2>成交顧客與訂單</h2><p>${coverage}</p></div></div>${[['成交訂單',t.order_count==null?'歷史明細不完整':`${t.order_count} 筆`],['平均訂單金額',t.average_order_value==null?'—':money(t.average_order_value)],['成交顧客',`${report.customers.count} 位`],['購買一次',`${report.customers.new} 位`],['回購顧客',`${report.customers.returning} 位`]].map(([label,value])=>`<div class="market-row"><span>${label}</span><strong>${value}</strong></div>`).join('')}</article><article class="card large-card"><div class="card-head"><div><h2>庫存狀態</h2><p>目前可售庫存 · 共 ${t.inventory} 件</p></div></div>${report.products.map(product=>`<div class="market-row"><span>${escapeHTML(product.name)}</span><div><strong>${product.inventory} 件</strong><em>預警 ${product.low_stock_threshold} 件</em></div></div>`).join('')}</article></section>
    <article class="card large-card report-section"><div class="card-head"><div><h2>最新成交訂單</h2><p>${coverage} · 最近 10 筆</p></div></div>${actualOrderTable(report.orders.slice(0,10))}</article>`;
  const select=root.querySelector('#operationsRange');select.value=operationsRange;
  const draw=()=>{const range=select.value;root.querySelector('#operationsChart').innerHTML=operationalChart(range==='all'?report.daily:report.daily.filter(day=>day.day>report.day-Number(range)))};
  select.onchange=()=>{operationsRange=select.value;draw()};draw();
  root.querySelectorAll('[data-go]').forEach(button=>button.onclick=()=>navigate(button.dataset.go));
  root.querySelector('#exportOperationalReport').onclick=()=>{
    const rows=[['模擬日','當日營收','當日毛利','當日銷量'],...report.daily.map(day=>[day.day,day.revenue,day.profit,day.units])];
    const blob=new Blob(['\ufeff'+rows.map(row=>row.join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`marketpilot-day-${report.day}.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
}

async function loadOperationalAnalytics() {
  const root=document.getElementById('operationalReport');
  if(!root||root.dataset.loading==='true')return;
  root.dataset.loading='true';
  try{
    const report=await api('/api/analytics');
    if(!root.isConnected)return;
    const signature=JSON.stringify({...report,synced_at:null});
    if(root.dataset.signature!==signature){renderOperationalReport(root,report);root.dataset.signature=signature}
    root.querySelector('#reportError').hidden=true;
    root.querySelector('#reportSyncStatus').textContent=`已同步至模擬第 ${report.day} 天 · ${new Date(report.synced_at).toLocaleTimeString('zh-TW')} · 每 5 秒更新`;
  }catch(error){
    if(!root.isConnected)return;
    let message=root.querySelector('#reportError');
    if(!message){root.innerHTML='<p id="reportError" role="alert"></p>';message=root.querySelector('#reportError')}
    message.hidden=false;message.textContent=`${error.message}${root.dataset.signature?' 畫面保留上次成功同步的資料。':''}`;
  }finally{delete root.dataset.loading}
}

const pages = {
  overview: ['營運總覽', overviewPage], manager: ['AI 店長', managerPage], orders: ['訂單管理', ()=>listPage('orders')], products: ['商品與庫存', ()=>listPage('products')], customers: ['顧客', ()=>listPage('customers')], marketing: ['促銷活動', ()=>listPage('marketing')], analytics: ['營運分析', analyticsPage], experiments: ['策略評測', experimentsPage], settings: ['商店設定', settingsPage]
};

function navigate(page, push=true) {
  if (!pages[page]) page='overview';
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.page===page));
  crumb.textContent=pages[page][0];
  app.innerHTML=pages[page][1]();
  if(push) history.pushState({page},'',`#${page}`);
  document.getElementById('sidebar').classList.remove('open');
  window.scrollTo({top:0,behavior:'smooth'});
  bindPageEvents();
}

function showToast(message) {
  const el=document.createElement('div'); el.className='toast'; el.innerHTML=`<i></i>${message}`; document.getElementById('toastStack').append(el); setTimeout(()=>el.remove(),3200);
}

function openModal(html) { modalContent.innerHTML=html; modalBackdrop.hidden=false; document.body.style.overflow='hidden'; }
function closeModal() { modalBackdrop.hidden=true; document.body.style.overflow=''; }

function createModal(title='新增商品') {
  if(title==='新增商品') { openProductModal(); return; }
  openModal(`<h2>${title}</h2><p>填寫基本資料後即可建立，你之後仍可繼續編輯。</p><div class="form-grid"><div class="form-group full"><label>名稱</label><input placeholder="輸入${title.replace('新增','').replace('建立','')}名稱"></div><div class="form-group full"><label>狀態</label><select><option>草稿</option><option>立即啟用</option></select></div><div class="form-group full"><label>備註</label><textarea placeholder="補充說明（選填）"></textarea></div></div><div class="modal-footer"><button class="ghost-button modal-cancel">取消</button><button class="primary-button modal-save">建立</button></div>`);
  modalContent.querySelector('.modal-cancel').onclick=closeModal;
  modalContent.querySelector('.modal-save').onclick=()=>{closeModal();showToast(`${title}已建立為草稿`)};
}

function openProductModal() {
  openModal(`<h2>新增商品</h2><p>輸入商品基本資料，GPT 會自動決定售價。建立後售價將持續由 AI 店長依市場狀況調整。</p><div class="form-grid"><div class="form-group full"><label>商品名稱</label><input id="productName" maxlength="100" placeholder="例如：無線降噪耳機"></div><div class="form-group"><label>單位成本</label><input id="productCost" type="number" min="0.01" step="0.01" placeholder="NT$ 0"></div><div class="form-group"><label>初始庫存</label><input id="productInventory" type="number" min="0" step="1" placeholder="0"></div><div class="form-group"><label>預警庫存</label><input id="productLowStock" type="number" min="0" step="1" value="10" placeholder="10"></div><div class="form-group"><label>最低毛利率</label><div class="percent-field"><input id="productMargin" type="number" min="1" max="94" step="0.1" value="30"><span>%</span></div></div></div><div class="ai-price-notice"><span>${icon('spark')}</span><div><strong>售價由 AI 店長管理</strong><p>你不需要設定價格。GPT 會建立初始售價；低於預警庫存時，AI 店長會通知賣家補貨。</p></div></div><div class="modal-footer"><button class="ghost-button modal-cancel">取消</button><button class="primary-button create-ai-product">由 AI 建立商品</button></div>`);
  modalContent.querySelector('.modal-cancel').onclick=closeModal;
  modalContent.querySelector('.create-ai-product').onclick=async e=>{
    const button=e.currentTarget;
    const payload={
      name:document.getElementById('productName').value.trim(),
      unit_cost:Number(document.getElementById('productCost').value),
      inventory:Number(document.getElementById('productInventory').value),
      low_stock_threshold:Number(document.getElementById('productLowStock').value),
      min_gross_margin:Number(document.getElementById('productMargin').value)/100
    };
    if(payload.name.length<2 || payload.unit_cost<=0 || !Number.isInteger(payload.inventory) || payload.inventory<0 || !Number.isInteger(payload.low_stock_threshold) || payload.low_stock_threshold<0 || payload.min_gross_margin<.01 || payload.min_gross_margin>=.95){showToast('請完整填寫商品名稱、成本、庫存、預警庫存與最低毛利率');return;}
    button.disabled=true;button.innerHTML='<span class="spinner"></span> GPT 定價中';
    try{
      const result=await api('/api/products',{method:'POST',body:JSON.stringify(payload)});
      closeModal();showToast(`${result.product.name} 已建立，AI 售價為 ${money(result.product.price)}`);navigate('products');
    }catch(error){button.disabled=false;button.textContent='由 AI 建立商品';showToast(error.message);}
  };
  setTimeout(()=>document.getElementById('productName')?.focus(),50);
}

async function loadPersistedProducts() {
  const body=document.getElementById('productRows');
  if(!body) return;
  try{
    const result=await api('/api/products');
    body.innerHTML='';
    (result.products || []).forEach(product=>{
      const row=document.createElement('tr');row.dataset.persistedProduct=product.id;
      const inventory=Number(product.inventory), threshold=Number(product.low_stock_threshold || 0), outOfStock=inventory===0, lowStock=!outOfStock&&inventory<=threshold;
      row.innerHTML=`<td><div class="customer-cell"><span class="product-thumb">📦</span><div><strong>${escapeHTML(product.name)}</strong><small>預警 ${threshold.toLocaleString()} 件 · 最低毛利 ${(Number(product.min_gross_margin)*100).toFixed(1)}%</small></div></div></td><td>${escapeHTML(product.sku)}</td><td><small>成本 ${money(product.unit_cost)}</small><strong>${money(product.price)}</strong><small class="ai-price-label">AI 自動定價 · ${escapeHTML(product.pricing?.model || '')}</small></td><td>${inventory.toLocaleString()} 件</td><td><span class="pill ${outOfStock||lowStock?'orange':''}">${outOfStock?'已售罄':lowStock?'低庫存':'販售中'}</span></td><td><button class="ghost-button edit-cost">調整成本</button></td>`;
      row.querySelector(".edit-cost").onclick=()=>editProductCost(product);
      body.prepend(row);
    });
  }catch(error){body.innerHTML=`<tr><td colspan="6">${escapeHTML(error.message)}</td></tr>`;}
}

function editProductCost(product) {
  openModal(`<h2>調整商品成本</h2><p>${escapeHTML(product.name)} · 目前售價 ${money(product.price)}</p><div class="form-group"><label>新的單位成本</label><input id="updatedCost" type="number" min="0.01" step="0.01" value="${Number(product.unit_cost)}"></div><div class="ai-price-notice"><p>儲存時 GPT 會依新成本、競品與昨日銷售重新定價，保護最低毛利 ${(Number(product.min_gross_margin)*100).toFixed(1)}%，並立即同步商城。</p></div><div class="modal-footer"><button class="ghost-button modal-cancel">取消</button><button class="primary-button save-cost">儲存並自動重新定價</button></div>`);
  modalContent.querySelector('.modal-cancel').onclick=closeModal;
  modalContent.querySelector('.save-cost').onclick=async event=>{
    const button=event.currentTarget,cost=Number(document.getElementById('updatedCost').value);
    if(!Number.isFinite(cost)||cost<=0){showToast('請輸入有效成本');return}
    button.disabled=true;button.textContent='GPT 正在重新定價…';
    try{const result=await api(`/api/products/${encodeURIComponent(product.id)}/cost`,{method:'POST',body:JSON.stringify({unit_cost:cost})});closeModal();await loadPersistedProducts();showToast(`成本已更新，AI 售價 ${money(result.product.price)}`)}
    catch(error){button.disabled=false;button.textContent='儲存並自動重新定價';showToast(error.message)}
  };
}

async function loadMarketExecutionRecords() {
  try{
    const result=await api('/api/simulator/dashboard'),run=result.last_agent_run;
    const notices=run?.seller_notifications||[];
    updateSellerNotifications(notices.map(item=>({status:'seller_notified',title:`${item.name} · ${item.type==='competitor_below_margin'?'競品毛利預警':'補貨提醒'}`,notification:item.reason})));
    const timeline=document.getElementById('decisionTimeline');
    if(timeline&&run){
      const executedAt=new Date(run.created_at),timeLabel=Number.isNaN(executedAt.getTime())?'—':executedAt.toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',hour12:false});
      timeline.innerHTML=`<p class="timeline-meta">模擬第 ${Number(run.simulation_day)} 天 · 依第 ${Number(run.observation_day)} 天銷售執行</p>`+(run.decisions||[]).map((item,index)=>`<div class="timeline-item"><div class="timeline-time"><span>第 ${Number(run.simulation_day)} 天</span><span>${timeLabel}</span></div><div class="timeline-line" aria-hidden="true"><i></i></div><div class="timeline-copy"><strong>${escapeHTML(result.state.catalog.find(product=>product.id===item.sku)?.name||item.sku)}</strong><p>${escapeHTML(item.decision.summary)}</p></div><button class="ghost-button market-reason" data-index="${index}">查看原因</button></div>`).join('');
      timeline.querySelectorAll('.market-reason').forEach(button=>button.onclick=()=>{
        const item=run.decisions[Number(button.dataset.index)];
        openModal(`<h2>每日操作原因</h2><p>${escapeHTML(item.decision.summary)}</p>${Object.entries(item.decision.reasons||{}).map(([key,reason])=>`<div class="reason-block"><small>${{price:'定價',inventory:'庫存',promotion:'促銷'}[key]||key}</small><p>${escapeHTML(reason)}</p></div>`).join('')}<p>售價 ${money(item.action.price)} · 折扣 ${(item.action.coupon_discount*100).toFixed(1)}% · 預估毛利 ${((item.guardrails?.margin?.projected||0)*100).toFixed(1)}%</p><div class="modal-footer"><button class="primary-button modal-cancel">關閉</button></div>`);
        modalContent.querySelector('.modal-cancel').onclick=closeModal;
      });
    }
  }catch{/* Market API may be offline; keep existing daily analysis visible. */}
}

async function api(path, options={}) {
  const response = await fetch(path, {
    ...options,
    headers: {'Content-Type':'application/json', ...(options.headers || {})}
  });
  const data = await response.json().catch(()=>({error:'伺服器回傳格式不正確'}));
  if (!response.ok) throw new Error(data.error || `請求失敗（${response.status}）`);
  return data;
}

async function loadAIStatus() {
  try {
    const status = await api('/api/ai/status');
    document.querySelectorAll('#aiConnection').forEach(el=>el.classList.toggle('connected',status.configured));
    document.querySelectorAll('#aiConnectionText').forEach(el=>el.textContent=status.configured?`${status.model} 已連線`:'連接 GPT');
    const badge=document.getElementById('settingsAIStatus');
    if(badge){badge.textContent=status.configured?'已連線':'尚未設定';badge.className=`pill ${status.configured?'':'orange'}`;}
    const model=document.getElementById('settingsAIModel'); if(model) model.textContent=status.model;
    return status;
  } catch {
    document.querySelectorAll('#aiConnectionText').forEach(el=>el.textContent='請由 server.py 啟動');
    const badge=document.getElementById('settingsAIStatus'); if(badge){badge.textContent='伺服器未連線';badge.className='pill orange';}
    return {configured:false, unavailable:true};
  }
}

function openAISettings() {
  openModal(`<h2>連接 OpenAI API</h2><p>金鑰會傳給你的本機 MarketPilot 伺服器並寫入 <code>.env</code>。前端不會保存或再次顯示金鑰。</p><div class="form-grid"><div class="form-group full"><label>OpenAI API key</label><input id="openaiKey" type="password" autocomplete="off" placeholder="sk-••••••••••••••••"></div><div class="form-group full"><label>模型</label><input id="openaiModel" value="gpt-4o-mini" placeholder="gpt-4o-mini"></div></div><div class="connection-help">需要的是 OpenAI Platform API key；ChatGPT 訂閱本身不會自動提供 API 額度。</div><div class="modal-footer"><button class="ghost-button modal-cancel">取消</button><button class="primary-button save-ai-settings">儲存並測試</button></div>`);
  modalContent.querySelector('.modal-cancel').onclick=closeModal;
  modalContent.querySelector('.save-ai-settings').onclick=async e=>{
    const button=e.currentTarget, key=document.getElementById('openaiKey').value.trim(), model=document.getElementById('openaiModel').value.trim();
    button.disabled=true; button.innerHTML='<span class="spinner"></span> 儲存中';
    try {
      await api('/api/ai/settings',{method:'POST',body:JSON.stringify({api_key:key,model})});
      closeModal(); const status=await loadAIStatus(); showToast('GPT 已連線，正在開始市場分析');
      if(document.getElementById('aiSummary')) runGPTAnalysis(null,status);
    } catch(error) { button.disabled=false; button.textContent='儲存並測試'; showToast(error.message); }
  };
}

function renderAIAnalysis(payload) {
  const data=payload.analysis, meta=payload.meta, recommendations=data.recommendations || [], executions=payload.execution_records || [];
  if(!document.getElementById('aiSummary')) return;
  const generatedAt=meta.generated_at?new Date(meta.generated_at):new Date();
  const generatedLabel=generatedAt.toLocaleString('zh-TW',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});
  document.getElementById('aiSummary').textContent=data.summary;
  document.getElementById('aiAnalysisLabel').innerHTML=`<i></i>${meta.cache_hit?'今日分析已保存':'今日 GPT 分析完成'} · ${generatedLabel}`;
  document.getElementById('aiSummaryNote').textContent='此分析每天產生一次並保存至隔日。定價與促銷策略會自動套用；即將缺貨時會通知賣家補貨。';
  document.getElementById('recommendationCount').textContent=`${executions.length} 項已處理`;
  document.getElementById('analysisModel').textContent=meta.model;
  document.getElementById('analysisSource').textContent=meta.context_source==='external_environment'?'外部環境':meta.context_source==='api_request'?'API 資料':'商店資料';
  document.getElementById('analysisCount').textContent=`${executions.length} 項`;
  const executionSummary=document.getElementById('executionSummary');if(executionSummary)executionSummary.textContent=`今日已自動處理 ${executions.length} 項`;
  const categoryIcons={inventory:'truck',pricing:'tag',promotion:'target',customer:'users'};
  document.getElementById('recommendationGrid').innerHTML=recommendations.map((item,index)=>recommendation(
    categoryIcons[item.category] || 'spark',
    escapeHTML(item.title), escapeHTML(item.suggested_value),
    executions[index]?.result || '已自動套用', executions[index]?.status || 'applied', index
  )).join('');
  document.querySelectorAll('.reason-button').forEach(button=>button.onclick=()=>{
    const index=Number(button.dataset.reasonIndex);
    openExecutionReason(recommendations[index],executions[index]);
  });
  renderMarketSnapshot(payload.market_snapshot || {}, data.market_status, meta.context_source);
  const timeline=document.getElementById('decisionTimeline');
  if(timeline) timeline.innerHTML=executions.map(record=>`<div class="timeline-item"><div class="timeline-time">${new Date(record.executed_at).toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'})}</div><div class="timeline-line"><i></i></div><div class="timeline-copy"><strong>${escapeHTML(record.title)}</strong><p>${escapeHTML(record.result)}</p></div><span class="timeline-result">${record.status==='seller_notified'?'已通知':'已套用'}</span></div>`).join('') || '<div class="empty-inline">今日沒有需要執行的策略</div>';
  updateSellerNotifications(executions);
  loadMarketExecutionRecords();
  loadOperationalAnalytics();
}

function updateSellerNotifications(executions) {
  const notices=executions.filter(item=>item.status==='seller_notified');
  const button=document.querySelector('.notification');
  if(!button) return;
  button.title=notices.length?`${notices.length} 則商家通知`:'目前沒有商家通知';
  button.onclick=()=>{
    openModal(`<h2>商家通知</h2><p>${notices.length?'AI 店長提醒你處理以下市場與庫存風險。':'目前沒有需要處理的通知。'}</p><div class="search-results">${notices.map(item=>`<div class="search-result"><span>${icon('truck')}</span><div><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.notification || '請確認補貨數量')}</small></div></div>`).join('')}</div><div class="modal-footer"><button class="primary-button modal-cancel">知道了</button></div>`);
    modalContent.querySelector('.modal-cancel').onclick=closeModal;
  };
  if(notices.length) button.classList.add('has-notice'); else button.classList.remove('has-notice');
}

function renderMarketSnapshot(snapshot, status, source) {
  const labels={normal:'正常',opportunity:'有機會',attention:'需注意',risk:'有風險'};
  const statusEl=document.getElementById('marketStatus');
  if(statusEl){statusEl.innerHTML=`<i></i>${labels[status] || '已分析'}`;statusEl.className=`status-pill market-${status || 'normal'}`;}
  const sourceEl=document.getElementById('marketSourceLabel');
  if(sourceEl) sourceEl.textContent=source==='external_environment'?'來自外部測試環境':'來自目前商店資料';
  const formatNumber=value=>value===null||value===undefined?'未提供':Number(value).toLocaleString('zh-TW');
  const rows=[
    ['競品價格',snapshot.competitor_price==null?'未提供':money(snapshot.competitor_price),'GPT 分析輸入'],
    ['市場需求指數',formatNumber(snapshot.demand_index),'GPT 分析輸入'],
    ['昨日轉換率',snapshot.conversion_rate==null?'未提供':`${(Number(snapshot.conversion_rate)*100).toFixed(2)}%`,'GPT 分析輸入'],
    ['目前庫存',snapshot.inventory_on_hand==null?'未提供':`${formatNumber(snapshot.inventory_on_hand)} 件`,'GPT 分析輸入'],
    ['突發事件',`${Number(snapshot.event_count || 0)} 件`,snapshot.events?.length?snapshot.events.map(e=>e.type).join('、'):'目前無事件']
  ];
  const target=document.getElementById('marketRows');
  if(target) target.innerHTML=rows.map(row=>`<div class="market-row"><span>${escapeHTML(row[0])}</span><div><strong>${escapeHTML(row[1])}</strong><em>${escapeHTML(row[2])}</em></div></div>`).join('');
}

function renderAIError(message) {
  if(!document.getElementById('aiSummary')) return;
  document.getElementById('aiAnalysisLabel').innerHTML='<i></i>GPT 分析未完成';
  document.getElementById('aiSummary').textContent='目前無法完成市場分析';
  document.getElementById('aiSummaryNote').textContent=message;
  document.getElementById('recommendationCount').textContent='0 項';
  document.getElementById('analysisModel').textContent='—';
  document.getElementById('analysisSource').textContent='—';
  document.getElementById('analysisCount').textContent='0 項';
  document.getElementById('recommendationGrid').innerHTML=`<article class="card empty-state ai-empty"><span class="metric-icon">${icon('spark')}</span><h3>沒有預填建議</h3><p>${escapeHTML(message)}</p></article>`;
}

let aiAnalysisInFlight=false;
async function runGPTAnalysis(button, knownStatus=null) {
  if(aiAnalysisInFlight) return;
  const status=knownStatus || await loadAIStatus();
  if(status.unavailable){showToast('請先執行 python3 server.py，再從 http://localhost:8000 開啟');return;}
  if(!status.configured){renderAIError('請先連接 OpenAI API，系統不會顯示範例分析。');if(button)openAISettings();return;}
  aiAnalysisInFlight=true;
  document.getElementById('aiAnalysisLabel').innerHTML='<i></i>GPT 正在產生今日分析';
  try {
    const result=await api('/api/ai/analyze',{method:'POST',body:JSON.stringify({})});
    renderAIAnalysis(result); showToast(result.meta?.cache_hit?'已載入今日市場分析':'GPT 已完成今日營運分析');
  } catch(error) { renderAIError(error.message);showToast(error.message); }
  finally { aiAnalysisInFlight=false; }
}

async function initializeAIManager() {
  const status=await loadAIStatus();
  if(!status.configured){renderAIError(status.unavailable?'請由 server.py 啟動 MarketPilot。':'請先連接 OpenAI API，系統不會顯示範例分析。');return;}
  try {
    const today=await api('/api/ai/analysis/today');
    if(today.available) renderAIAnalysis(today);
    else await runGPTAnalysis(null,status);
  } catch(error) { renderAIError(error.message); }
}

function bindPageEvents() {
  document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>navigate(b.dataset.go));
  document.querySelectorAll('.ai-connect-button').forEach(b=>b.onclick=openAISettings);
  document.querySelectorAll('.ai-run-button').forEach(b=>b.onclick=e=>runGPTAnalysis(e.currentTarget));
  const dismiss=document.querySelector('.dismiss-brief'); if(dismiss) dismiss.onclick=()=>{dismiss.closest('.briefing').style.opacity='.55';showToast('提醒已移到稍後處理');};
  document.querySelectorAll('.open-create').forEach(b=>b.onclick=()=>createModal(b.textContent.trim().replace('＋ ','')));
  document.querySelectorAll('.save-settings').forEach(b=>b.onclick=()=>showToast('商店設定已儲存'));
  const run=document.querySelector('.run-experiment'); if(run) run.onclick=()=>openModal(`<h2>執行策略評測</h2><p>三種策略會使用相同的市場情境，評測完成後可比較累積淨利、勝率、缺貨與事件恢復速度。</p><div class="form-grid"><div class="form-group"><label>市場情境數</label><input value="50" type="number"></div><div class="form-group"><label>模擬天數</label><input value="90" type="number"></div><div class="form-group"><label>市場難度</label><select><option>一般波動</option><option>高波動</option><option>危機模式</option></select></div><div class="form-group"><label>預估完成時間</label><input value="約 4 分鐘" disabled></div></div><div class="modal-footer"><button class="ghost-button modal-cancel">取消</button><button class="primary-button start-run">開始評測</button></div>`);
  if(run) setTimeout(()=>{const c=modalContent.querySelector('.modal-cancel'),s=modalContent.querySelector('.start-run');if(c)c.onclick=closeModal;if(s)s.onclick=()=>{closeModal();showToast('策略評測已開始，完成後會通知你')}});
  if(document.getElementById('aiConnection')) initializeAIManager();
  else if(document.getElementById('settingsAIStatus')) loadAIStatus();
  if(document.getElementById('productRows')) loadPersistedProducts();
  loadMarketExecutionRecords();
  loadOperationalAnalytics();
}

document.querySelectorAll('.nav-item[data-page]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));
document.getElementById('menuBtn').onclick=()=>document.getElementById('sidebar').classList.toggle('open');
document.getElementById('quickAction').onclick=()=>createModal('新增商品');
document.getElementById('modalClose').onclick=closeModal;
modalBackdrop.addEventListener('click',e=>{if(e.target===modalBackdrop)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}});
document.getElementById('searchBtn').onclick=openSearch;
function openSearch(){openModal(`<h2>快速搜尋</h2><p>搜尋訂單、商品或顧客。</p><div class="form-group" style="margin-bottom:14px"><input autofocus placeholder="輸入名稱、編號或 Email"></div><div class="search-results"><div class="search-result"><span>${icon('bag')}</span><div><strong>#MP-10482 · 陳怡安</strong><small>訂單 · NT$ 799 · 已付款</small></div></div><div class="search-result"><span>${icon('box')}</span><div><strong>手錶</strong><small>商品 · AI-3FD44584 · 庫存 50 件</small></div></div><div class="search-result"><span>${icon('users')}</span><div><strong>陳怡安</strong><small>顧客 · 12 筆訂單 · 高價值顧客</small></div></div></div>`);setTimeout(()=>modalContent.querySelector('input')?.focus(),50);}
window.addEventListener('popstate',e=>navigate(e.state?.page || location.hash.slice(1) || 'overview',false));

navigate(location.hash.slice(1)||'overview',false);

// Reading completed records does not rerun the daily GPT market analysis.
setInterval(()=>{if(document.visibilityState==='visible'){loadOperationalAnalytics();loadMarketExecutionRecords();if(document.getElementById('productRows'))loadPersistedProducts();}},5000);
