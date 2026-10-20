import copy,unittest
from demo11_47h_contract import ORDER,USERDIR,validate_result
class ResultContract(unittest.TestCase):
 def fixture(self):
  rows=[{'id':id,'status':'NOT_READY','checkpoint':False,'evidence':{}} for id in ORDER]
  return {'overall':'NOT_READY','continuous_E2E':False,'headless':True,'userdir':'/isolated/'+USERDIR,'counts':{'PASS':0,'NOT_READY':len(rows),'FAIL':0},'stages':rows}
 def test_partial_is_valid_diagnostic(self):self.assertEqual(validate_result(self.fixture()),[])
 def test_fake_global_pass_rejected(self):
  r=self.fixture();r.update(overall='PASS',continuous_E2E=True);self.assertIn('overall_claim',validate_result(r))
 def test_missing_stage_and_wrong_namespace_rejected(self):
  r=self.fixture();r['stages'].pop();r['userdir']='/real/user';errors=validate_result(r);self.assertIn('stage_order_or_coverage',errors);self.assertIn('isolation_claim',errors)
 def test_claimed_equip_with_wrong_readback_rejected(self):
  r=self.fixture();row=r['stages'][ORDER.index('equip')];row.update(status='PASS',evidence={'applied':True,'same_item_equipped':False});r['counts'].update(PASS=1,NOT_READY=len(ORDER)-1);self.assertIn('equip:same_item_equipped',validate_result(r))
 def test_checkpoint_cannot_be_continuous(self):
  r=self.fixture();r['stages'][0]['checkpoint']=True;r['continuous_E2E']=True;self.assertIn('continuous_claim',validate_result(r))
if __name__=='__main__':unittest.main()
