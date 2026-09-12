export const catalog = [
  { id:'P001', name:'夏季短袖 T-shirt', category:'服飾', cost:300, quality:.85, description:'100% 純棉材質，透氣舒適，適合夏季日常穿著。', emoji:'👕' },
  { id:'P002', name:'無線藍牙耳機', category:'3C', cost:500, quality:.82, description:'輕巧真無線設計，提供清晰音質與長效續航。', emoji:'🎧' },
  { id:'P003', name:'保溫杯', category:'生活用品', cost:200, quality:.80, description:'雙層真空保溫，讓每一口飲品維持理想溫度。', emoji:'🥤' },
  { id:'P004', name:'精品咖啡豆', category:'食品', cost:350, quality:.90, description:'精選產區阿拉比卡咖啡豆，中焙呈現花果香氣。', emoji:'☕' },
  { id:'P005', name:'運動鞋', category:'服飾', cost:700, quality:.88, description:'輕量避震鞋底，為日常運動提供穩定支撐。', emoji:'👟' },
  { id:'P006', name:'行動電源', category:'3C', cost:450, quality:.84, description:'10000mAh 高效充電，外出旅行的可靠電力夥伴。', emoji:'🔋' },
];

export const info = Object.fromEntries(catalog.map(p => [p.id, p]));
const sellers = { pilot:'MarketPilot', npc1:'小明商店', npc2:'3C之家', npc3:'生活百貨' };
export const buyers = [
  {name:'小安',emoji:'🧑🏻‍💻',budget:1.15,likes:['3C','服飾']}, {name:'雅婷',emoji:'👩🏻',budget:1.35,likes:['生活用品','食品']},
  {name:'阿哲',emoji:'🧑🏻',budget:.95,likes:['3C','服飾']}, {name:'米米',emoji:'🧑🏼‍🎨',budget:1.25,likes:['服飾','食品']},
  {name:'志豪',emoji:'👨🏻',budget:1.5,likes:['生活用品','3C']},
];
const initialListings = [
  ['npc1','P001',479,110,4.6,192], ['npc1','P005',1090,65,4.7,86], ['npc2','P002',799,95,4.6,128],
  ['npc2','P006',699,90,4.5,91], ['npc3','P003',379,140,4.5,152], ['npc3','P004',559,75,4.8,105],
].map(([seller,productId,price,inventory,rating,unitsSold]) => ({ id:`${seller}-${productId}`,seller,productId,price,inventory,initialInventory:inventory,rating,reviews:Math.round(unitsSold*.55),unitsSold,revenue:price*unitsSold,profit:(price-info[productId].cost)*unitsSold,restocked:0,adBudget:0,couponDiscount:0,promotionLevel:0,reviewItems:[] }));

