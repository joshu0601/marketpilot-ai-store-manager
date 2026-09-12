export const catalog = [];

const sellers = { pilot:'MarketPilot', npc1:'小明商店', npc2:'3C之家', npc3:'生活百貨' };
export const buyers = [
  {name:'小安',emoji:'🧑🏻‍💻',budget:1.15,likes:['3C','服飾','MarketPilot 商品']},
  {name:'雅婷',emoji:'👩🏻',budget:1.35,likes:['生活用品','食品','MarketPilot 商品']},
  {name:'阿哲',emoji:'🧑🏻',budget:.95,likes:['3C','服飾']},
  {name:'米米',emoji:'🧑🏼‍🎨',budget:1.25,likes:['服飾','食品']},
  {name:'志豪',emoji:'👨🏻',budget:1.5,likes:['生活用品','3C','MarketPilot 商品']},
];

const stateCatalog = state => Array.isArray(state.catalog) ? state.catalog : [];
const stateInfo = state => Object.fromEntries(stateCatalog(state).map(product => [product.id, product]));
const listingBase = (seller, productId, price, inventory, rating=4.5) => ({
  id:`${seller}-${productId}`, seller, productId, price, inventory, initialInventory:inventory,
  rating, reviews:0, unitsSold:0, revenue:0, profit:0, restocked:0,
  couponDiscount:0, promotionLevel:0, reviewItems:[],
});
const competitorSeller = id => ['npc1','npc2','npc3'][[...id].reduce((sum,char)=>sum+char.charCodeAt(0),0)%3];
const competitorPrice = price => Math.max(1, Math.round(Number(price)*.97));

function seeded(seed) { let value=(Number(seed)||1)>>>0; return () => { value=(value*1664525+1013904223)>>>0; return value/4294967296; }; }
function demandFactor(state, product) { return state.events.filter(event => state.day>=event.start_day && state.day<event.start_day+event.duration).reduce((factor,event) => !event.category || event.category===product.category ? factor*event.effect : factor, 1); }
function purchaseScore(buyer, product, listing, random) { const preference=buyer.likes.includes(product.category)?.22:0; const affordable=Math.min(1.25,(product.cost*buyer.budget*1.7)/listing.price); return product.quality*1.05+affordable*.7+preference+(random()-.5)*.28; }

export function createState(seed=12345) { return {day:0,seed:Number(seed),catalog:[],listings:[],logs:['商品目錄會與 MarketPilot 後台自動同步。'],events:[],history:[],dailyResults:[],dailyHistory:[],pendingActions:[]}; }

export function metrics(state) {
  const mine=state.listings.filter(item=>item.seller==='pilot'),market=state.listings.reduce((total,item)=>total+item.unitsSold,0),units=mine.reduce((total,item)=>total+item.unitsSold,0);
  return {revenue:mine.reduce((total,item)=>total+item.revenue,0),profit:mine.reduce((total,item)=>total+item.profit,0),units,inventory:mine.reduce((total,item)=>total+item.inventory,0),marketUnits:market,share:market?units/market*100:0};
}

export function validateAction(action,state) {
  const products=stateInfo(state);
  if(!action || typeof action!=='object' || !['list_product','update_price','update_strategy','restock','delist_product'].includes(action.type)) return '未知的動作類型';
  if(!products[action.productId]) return '商品 ID 不存在';
  const listing=state.listings.find(item=>item.seller==='pilot'&&item.productId===action.productId);
  if(action.type==='list_product'&&listing) return '商品已上架';
  if(action.type!=='list_product'&&!listing) return '商品尚未上架';
  if(['list_product','update_price'].includes(action.type)&&(!Number.isFinite(Number(action.price))||Number(action.price)<=products[action.productId].cost)) return '售價必須高於成本';
  if(action.type==='list_product'&&(!Number.isInteger(Number(action.initial_inventory))||Number(action.initial_inventory)<=0)) return '初始庫存必須是正整數';
  if(action.type==='restock'&&(!Number.isInteger(Number(action.quantity))||Number(action.quantity)<=0)) return '補貨數量必須是正整數';
  if(action.type==='update_strategy'&&(!Number.isFinite(Number(action.coupon_discount))||Number(action.coupon_discount)<0||Number(action.coupon_discount)>.3||!Number.isFinite(Number(action.promotion_level))||Number(action.promotion_level)<0||Number(action.promotion_level)>1)) return '折扣或促銷設定超出範圍';
  return null;
}

