import os, shutil, sys
sys.path.insert(0, os.path.dirname(__file__))
from sheet import compare
import os
R=os.environ.get('PARITY_OUT', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'exoduser-wt', '_out', 'parity')); W=R+'/web/'; GB=R+'/godot/lobby_b/'; GA=R+'/godot/lobby_a/'; GD=R+'/godot/direct_persp/'; GS=R+'/godot/boss/'
pairs=[
('01a_lobby_title','로비 첫 화면: 웹 타이틀(스플래시) / Godot 로비', W+'01c_splash_title_t7s.png', GB+'01_lobby_first.png'),
('01b_lobby_main','로비 본화면(빈 슬롯)', W+'01k_lobby_empty.png', GB+'01_lobby_first.png'),
('01c_lobby_storage_gate','Godot 지정 격리명(EXODUSER-parity-capture-...)에서 로비', W+'01k_lobby_empty.png', GA+'01_lobby_first.png'),
('01d_lobby_cinematic','로비 시네마틱: 웹 world_intro 영상 / Godot 인트로 I 정지컷(p01)', W+'01i_cin_world_cut1_t6_1.png', GB+'03c_s0_c00_p01.png'),
('01e_lobby_cinematic2','로비 시네마틱 중반: 웹 영상 t48 / Godot 같은 서사 정지컷 p06', W+'01i_cin_world_cut5_t48_3.png', GB+'03c_s0_c06_p06.png'),
('02a_charselect','캐릭터 선택', W+'02a_charselect.png', GB+'02a_charselect_form.png'),
('02b_char_story','캐릭터 생성 후 전사 스토리: 웹 영상 / Godot 인트로 II 정지컷', W+'02d_story_t3s.png', GB+'03c_s1_c00_cin_war.png'),
('03a_intro_nemesis','게임 인트로(네메시스 INTRO) 같은 컷 02.png', W+'03c_02_02_png.png', GB+'03c_s2_c02_02.png'),
('03b_intro_transition','컷 전환 중간: 웹 크로스페이드 / Godot 즉시 교체', W+'03c_03_trans_mid_cross.png', GB+'03c_s0_trans_after.png'),
('03c_intro_dialogue','화자 대사 컷(헥터 까마귀 11.png)', W+'03c_11_11_png.png', GB+'03c_s2_c11_11.png'),
('03d_guide','눈을 떠 안내 1컷', W+'03d_guide_0.png', GB+'03d_guide_0.png'),
('03e_curtain','커튼 열림 직후', W+'03d_guide_4.png', GB+'03e_curtain_mid.png'),
('04a_field_start','1-1 첫 필드(레슨 패널 포함)', W+'04a_field_first_t4s.png', GB+'04a_field_first_with_lesson.png'),
('04b_field_clean','1-1 필드(레슨 종료)', W+'04c_field_clean.png', GB+'04c_field_clean.png'),
('04c_field_perspective','1-1 필드: Godot run.cmd 인자 --fdg-native-perspective-first', W+'04c_field_clean.png', GD+'04c_field_clean.png'),
('04d_field_walk','북쪽 1.8초 이동 후', W+'04d_field_walk_north.png', GB+'04d_field_walk_north.png'),
('06a_inventory','인벤토리(Tab)', W+'06a_inventory.png', GB+'06a_inventory_tab_key.png'),
('06b_skill','스킬창(K) 학습·강화', W+'06b_skill.png', GB+'06b_skill_K.png'),
('06c_settings','옵션/설정(Esc)', W+'06c_settings.png', GB+'06c_settings.png'),
('06d_pause','Esc 첫 화면: 웹=설정 직행 / Godot=일시정지 메뉴', W+'06c_settings.png', GB+'06c_pause_menu.png'),
('07a_enemies','적 5마리 링(etype0 눈알 육괴)', W+'07a_enemies_ring.png', GB+'07a_enemies_ring.png'),
('07b_lmb','좌클릭 기검참 3타', W+'07b_lmb_combo.png', GB+'07b_lmb_combo.png'),
('07c_damage_numbers','타격 직후 데미지 숫자', W+'07c_lmb_after_dmgnum.png', GB+'07c_lmb_after_dmgnum.png'),
('07d_rmb','우클릭 악의구', W+'07d_rmb_fireball.png', GB+'07d_rmb_fireball.png'),
('07e_skill_space','Space 지옥강타', W+'07f_space_giantslam.png', GB+'07f_space_giantslam.png'),
('07f_skill_F','F 회복의 영역(0.4초 후)', W+'07h_F_holydome.png', GB+'07h_F_holydome.png'),
('07g_skill_ctrl','Ctrl 얼음보주', W+'07i_ctrl_iceorb.png', GB+'07j_after_combat.png'),
('08a_shift','Shift 사슬 이동(홀드 0.7초→릴리즈 직후)', W+'08b_shift_chain_mid.png', GB+'08b_shift_chain_mid.png'),
('08b_dirspace','방향(A)+Space 전격이동 직후', W+'08d_dirspace_bladedash_mid.png', GB+'08d_dirspace_bladedash_mid.png'),
('09a_fieldboss','필드보스 심연의 앵글러 위치(마커0)', W+'09a_fieldboss_angler.png', GB+'09a_fieldboss_angler.png'),
('09b_enemies','일반 적 자연 스폰 구역', W+'09c_field_center_enemies.png', GB+'09c_field_hole_enemies.png'),
('10a_boss_entry','보스방 진입 연출(약 1.4초)', W+'10a_boss_entry_1.png', GB+'10a_boss_entry_1.png'),
('10b_boss_pattern','보스 외형·패턴(근접)', W+'10e_boss_close_pattern_2.png', GB+'10e_boss_close_pattern_2.png'),
('11a_death_fallen','사망 직후 1초(fallen)', W+'11a_death_fallen_t1s.png', GD+'11a_death_fallen_t1s.png'),
('11b_death_screen','사망 화면', W+'11b_death_screen.png', GD+'11b_death_screen.png'),
('11c_stage_clear','스테이지 클리어', W+'11d_stage_clear_1.png', GB+'11d_stage_clear_0.png'),
('11d_demo_end','클리어 후 다음 화면', W+'11d_stage_clear_5.png', GB+'11d_demo_end.png'),
('11e_lobby_return','로비 복귀', W+'11e_lobby_return.png', GB+'11e_lobby_return.png'),
]
for n,t,w,g in pairs:
    for src,suf in ((w,'web'),(g,'godot')):
        if os.path.exists(src): shutil.copyfile(src, f'{R}/{n}_{suf}.png')
    compare(f'{R}/{n}_compare.png', f'{n}  {t}', w, g, scale=0.5)
# HUD 1x 크롭 (같은 좌표)
crops=[('05a_hud_orbs_skillbar','HUD 하단 구슬·스킬바 1x',(380,850,1160,230)),('05b_hud_topright','HUD 우상단 1x',(1560,0,360,300)),('05c_hud_topleft_minimap','HUD 좌상단 미니맵·화폐 1x',(0,0,420,300)),('05d_hud_dialogue','대화·자막(펫) 1x',(0,620,760,300)),('05e_hud_topcenter','상단 중앙 시계 1x',(760,0,400,120))]
for n,t,c in crops:
    compare(f'{R}/{n}_compare.png', f'{n}  {t}', W+'04c_field_clean.png', GB+'04c_field_clean.png', crop=c)
    from PIL import Image
    Image.open(W+'04c_field_clean.png').crop((c[0],c[1],c[0]+c[2],c[1]+c[3])).save(f'{R}/{n}_web.png')
    Image.open(GB+'04c_field_clean.png').crop((c[0],c[1],c[0]+c[2],c[1]+c[3])).save(f'{R}/{n}_godot.png')
print('done', len(pairs)+len(crops))
