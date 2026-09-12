import test from 'node:test';
import assert from 'node:assert/strict';
import { addProduct, createState, publicState, queueActions, step } from '../src/engine.js';

test('seller action is validated then applied on the next day', () => {
  let state = createState(12345);
  const result = queueActions(state, [{type:'list_product',productId:'P002',price:799,initial_inventory:20}]);
  assert.equal(result.rejected.length, 0);
  state = step(state);
  const listing = state.listings.find(x => x.id === 'pilot-P002');
  assert.ok(listing);
  assert.equal(listing.price, 799);
});

test('seller cannot submit a price at or below cost', () => {
  const result = queueActions(createState(), [{type:'list_product',productId:'P001',price:300,initial_inventory:20}]);
  assert.equal(result.accepted.length, 0);
  assert.match(result.rejected[0].error, /高於成本/);
});

test('AI strategy changes demand inputs and creates daily SKU results', () => {
  let state = createState(12345);
  queueActions(state, [
    {type:'list_product',productId:'P002',price:799,initial_inventory:20},
  ]);
  state = step(state);
  queueActions(state, [{type:'update_strategy',productId:'P002',ad_budget:1200,coupon_discount:.1,promotion_level:.5}]);
  state = step(state);
  const listing = state.listings.find(x => x.id === 'pilot-P002');
  const daily = state.dailyResults.find(x => x.listingId === listing.id);
  assert.equal(listing.adBudget, 1200);
  assert.equal(listing.couponDiscount, .1);
  assert.ok(daily);
  assert.equal(daily.day, 2);
  assert.ok(daily.grossProfit <= daily.revenue - daily.unitsSold * 500, 'advertising spend is deducted from profit');
});

test('an admin product is added to the dynamic catalog and storefront immediately', () => {
  let state = createState(12345);
  const result = addProduct(state, {
    id:'AI-12AB34CD', name:'測試新品', category:'MarketPilot 商品', cost:100,
    price:160, inventory:8, lowStockThreshold:2, minGrossMargin:.35,
  });
  assert.equal(result.created, true);
  assert.equal(publicState(state).catalog.find(product => product.id === 'AI-12AB34CD').name, '測試新品');
  assert.equal(publicState(state).catalog.find(product => product.id === 'AI-12AB34CD').minGrossMargin, .35);
  assert.equal(state.listings.find(listing => listing.productId === 'AI-12AB34CD').inventory, 8);
  state = step(state);
  assert.ok(state.dailyResults.find(item => item.productId === 'AI-12AB34CD'));
});
