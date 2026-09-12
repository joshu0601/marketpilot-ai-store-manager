import { createServer } from 'node:http';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { addProduct, createState, publicState, queueActions, step, buyers } from './src/engine.js';

const stateFile = new URL('./data/state.json', import.meta.url);
const loadState = () => { try { return JSON.parse(readFileSync(stateFile, 'utf8')); } catch { return createState(); } };
const saveState = current => { mkdirSync(new URL('./data/', import.meta.url), {recursive:true}); writeFileSync(stateFile, JSON.stringify(current, null, 2)); };
let state = loadState();
let openaiApiKey = process.env.OPENAI_API_KEY || '';
// Keep model selection on the server so it can be changed without rebuilding the client.
const model = process.env.OPENAI_MODEL || 'gpt-5-mini';
const send = (res, code, body) => { res.writeHead(code, {'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type'}); res.end(JSON.stringify(body)); };
const readJson = req => new Promise((resolve, reject) => { let raw = ''; req.on('data', chunk => { raw += chunk; if (raw.length > 100_000) reject(new Error('Request body too large')); }); req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('Invalid JSON')); } }); req.on('error', reject); });
const aiSchema = { type:'object', additionalProperties:false, required:['decisions'], properties:{ decisions:{ type:'array', maxItems:5, items:{ type:'object', additionalProperties:false, required:['buyer','listingId','buy','review'], properties:{ buyer:{type:'string'}, listingId:{type:'string'}, buy:{type:'boolean'}, review:{ type:'object', additionalProperties:false, required:['score','text'], properties:{score:{type:'number'},text:{type:'string'}} } } } } } };
const responseText = body => {
  // `output_text` is an SDK convenience property. Raw Responses API JSON stores
  // the generated text inside output message content instead.
  if (typeof body?.output_text === 'string') return body.output_text;
  return body?.output
    ?.flatMap(item => item?.content || [])
    .filter(content => content?.type === 'output_text' && typeof content.text === 'string')
    .map(content => content.text)
    .join('');
};
async function getBuyerDecisions(currentState) {
  const productInfo = Object.fromEntries((currentState.catalog || []).map(product => [product.id, product]));
  const listings = currentState.listings.filter(listing => listing.inventory > 0 && productInfo[listing.productId]).map(listing => ({ id:listing.id, product:productInfo[listing.productId].name, category:productInfo[listing.productId].category, price:listing.price, effectivePrice:Number((listing.price*(1-(listing.couponDiscount||0))).toFixed(2)), promotionLevel:listing.promotionLevel||0, rating:Number(listing.rating.toFixed(1)), inventory:listing.inventory }));
  const prompt = `你正在扮演電商平台上的五位買家。今天是第 ${currentState.day + 1} 天。每位買家最多買一件，也可以不買。只從提供的 listingId 中選擇；依預算、喜好、有效價格、評分與促銷曝光做自然決定，promotionLevel 較高代表商品更容易被看到。buy 為 false 時仍提供 review 但 text 留空。buy 為 true 時，寫一則繁體中文、30 字內的真實短評，score 是 1 到 5。\n買家：${JSON.stringify(buyers)}\n商品：${JSON.stringify(listings)}`;
  const response = await fetch('https://api.openai.com/v1/responses', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${openaiApiKey}`}, body:JSON.stringify({ model, store:false, input:[{role:'developer',content:'請嚴格依照 JSON schema 回傳，不要購買不存在的商品。'},{role:'user',content:prompt}], text:{format:{type:'json_schema',name:'buyer_decisions',strict:true,schema:aiSchema}} }) });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error?.message || 'OpenAI request failed');
  const text = responseText(body);
  if (!text) throw new Error('OpenAI 未回傳可用的買家決策。請確認模型與 API Key 後再試一次。');
  try {
    const decisions = JSON.parse(text).decisions;
    if (!Array.isArray(decisions)) throw new Error('missing decisions');
    return decisions;
  } catch {
    throw new Error('OpenAI 回傳的買家決策格式無效，請再試一次。');
  }
}

createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === 'GET' && url.pathname === '/api/state') return send(res, 200, publicState(state));
    if (req.method === 'GET' && url.pathname === '/api/health') return send(res, 200, {ok:true,service:'market-simulator',day:state.day});
    if (req.method === 'GET' && url.pathname === '/api/openai') return send(res, 200, {enabled:Boolean(openaiApiKey), model});
    const body = await readJson(req);
    if (req.method === 'POST' && url.pathname === '/api/openai') { if (typeof body.apiKey !== 'string' || !body.apiKey.trim()) throw new Error('請輸入 API Key'); openaiApiKey = body.apiKey.trim(); return send(res, 200, {enabled:true, model}); }
    if (req.method === 'POST' && url.pathname === '/api/reset') { state = createState(body.seed); saveState(state); return send(res, 200, publicState(state)); }
    if (req.method === 'POST' && url.pathname === '/api/products') { const result = addProduct(state, body); saveState(state); return send(res, result.created ? 201 : 200, result); }
    if (req.method === 'POST' && url.pathname === '/api/actions') { const actions = Array.isArray(body.actions) ? body.actions : [body]; const result = queueActions(state, actions); if (!result.rejected.length) saveState(state); return send(res, result.rejected.length ? 422 : 202, {...result, pendingActions:state.pendingActions.length}); }
    if (req.method === 'POST' && url.pathname === '/api/step') { const days = Math.min(365, Math.max(1, Number(body.days) || 1)); for (let day = 0; day < days; day++) state = step(state, openaiApiKey ? await getBuyerDecisions(state) : null); saveState(state); return send(res, 200, publicState(state)); }
    return send(res, 404, {error:'Not found'});
  } catch (error) { return send(res, 400, {error:error.message}); }
}).listen(process.env.PORT || 3001, '127.0.0.1', () => console.log(`Simulator API listening on http://localhost:${process.env.PORT || 3001}`));
