import sys, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools'))
from audit_demo11_i18n import extract

class AuditScopeTests(unittest.TestCase):
    def test_named_basic_array_does_not_depend_on_line_number(self):
        source='\n'*600+'const BASIC_LABELS: Array[String] = ["\uac00", "\ub098"]\n'
        rows=extract(source,'native_parry_lesson_flow.gd','fixture')
        self.assertEqual([x['text'] for x in rows],['\uac00','\ub098'])

    def test_comments_and_shader_are_not_display_strings(self):
        source='# "\uac00"\nfunc _build_ui():\n var s="""shader_type canvas_item; // \ub098\n"""\n var ui="\ub2e4"\n'
        self.assertEqual([x['text'] for x in extract(source,'hud.gd','fixture')],['\ub2e4'])

    def test_multiline_format_and_escape_are_preserved(self):
        source='func _render():\n var ui="\uac00 %d\\n\\\"\ub098\\\""\n'
        row=extract(source,'native_parry_lesson_flow.gd','fixture')[0]
        self.assertEqual(row['text'],'\uac00 %d\n"\ub098"')

    def test_receipt_excluded_and_object_pair_detected(self):
        source='const INTRO_LINES=[{"ko":"\uac00","en":"Open"}]\nfunc get_snapshot():\n return {"diagnostic":"\ub098"}\n'
        rows=extract(source,'native_intro_key_guide_panel.gd','fixture')
        self.assertEqual([(x['text'],x['inline_en']) for x in rows],[('\uac00','Open')])

if __name__=='__main__':unittest.main()
