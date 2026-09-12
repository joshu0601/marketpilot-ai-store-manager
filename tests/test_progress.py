import copy
import unittest
from unittest.mock import patch

import server
import test_server


class ProgressTests(unittest.TestCase):
    def setUp(self):
        self.previous = server.simulation_progress()
        server.set_simulation_progress('idle',status='idle',day=None,product_name=None,product_count=0,product_index=0,error=None)

    def tearDown(self):
        previous = dict(self.previous)
        stage = previous.pop('stage')
        server.set_simulation_progress(stage,**previous)

    def test_progress_follows_actual_competitor_manager_buyer_calls(self):
        original = test_server.ServerTests().simulator_state()
        prepared = copy.deepcopy(original)
        prepared['listings'][1]['price'] = 510
        observed=[]

        def simulator(path,*args):
            observed.append(server.simulation_progress()['stage'])
            if path=='/api/prepare-day':
                self.assertEqual(server.simulation_progress()['stage'],'competitor')
                return {'state':prepared,'token':'t'}
            self.assertEqual(path,'/api/step')
            self.assertEqual(server.simulation_progress()['stage'],'buyer')
            self.assertEqual(args[1]['actions'][0]['price'],500)
            return {**original,'day':2,'lastAgentRun':{'simulation_day':2}}

        def decide(request,require_ai):
            progress = server.simulation_progress()
            observed.append(progress['stage'])
            self.assertEqual(progress['stage'],'manager')
            self.assertEqual(progress['product_name'],'測試上衣')
            self.assertEqual(progress['product_index'],1)
            self.assertEqual(progress['product_count'],1)
            self.assertEqual(request.market.competitor_price,510)
            self.assertTrue(require_ai)
            return {'sku':'P001','action':{'price':500,'coupon_discount':0,'promotion_level':0,'reorder_quantity':0},'meta':{'source':'ai'}}

        with patch.object(server,'sync_products_to_simulator',return_value=original),patch.object(server,'simulator_request',side_effect=simulator),patch.object(server,'decide_action',side_effect=decide),patch.object(server,'save_simulator_run'):
            server.run_simulator_day(1)
        self.assertEqual(observed,['competitor','manager','buyer'])
        self.assertEqual(server.simulation_progress()['status'],'completed')
        self.assertEqual(server.simulation_progress()['day'],2)

    def test_failed_competitor_does_not_advance_to_manager(self):
        with patch.object(server,'sync_products_to_simulator',return_value=test_server.ServerTests().simulator_state()),patch.object(server,'simulator_request',side_effect=RuntimeError('test failure')),patch.object(server,'decide_all_products') as decide:
            with self.assertRaises(RuntimeError):server.run_simulator_day(1)
        decide.assert_not_called()
        self.assertEqual(server.simulation_progress()['stage'],'competitor')
        self.assertEqual(server.simulation_progress()['status'],'failed')

    def test_failed_manager_does_not_start_buyers(self):
        state=test_server.ServerTests().simulator_state()
        with patch.object(server,'sync_products_to_simulator',return_value=state),patch.object(server,'simulator_request',return_value={'state':state,'token':'t'}) as simulator,patch.object(server,'decide_all_products',side_effect=RuntimeError('test failure')):
            with self.assertRaises(RuntimeError):server.run_simulator_day(1)
        self.assertEqual(simulator.call_count,1)
        self.assertEqual(server.simulation_progress()['stage'],'manager')
        self.assertEqual(server.simulation_progress()['status'],'failed')

    def test_progress_can_be_read_without_acquiring_simulation_lock(self):
        import threading
        server.set_simulation_progress('manager',status='running')
        result=[]
        with server.SIMULATION_LOCK:
            reader=threading.Thread(target=lambda:result.append(server.simulation_progress()))
            reader.start();reader.join(timeout=1)
            self.assertFalse(reader.is_alive())
        self.assertEqual(result[0]['stage'],'manager')
