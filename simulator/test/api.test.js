import { settleDay } from '../src/daily.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { addProduct, createState, publicState, queueActions, step, syncProducts, prepareMarket, applyCompetitorDecisions } from '../src/engine.js';

const product=(id,name='測試商品')=>({id,name,category:'MarketPilot 商品',cost:100,price:160,inventory:8,lowStockThreshold:2,minGrossMargin:.35});

test('catalog sync keeps exactly the admin products and creates competitor prices',()=>{
  const state=createState(12345);
  syncProducts(state,[product('AI-1','上衣'),product('AI-2','耳機'),product('AI-3','手錶')]);
  assert.deepEqual(state.catalog.map(item=>item.id),['AI-1','AI-2','AI-3']);
  assert.equal(state.listings.filter(item=>item.seller==='pilot').length,3);
  assert.equal(state.listings.filter(item=>item.seller!=='pilot').length,3);
  syncProducts(state,[product('AI-2','耳機'),product('AI-3','手錶')]);
  assert.deepEqual(state.catalog.map(item=>item.id),['AI-2','AI-3']);
  assert.equal(state.day,0);
});

test('AI price must stay above product cost',()=>{
  const state=createState();
  addProduct(state,product('AI-1'));
  const result=queueActions(state,[{type:'update_price',productId:'AI-1',price:100}]);
  assert.equal(result.accepted.length,0);
  assert.match(result.rejected[0].error,/高於成本/);
});

test('promotion strategy has no advertising field and creates daily SKU results',()=>{
  let state=createState(12345);
  addProduct(state,product('AI-1'));
  queueActions(state,[{type:'update_strategy',productId:'AI-1',coupon_discount:.02,promotion_level:.5}]);
  state=step(state);
  const listing=state.listings.find(item=>item.id==='pilot-AI-1');
  const daily=state.dailyResults.find(item=>item.listingId===listing.id);
  assert.equal(listing.couponDiscount,.02);
  assert.equal(listing.promotionLevel,.5);
  assert.equal('adBudget' in listing,false);
  assert.equal('adBudget' in daily,false);
});

test('admin product appears in the public storefront state immediately',()=>{
  const state=createState(12345);
  addProduct(state,product('AI-12AB34CD','測試新品'));
  assert.equal(publicState(state).catalog[0].name,'測試新品');
  assert.equal(publicState(state).catalog[0].minGrossMargin,.35);
  assert.equal(state.listings.find(item=>item.id==='pilot-AI-12AB34CD').inventory,8);
});


test('competitor prices are complete, validated, and leave original state unchanged',()=>{
  const state=createState();addProduct(state,product('AI-1'));
  const npc=state.listings.find(item=>item.seller!=='pilot');
  const prepared=applyCompetitorDecisions(prepareMarket(state),[{listingId:npc.id,price:130,reason:'昨日銷量偏低，調價吸引買家'}]);
  assert.equal(state.day,0);assert.equal(prepared.day,0);
  assert.equal(prepared.listings.find(item=>item.id===npc.id).price,130);
  assert.notEqual(npc.price,130);
  assert.throws(()=>applyCompetitorDecisions(state,[]),/每個競品/);
  assert.throws(()=>applyCompetitorDecisions(state,[{listingId:npc.id,price:NaN,reason:'invalid'}]),/格式/);
});

test('buyers see final prices and completed orders reconcile with sales and stock',async()=>{
  const state=createState();addProduct(state,{...product('AI-1'),inventory:1,lowStockThreshold:1});
  const next=await settleDay(state,{actions:[{type:'update_price',productId:'AI-1',price:170},{type:'update_strategy',productId:'AI-1',coupon_discount:.05,promotion_level:.2}],agent_run:{observation_day:0,seller_notifications:[]}},async preview=>{
    assert.equal(preview.listings[0].price,170);
    assert.equal(preview.listings[0].couponDiscount,.05);
    return [{buyer:'小安',listingId:'pilot-AI-1',buy:true,review:{score:4,text:'價格合理'}},{buyer:'雅婷',listingId:'pilot-AI-1',buy:true,review:{score:4,text:'喜歡'}}];
  },'test-model');
  assert.equal(next.day,1);assert.equal(state.day,0);assert.equal(state.listings[0].inventory,1);
  assert.equal(next.orders.length,1);assert.equal(next.orders[0].total,161.5);
  assert.equal(next.dailyResults[0].revenue,161.5);assert.equal(next.dailyResults[0].unitsSold,1);
  assert.equal(next.listings[0].inventory,0);
  assert.equal(next.lastAgentRun.seller_notifications[0].type,'low_stock');
  assert.equal(next.agentHistory.length,1);
});

test('a failed buyer leaves prices, stock, and simulation day untouched',async()=>{
  const state=createState();addProduct(state,product('AI-1'));const original=structuredClone(state);
  await assert.rejects(settleDay(state,{actions:[{type:'update_price',productId:'AI-1',price:170}]},async()=>{throw new Error('GPT unavailable')},'test'),/GPT unavailable/);
  assert.deepEqual(state,original);
});

test('unsafe discounted sale is rejected before buyers are called',async()=>{
  const state=createState();addProduct(state,product('AI-1'));let called=false;
  await assert.rejects(settleDay(state,{actions:[{type:'update_strategy',productId:'AI-1',coupon_discount:.3,promotion_level:1}]},async()=>{called=true;return []},'test'),/最低毛利/);
  assert.equal(called,false);assert.equal(state.day,0);
});