export function queueActions(state,actions) { const rejected=actions.map(action=>({action,error:validateAction(action,state)})).filter(item=>item.error);if(rejected.length)return {accepted:[],rejected};state.pendingActions.push(...structuredClone(actions));return {accepted:actions,rejected:[]}; }

export function addProduct(state,input) {
  const product={id:String(input.id||''),name:String(input.name||''),category:String(input.category||'MarketPilot 商品'),cost:Number(input.cost),quality:Number(input.quality||.85),description:String(input.description||''),emoji:String(input.emoji||'📦'),lowStockThreshold:Number(input.lowStockThreshold||0),minGrossMargin:Number(input.minGrossMargin||.30)};
  const price=Number(input.price),inventory=Number(input.inventory);
  if(!product.id||!product.name||!Number.isFinite(product.cost)||product.cost<=0) throw new Error('商品 ID、名稱與成本格式不正確');
  if(!Number.isFinite(price)||price<=product.cost||!Number.isInteger(inventory)||inventory<0) throw new Error('商品售價必須高於成本，庫存必須為非負整數');
  state.catalog=stateCatalog(state);const existing=state.catalog.find(item=>item.id===product.id);if(existing)Object.assign(existing,product);else state.catalog.push(product);
  let listing=state.listings.find(item=>item.seller==='pilot'&&item.productId===product.id),createdListing=false;if(!listing){listing=listingBase('pilot',product.id,price,inventory);state.listings.push(listing);createdListing=true;}
  const seller=competitorSeller(product.id);if(!state.listings.some(item=>item.seller!=='pilot'&&item.productId===product.id))state.listings.push(listingBase(seller,product.id,competitorPrice(price),Math.max(100,inventory),4.4));
  if(!existing||createdListing)state.logs=[`MarketPilot 同步商品「${product.name}」至商城`,...state.logs].slice(0,80);return {created:!existing,product:existing||product,listing};
}

export function syncProducts(state,inputs) {
  if(!Array.isArray(inputs)) throw new Error('products 必須是陣列');
  const desiredIds=new Set(inputs.map(item=>String(item.id||''))),removed=stateCatalog(state).some(product=>!desiredIds.has(product.id));
  if(removed)Object.assign(state,createState(state.seed));else{state.catalog=stateCatalog(state).filter(product=>desiredIds.has(product.id));state.listings=state.listings.filter(listing=>desiredIds.has(listing.productId));state.listings.forEach(listing=>delete listing.adBudget);}
  const results=inputs.map(input=>addProduct(state,input));return {synced:true,productCount:state.catalog.length,results};
}

function applyPurchase(state,listing,buyer,review,logs) {
  if(!listing||listing.inventory<1)return false;const product=stateInfo(state)[listing.productId];listing.inventory--;listing.unitsSold++;
  const effectivePrice=listing.price*(1-(listing.couponDiscount||0));listing.revenue+=effectivePrice;listing.profit+=effectivePrice-product.cost;
  if(review){const score=Math.max(1,Math.min(5,Number(review.score)||4));listing.rating=(listing.rating*listing.reviews+score)/(listing.reviews+1);listing.reviews++;listing.reviewItems=[{id:`${state.day}-${listing.id}-${listing.reviews}`,buyer:buyer.name,emoji:buyer.emoji,score,text:String(review.text||'').slice(0,160),day:state.day},...(listing.reviewItems||[])].slice(0,8);}
  if(listing.seller==='pilot')logs.push(`${buyer.name} 購買了 ${listing.price} 元的「${product.name}」`);return true;
}