function seeded(seed) { let s = (Number(seed) || 1) >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function demandFactor(state, product) { return state.events.filter(e => state.day >= e.start_day && state.day < e.start_day + e.duration).reduce((factor, e) => !e.category || e.category === product.category ? factor * e.effect : factor, 1); }
function purchaseScore(buyer, product, listing, random) { const preference = buyer.likes.includes(product.category) ? .22 : 0; const affordable = Math.min(1.25, (product.cost * buyer.budget * 1.7) / listing.price); return (product.quality * 1.05) + affordable * .7 + preference + (random() - .5) * .28; }

export function createState(seed = 12345) { return { day:0, seed:Number(seed), listings:structuredClone(initialListings), logs:['市場已準備完成：NPC 賣家已上架 6 項商品。'], events:[], history:[], dailyResults:[], dailyHistory:[], pendingActions:[] }; }

export function metrics(state) { const mine = state.listings.filter(x => x.seller === 'pilot'); const market = state.listings.reduce((n,x) => n + x.unitsSold, 0); const units = mine.reduce((n,x) => n + x.unitsSold, 0); return { revenue:mine.reduce((n,x) => n+x.revenue,0), profit:mine.reduce((n,x) => n+x.profit,0), units, inventory:mine.reduce((n,x) => n+x.inventory,0), marketUnits:market, share:market ? units / market * 100 : 0 }; }

export function validateAction(action, state) {
  if (!action || typeof action !== 'object' || !['list_product','update_price','update_strategy','restock','delist_product'].includes(action.type)) return '未知的動作類型';
  if (!info[action.productId]) return '商品 ID 不存在';
  const listing = state.listings.find(x => x.seller === 'pilot' && x.productId === action.productId);
  if (action.type === 'list_product' && listing) return '商品已上架';
  if (action.type !== 'list_product' && !listing) return '商品尚未上架';
  if (['list_product','update_price'].includes(action.type) && (!Number.isFinite(Number(action.price)) || Number(action.price) <= info[action.productId].cost)) return '售價必須高於成本';
  if (action.type === 'list_product' && (!Number.isInteger(Number(action.initial_inventory)) || Number(action.initial_inventory) <= 0)) return '初始庫存必須是正整數';
  if (action.type === 'restock' && (!Number.isInteger(Number(action.quantity)) || Number(action.quantity) <= 0)) return '補貨數量必須是正整數';
  if (action.type === 'update_strategy' && (
    !Number.isFinite(Number(action.ad_budget)) || Number(action.ad_budget) < 0 ||
    !Number.isFinite(Number(action.coupon_discount)) || Number(action.coupon_discount) < 0 || Number(action.coupon_discount) > .3 ||
    !Number.isFinite(Number(action.promotion_level)) || Number(action.promotion_level) < 0 || Number(action.promotion_level) > 1
  )) return '廣告、折扣或促銷設定超出範圍';
  return null;
}

export function queueActions(state, actions) { const rejected = actions.map(action => ({ action, error:validateAction(action, state) })).filter(x => x.error); if (rejected.length) return { accepted:[], rejected }; state.pendingActions.push(...structuredClone(actions)); return { accepted:actions, rejected:[] }; }

function applyPurchase(state, listing, buyer, review, logs) {
  if (!listing || listing.inventory < 1) return false;
  const product = info[listing.productId];
  listing.inventory--;
  listing.unitsSold++;
  const effectivePrice = listing.price * (1 - (listing.couponDiscount || 0));
  listing.revenue += effectivePrice;
  listing.profit += effectivePrice - product.cost;
  if (review) {
    const score = Math.max(1, Math.min(5, Number(review.score) || 4));
    listing.rating = (listing.rating * listing.reviews + score) / (listing.reviews + 1);
    listing.reviews++;
    listing.reviewItems = [{ id:`${state.day}-${listing.id}-${listing.reviews}`, buyer:buyer.name, emoji:buyer.emoji, score, text:String(review.text || '').slice(0,160), day:state.day }, ...(listing.reviewItems || [])].slice(0, 8);
  }
  if (listing.seller === 'pilot') logs.push(`${buyer.name} 購買了 ${listing.price} 元的「${product.name}」`);
  return true;
}

export function step(oldState, buyerDecisions = null) {
  const state = structuredClone(oldState); const random = seeded(state.seed + state.day * 7919); const before = new Map(state.listings.map(item => [item.id,{unitsSold:item.unitsSold,revenue:item.revenue,profit:item.profit}])); state.day++; const logs = [`Day ${state.day}`];
  if (random() <= .31) { const choices = [{name:'🔥 市場需求暴增',effect:1.3,duration:2},{name:'📉 市場需求下降',effect:.7,duration:2},{name:'🔥 服飾類突然熱門',effect:1.35,duration:3,category:'服飾'},{name:'🛍️ 購物節',effect:1.45,duration:1}]; const event = {...choices[Math.floor(random()*choices.length)],event_id:`E${state.day}`,start_day:state.day}; state.events.push(event); logs.push(`${event.name}｜需求 ${event.effect > 1 ? '+' : '-'}${Math.round(Math.abs(event.effect-1)*100)}%`); }
  state.listings.filter(listing => listing.seller !== 'pilot').forEach(listing => { const peers=state.listings.filter(item => item.productId===listing.productId&&item.id!==listing.id); if(peers.length&&random()<.38){const average=peers.reduce((sum,item)=>sum+item.price,0)/peers.length;const target=Math.max(info[listing.productId].cost+1,Math.round(average*.98));if(target!==listing.price){listing.price=target;logs.push(`${sellers[listing.seller]} 調整「${info[listing.productId].name}」價格為 NT$${target}`)}} if(listing.inventory<20&&random()<.7){listing.inventory+=60;listing.restocked+=60;logs.push(`${sellers[listing.seller]} 補貨「${info[listing.productId].name}」60 件`)}});
  for (const action of state.pendingActions) { const product = info[action.productId]; let listing = state.listings.find(x => x.seller === 'pilot' && x.productId === action.productId); if (action.type === 'list_product') { listing = {id:`pilot-${action.productId}`,seller:'pilot',productId:action.productId,price:Number(action.price),inventory:Number(action.initial_inventory),initialInventory:Number(action.initial_inventory),rating:4.5,reviews:0,unitsSold:0,revenue:0,profit:0,restocked:0,adBudget:0,couponDiscount:0,promotionLevel:0,reviewItems:[]}; state.listings.push(listing); } else if (action.type === 'update_price') listing.price = Number(action.price); else if (action.type === 'update_strategy') { listing.adBudget=Number(action.ad_budget); listing.couponDiscount=Number(action.coupon_discount); listing.promotionLevel=Number(action.promotion_level); } else if (action.type === 'restock') { listing.inventory += Number(action.quantity); listing.restocked += Number(action.quantity); } else state.listings = state.listings.filter(x => x !== listing); logs.push(`MarketPilot 執行：${action.type} ${product.name}`); }
  state.pendingActions = [];
  if (Array.isArray(buyerDecisions)) {
    const buyerByName = new Map(buyers.map(buyer => [buyer.name, buyer]));
    const processedBuyers = new Set();
    for (const decision of buyerDecisions) {
      const buyer = buyerByName.get(decision?.buyer);
      const listing = state.listings.find(item => item.id === decision?.listingId);
      if (!buyer || processedBuyers.has(buyer.name)) continue;
      processedBuyers.add(buyer.name);
      if (listing && decision.buy === true) applyPurchase(state, listing, buyer, decision.review, logs);
    }
    logs.push(`OpenAI 買家完成 ${processedBuyers.size} 個購買決策`);
  } else {
    for (const listing of state.listings) { if (!listing.inventory) continue; const product = info[listing.productId]; const effectivePrice=listing.price*(1-(listing.couponDiscount||0)); const adFactor=1+Math.min(.5,(listing.adBudget||0)/5000*.5); const promotionFactor=1+(listing.promotionLevel||0)*.35; const base = 13 * Math.max(.15, 1.75-effectivePrice/(product.cost*1.55)) * (.65+product.quality*.55) * (.65+listing.rating/5*.55) * demandFactor(state,product) * adFactor * promotionFactor * (.65+random()*.7); const candidates = Array.from({length:Math.max(0,Math.round(base))}, () => purchaseScore(buyers[Math.floor(random()*buyers.length)], product, {...listing,price:effectivePrice}, random)).filter(score => score >= 1.28 + random()*.18); const sold = Math.min(listing.inventory, candidates.length); listing.inventory -= sold; listing.unitsSold += sold; listing.revenue += sold * effectivePrice; listing.profit += sold * (effectivePrice-product.cost); if (listing.seller === 'pilot' && sold) logs.push(`MarketPilot 售出 ${sold} 件「${product.name}」`); }
  }
  state.listings.filter(listing => listing.seller === 'pilot').forEach(listing => { listing.profit -= listing.adBudget || 0; }); state.dailyResults = state.listings.map(listing => { const previous=before.get(listing.id)||{unitsSold:0,revenue:0,profit:0}; return {day:state.day,listingId:listing.id,productId:listing.productId,seller:listing.seller,price:listing.price,unitCost:info[listing.productId].cost,unitsSold:listing.unitsSold-previous.unitsSold,revenue:listing.revenue-previous.revenue,grossProfit:listing.profit-previous.profit,inventory:listing.inventory,adBudget:listing.adBudget||0,couponDiscount:listing.couponDiscount||0,promotionLevel:listing.promotionLevel||0,rating:listing.rating}; }); state.dailyHistory=[...(state.dailyHistory||[]),{day:state.day,results:state.dailyResults}].slice(-7); state.events = state.events.filter(e => state.day < e.start_day + e.duration); state.history.push({day:state.day,...metrics(state)}); state.logs = [...logs,...state.logs].slice(0,80); return state;
}

export function publicState(state) { return { ...structuredClone(state), catalog, sellers, metrics:metrics(state) }; }
