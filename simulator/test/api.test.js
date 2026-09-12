import test from 'node:test';
import assert from 'node:assert/strict';
import { addProduct, createState, publicState, queueActions, step, syncProducts } from '../src/engine.js';

const product=(id,name='測試商品')=>({id,name,category:'MarketPilot 商品',cost:100,price:160,inventory:8,lowStockThreshold:2,minGrossMargin:.35});

test('catalog sync keeps exactly the admin products and creates competitor prices',()=>{
  const state=createState(12345);
  syncProducts(state,[product('AI-1','衣服'),product('AI-2','衣服2'),product('AI-3','手錶')]);
  assert.deepEqual(state.catalog.map(item=>item.id),['AI-1','AI-2','AI-3']);
  assert.equal(state.listings.filter(item=>item.seller==='pilot').length,3);
  assert.equal(state.listings.filter(item=>item.seller!=='pilot').length,3);
  syncProducts(state,[product('AI-2','衣服2'),product('AI-3','手錶')]);
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
  queueActions(state,[{type:'update_strategy',productId:'AI-1',coupon_discount:.1,promotion_level:.5}]);
  state=step(state);
  const listing=state.listings.find(item=>item.id==='pilot-AI-1');
  const daily=state.dailyResults.find(item=>item.listingId===listing.id);
  assert.equal(listing.couponDiscount,.1);
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
