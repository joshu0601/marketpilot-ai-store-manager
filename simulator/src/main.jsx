import React, { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const sellers={pilot:'MarketPilot',npc1:'小明商店',npc2:'3C之家',npc3:'生活百貨'};
const money=value=>`NT$${(Number(value)||0).toLocaleString('zh-TW',{maximumFractionDigits:2})}`;

function App(){
  const [sim,setSim]=useState(null),[agentRun,setAgentRun]=useState(null),[days,setDays]=useState(30),[seed,setSeed]=useState(12345),[running,setRunning]=useState(false),[tab,setTab]=useState(location.hash==='#sim'?'sim':'market'),[selected,setSelected]=useState(null),[search,setSearch]=useState(''),[buyerApi,setBuyerApi]=useState({enabled:false}),[error,setError]=useState('');
  const [busy,setBusy]=useState(false),busyRef=useRef(false);
  const [progress,setProgress]=useState(null),[progressConnected,setProgressConnected]=useState(true);
  const simulatorRequest=async(path,body)=>{const response=await fetch(`http://127.0.0.1:3001${path}`,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:undefined),json=await response.json();if(!response.ok)throw new Error(json.error||'模擬器請求失敗');return json};
  const managerRequest=async(path,body)=>{const response=await fetch(`http://127.0.0.1:8000${path}`,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:undefined),json=await response.json();if(!response.ok)throw new Error(json.error||'AI 店長請求失敗');return json};
  const refresh=async()=>{try{const [dashboard,status]=await Promise.all([managerRequest('/api/simulator/dashboard'),simulatorRequest('/api/openai')]);if(!busyRef.current){setSim(dashboard.state);setAgentRun(dashboard.last_agent_run)}setBuyerApi(status)}catch(requestError){setError(requestError.message)}};
  useEffect(()=>{refresh();const id=setInterval(refresh,2500);return()=>clearInterval(id)},[]);
  useEffect(()=>{
    let cancelled=false,timer;
    const poll=async()=>{
      try{const result=await managerRequest('/api/simulator/progress');if(!cancelled){setProgress(result);setProgressConnected(true)}}
      catch{if(!cancelled)setProgressConnected(false)}
      finally{if(!cancelled)timer=setTimeout(poll,1000)}
    };
    poll();return()=>{cancelled=true;clearTimeout(timer)};
  },[]);
  const nextDay=async()=>{
    if(busyRef.current||progress?.status==='running')return;
    busyRef.current=true;setBusy(true);setProgress(null);setError('');
    try{const result=await managerRequest('/api/simulator/run-day',{expected_day:sim.day});setSim(result.state);setAgentRun(result.agent_run);if(result.state.day>=Number(days))setRunning(false)}
    catch(runError){setError(runError.message);setRunning(false)}
    finally{busyRef.current=false;setBusy(false)}
  };
  useEffect(()=>{if(!running||busy||progress?.status==='running'||!sim)return;const id=setTimeout(nextDay,650);return()=>clearTimeout(id)},[running,busy,sim?.day,days,progress?.status]);
  const reset=async()=>{if(busyRef.current)return;setRunning(false);busyRef.current=true;setBusy(true);try{const result=await managerRequest('/api/simulator/reset',{seed});setSim(result.state);setAgentRun(null);setError('')}catch(resetError){setError(resetError.message)}finally{busyRef.current=false;setBusy(false)}};
  const setBuyerKey=async apiKey=>{try{setBuyerApi(await simulatorRequest('/api/openai',{apiKey}));setError('')}catch(keyError){setError(keyError.message)}};
  if(!sim)return <main><section className="loading">正在連線至完整市場環境…<p>{error}</p></section></main>;
  const info=Object.fromEntries((sim.catalog||[]).map(product=>[product.id,product])),pilot=sim.listings.filter(listing=>listing.seller==='pilot'&&info[listing.productId]),query=search.toLowerCase(),products=pilot.filter(listing=>info[listing.productId].name.toLowerCase().includes(query)||info[listing.productId].category.includes(search)),visible=selected?pilot.find(listing=>listing.id===selected):null,categories=['全部',...new Set((sim.catalog||[]).map(product=>product.category))],metrics=sim.metrics;
  return <main><header><div className="brand"><span>✦</span><div>MarketPilot <small>智慧電商模擬市場</small></div></div><nav>{[['market','首頁'],['categories','商品分類'],['hot','熱門商品'],['sellers','賣家商店'],['sim','模擬控制台']].map(([id,name])=><button className={tab===id?'active':''} onClick={()=>{setTab(id);location.hash=id==='sim'?'sim':'';setSelected(null)}} key={id}>{name}</button>)}<button className="cart">🛒 購物車 <b>0</b></button></nav></header>
    <section className="hero"><div><p>探索智慧電商的每一天</p><h1>讓策略，創造更好的市場表現</h1><label className="search">⌕ <input value={search} onChange={event=>setSearch(event.target.value)} placeholder="搜尋商品或分類"/></label></div><div className="heroart">🛍️<i>即時市場<br/>模擬中</i></div></section>
    {tab==='sim'?<Simulation {...{sim,agentRun,days,setDays,seed,setSeed,running,setRunning,metrics,pilot,info,reset,buyerApi,setBuyerKey,error,busy:busy||progress?.status==='running',nextDay,progress,progressConnected}}/>:visible?<Detail listing={visible} product={info[visible.productId]} onBack={()=>setSelected(null)}/>:<><section className="sectionhead"><div><span>精選商品</span><h2>{tab==='sellers'?'MarketPilot 商店':tab==='hot'?'熱門商品排行':tab==='categories'?'全館商品分類':'探索市場上的好商品'}</h2></div><button className="link" onClick={()=>{setTab('sim');location.hash='sim'}}>前往模擬控制台 →</button></section><section className="chips">{categories.map(category=><button key={category} onClick={()=>setSearch(category==='全部'?'':category)}>{category}</button>)}</section><section className="grid">{products.sort((a,b)=>tab==='hot'?b.unitsSold-a.unitsSold:0).map(listing=><Card listing={listing} product={info[listing.productId]} key={listing.id} onClick={()=>setSelected(listing.id)}/>)}</section>{!pilot.length&&<div className="empty">後台尚未建立商品。</div>}<section className="trust"><div>🚚<b>即時市場變化</b><small>交易成果同步到商城</small></div><div>✦<b>逐日市場模擬</b><small>保留每日決策與成交紀錄</small></div><div>◌<b>多方賣家競爭</b><small>AI 買家每日決策</small></div></section></>}
  </main>;
}

function Card({listing,product,onClick}){return <article className="card" onClick={onClick}><div className="productimg">{product.emoji}<em>{listing.inventory===0?'已售罄':'現貨供應'}</em></div><div className="cardbody"><small>{product.category}</small><h3>{product.name}</h3><strong>{money(listing.price)}</strong><div className="rating">★ {listing.rating.toFixed(1)} <span>已售出 {listing.unitsSold} 件</span></div><p>賣家：MarketPilot</p></div></article>}

function Detail({listing,product,onBack}){return <section className="detail"><button className="back" onClick={onBack}>← 返回商品列表</button><div className="detailgrid"><div className="detailimg">{product.emoji}</div><div><small>{product.category} · {product.id}</small><h1>{product.name}</h1><h2>{money(listing.price)}</h2><div className="rating big">★ {listing.rating.toFixed(1)} <span>{listing.reviews} 則評價　｜　已售出 {listing.unitsSold} 件</span></div><p>賣家：<b>MarketPilot</b></p><p>庫存：<b>{listing.inventory} 件</b></p><button className="buy">加入購物車</button><button className="buy outline">立即購買</button><hr/><h3>商品介紹</h3><p>{product.description}</p><h3>AI 買家評價</h3>{listing.reviewItems?.length?<div className="reviewlist">{listing.reviewItems.map(review=><article className="review" key={review.id}><span>{review.emoji}</span><div><b>{review.buyer} <small>AI 買家 · 第 {review.day} 天</small></b><em>{'★'.repeat(Math.round(review.score))} <i>{review.score.toFixed(1)}</i></em><p>{review.text}</p></div></article>)}</div>:<p className="muted">尚未收到 AI 買家的評價；開始模擬後會在成交時產生。</p>}</div></div></section>}

const agentLabels={competitor:'競品 agent 正在調整價格',manager:'店長 agent 正在調整售價',buyer:'使用者 agent 正在模擬購買'};
function AgentProgress({progress,connected,busy}){
  const stages=[['competitor','競品 agent','根據市場資料調整競品價格'],['manager','店長 agent','根據競品價格、昨日銷售與最低毛利定價'],['buyer','使用者 agent','依調整後的價格決定購買並產生訂單']];
  const current=stages.findIndex(([id])=>id===progress?.stage),complete=progress?.status==='completed',failed=progress?.status==='failed';
  const heading=!connected?'暫時無法取得即時進度，正在重新連線':failed?`${agentLabels[progress.stage]?.replace('正在','')}未完成`:complete?`第 ${progress.day} 天已完成`:busy?(agentLabels[progress?.stage]||'正在準備本日模擬'):'每日執行順序';
  return <section className="agent-progress" aria-label="每日 agent 執行進度"><div className="agent-progress-heading" role="status" aria-live="polite"><b>{heading}</b>{progress?.status==='running'&&progress.stage==='manager'&&progress.product_name&&<span>{progress.product_name} · {progress.product_index} / {progress.product_count} 個商品</span>}</div><ol>{stages.map(([id,title,description],index)=>{
    const status=complete||index<current?'done':index===current?(failed?'failed':'active'):'pending';
    return <li key={id} data-stage={id} className={status} aria-current={status==='active'?'step':undefined}><i>{status==='done'?'✓':index+1}</i><div><b>{title}<small>{status==='done'?'已完成':status==='active'?'執行中':status==='failed'?'執行失敗':'等待執行'}</small></b><p>{description}</p></div></li>
  })}</ol>{failed&&<p className="apierror">{progress.error}</p>}</section>;
}

function Simulation({sim,agentRun,days,setDays,seed,setSeed,running,setRunning,metrics,pilot,info,reset,buyerApi,setBuyerKey,error,busy,nextDay,progress,progressConnected}){
  const [key,setKey]=useState(''),[recordDay,setRecordDay]=useState('latest');
  const history=sim.agentHistory||[],run=recordDay==='latest'?agentRun:history.find(item=>String(item.simulation_day)===recordDay);
  const decisions=run?.decisions||[],orders=(sim.orders||[]).filter(item=>item.day===(run?.simulation_day||sim.day));
  return <section className="simulation">
    <div className="simtop"><div><span>MARKET SIMULATION</span><h1>模擬控制台</h1><p>競品 agent 調價 → 店長 agent 定價 → 使用者 agent 模擬購買。</p></div><div className="status"><i className={busy?'pulse':''}/>{busy?(progressConnected?(agentLabels[progress?.stage]||'正在準備本日模擬'):'正在執行，進度連線中斷'):running?'連續模擬中':'等待下一天'}</div></div>
    <div className="keybox"><b>市場 agents</b><span>{buyerApi.enabled?`GPT 已連線 · ${buyerApi.model}`:'請先設定 GPT 連線'}</span><input type="password" value={key} onChange={event=>setKey(event.target.value)} placeholder="OpenAI API Key" autoComplete="off"/><button disabled={!key||busy} onClick={()=>{setBuyerKey(key);setKey('')}}>儲存連線</button><small>買家與競品各自使用 GPT 決策；店長沿用後台 GPT 設定。第一天尚無昨日交易，以零銷售作為起始資料。</small></div>
    <div className="controls"><label>連續模擬至第幾天<input disabled={busy||running} type="number" min="1" max="365" value={days} onChange={event=>setDays(Math.min(365,Math.max(1,Number(event.target.value))))}/></label><label>事件隨機種子<input disabled={busy||running} type="number" value={seed} onChange={event=>setSeed(event.target.value)}/></label><button className="start" disabled={busy||running||!pilot.length||!buyerApi.enabled} onClick={nextDay}>{busy?'執行中…':'下一天 →'}</button><button disabled={busy||running||sim.day>=days||!pilot.length||!buyerApi.enabled} onClick={()=>setRunning(true)}>連續模擬</button><button disabled={!running} onClick={()=>setRunning(false)}>暫停</button><button disabled={busy} onClick={reset}>重置</button></div>
    <AgentProgress progress={busy&&progress?.status==='completed'?null:progress} connected={progressConnected} busy={busy}/>{error&&<p className="apierror" role="alert">{error}</p>}
    <div className="progress"><span>已完成 <b>{sim.day}</b> 天</span><div><i style={{width:`${Math.min(100,sim.day/days*100)}%`}}/></div></div>
    <div className="metricgrid">{[['總營收',money(metrics.revenue)],['總利潤',money(metrics.profit)],['總銷量',`${metrics.units} 件`],['市場佔有率',`${metrics.share.toFixed(1)}%`]].map(([label,value])=><div className="metric" key={label}><small>{label}</small><b>{value}</b></div>)}</div>
    <div className="recordhead"><h2>每日營運紀錄</h2><select aria-label="查看日期" value={recordDay} onChange={event=>setRecordDay(event.target.value)}><option value="latest">最新一天</option>{[...history].reverse().map(item=><option key={item.simulation_day} value={item.simulation_day}>第 {item.simulation_day} 天</option>)}</select></div>
    <div className="simgrid"><div className="panel"><div className="paneltitle"><h3>店長定價與促銷</h3></div><p className="muted">第 {run?.simulation_day||sim.day} 天 · 根據第 {run?.observation_day??0} 天銷售，點開查看依據。</p>{decisions.length?decisions.map(item=><details className="decision" key={item.sku}><summary><b>{info[item.sku]?.name||item.sku}</b><span>{money(item.action.price)} · 折扣 {(item.action.coupon_discount*100).toFixed(1)}%</span></summary><p>{item.decision.summary}</p><dl><dt>昨日銷量</dt><dd>{item.observation?.sales?.units_sold??'—'} 件</dd><dt>今日競品有效價格</dt><dd>{money(item.observation?.market?.competitor_price)}</dd><dt>最低毛利 / 預估毛利</dt><dd>{((item.guardrails?.margin?.target||0)*100).toFixed(1)}% / {((item.guardrails?.margin?.projected||0)*100).toFixed(1)}%</dd></dl>{Object.entries(item.decision.reasons||{}).map(([key,reason])=><p key={key}><b>{{price:'定價',inventory:'庫存',promotion:'促銷'}[key]}：</b>{reason}</p>)}<small>模型：{item.meta.model}</small></details>):<p className="muted">點選「下一天」開始模擬。</p>}</div>
    <div className="panel"><div className="paneltitle"><h3>競品 agent 定價紀錄</h3></div>{(run?.competitor_decisions||[]).map(item=><details className="decision" key={item.listingId}><summary><b>{info[item.productId]?.name}</b><span>{money(item.previousPrice)} → {money(item.price)}</span></summary><p>{sellers[item.seller]}：{item.reason}</p><small>GPT · {run.market_model}</small></details>)}{!run&&<p className="muted">每天根據成交與市場事件重新評估競品價格。</p>}</div></div>
    <div className="panel orderpanel"><div className="paneltitle"><h3>買家 agent 訂單 · 第 {run?.simulation_day||sim.day} 天</h3><span>{orders.length} 筆成交</span></div><div className="tablewrap"><table><thead><tr><th>訂單</th><th>買家</th><th>商品</th><th>賣家</th><th>數量</th><th>成交金額</th></tr></thead><tbody>{orders.map(order=><tr key={order.id}><td>{order.id}</td><td>{order.buyer}</td><td>{order.productName}</td><td>{sellers[order.seller]}</td><td>{order.quantity}</td><td>{money(order.total)}</td></tr>)}</tbody></table></div>{!orders.length&&<p className="muted">本日尚無成交，買家也可能選擇不購買。</p>}<div className="buyerchoices">{(run?.buyer_decisions||[]).map(item=><span key={item.buyer}>{item.buyer} · {item.buy?'選擇購買':'本日未購買'}</span>)}</div></div>
    <div className="simgrid"><div className="panel"><div className="paneltitle"><h3>商家通知</h3></div>{(run?.seller_notifications||[]).map((notice,index)=><div className="notice" key={index}><b>{notice.name} · {notice.type==='competitor_below_margin'?'競品低於毛利底線':'補貨提醒'}</b><p>{notice.reason}</p>{notice.quantity>0&&<small>建議補貨 {notice.quantity} 件</small>}</div>)}{!run?.seller_notifications?.length&&<p className="muted">本日沒有需處理的通知。</p>}</div><div className="panel"><div className="paneltitle"><h3>目前市場狀態</h3></div><dl><dt>可售庫存</dt><dd>{metrics.inventory} 件</dd><dt>商品種類</dt><dd>{pilot.length} 種</dd></dl>{sim.events.length?sim.events.map(event=><div className="event" key={event.event_id}>{event.name}</div>):<p className="muted">目前沒有市場事件。</p>}</div></div>
    <div className="panel log"><h3>活動紀錄</h3>{sim.logs.slice(0,12).map((line,index)=><p key={index}>{line}</p>)}</div>
  </section>;
}

createRoot(document.getElementById('root')).render(<App/>);
