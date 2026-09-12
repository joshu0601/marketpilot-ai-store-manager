import {queueActions,applyPendingActions,step} from './engine.js';

// All work happens on a copy; the caller persists only a fully settled day.
export async function settleDay(market,body,getBuyers,model){
  const preview=structuredClone(market);
  const queued=queueActions(preview,body.actions||[]);
  if(queued.rejected.length)throw new Error(queued.rejected[0].error);
  applyPendingActions(preview);
  // Buyers see the exact prices and promotions that will be charged today.
  const decisions=await getBuyers(preview);
  const next=step(preview,decisions);
  const run={...structuredClone(body.agent_run||{}),simulation_day:next.day,competitor_decisions:market.competitorDecisions,buyer_decisions:decisions,market_model:model,created_at:new Date().toISOString()};
  const catalog=Object.fromEntries(next.catalog.map(item=>[item.id,item]));
  run.seller_notifications ||= [];
  for(const listing of next.listings.filter(item=>item.seller==='pilot')){
    const product=catalog[listing.productId];
    if(listing.inventory<=product.lowStockThreshold&&!run.seller_notifications.some(item=>item.product_id===product.id&&item.type==='low_stock'))run.seller_notifications.push({type:'low_stock',product_id:product.id,name:product.name,reason:`庫存剩 ${listing.inventory} 件，已達預警 ${product.lowStockThreshold} 件，請安排補貨。`,status:'waiting_for_seller'});
  }
  next.lastAgentRun=run;
  next.agentHistory=[...(next.agentHistory||[]),run];
  return next;
}
