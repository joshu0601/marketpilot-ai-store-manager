import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import server


class AnalysisRefreshTests(unittest.TestCase):
    def test_explicit_refresh_replaces_cache_and_normal_reads_stay_cached(self):
        with tempfile.TemporaryDirectory() as directory,patch.object(server,'DAILY_ANALYSIS_FILE',Path(directory)/'analysis.json'),patch.object(server,'analyze_store',side_effect=[{'analysis':{'summary':'first','recommendations':[]}}, {'analysis':{'summary':'refreshed','recommendations':[]}}]) as analyze:
            server.get_daily_analysis()
            self.assertEqual(server.get_daily_analysis()['analysis']['summary'],'first')
            result=server.get_daily_analysis({'source':'test'},force_refresh=True)
            self.assertFalse(result['meta']['cache_hit'])
            self.assertEqual(server.get_daily_analysis()['analysis']['summary'],'refreshed')
            self.assertEqual(analyze.call_count,2)
            analyze.assert_called_with({'source':'test'})

    def test_failed_refresh_preserves_previous_successful_analysis(self):
        with tempfile.TemporaryDirectory() as directory,patch.object(server,'DAILY_ANALYSIS_FILE',Path(directory)/'analysis.json'):
            server.save_daily_analysis({'analysis':{'summary':'previous','recommendations':[]},'meta':{}})
            with patch.object(server,'analyze_store',side_effect=RuntimeError('GPT failed')):
                with self.assertRaises(RuntimeError):server.get_daily_analysis(force_refresh=True)
            self.assertEqual(server.get_daily_analysis()['analysis']['summary'],'previous')
