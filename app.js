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

const salesData = {
  week: [132, 148, 141, 173, 185, 204, 218],
  month: [118, 132, 125, 149, 143, 164, 172, 158, 183, 191, 180, 207, 218, 231],
  quarter: [92, 104, 99, 116, 111, 124, 132, 145, 139, 151, 160, 174, 168, 181, 196, 188, 205, 218]
};

const orders = [
  ['#MP-10482','陳怡安','yi.an@email.com','無線降噪耳機 × 1','2,990','已付款','green'],
  ['#MP-10481','王柏凱','kai.w@email.com','日光隨行保溫杯 × 2','1,760','待出貨','orange'],
  ['#MP-10480','林書妤','shuyu@email.com','簡約帆布托特包 × 1','1,280','配送中','blue'],
  ['#MP-10479','張家豪','hao.z@email.com','無線降噪耳機 × 1','2,840','已完成','gray'],
  ['#MP-10478','許雅婷','yating@email.com','植萃洗沐組 × 3','2,370','已完成','gray'],
  ['#MP-10477','黃冠宇','kuan@email.com','日光隨行保溫杯 × 1','880','待付款','orange']
];

const products = [
  ['🎧','無線降噪耳機','SKU-001','3,280','218','熱銷中','green'],
  ['🥤','日光隨行保溫杯','SKU-014','880','14','庫存偏低','orange'],
  ['👜','簡約帆布托特包','SKU-023','1,280','86','販售中','green'],
  ['🧴','植萃洗沐組','SKU-031','790','8','需補貨','orange'],
  ['🕯️','山林香氛蠟燭','SKU-042','1,080','124','販售中','green'],
  ['📓','再生紙手帳','SKU-053','520','0','已售罄','gray']
];