export function step(oldState,buyerDecisions=null) {
  const state=structuredClone(oldState),products=stateInfo(state),random=seeded(state.seed+state.day*7919),before=new Map(state.listings.map(item=>[item.id,{unitsSold:item.unitsSold,revenue:item.revenue,profit:item.profit}]));state.day++;const logs=[`Day ${state.day}`];
  if(random()<=.31){const choices=[{name:'🔥 市場需求暴增',effect:1.3,duration:2},{name:'📉 市場需求下降',effect:.7,duration:2},{name:'🛍️ 購物節',effect:1.45,duration:1}],event={...choices[Math.floor(random()*choices.length)],event_id:`E${state.day}`,start_day:state.day};state.events.push(event);logs.push(`${event.name}｜需求 ${event.effect>1?'+':'-'}${Math.round(Math.abs(event.effect-1)*100)}%`);}
  state.listings.filter(listing=>listing.seller!=='pilot').forEach(listing=>{const pilot=state.listings.find(item=>item.seller==='pilot'&&item.productId===listing.productId);if(pilot&&random()<.38){const target=Math.max(products[listing.productId].cost+1,Math.round(pilot.price*(.94+random()*.08)));if(target!==listing.price){listing.price=target;logs.push(`${sellers[listing.seller]} 調整「${products[listing.productId].name}」價格為 NT$${target}`);}}if(listing.inventory<20&&random()<.7){listing.inventory+=60;listing.restocked+=60;}});
  for(const action of state.pendingActions){const product=products[action.productId];let listing=state.listings.find(item=>item.seller==='pilot'&&item.productId===action.productId);if(action.type==='list_product'){listing=listingBase('pilot',action.productId,Number(action.price),Number(action.initial_inventory));state.listings.push(listing);}else if(action.type==='update_price')listing.price=Number(action.price);else if(action.type==='update_strategy'){listing.couponDiscount=Number(action.coupon_discount);listing.promotionLevel=Number(action.promotion_level);}else if(action.type==='restock'){listing.inventory+=Number(action.quantity);listing.restocked+=Number(action.quantity);}else state.listings=state.listings.filter(item=>item!==listing);logs.push(`MarketPilot 執行：${action.type} ${product.name}`);}state.pendingActions=[];
  if(Array.isArray(buyerDecisions)){const buyerByName=new Map(buyers.map(buyer=>[buyer.name,buyer])),processed=new Set();for(const decision of buyerDecisions){const buyer=buyerByName.get(decision?.buyer),listing=state.listings.find(item=>item.id===decision?.listingId);if(!buyer||processed.has(buyer.name))continue;processed.add(buyer.name);if(listing&&decision.buy===true)applyPurchase(state,listing,buyer,decision.review,logs);}logs.push(`OpenAI 買家完成 ${processed.size} 個購買決策`);}else{for(const listing of state.listings){if(!listing.inventory)continue;const product=products[listing.productId],effectivePrice=listing.price*(1-(listing.couponDiscount||0)),promotionFactor=1+(listing.promotionLevel||0)*.35,base=13*Math.max(.15,1.75-effectivePrice/(product.cost*1.55))*(.65+product.quality*.55)*(.65+listing.rating/5*.55)*demandFactor(state,product)*promotionFactor*(.65+random()*.7),sold=Math.min(listing.inventory,Array.from({length:Math.max(0,Math.round(base))},()=>purchaseScore(buyers[Math.floor(random()*buyers.length)],product,{...listing,price:effectivePrice},random)).filter(score=>score>=1.28+random()*.18).length);listing.inventory-=sold;listing.unitsSold+=sold;listing.revenue+=sold*effectivePrice;listing.profit+=sold*(effectivePrice-product.cost);if(listing.seller==='pilot'&&sold)logs.push(`MarketPilot 售出 ${sold} 件「${product.name}」`);}}
  state.dailyResults=state.listings.map(listing=>{const previous=before.get(listing.id)||{unitsSold:0,revenue:0,profit:0};return {day:state.day,listingId:listing.id,productId:listing.productId,seller:listing.seller,price:listing.price,unitCost:products[listing.productId].cost,unitsSold:listing.unitsSold-previous.unitsSold,revenue:listing.revenue-previous.revenue,grossProfit:listing.profit-previous.profit,inventory:listing.inventory,couponDiscount:listing.couponDiscount||0,promotionLevel:listing.promotionLevel||0,rating:listing.rating};});state.dailyHistory=[...(state.dailyHistory||[]),{day:state.day,results:state.dailyResults}].slice(-7);state.events=state.events.filter(event=>state.day<event.start_day+event.duration);state.history.push({day:state.day,...metrics(state)});state.logs=[...logs,...state.logs].slice(0,80);return state;
}

export function publicState(state){return {...structuredClone(state),catalog:structuredClone(stateCatalog(state)),sellers,metrics:metrics(state)};}
