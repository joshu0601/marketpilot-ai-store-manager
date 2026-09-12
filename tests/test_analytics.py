import copy
import unittest

import server


class AnalyticsTests(unittest.TestCase):
    def state(self):
        return {
            'day': 2,
            'catalog': [{'id':'P1','name':'商品一','cost':900,'lowStockThreshold':2}],
            'sellers': {'pilot':'MarketPilot','npc1':'競品'},
            'listings': [
                {'seller':'pilot','productId':'P1','price':1500,'inventory':2,'unitsSold':3,'revenue':340,'profit':130},
                {'seller':'npc1','productId':'P1','price':100,'inventory':40,'unitsSold':2,'revenue':200,'profit':60},
            ],
            'history': [{'day':1,'revenue':100,'profit':30,'units':1},{'day':2,'revenue':340,'profit':130,'units':3}],
            'orders': [
                {'id':'o1','day':1,'seller':'pilot','buyer':'小安','quantity':1,'total':100,'status':'completed'},
                {'id':'o2','day':2,'seller':'pilot','buyer':'小安','quantity':2,'total':240,'status':'completed'},
                {'id':'npc','day':2,'seller':'npc1','buyer':'其他買家','quantity':2,'total':200,'status':'completed'},
            ],
        }

    def test_sales_match_store_metrics_and_exclude_competitors(self):
        report = server.operational_analytics(self.state())
        t = report['totals']
        self.assertEqual(t['revenue'],340)
        self.assertEqual(t['profit'],130)
        self.assertAlmostEqual(t['gross_margin'],130/340)
        self.assertEqual(t['units'],3)
        self.assertEqual(t['order_count'],2)
        self.assertEqual(t['average_order_value'],170)
        self.assertEqual(t['market_share'],.6)
        self.assertEqual(report['customers']['count'],1)
        self.assertEqual(report['customers']['returning'],1)
        self.assertEqual(report['products'][0]['profit'],130)  # not recomputed with today's cost 900
        self.assertTrue(report['products'][0]['low_stock'])

    def test_daily_values_are_differences_not_cumulative_and_cost_edits_preserve_profit(self):
        state = self.state()
        original = copy.deepcopy(state)
        report = server.operational_analytics(state)
        self.assertEqual(report['daily'][1],{'day':2,'revenue':240,'profit':100,'units':2})
        self.assertEqual(sum(item['revenue'] for item in report['daily']),report['totals']['revenue'])
        self.assertEqual(sum(item['profit'] for item in report['daily']),report['totals']['profit'])
        self.assertEqual(state,original)
        state['catalog'][0]['cost']=1500
        self.assertEqual(server.operational_analytics(state)['totals']['profit'],130)

    def test_missing_legacy_orders_are_not_reported_as_complete(self):
        state = self.state()
        state['orders'] = state['orders'][1:]
        report = server.operational_analytics(state)
        self.assertFalse(report['coverage']['orders_complete'])
        self.assertIsNone(report['totals']['order_count'])
        self.assertIsNone(report['totals']['average_order_value'])
        self.assertEqual(report['totals']['revenue'],340)
        self.assertEqual(report['coverage']['recorded_orders'],1)

    def test_reset_and_zero_sales_do_not_return_previous_simulation_totals(self):
        server.operational_analytics(self.state())
        report = server.operational_analytics({'day':0,'catalog':[],'listings':[],'history':[],'orders':[]})
        self.assertEqual(report['totals']['revenue'],0)
        self.assertEqual(report['totals']['profit'],0)
        self.assertEqual(report['totals']['market_share'],0)
        self.assertIsNone(report['totals']['gross_margin'])
        self.assertEqual(report['daily'],[])
        self.assertEqual(report['products'],[])