function lineChart(data = salesData.month, color = 'var(--green)') {
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

function overviewPage() {
  return `${pageHead('TODAY · 09/12','早安，Joshua','這是森日選物今天的營運狀況與待辦重點。',`<button class="date-control">${icon('calendar')} 8月14日 — 9月12日⌄</button>`)}
  <section class="dashboard-grid">
    ${metric('總營收','NT$ 384,260','+12.8%','較前 30 天','dollar')}
    ${metric('訂單數','286','+8.4%','較前 30 天','cart','blue')}
    ${metric('轉換率','3.82%','+0.46%','較前 30 天','target','purple')}
    ${metric('回購率','27.4%','-1.2%','較前 30 天','repeat','orange')}
    <article class="card chart-card">
      <div class="card-head"><div><h2>營收趨勢</h2><p>所有銷售管道 · 已扣除折扣</p></div><div class="segmented chart-range"><button data-range="week">7 天</button><button class="active" data-range="month">30 天</button><button data-range="quarter">90 天</button></div></div>
      <div class="revenue-summary"><strong>NT$ 384,260</strong><span>↑ 12.8%</span></div><div class="chart-wrap" id="salesChart">${lineChart()}</div>
    </article>
    <article class="card side-card briefing">
      <div class="card-head"><div><h2>今日營運提醒</h2><p>依目前儀表板資料整理</p></div><span class="status-pill"><i></i>待 GPT 分析</span></div>
      <div class="brief-list">
        <div class="brief-item"><span class="brief-index">01</span><div><strong>耳機需求正在升溫</strong><p>近 7 日搜尋量上升 23%，建議廣告預算提高 15%。</p></div></div>
        <div class="brief-item"><span class="brief-index">02</span><div><strong>兩項商品需要補貨</strong><p>保溫杯與洗沐組預估將在 6 天內售罄。</p></div></div>
        <div class="brief-item"><span class="brief-index">03</span><div><strong>週末活動有成長機會</strong><p>滿額免運預估可帶來 NT$ 18,400 額外營收。</p></div></div>
      </div><div class="brief-actions"><button class="primary-button" data-go="manager">開啟 GPT 分析</button><button class="ghost-button dismiss-brief">稍後處理</button></div>
    </article>
    <article class="card orders-card"><div class="card-head"><div><h2>最新訂單</h2><p>今日已有 12 筆新訂單</p></div><button class="text-link" data-go="orders">查看全部 ${icon('arrow')}</button></div>${orderTable(orders.slice(0,5))}</article>
    <article class="card stock-card"><div class="card-head"><div><h2>庫存提醒</h2><p>依目前銷售速度預估</p></div><button class="text-link" data-go="products">管理庫存</button></div><div class="stock-list">
      ${[['🥤','日光隨行保溫杯','SKU-014',14,'約 5 天售罄'],['🧴','植萃洗沐組','SKU-031',8,'約 4 天售罄'],['📓','再生紙手帳','SKU-053',0,'已售罄']].map(x=>`<div class="stock-row"><div class="product-thumb">${x[0]}</div><div><strong>${x[1]}</strong><small>${x[2]}</small></div><div class="stock-count"><b>${x[3]} 件</b><span>${x[4]}</span></div></div>`).join('')}
    </div></article>
  </section>`;
}

function orderTable(rows) {
  return `<table><thead><tr><th>訂單</th><th>顧客</th><th>商品</th><th>金額</th><th>狀態</th></tr></thead><tbody>${rows.map(o=>`<tr><td class="order-id">${o[0]}</td><td><div class="customer-cell"><span class="mini-avatar">${o[1].slice(-2)}</span><div><strong>${o[1]}</strong><small>${o[2]}</small></div></div></td><td>${o[3]}</td><td>NT$ ${o[4]}</td><td><span class="pill ${o[6]}">${o[5]}</span></td></tr>`).join('')}</tbody></table>`;
}

function managerPage() {
  return `${pageHead('AI STORE MANAGER','AI 店長','把每日市場訊號轉成可以理解、可以控制的營運決策。',`<button class="ghost-button ai-connect-button"><span class="connection-dot" id="aiConnection"></span><span id="aiConnectionText">檢查連線</span></button><button class="primary-button" disabled>${icon('spark')} 每日分析一次</button>`)}
  <section class="manager-hero"><article class="card manager-main"><span class="manager-label" id="aiAnalysisLabel"><i></i>正在讀取今日分析</span><h1 id="aiSummary">正在準備市場分析</h1><p id="aiSummaryNote">系統每天只會呼叫 GPT 一次，分析完成後自動執行策略並留下紀錄。</p><div class="decision-metrics"><div><small>分析模型</small><strong id="analysisModel">—</strong></div><div><small>資料來源</small><strong id="analysisSource">—</strong></div><div><small>自動執行</small><strong id="analysisCount">—</strong></div></div><div class="manager-actions"><button class="primary-button" id="executionSummary" disabled>等待今日自動執行</button><button class="ghost-button" disabled>明日自動更新</button></div></article>
  <article class="card confidence-card"><h2>決策可信度</h2><div class="confidence-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="51" fill="none" stroke="#edf0ec" stroke-width="9"/><circle id="confidenceProgress" cx="60" cy="60" r="51" fill="none" stroke="#2b7d60" stroke-width="9" stroke-linecap="round" stroke-dasharray="320" stroke-dashoffset="320"/></svg><div><strong id="confidenceValue">—</strong><small id="confidenceLabel">尚未分析</small></div></div><div class="confidence-note" id="aiMeta">完成後會顯示實際模型、回應時間與 token 用量。</div></article></section>
  <div class="card-head"><div><h2>今日執行紀錄</h2><p>AI 策略會自動套用，缺貨風險會通知賣家</p></div><span class="pill gray" id="recommendationCount">0 項</span></div>
  <section class="recommendation-grid" id="recommendationGrid"><article class="card empty-state ai-empty"><span class="metric-icon">${icon('spark')}</span><h3>等待每日分析</h3><p>分析完成後會顯示實際執行與補貨通知。</p></article></section>
  <section class="dashboard-grid"><article class="card timeline-card"><div class="card-head"><div><h2>自動執行時間軸</h2><p>今日實際套用與通知紀錄</p></div></div><div class="timeline" id="decisionTimeline"><div class="empty-inline">尚未產生執行紀錄</div></div></article><article class="card context-card"><div class="card-head"><div><h2>市場資料</h2><p id="marketSourceLabel">等待資料來源</p></div><span class="status-pill" id="marketStatus"><i></i>尚未分析</span></div><div id="marketRows"><div class="empty-inline">完成 GPT 分析後顯示實際輸入資料</div></div></article></section>`;
}

function recommendation(iconName,title,to,result,status,index) {
  return `<article class="card recommendation"><div class="rec-top"><span class="rec-icon">${icon(iconName)}</span><span class="rec-impact">執行紀錄</span></div><h3>${title}</h3><p>${status==='seller_notified'?'補貨通知內容':'AI 店長套用內容'}</p><div class="rec-change"><span>${to}</span></div><div class="execution-status ${status==='seller_notified'?'notified':''}"><span>${status==='seller_notified'?icon('bell'):icon('check')}</span><strong>${escapeHTML(result)}</strong></div><button class="ghost-button reason-button" data-reason-index="${index}">${icon('eye')} 查看 AI 判斷原因</button></article>`;
}

function simulationPage() {
  return `${pageHead('MARKET SIMULATION','市場模擬','以真實 GPT 賣家對抗動態競品與 AI 買家，逐日驗證營運策略。',`<button class="ghost-button simulator-marketplace">${icon('eye')} 開啟模擬商城</button><button class="primary-button simulator-run">${icon('play')} 推進下一天</button>`)}
  <article class="card simulation-status"><div><span class="manager-label"><i></i><b id="simConnection">正在連線模擬器</b></span><h2 id="simHeadline">讀取市場狀態中</h2><p id="simDescription">完整環境會同步市場事件、競品、AI 買家與 MarketPilot 店長決策。</p></div><div class="sim-day"><small>模擬日</small><strong id="simDay">—</strong><button class="ghost-button simulator-reset">重置市場</button></div></article>
  <section class="stat-strip" id="simMetrics">${['累積營收','累積利潤','銷售件數','市場佔有率'].map(label=>`<article class="card stat-box"><small>${label}</small><strong>—</strong><div class="delta">等待模擬資料</div></article>`).join('')}</section>
  <section class="split-grid simulation-grid"><article class="card large-card"><div class="card-head"><div><h2>MarketPilot 商品</h2><p>AI 每天依昨日市場結果自動調整</p></div><span class="pill gray" id="simProductCount">0 項</span></div><div class="sim-products" id="simProducts"><div class="empty-inline">尚未啟動市場</div></div></article><article class="card large-card"><div class="card-head"><div><h2>市場事件與競爭</h2><p>直接影響下一日需求</p></div></div><div id="simEvents"><div class="empty-inline">等待市場事件</div></div><div class="sim-log" id="simLogs"></div></article></section>
  <div class="card-head"><div><h2>最新 AI 店長決策</h2><p>每個商品的價格、廣告、促銷與補貨判斷</p></div><span class="pill" id="simDecisionStatus">等待執行</span></div>
  <section class="recommendation-grid" id="simDecisions"><article class="card empty-state ai-empty"><span class="metric-icon">${icon('spark')}</span><h3>尚無模擬決策</h3><p>第一次推進會由 GPT 自動上架所有商品。</p></article></section>
  <article class="card large-card sim-notifications"><div class="card-head"><div><h2>賣家補貨通知</h2><p>AI 建議補貨時由賣家確認數量</p></div><span class="pill orange" id="simNotificationCount">0 則</span></div><div id="simNotifications"><div class="empty-inline">目前沒有待確認補貨</div></div></article>`;
}

function openExecutionReason(item, execution) {
  openModal(`<h2>AI 判斷原因</h2><p>${escapeHTML(item.title)}</p><div class="reason-summary"><span class="pill ${execution?.status==='seller_notified'?'orange':''}">${escapeHTML(execution?.result || '已自動套用')}</span><strong>信心分數 ${Number(item.confidence || 0)}%</strong></div><div class="reason-block"><small>判斷依據</small><p>${escapeHTML(item.rationale || item.description)}</p></div><div class="reason-block"><small>執行內容</small><div class="rec-change"><b>${escapeHTML(item.current_value)}</b>${icon('arrow')}<span>${escapeHTML(item.suggested_value)}</span></div></div><div class="reason-block"><small>預期影響</small><p>${escapeHTML(item.expected_impact)}</p></div><div class="modal-footer"><button class="primary-button modal-cancel">關閉</button></div>`);
  modalContent.querySelector('.modal-cancel').onclick=closeModal;
}

function listPage(type) {
  const configs = {
    orders: ['訂單管理','追蹤付款、出貨與退貨狀態。',['今日訂單','待出貨','配送中','退貨申請'],['12','8','19','2']],
    products: ['商品與庫存','管理商品資料、AI 自動售價與即時庫存。',['販售中商品','低庫存','已售罄','庫存總值'],['42','2','1','NT$ 486K']],
    customers: ['顧客','了解顧客輪廓與長期價值。',['總顧客數','本月新客','回購顧客','平均終身價值'],['8,426','384','2,308','NT$ 4,820']],
    marketing: ['行銷活動','規劃活動並追蹤每一筆行銷投入。',['進行中活動','本月廣告支出','平均 ROAS','帶來營收'],['4','NT$ 48.6K','4.7x','NT$ 228K']]
  };
  const c=configs[type];
  let body='';
  if(type==='orders') body=orderTable(orders);
  else if(type==='products') body=`<table><thead><tr><th>商品</th><th>SKU</th><th>AI 售價</th><th>可售庫存</th><th>狀態</th><th></th></tr></thead><tbody id="productRows">${products.map(p=>`<tr><td><div class="customer-cell"><span class="product-thumb">${p[0]}</span><strong>${p[1]}</strong></div></td><td>${p[2]}</td><td><strong>NT$ ${p[3]}</strong><small class="ai-price-label">AI 自動定價</small></td><td>${p[4]} 件</td><td><span class="pill ${p[6]}">${p[5]}</span></td><td><button class="icon-button bare">•••</button></td></tr>`).join('')}</tbody></table>`;
  else if(type==='customers') body=`<table><thead><tr><th>顧客</th><th>訂單數</th><th>累積消費</th><th>最近購買</th><th>分群</th></tr></thead><tbody>${[['陳怡安','12','35,680','今天','高價值顧客'],['王柏凱','5','12,460','今天','活躍顧客'],['林書妤','8','21,840','今天','回購顧客'],['張家豪','2','5,830','昨天','新顧客'],['許雅婷','16','48,210','昨天','高價值顧客'],['黃冠宇','1','880','09/10','新顧客']].map((x,i)=>`<tr><td><div class="customer-cell"><span class="mini-avatar">${x[0].slice(-2)}</span><div><strong>${x[0]}</strong><small>member${1048+i}@email.com</small></div></div></td><td>${x[1]}</td><td>NT$ ${x[2]}</td><td>${x[3]}</td><td><span class="pill ${i%3===0?'':'gray'}">${x[4]}</span></td></tr>`).join('')}</tbody></table>`;
  else body=`<table><thead><tr><th>活動名稱</th><th>類型</th><th>期間</th><th>支出</th><th>帶來營收</th><th>狀態</th></tr></thead><tbody>${[['週末滿額免運','站內活動','09/13 – 09/15','0','—','草稿'],['耳機搜尋廣告','搜尋廣告','持續進行','18,420','86,580','進行中'],['九月會員回購禮','分眾訊息','09/01 – 09/30','8,600','52,340','進行中'],['新品香氛上市','社群廣告','08/28 – 09/18','21,580','89,210','進行中']].map((x,i)=>`<tr><td><strong>${x[0]}</strong></td><td>${x[1]}</td><td>${x[2]}</td><td>NT$ ${x[3]}</td><td>${x[4]==='—'?'—':'NT$ '+x[4]}</td><td><span class="pill ${i===0?'gray':''}">${x[5]}</span></td></tr>`).join('')}</tbody></table>`;
  return `${pageHead('STORE MANAGEMENT',c[0],c[1],`<button class="primary-button open-create">＋ ${type==='orders'?'建立訂單':type==='products'?'新增商品':type==='customers'?'匯入顧客':'建立活動'}</button>`)}<section class="stat-strip">${c[2].map((x,i)=>`<article class="card stat-box"><small>${x}</small><strong>${c[3][i]}</strong><div class="delta">${i===1?'今日更新':'較上月 +'+(i+3)+'.'+i+'%'}</div></article>`).join('')}</section><div class="card toolbar"><div class="toolbar-left"><input class="field" type="search" placeholder="搜尋${c[0]}…"><select class="field"><option>全部狀態</option><option>進行中</option><option>待處理</option></select></div><div class="toolbar-right"><button class="ghost-button">${icon('filter')} 篩選</button><button class="ghost-button">${icon('download')} 匯出</button></div></div><article class="card data-card">${body}<div class="table-footer"><span>顯示 1–6，共 ${type==='customers'?'8,426':type==='products'?'42':'286'} 筆</span><div class="pagination"><button>‹</button><button class="active">1</button><button>2</button><button>3</button><button>›</button></div></div></article>`;
}

function analyticsPage() {
 return `${pageHead('INSIGHTS','營運分析','從銷售、顧客與商品表現掌握成長來源。',`<button class="date-control">${icon('calendar')} 最近 30 天⌄</button><button class="ghost-button">${icon('download')} 匯出報表</button>`)}<section class="stat-strip"><article class="card stat-box"><small>淨營收</small><strong>NT$ 358,420</strong><div class="delta">+11.4% 較上期</div></article><article class="card stat-box"><small>毛利率</small><strong>42.8%</strong><div class="delta">+2.6% 較上期</div></article><article class="card stat-box"><small>平均訂單金額</small><strong>NT$ 1,344</strong><div class="delta">+4.1% 較上期</div></article><article class="card stat-box"><small>廣告投資報酬</small><strong>4.7x</strong><div class="delta">+0.8x 較上期</div></article></section><section class="split-grid"><article class="card large-card"><div class="card-head"><div><h2>淨營收與毛利趨勢</h2><p>最近 30 天</p></div><div class="segmented"><button class="active">每日</button><button>每週</button></div></div><div class="chart-wrap">${lineChart([112,128,122,146,139,157,169,154,176,184,173,198,207,220])}</div></article><article class="card large-card"><div class="card-head"><div><h2>銷售來源</h2><p>依淨營收排序</p></div></div><div class="bar-chart">${[['自然搜尋',82,'NT$ 126K'],['付費廣告',67,'NT$ 103K'],['直接流量',45,'NT$ 69K'],['會員訊息',29,'NT$ 44K'],['社群推薦',11,'NT$ 16K']].map(x=>`<div class="bar-row"><span>${x[0]}</span><div class="bar-track"><i style="width:${x[1]}%"></i></div><b>${x[2]}</b></div>`).join('')}</div></article></section><section class="split-grid" style="margin-top:16px"><article class="card large-card"><div class="card-head"><div><h2>商品營收排行</h2><p>前五名商品貢獻 78% 營收</p></div><button class="text-link">完整商品報表</button></div>${products.slice(0,4).map((p,i)=>`<div class="market-row"><div class="customer-cell"><span class="product-thumb">${p[0]}</span><div><strong>${p[1]}</strong><small>${[36,18,14,10][i]}% 營收占比</small></div></div><div><strong>NT$ ${[138240,69120,53780,38420][i].toLocaleString()}</strong><em>+${[18.2,7.4,4.1,2.8][i]}%</em></div></div>`).join('')}</article><article class="card large-card"><div class="card-head"><div><h2>顧客組成</h2><p>依近 90 天購買行為</p></div></div><div style="display:grid;place-items:center;padding:13px"><div class="confidence-ring" style="width:150px;height:150px"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="49" fill="none" stroke="#edf0ec" stroke-width="16"/><circle cx="60" cy="60" r="49" fill="none" stroke="#247258" stroke-width="16" stroke-dasharray="308" stroke-dashoffset="188"/><circle cx="60" cy="60" r="49" fill="none" stroke="#87ad9d" stroke-width="16" stroke-dasharray="308" stroke-dashoffset="242" stroke-dashoffset="120"/></svg><div><strong>8,426</strong><small>總顧客數</small></div></div></div><div class="market-row"><span>新顧客</span><strong>62%</strong></div><div class="market-row"><span>回購顧客</span><strong>27%</strong></div><div class="market-row"><span>高價值顧客</span><strong>11%</strong></div></article></section>`;
}

function experimentsPage() {
  return `${pageHead('STRATEGY LAB','策略評測','讓不同營運策略在相同市場條件下公平比較。',`<button class="ghost-button">${icon('download')} 匯出結果</button>`)}<article class="card experiment-hero"><div><h2>9 月策略評測已完成</h2><p>50 組市場情境、每組 90 天。三種策略使用完全相同的需求波動、競品價格與隨機事件，以配對統計比較長期獲利和恢復能力。</p></div><button class="primary-button run-experiment">${icon('play')} 執行新評測</button></article><section class="strategy-cards"><article class="card strategy-card"><div class="strategy-name"><h3>AI 店長</h3><span>勝率 64%</span></div><div class="strategy-profit">NT$ 428,620</div><small>平均累積淨利 · 50 組情境</small><div class="mini-spark">${sparkline([8,11,10,14,16,15,19,22,21,25,28])}</div></article><article class="card strategy-card rule"><div class="strategy-name"><h3>規則策略</h3><span style="color:#628d7b">勝率 24%</span></div><div class="strategy-profit">NT$ 393,480</div><small>平均累積淨利 · 50 組情境</small><div class="mini-spark">${sparkline([7,9,11,10,13,14,16,17,19,20,22],'#6c9f89')}</div></article><article class="card strategy-card fixed"><div class="strategy-name"><h3>固定策略</h3><span style="color:#b56b44">勝率 12%</span></div><div class="strategy-profit">NT$ 354,190</div><small>平均累積淨利 · 50 組情境</small><div class="mini-spark">${sparkline([6,8,9,11,10,12,13,14,16,17,18],'#c98a67')}</div></article></section><section class="split-grid"><article class="card large-card"><div class="card-head"><div><h2>策略累積淨利</h2><p>50 組情境平均 · 90 天</p></div><div class="segmented"><button class="active">平均值</button><button>單一情境</button></div></div><div class="chart-wrap">${lineChart([72,83,91,105,119,128,145,159,171,194,208,229,247,268])}</div><div style="display:flex;gap:20px;justify-content:center;color:var(--muted);font-size:9px"><span>● <b style="color:var(--green)">AI 店長</b></span><span>● 規則策略</span><span>● 固定策略</span></div></article><article class="card large-card"><div class="card-head"><div><h2>評測摘要</h2><p>AI 店長相對基準策略</p></div><span class="pill">表現穩定</span></div>${[['相較規則策略','+8.9%','平均淨利提升'],['相較固定策略','+21.0%','平均淨利提升'],['缺貨天數','-3.2 天','每 90 天'],['事件恢復時間','-1.8 天','相較規則策略'],['AI 推論成本','NT$ 386','50 組完整評測']].map(x=>`<div class="market-row"><span>${x[0]}</span><div><strong>${x[1]}</strong><em>${x[2]}</em></div></div>`).join('')}</article></section>`;
}

function settingsPage() {
  return `${pageHead('SETTINGS','商店設定','管理基本資訊、AI 店長權限與通知偏好。')}<section class="split-grid"><article class="card large-card"><div class="card-head"><div><h2>商店基本資料</h2><p>顯示於訂單與顧客通知</p></div></div><div class="form-grid"><div class="form-group"><label>商店名稱</label><input value="森日選物"></div><div class="form-group"><label>預設幣別</label><select><option>新台幣（TWD）</option></select></div><div class="form-group"><label>客服信箱</label><input value="hello@senri.tw"></div><div class="form-group"><label>營運時區</label><select><option>台北（GMT+8）</option></select></div><div class="form-group full"><label>商店簡介</label><textarea>選擇耐用、簡約且對生活友善的日常用品。</textarea></div></div><div class="modal-footer"><button class="primary-button save-settings">儲存變更</button></div></article><article class="card large-card"><div class="card-head"><div><h2>AI 店長權限</h2><p>控制建議可以執行到什麼程度</p></div></div>${[['商品售價','AI 自動執行'],['最低毛利','永遠強制保護'],['廣告預算','需要人工確認'],['庫存補貨','低於 NT$ 10,000 可自動'],['顧客訊息','需要人工確認']].map(x=>`<div class="market-row"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('')}</article></section><article class="card large-card ai-settings-card"><div class="card-head"><div><h2>GPT 連線</h2><p>API key 僅儲存在本機伺服器的 .env，不會寫入瀏覽器儲存空間。</p></div><span class="pill gray" id="settingsAIStatus">檢查中</span></div><div class="market-row"><span>目前模型</span><strong id="settingsAIModel">gpt-4o-mini</strong></div><div class="modal-footer"><button class="primary-button ai-connect-button">設定 OpenAI API</button></div></article>`;
}

const pages = {
  overview: ['營運總覽', overviewPage], manager: ['AI 店長', managerPage], simulation: ['市場模擬', simulationPage], orders: ['訂單管理', ()=>listPage('orders')], products: ['商品與庫存', ()=>listPage('products')], customers: ['顧客', ()=>listPage('customers')], marketing: ['行銷活動', ()=>listPage('marketing')], analytics: ['營運分析', analyticsPage], experiments: ['策略評測', experimentsPage], settings: ['商店設定', settingsPage]
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
    body.querySelectorAll('[data-persisted-product]').forEach(row=>row.remove());
    (result.products || []).forEach(product=>{
      const row=document.createElement('tr');row.dataset.persistedProduct=product.id;
      const inventory=Number(product.inventory), threshold=Number(product.low_stock_threshold || 0), outOfStock=inventory===0, lowStock=!outOfStock&&inventory<=threshold;
      row.innerHTML=`<td><div class="customer-cell"><span class="product-thumb">📦</span><div><strong>${escapeHTML(product.name)}</strong><small>預警 ${threshold.toLocaleString()} 件 · 最低毛利 ${(Number(product.min_gross_margin)*100).toFixed(1)}%</small></div></div></td><td>${escapeHTML(product.sku)}</td><td><strong>${money(product.price)}</strong><small class="ai-price-label">AI 自動定價 · ${escapeHTML(product.pricing?.model || '')}</small></td><td>${inventory.toLocaleString()} 件</td><td><span class="pill ${outOfStock||lowStock?'orange':''}">${outOfStock?'已售罄':lowStock?'低庫存':'販售中'}</span></td><td><button class="icon-button bare">•••</button></td>`;
      body.prepend(row);
    });
  }catch{/* 靜態開啟時保留展示資料 */}
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

function renderSimulatorDashboard(payload) {
  const state=payload.state || {}, run=payload.last_agent_run || payload.agent_run, catalog=state.catalog || [], listings=state.listings || [];
  const catalogById=Object.fromEntries(catalog.map(item=>[item.id,item]));
  const pilot=listings.filter(item=>item.seller==='pilot'), metrics=state.metrics || {};
  document.getElementById('simConnection').textContent='MarketSimulator 已連線';
  document.getElementById('simHeadline').textContent=state.day?`第 ${state.day} 天市場已結算`:'市場已就緒，等待 AI 店長上架';
  document.getElementById('simDescription').textContent=run?.phase==='daily_ai'?`GPT 已依第 ${run.observation_day} 天銷售資料調整全部商品，並完成第 ${run.simulation_day} 天交易。`:'首次推進會由 GPT 決定全部商品初始售價，再由市場買家產生成交。';
  document.getElementById('simDay').textContent=String(state.day ?? 0);
  const metricValues=[money(metrics.revenue || 0),money(metrics.profit || 0),`${Number(metrics.units || 0).toLocaleString()} 件`,`${Number(metrics.share || 0).toFixed(1)}%`];
  document.getElementById('simMetrics').innerHTML=['累積營收','累積利潤','銷售件數','市場佔有率'].map((label,index)=>`<article class="card stat-box"><small>${label}</small><strong>${metricValues[index]}</strong><div class="delta">截至第 ${state.day || 0} 天</div></article>`).join('');
  document.getElementById('simProductCount').textContent=`${pilot.length} 項`;
  document.getElementById('simProducts').innerHTML=pilot.length?pilot.map(listing=>{
    const product=catalogById[listing.productId] || {}, competitors=listings.filter(item=>item.seller!=='pilot'&&item.productId===listing.productId), competitor=competitors.length?competitors.reduce((sum,item)=>sum+Number(item.price),0)/competitors.length:null;
    return `<div class="sim-product"><span class="product-thumb">${product.emoji || '📦'}</span><div><strong>${escapeHTML(product.name || listing.productId)}</strong><small>${listing.inventory} 件庫存 · 已售 ${listing.unitsSold} 件${competitor?` · 競品 ${money(competitor)}`:''}</small></div><div><strong>${money(listing.price)}</strong><small>廣告 ${money(listing.adBudget || 0)} · 折扣 ${(Number(listing.couponDiscount || 0)*100).toFixed(0)}%</small></div></div>`;
  }).join(''):'<div class="empty-inline">第一次推進後，GPT 會自動上架全部商品</div>';
  const events=state.events || [];
  document.getElementById('simEvents').innerHTML=events.length?events.map(event=>`<div class="market-row"><span>${escapeHTML(event.name)}</span><div><strong>${Number(event.effect)>1?'需求上升':'需求下降'} ${Math.round(Math.abs(Number(event.effect)-1)*100)}%</strong><em>${event.category?escapeHTML(event.category):'全市場'} · ${event.duration} 天</em></div></div>`).join(''):'<div class="empty-inline">目前沒有突發市場事件</div>';
  document.getElementById('simLogs').innerHTML=(state.logs || []).slice(0,6).map(line=>`<p>${escapeHTML(line)}</p>`).join('');
  const decisions=run?.decisions || [];
  document.getElementById('simDecisionStatus').textContent=decisions.length?`${decisions.length} 項已執行`:'等待執行';
  document.getElementById('simDecisions').innerHTML=decisions.length?decisions.map((decision,index)=>{
    const action=decision.action || {}, detail=decision.decision || {};
    return `<article class="card recommendation sim-decision"><div class="rec-top"><span class="rec-icon">${icon('spark')}</span><span class="rec-impact">${escapeHTML(decision.sku)}</span></div><h3>${escapeHTML(catalogById[decision.sku]?.name || decision.name || decision.sku)}</h3><p>${escapeHTML(detail.summary || 'AI 初始上架定價')}</p><div class="decision-values"><span>售價 <b>${money(action.price || 0)}</b></span>${action.ad_budget===undefined?'':`<span>廣告 <b>${money(action.ad_budget)}</b></span><span>折扣 <b>${(Number(action.coupon_discount)*100).toFixed(0)}%</b></span><span>促銷 <b>${(Number(action.promotion_level)*100).toFixed(0)}%</b></span>`}</div><button class="ghost-button sim-reason" data-sim-decision="${index}">${icon('eye')} 查看 AI 判斷原因</button></article>`;
  }).join(''):'<article class="card empty-state ai-empty"><span class="metric-icon">'+icon('spark')+'</span><h3>尚無模擬決策</h3><p>第一次推進會由 GPT 自動上架所有商品。</p></article>';
  document.querySelectorAll('.sim-reason').forEach(button=>button.onclick=()=>openSimulatorDecision(decisions[Number(button.dataset.simDecision)],catalogById));
  const notifications=run?.seller_notifications || [];
  document.getElementById('simNotificationCount').textContent=`${notifications.length} 則`;
  document.getElementById('simNotifications').innerHTML=notifications.length?notifications.map(item=>`<div class="sim-notification"><div><strong>${escapeHTML(item.name)}</strong><p>${escapeHTML(item.reason)}</p></div><button class="primary-button simulator-restock" data-product-id="${escapeHTML(item.product_id)}" data-quantity="${Number(item.quantity)}">確認補貨 ${Number(item.quantity)} 件</button></div>`).join(''):'<div class="empty-inline">目前沒有待確認補貨</div>';
  document.querySelectorAll('.simulator-restock').forEach(button=>button.onclick=()=>queueSimulatorRestock(button));
}

function openSimulatorDecision(decision, catalogById) {
  const action=decision.action || {}, detail=decision.decision || {}, reasons=detail.reasons || {}, name=catalogById[decision.sku]?.name || decision.name || decision.sku;
  openModal(`<h2>${escapeHTML(name)} · AI 決策</h2><p>${escapeHTML(detail.summary || '初始上架定價')}</p><div class="reason-summary"><span class="pill">${escapeHTML(decision.meta?.model || 'GPT')}</span><strong>信心分數 ${Number(detail.confidence || 0)}%</strong></div>${Object.entries({定價:reasons.price,廣告:reasons.advertising,庫存:reasons.inventory,促銷:reasons.promotion}).filter(([,value])=>value).map(([label,value])=>`<div class="reason-block"><small>${label}判斷</small><p>${escapeHTML(value)}</p></div>`).join('')}<div class="reason-block"><small>套用數值</small><p>售價 ${money(action.price || 0)}${action.ad_budget===undefined?'':` · 廣告 ${money(action.ad_budget)} · 折扣 ${(Number(action.coupon_discount)*100).toFixed(0)}% · 促銷 ${(Number(action.promotion_level)*100).toFixed(0)}% · 建議補貨 ${Number(action.reorder_quantity)} 件`}</p></div><div class="modal-footer"><button class="primary-button modal-cancel">關閉</button></div>`);
  modalContent.querySelector('.modal-cancel').onclick=closeModal;
}

async function loadSimulatorDashboard() {
  try { renderSimulatorDashboard(await api('/api/simulator/dashboard')); }
  catch(error){document.getElementById('simConnection').textContent='MarketSimulator 未啟動';document.getElementById('simHeadline').textContent='請啟動完整市場環境';document.getElementById('simDescription').textContent=error.message;}
}

async function runSimulatorDay(button) {
  button.disabled=true;const label=button.innerHTML;button.innerHTML='<span class="spinner"></span> GPT 決策與市場交易中';
  try {const result=await api('/api/simulator/run-day',{method:'POST',body:'{}'});renderSimulatorDashboard(result);showToast(`市場已推進至第 ${result.state.day} 天`);}
  catch(error){showToast(error.message);}
  finally{button.disabled=false;button.innerHTML=label;}
}

async function resetSimulatorMarket() {
  try {const result=await api('/api/simulator/reset',{method:'POST',body:JSON.stringify({seed:12345})});renderSimulatorDashboard({state:result.state,last_agent_run:null});showToast('市場已重置');}
  catch(error){showToast(error.message);}
}

async function queueSimulatorRestock(button) {
  button.disabled=true;
  try {await api('/api/simulator/restock',{method:'POST',body:JSON.stringify({product_id:button.dataset.productId,quantity:Number(button.dataset.quantity)})});button.textContent='已排入下一日';showToast('補貨已排入下一個模擬日');}
  catch(error){button.disabled=false;showToast(error.message);}
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
  document.getElementById('aiSummaryNote').textContent='此分析每天產生一次並保存至隔日。定價、廣告與促銷策略會自動套用；即將缺貨時會通知賣家補貨。';
  document.getElementById('confidenceValue').textContent=`${data.confidence}%`;
  document.getElementById('confidenceLabel').textContent=data.confidence>=80?'高可信':data.confidence>=60?'中等可信':'需審慎評估';
  document.getElementById('confidenceProgress').style.strokeDashoffset=String(320-(320*data.confidence/100));
  document.getElementById('aiMeta').textContent=`${meta.model} · ${Number(meta.latency_ms).toLocaleString()} ms · ${Number(meta.input_tokens)+Number(meta.output_tokens)} tokens${meta.cache_hit?' · 今日快取':''}`;
  document.getElementById('recommendationCount').textContent=`${executions.length} 項已處理`;
  document.getElementById('analysisModel').textContent=meta.model;
  document.getElementById('analysisSource').textContent=meta.context_source==='external_environment'?'外部環境':meta.context_source==='api_request'?'API 資料':'商店資料';
  document.getElementById('analysisCount').textContent=`${executions.length} 項`;
  const executionSummary=document.getElementById('executionSummary');if(executionSummary)executionSummary.textContent=`今日已自動處理 ${executions.length} 項`;
  const categoryIcons={advertising:'megaphone',inventory:'truck',pricing:'tag',promotion:'target',customer:'users'};
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
}

function updateSellerNotifications(executions) {
  const notices=executions.filter(item=>item.status==='seller_notified');
  const button=document.querySelector('.notification');
  if(!button) return;
  button.title=notices.length?`${notices.length} 則補貨通知`:'目前沒有補貨通知';
  button.onclick=()=>{
    openModal(`<h2>補貨通知</h2><p>${notices.length?'AI 店長依今日庫存風險通知你處理以下商品。':'目前沒有商品即將缺貨。'}</p><div class="search-results">${notices.map(item=>`<div class="search-result"><span>${icon('truck')}</span><div><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.notification || '請確認補貨數量')}</small></div></div>`).join('')}</div><div class="modal-footer"><button class="primary-button modal-cancel">知道了</button></div>`);
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
  document.getElementById('confidenceValue').textContent='—';
  document.getElementById('confidenceLabel').textContent='無分析結果';
  document.getElementById('confidenceProgress').style.strokeDashoffset='320';
  document.getElementById('aiMeta').textContent='沒有使用預先產生或模擬的 GPT 回覆。';
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
  document.querySelectorAll('.chart-range button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.chart-range button').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.getElementById('salesChart').innerHTML=lineChart(salesData[b.dataset.range]);});
  document.querySelectorAll('.ai-connect-button').forEach(b=>b.onclick=openAISettings);
  document.querySelectorAll('.ai-run-button').forEach(b=>b.onclick=e=>runGPTAnalysis(e.currentTarget));
  document.querySelectorAll('.simulator-run').forEach(b=>b.onclick=()=>runSimulatorDay(b));
  document.querySelectorAll('.simulator-reset').forEach(b=>b.onclick=resetSimulatorMarket);
  document.querySelectorAll('.simulator-marketplace').forEach(b=>b.onclick=()=>window.open('http://127.0.0.1:5173','_blank','noopener'));
  const dismiss=document.querySelector('.dismiss-brief'); if(dismiss) dismiss.onclick=()=>{dismiss.closest('.briefing').style.opacity='.55';showToast('提醒已移到稍後處理');};
  document.querySelectorAll('.open-create').forEach(b=>b.onclick=()=>createModal(b.textContent.trim().replace('＋ ','')));
  document.querySelectorAll('.save-settings').forEach(b=>b.onclick=()=>showToast('商店設定已儲存'));
  const run=document.querySelector('.run-experiment'); if(run) run.onclick=()=>openModal(`<h2>執行策略評測</h2><p>三種策略會使用相同的市場情境，評測完成後可比較累積淨利、勝率、缺貨與事件恢復速度。</p><div class="form-grid"><div class="form-group"><label>市場情境數</label><input value="50" type="number"></div><div class="form-group"><label>模擬天數</label><input value="90" type="number"></div><div class="form-group"><label>市場難度</label><select><option>一般波動</option><option>高波動</option><option>危機模式</option></select></div><div class="form-group"><label>預估完成時間</label><input value="約 4 分鐘" disabled></div></div><div class="modal-footer"><button class="ghost-button modal-cancel">取消</button><button class="primary-button start-run">開始評測</button></div>`);
  if(run) setTimeout(()=>{const c=modalContent.querySelector('.modal-cancel'),s=modalContent.querySelector('.start-run');if(c)c.onclick=closeModal;if(s)s.onclick=()=>{closeModal();showToast('策略評測已開始，完成後會通知你')}});
  if(document.getElementById('aiConnection')) initializeAIManager();
  else if(document.getElementById('settingsAIStatus')) loadAIStatus();
  if(document.getElementById('productRows')) loadPersistedProducts();
  if(document.getElementById('simConnection')) loadSimulatorDashboard();
}

document.querySelectorAll('.nav-item[data-page]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));
document.getElementById('menuBtn').onclick=()=>document.getElementById('sidebar').classList.toggle('open');
document.getElementById('quickAction').onclick=()=>createModal('新增商品');
document.getElementById('modalClose').onclick=closeModal;
modalBackdrop.addEventListener('click',e=>{if(e.target===modalBackdrop)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}});
document.getElementById('searchBtn').onclick=openSearch;
function openSearch(){openModal(`<h2>快速搜尋</h2><p>搜尋訂單、商品或顧客。</p><div class="form-group" style="margin-bottom:14px"><input autofocus placeholder="輸入名稱、編號或 Email"></div><div class="search-results"><div class="search-result"><span>${icon('bag')}</span><div><strong>#MP-10482 · 陳怡安</strong><small>訂單 · NT$ 2,990 · 已付款</small></div></div><div class="search-result"><span>${icon('box')}</span><div><strong>無線降噪耳機</strong><small>商品 · SKU-001 · 庫存 218 件</small></div></div><div class="search-result"><span>${icon('users')}</span><div><strong>陳怡安</strong><small>顧客 · 12 筆訂單 · 高價值顧客</small></div></div></div>`);setTimeout(()=>modalContent.querySelector('input')?.focus(),50);}
window.addEventListener('popstate',e=>navigate(e.state?.page || location.hash.slice(1) || 'overview',false));

navigate(location.hash.slice(1)||'overview',false);
