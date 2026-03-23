#!/usr/bin/env python3
"""PixelLab 전체 캐릭터 다운로드 — 완성(✅)된 것만 ZIP으로 받아서 한 폴더에"""
import requests, os, time, re, json

API_BASE = "https://api.pixellab.ai/mcp"
OUT_DIR = os.path.join(os.path.dirname(__file__), "img", "pixellab_all")
os.makedirs(OUT_DIR, exist_ok=True)

# PixelLab API key from environment or config
API_KEY = None
# Try to find API key from MCP config
config_paths = [
    os.path.expanduser("~/.claude/settings.json"),
    os.path.expanduser("~/.claude/settings.local.json"),
]

def find_api_key():
    """Try to find PixelLab API key from various config locations"""
    # Check environment
    key = os.environ.get("PIXELLAB_API_KEY") or os.environ.get("PIXELLAB_SECRET")
    if key:
        return key

    # Check claude MCP config files
    for pattern in [
        os.path.expanduser("~/.claude.json"),
        os.path.expanduser("~/.claude/settings.json"),
        os.path.expanduser("~/.claude/settings.local.json"),
        os.path.expanduser("~/AppData/Roaming/Claude/claude_desktop_config.json"),
    ]:
        if os.path.exists(pattern):
            try:
                with open(pattern) as f:
                    data = json.load(f)
                # Search recursively for pixellab key
                text = json.dumps(data)
                if "PIXELLAB_SECRET" in text or "pixellab" in text.lower():
                    # Try to extract from env or args
                    if "mcpServers" in data:
                        for name, srv in data.get("mcpServers", {}).items():
                            if "pixellab" in name.lower():
                                env = srv.get("env", {})
                                if "PIXELLAB_SECRET" in env:
                                    return env["PIXELLAB_SECRET"]
                                if "PIXELLAB_API_KEY" in env:
                                    return env["PIXELLAB_API_KEY"]
            except:
                pass
    return None

API_KEY = find_api_key()

def safe_filename(name):
    """Make a safe filename from character name"""
    name = re.sub(r'[<>:"/\\|?*]', '_', name)
    name = name.strip('. ')
    if len(name) > 80:
        name = name[:80]
    return name

def list_all_characters():
    """List all characters via REST API"""
    # We'll use the download endpoint directly with character IDs
    # Since we can't easily call REST API without auth details,
    # let's just collect IDs from what we know
    pass

def download_character(char_id, char_name, idx):
    """Download a single character ZIP"""
    safe_name = safe_filename(char_name)
    out_path = os.path.join(OUT_DIR, f"{safe_name}_{char_id[:8]}.zip")

    if os.path.exists(out_path) and os.path.getsize(out_path) > 1024:
        print(f"  [{idx}] SKIP (exists): {char_name}")
        return True

    url = f"{API_BASE}/characters/{char_id}/download"
    headers = {}
    if API_KEY:
        headers["Authorization"] = f"Bearer {API_KEY}"
        headers["x-api-key"] = API_KEY

    try:
        resp = requests.get(url, headers=headers, timeout=30)
        if resp.status_code == 200 and len(resp.content) > 1024:
            with open(out_path, 'wb') as f:
                f.write(resp.content)
            print(f"  [{idx}] OK: {char_name} ({len(resp.content)//1024}KB)")
            return True
        elif resp.status_code == 423:
            print(f"  [{idx}] PENDING: {char_name}")
            return False
        else:
            print(f"  [{idx}] FAIL ({resp.status_code}): {char_name}")
            return False
    except Exception as e:
        print(f"  [{idx}] ERROR: {char_name} — {e}")
        return False

# All completed character IDs collected from list_characters output
CHARACTERS = [
    ("aee24a49-f85f-447f-8674-2255ec9ed0ca", "Exoduser Warrior 84px"),
    ("85c2a4f6-24b5-4609-b2a2-8c731c60a089", "si17 화염 전사 64"),
    ("b0b2c0e5-6e96-42e5-ad45-211205ccd777", "si16 용암의 심장 64"),
    ("420ec8e5-6bb4-4185-a576-f055b13660cb", "si15 불기둥 수호자 64 v2"),
    ("63eae882-1711-45b7-9f5f-9885225ac732", "si33 Killu 64"),
    ("436dd7d4-6659-4dda-8502-7b0f885e4bfd", "si31 대사도 64"),
    ("a1129084-6360-4711-85e6-712bfb93c1cb", "si30 불완전 사도 64"),
    ("96279bb0-8389-4137-b648-01cdb6b2e9ad", "si29 촉수의 어미 64"),
    ("c0cf9b14-e0c4-46a4-8df4-28af7ec6987e", "si28 뒤틀린 자 64"),
    ("0951644b-b8de-41f4-8832-31ce627e3577", "si27 인간뼈 감시자 64"),
    ("67ebcdc0-6a73-49d6-ac74-90da2579cced", "si25 군단 지휘관 64"),
    ("658086fe-7dd2-467d-8e11-8e12c099d274", "si24 철벽 기사단장 64"),
    ("c2fb4c54-7763-40d2-bfb0-6fbc614939e4", "si23 악마 사령관 64"),
    ("332a4758-5a34-4f64-9c6b-1f76806041a3", "si22 뼈산의 왕 64"),
    ("b04d0dcd-03af-424d-b6c5-b5db33af59af", "si20 화염 감옥지기 64"),
    ("252e3e15-9aeb-401e-8453-438326313fdf", "si15 불기둥 수호자 64"),
    ("de630e90-4ca5-4a4b-b47a-b0ccdfcff07a", "si12 얼어붙은 감시자 64"),
    ("6fdbe9af-e54a-469d-bf5e-ddecc2364086", "Fire Bug Lord 64"),
    ("00b37385-d785-4ac6-894f-1c364bc68e47", "Twin-Head Flame 64"),
    ("e27ec914-c75a-4a9e-805c-a2d32eae0a71", "Fire Elemental 64"),
    ("1a9bd635-0306-44bd-98c6-3db2a4ad2159", "Sealed Ice Monster 64"),
    ("2fd3c8db-6a82-4089-8b24-925e7fe20a5b", "Flame Warrior 64"),
    ("6471e881-a4c6-4abc-a8e2-aa8ae49589bd", "Heart of Lava 64"),
    ("89a37326-5f0a-4e03-9d77-a82d4ad9ea0e", "Frost Knight v2 64"),
    ("a0aee1ba-2f88-4b69-a3c9-6c5cff5ae31c", "Heart of Lava 64 v2"),
    ("53a3a7c0-0e5f-40bb-9c76-2e0a955df846", "Queen Maggot 64"),
    ("b985a1de-0195-4da6-8e83-70c7f56d7c0a", "Flesh Wall Lord 64"),
    ("8353a6f7-caf0-465c-a994-3bd9f91314ab", "Giant Egg Sac 64"),
    ("162874ce-f514-4077-95a2-376510aa4a90", "Parasite Mother 64"),
    ("c73619fd-bd04-4b18-84ed-0cb09db43624", "Slime Beast 64"),
    ("ae6c7740-cb0c-46d2-a9fd-9ce43349c62e", "Hell Lord 128"),
    ("870acea0-2f4a-4e3b-80e9-a858588a750e", "Heart of Lava 64 v3"),
    ("e22f22da-9fe3-4f01-b616-432dc15be299", "숲의 사냥꾼 64"),
    ("6c66bd0f-d6de-4c27-8a04-4763cd8eed85", "독버섯 거인 64"),
    ("2aaadbfe-de01-47d8-acdc-22a6118a4130", "검은 성의 수호자 64"),
    ("55a9bb18-6bd9-4590-ab7c-a1753ddf4f0e", "전쟁의 잔해 64"),
    ("1f92d781-b435-4ee3-94d6-6786b1c82aae", "화염 악마 64"),
    ("42c1e9fa-b0e0-43cd-99df-ef0657de215e", "얼음 망령 64"),
    ("121292d0-b9ce-4f88-891b-10738f2b2fb7", "벌레 수호자 64"),
    ("11fd62b3-f776-4041-88be-cea9ca965c91", "etype99 죽음 64"),
    ("af546231-b88b-4e24-aace-55e225013cba", "etype98 차원균열체 48"),
    ("55e3471c-d54f-4572-b4f0-c9cef789c98d", "etype97 쌍둥이 48"),
    ("21bbb382-fc7c-4fa8-940c-f2d304212a61", "etype94 사슬죄수 56"),
    ("cd8d04bc-b706-4eae-acf5-340d2e76e746", "etype93 상인악마 48"),
    ("a1058f5c-c79e-44c9-b695-28d1da1b0b05", "etype87 도플갱어 48"),
    ("14b3c407-d092-4083-b85f-c0e419d354f5", "si3 숲의 기생수 64"),
    ("58aa13c3-4e1a-49e2-936b-15a084c2ec03", "si2 숲의 사냥꾼 64"),
    ("a0a4e68c-56da-4c12-96ac-46636bf9de4f", "si1 독버섯 거인 64"),
    ("cff5daa1-c871-49ce-9c32-432738a75677", "si0 숲의 감시자 64"),
    ("472bf265-e351-4a3e-99ce-8f55e362d67f", "etype90 방랑기사 48"),
    ("e4ea2597-1dd1-49a4-b57a-ea2453fc53a8", "etype96 탐욕사도 56"),
    ("cc4cea8b-2f17-4450-b17f-b1f17f782cd3", "etype91 보물악마 48"),
    ("57cbc095-c399-4ebf-b2e2-3b5ab630dfe7", "etype89 고통의왕 80"),
    ("9dc36266-2b8f-40d3-82fd-a44a8730cb88", "etype88 심판자 64"),
    ("f23164f4-7779-47f5-8379-602869dd51dc", "etype95 시간사도 48"),
    ("428f6101-2ac7-48ae-8fdb-7f7a9307144b", "etype92 거울사도 48"),
    ("c2ca2cd6-cb61-4e57-83ef-fcd882f97063", "etype86 거꾸로천사 48"),
    ("70758076-0cdf-4ef6-8492-0e5d47bf0c78", "etype85 절망기사 48"),
    ("6a8d6737-ad13-4e8c-a7d9-593eda18443b", "구울 중형 v3 48"),
    ("13e472ec-c7fa-4cbd-8e9f-4f2d437de89c", "대형 구울 v2 64"),
    ("bd186162-d6f8-411a-857e-b33dbfc47f1b", "소형 구울 v2 32"),
    ("95c022cd-d4cc-42e9-b9c7-95e3bfdff716", "대형 구울 64"),
    ("2951be10-4764-417a-b040-d6cc866580ff", "구울 중형 48"),
    ("a6626284-1024-4bf0-adc3-80de616b4969", "소형 구울 32"),
    ("563b4901-a4f5-46b8-a772-52fc77af85e9", "Large Ghoul 64"),
    ("1bfd4d52-544d-482c-aee8-adf68d71891f", "Ghoul 48"),
    ("90de1a8b-6ec4-41f9-a51a-fc1d072702d1", "Small Ghoul 32"),
    ("5478eac1-6c25-4be8-a19a-7325122db5ae", "지옥 군주 si34 128px"),
    ("013f40cf-ce3e-48a1-8d6f-1c22ca95e18f", "Killu si33 128px"),
    ("e00c4103-65d9-441d-824d-ca69635e53ba", "촉수의 어미 si29 128px"),
    ("916a98d9-c428-420a-b2fb-ac4e46017219", "불완전 사도 si30 128px"),
    ("ae5260c4-021a-4193-ab5d-72aa7ac70f44", "대사도 si31 128px"),
    ("eac3486e-f5fe-40e2-be83-2338fbbdfc18", "악마 사령관 si23 128px"),
    ("a52fff24-84f2-4cf6-ae50-58ee8f7337aa", "뼈산의 왕 si22 128px"),
    ("2a418a8b-4cff-4ef6-b778-f382d9d8514b", "뒤틀린 자 si28 128px"),
    ("a701f6bb-0b9e-43c2-9032-20bced23be0c", "전쟁의 잔해 si21 128px"),
    ("fa4f104b-a5f2-492d-a58d-2055beea9f3e", "화염 쌍두 si18 128px"),
    ("5c87fd84-bb5f-4684-a2e0-3a38d730a7d5", "불벌레 군주 si19 128px"),
    ("30aa161e-deb8-4f8f-aa4d-a6eef3fa94c9", "화염 전사 si17 128px"),
    ("d9f8d46c-3168-47bc-9b73-21e3ab579202", "기생충 모체 si6 128px"),
    ("4f14ec9e-3d11-44f2-89fc-e7f99f930a86", "용암의 심장 si16 128px"),
    ("ac005eb3-8fa1-42ff-8a73-a74a9253faf5", "점액 괴수 si5 128px"),
    ("e497bf22-afb6-4fbd-9956-a3a573b70443", "군단 지휘관 si25 128px"),
    ("a64c3865-6b26-40f9-8e7f-514f75dfc4c5", "화염 감옥지기 si20 128px"),
    ("d20a68b8-7aa4-4fc0-903c-b78d30ee9d76", "전쟁의 잔해 si21 64"),
    ("4e4de333-47dd-4cf2-bbbc-9257ca4a5d90", "화염 감옥지기 si20 64"),
    ("fc7c13ad-f119-448c-8b26-6a4c61f8f924", "불벌레 군주 si19 64"),
    ("96af806e-e88f-4ee8-add9-af4766a64fb4", "화염 쌍두 si18 64"),
    ("676ffb64-22bd-4602-ae20-84d56f11038e", "화염 전사 si17 64 v2"),
    ("3b5ebd6b-7d34-4f68-98c0-3098d343b45d", "용암의 심장 si16 64 v2"),
    ("febde164-3705-47b6-87bf-5a279a236019", "기생충 모체 si6 64"),
    ("9129b68a-0422-4731-984b-71374b43eaf5", "점액 괴수 si5 64"),
    ("7844d3a8-f538-4464-9042-d533f1ed704c", "Bone Mountain King 64"),
    ("b479aeaa-8d16-48d3-b2f2-48396709fe43", "War Remnant 64"),
    ("8e80845c-8e57-4c8e-bc4f-9fb02d7b3089", "Flame Jailer 64"),
    ("4f8d41a6-c4d1-4b61-9855-62cd78f6d205", "Fire Bug Lord 64 v2"),
    ("47d9f24a-70f7-4baa-b280-c5ceceebed24", "Flame Twin-Head v2 64"),
    ("12dbbe7a-cb5f-48e6-9969-e8e8817f99cb", "Lava Heart v2 64"),
    ("92cbed4e-e62e-4703-b3ae-440f3c896b8d", "Parasite Mother v2 64"),
    ("f49879cd-dbef-46bf-bf37-c40c585fe8e7", "Slime Beast v2 64"),
    ("5611994a-cf1b-4bd7-bf13-70e62cfb63d1", "Fire Pillar Guardian 64"),
    ("f439ac1a-8e68-43b2-8730-98cf4bb180ee", "Frozen Watcher 64"),
    ("682accd7-59f7-4808-b511-d7a885f6eff3", "Frost Knight 64"),
    ("f1ad6f25-acaa-4456-9412-123f34f50e18", "Maggot Queen 64"),
    ("2a0ad7e2-ebee-4440-90d6-e476bbb0e13b", "Flesh Wall Lord 64 v2"),
    ("7373792a-1677-4526-a739-e741f26b8ac0", "Giant Egg Sac 64 v2"),
    ("3a2da704-1f0e-43c8-b59c-01875b67a3e4", "Bone Watcher 64"),
    ("999b30cb-3ba6-48de-8f7b-5feb8a8715dc", "Iron Wall Captain 64"),
    ("a5f1459a-833b-4626-ba46-92a90bfd692b", "Sealed Ice Beast 64"),
    ("569a8dae-5c82-4ec7-b1e9-c72c6cbba917", "Parasitic Tree 64"),
    ("c87078ff-8714-4c7e-9d22-b7d1690235e7", "Forest Hunter 64"),
    ("f6274b19-dcd9-4190-a703-f6f413bcd7bc", "Poison Mushroom Giant 64"),
    ("3649fbdf-6a24-498c-a623-17a05a99e803", "h84 48"),
    ("9eb210f3-b2a3-4b0b-91e1-3b6b9ef4ebb7", "g76 32"),
    ("2bdcafdb-d69f-402f-bcc2-0c6a1f7c858a", "g75 48"),
    ("c6065a7a-58f3-4131-9003-5c63de52c6d2", "g73 48"),
    ("53de6959-f236-45fd-858e-984cf2fdaabe", "f72 48"),
    ("e55cb680-ab93-4f48-aada-cd705d921d22", "f71 48"),
    ("f207c06d-da90-4a0e-b266-5d2251a0a837", "f66 48"),
    ("ef8092dd-cb2d-485e-9e1f-77656538c22e", "t69 64"),
    ("e2e21af3-0c56-4a4e-a0a8-ed0eae344e3f", "t67 48"),
    ("09c56658-cec3-4260-8692-dc5cd01a549b", "t65 48"),
    ("ad253afc-7765-41aa-b09d-6d7e9b11b8b0", "t64 32"),
    ("5732ed66-84b6-44a7-85d0-8d7de175f82f", "t63 48"),
    ("f4ced43b-8228-438d-8a0b-e4c9e9bbb076", "War Wreckage v2 64"),
    ("836c676f-2544-4f16-8552-e2efe362bc6e", "e77r 64"),
    ("dc2fa6f0-1c6e-4b89-842d-9e57fe23ae31", "Parasitic Tree 64 v2"),
    ("b5e2c693-5c11-40e3-9068-880345d136e4", "e62 48"),
    ("6ca32217-f1c1-491f-916a-fbafa55223b9", "e61 56"),
    ("fa65219d-a2f0-4597-b265-4b7b0407e2b2", "e39 80"),
    ("52addfdc-e66e-4ea5-8db6-14d34e1c8ee8", "etype83 48"),
    ("59fa9855-42bf-4c97-b758-19a26d1b302d", "etype35 48"),
    ("7950ccab-970c-479f-8937-f4b891ef72fe", "etype34 48"),
    ("0118fccf-e5fc-43bb-919a-fda3fffc6c80", "etype82_lavaSkin 48"),
    ("4dd5b9a9-279e-4489-a07e-59aad62e63ee", "etype78_flamePriest 48"),
    ("bd8e715e-dd18-4f41-ac94-2a49c84611a0", "etype74_obsidianKnight 56"),
    ("2f5a7cea-18c4-4963-85c1-3fb64c2c239e", "etype36_serpentApostle 48"),
    ("26481f37-fbb2-40c4-8fb1-cae4e5d085f8", "etype33_miniDemon 32"),
    ("922391c8-9069-4b9c-b91c-d51ca5137bed", "Forest Hunter 64 v2"),
    ("eb9bd17e-15d8-46e2-98fa-a0936ce81b8c", "Poison Mushroom Giant 64 v2"),
    ("5a3652a4-a78c-4234-9531-878be849415a", "etype32_boulderApostle 64"),
    ("18da29ed-32d8-4a12-8399-3f9c12029e12", "etype31_thornApostle 48"),
    ("8e213f58-47a0-45a6-9950-b46c204136b1", "etype29_iceDevil 64"),
    ("15e43a55-0ffd-4c95-a791-5ddf2934a034", "etype28_glacierGolem 64"),
    ("de26108e-6bd8-4ab1-bca5-0b72699f9f3c", "etype27_icicleBat 48"),
    ("dc707f72-8873-4f8d-b6ea-6a6be5030aed", "etype70_flameWalker 48"),
    ("d1949c2b-dca7-4bfd-b7d8-11390e7e34a7", "etype30_huntDog 48"),
    ("ef8bf5fa-0546-4dbe-9c85-09768da3d526", "etype81_iceSkin 48"),
    ("4f05ab7f-c0ad-4ede-9a42-f3f5ceedd069", "etype80_bugSkin 48"),
    ("6964333f-4a6e-444d-bc66-a15a57a26424", "etype79_dragonApostle 80"),
    ("fffd7e58-1c47-4b2e-95e5-be85fd8c62ba", "etype26_blizzardMage 48"),
    ("c583cac8-aef5-465e-b126-e8f0e8e6d33d", "etype25_iceSlime 48"),
    ("c99cebea-f559-4a58-aafd-231895968227", "etype24_frostZombie 48"),
    ("00896711-6384-4af3-ab10-e302fdb0411f", "Hell Lord 64"),
    ("9b1705ff-0d1a-4984-94a9-f618f536b079", "Flesh Abomination 64"),
    ("fbbcf34d-1324-4037-a7d7-824b45cd9888", "Flame Demon Lord 64"),
    ("5c617d61-bf0c-4201-a2f7-37bba4777edd", "Ice Wraith Lord 64"),
    ("4994d2a3-81b7-41ac-ae42-7cfa120ae9cb", "Bug Queen 64"),
    ("c1704a51-f9e4-425b-b2c6-f0a2ebf472f5", "Forest Guardian 64"),
    ("59eef517-dec3-4090-8dd5-de8b256aa33c", "Angler Devil 48"),
    ("fcf2fc52-03a2-4643-ba22-556301f67a13", "Frost Wolf 48"),
    ("4ebaf86c-115a-4a53-ac2f-213b5962a65b", "Ice Archer 48"),
    ("43a2c159-90f0-4f87-af2b-84632fe8010a", "Frost Warrior 48"),
    ("78a3508d-987b-4202-9074-69122166a394", "Ice Elemental 48"),
    ("af97b810-b51f-4eed-89b5-8eb2b59f51e1", "Frost Wolf 48 v2"),
    ("8f4f3403-15c2-417a-bc64-74ed7cc568a3", "Womb Apostle 48"),
    ("ba122f00-6898-4715-8daf-09951753f3f8", "Shadow Apostle 48"),
    ("3f1459b4-d19f-4d1b-86e4-a218c6b906dd", "Hell Priest 48"),
    ("172a956d-2daf-4bcd-9055-c254ac164842", "Shadow Twin 48"),
    ("a8d4cf55-dc56-4b06-897d-7bfbac0cdaf9", "Pillar Demon 64"),
    ("5c1e9837-b451-442a-bc5c-eedc4e566d1e", "Winged Demon 48"),
    ("698c604a-a3a0-4b32-9ac3-5b6adde1bf70", "Demon Dog 48"),
    ("846598d0-48c2-4bec-a55d-f5299f761e92", "Flesh Blob 64"),
    ("bf404f4d-eb52-4d8a-8354-bcdc1f7091f3", "Minor Wraith 48"),
    ("fc6edd7f-9b45-43de-afb5-2d8f871b26c7", "Giant Demon 64"),
    ("3571ef22-534f-48e7-bda9-61974e7d47fb", "Splitter Worm 48"),
    ("60724a06-5a6b-4c4b-bc51-5bc0f32ca0b6", "Mother Apostle 56"),
    ("61eab2a6-ae28-4d6f-8e0a-58ce5cc9ed4b", "Trapper 48"),
    ("c2037138-822d-46ff-9192-bdce77309bd7", "Wing Apostle 48"),
    ("10bcc151-1675-4f37-9c49-3e1674dd3dd9", "Flesh Demon Lord 80"),
    ("38678c47-2d79-470f-b27b-878a9855108e", "Mirror Knight 64"),
    ("08a853a3-460f-4c01-ac8f-15f3b37ab440", "Pale Giant 48"),
    ("4538fb3d-053c-4662-ab82-b8ba4938a3bb", "Ghost Wraith 48"),
    ("edade070-534f-47bb-9d99-5a0c02ce4fdc", "Eye Creature 32"),
    ("805e381b-f1f0-44be-ad12-e0c4cd8115ec", "Mouth Monster 64"),
    ("01ba16c4-9e50-405b-af7c-bb6e0efac77c", "Fusion Mass 64"),
    ("d2c8bba2-0578-4c93-a736-f4f84e79fbe6", "Deformed Walker 48"),
    ("08979f59-c0ac-4168-b010-4a4be422c393", "Fusion Creature 48"),
    ("2c210031-449f-42cf-8acf-94df99c7ae40", "Deformed Walker 48 v2"),
    ("9c88b5aa-084e-4974-a6fd-bc892cf2652f", "Skinless One 48"),
    ("69111340-fb66-443f-92af-7f39c11440ef", "Bone Beast 48"),
    ("655de46e-e797-4200-8a94-1df6ca7059c5", "etype68_abyssalFish 64"),
    ("8df139d5-aeb6-4fbc-9755-eb45dd9460a0", "etype60_deepWalker 48"),
    ("1a7ad229-7c37-4dfb-a773-5716f2ae80a4", "etype38_broodApostle 64"),
    ("8eafaf21-2806-4e49-a66b-5b1dd83d0e0b", "etype37_predatorApostle 48"),
    ("2343a466-8ec4-4dfa-98ed-32a4dd99ef05", "Arch Demon 56"),
    ("7d82722e-5c36-42f4-aeed-3fa64067f517", "Torturer Demon 48"),
    ("e07e2fd4-dd3c-4703-b448-8359d9a2e3fc", "Fallen Knight 48"),
    ("8beffe51-1462-4fd9-ac49-6a0b4c89d6c9", "Vampire Apostle 48"),
    ("d2c89b20-b39a-4f83-9e60-fbf73fe0e7b1", "Spider Apostle 48"),
    ("88816e15-ca66-451b-b03c-cee6732008e2", "Berserker Demon 48"),
    ("0d9cb900-bad9-41b2-bf31-d818fdcadd42", "Hell Spider 32"),
    ("ab4408d4-e561-4ae1-9fff-0bef772f9feb", "Dark Sorcerer 48"),
    ("22f73604-7d97-455b-98cd-ee528841e64f", "Berserker 56"),
    ("aded8e4e-eb4f-4e62-9f96-ad029337007f", "Womb Horror 48"),
    ("77260ee8-bfc9-4523-95b3-fb5424b50906", "Shadow Wraith 48"),
    ("81c54e4f-afd4-44eb-814a-14cd0409a351", "Greatsword Knight 48 8dir"),
    ("caa14af4-334e-4350-9f75-d4a2f6c5879b", "Alchemist 48"),
    ("90782c47-0717-4d32-9f0f-ed9ed2a53f8e", "Lich 48"),
    ("07f74d22-0442-4c39-80eb-577e61f6be37", "Shield Knight 52"),
    ("00d31b60-0c50-4d11-b990-7adf21a720a5", "Suicide Bomber 48"),
    ("c49f01cb-e029-489b-8519-2e39d0a6b100", "Heavy Tank 56"),
    ("943318e7-9978-4a71-90c5-dcfa3c65ea56", "Swarm Imp 32"),
    ("5e009a81-bdce-4cc2-943d-3dd42575171b", "Charger Demon 48 8dir"),
    ("ac12e1f1-66fd-45ef-bad9-2e2111fc6de2", "Skeleton Warrior 48 8dir"),
    ("a1d5850d-3aa9-4069-96b6-47cbdfff2e19", "Skeleton Archer 48 8dir"),
    ("0ee9ccfe-4332-40b5-b70c-fd030079bdc6", "Dark Cat Companion 32 8dir"),
    ("e66bfb95-591d-411a-991b-66a8ef916109", "War Crow 32 8dir"),
    ("75b16566-ff9e-4369-b97e-1873617b0b33", "player_warrior 48 8dir"),
    ("a0c4666c-0966-4ede-bc41-39b1fb245bd8", "mob_82 48"),
    ("d09f0058-2f1b-47a1-a499-36bbc3477ce0", "mob_81 48"),
    ("426dbf5e-8ae7-4875-9f73-9afdb0611b97", "mob_80 48"),
    ("3a6dfaca-5936-46d3-b6ea-fe2e8838e264", "mob_99 48"),
    ("25887ebe-e74a-402e-9842-ab2b51414fce", "mob_98 48"),
    ("bad902a3-bd1d-4b98-9263-47d20f1e0ac9", "mob_97 48"),
    ("b48a82fd-e05c-41ab-8566-de7b11224b91", "mob_96 48"),
    ("5864a73c-61d4-48aa-adf9-8e70ff4cbe0a", "mob_95 48"),
    ("b7be22e7-162a-4bba-834e-37bfee0542e6", "mob_94 48"),
    ("39f4e995-028e-47a1-8aaf-4141e7547be8", "mob_93 48"),
    ("8d32685f-7b59-40e7-9a4d-02416f5015cf", "mob_92 48"),
    ("fee3a63e-a342-408f-bc8a-82487542790b", "mob_91 48"),
    ("3413d74c-55ab-4a9a-aee0-2a3473dc9441", "mob_90 48"),
    ("5b767af3-430e-41c8-b56d-65f1fa7beda2", "mob_89 48"),
    ("d2767353-4820-47d2-af79-0d6552a657c1", "mob_88 48"),
    ("8ea5b783-e8db-485f-8510-1db34d8ba471", "mob_87 48"),
    ("90d089e9-8bf0-4ef8-adf2-88cfd929603c", "mob_86 48"),
    ("e1357cb2-5804-445e-828d-7a231cd00502", "mob_85 48"),
    ("43ce3539-9364-44ec-9a9e-d9337924c0a1", "mob_84 48"),
    ("cb0f78e5-dd13-4982-a69a-0d5f0881bb3a", "mob_83 48"),
    ("09141031-f3ae-4276-be66-32e75e478e64", "mob_82 Iron Maiden 48"),
    ("b6857e5f-fdc4-48c6-abba-e207e8465178", "mob_81 Torment Shade 48"),
    ("c93b9b48-8447-4fb8-be77-60aeb3048d3d", "mob_80 Pain Crawler 48"),
    ("414f1ebf-9e6e-47f8-8bcb-22f5f393c3f5", "mob_79 Volcano Lord 48"),
    ("54150e67-8786-458c-9c53-dbe7483ca5e2", "mob_78 Cinder Mage 48"),
    ("e1c362b6-8c70-4e26-9e1a-1daf3a1e6211", "mob_77 Forge Demon 48"),
    ("4e9709a2-f502-4865-a6ca-507a2005c467", "mob_76 Magma Worm 48"),
    ("795347b7-f618-465b-b2d9-e5d22fbc276c", "mob_75 Salamander 48"),
    ("33cc01ff-3461-44ab-80c3-073b060b6104", "mob_74 Ash Zombie 48"),
    ("912cf7b2-762b-47ed-846c-78cce0a8c730", "mob_73 Obsidian Knight 48"),
    ("45338c58-61ee-433c-a0a9-5714816ca69d", "mob_72 Fire Wraith 48"),
    ("ba7a1ff9-0e13-473d-b9b2-240613971336", "mob_71 Lava Golem 48"),
    ("f6991825-4957-4543-98dd-fc347a3e9bfd", "mob_70 Magma Imp 48"),
    ("85e52aa5-ffdd-4acf-89ee-7a714f2eb596", "mob_69 Leviathan 48"),
    ("4c3ecef8-c6fb-4bb6-a36a-e3bfeedcfa6d", "mob_68 Kraken Spawn 48"),
    ("bdef3dba-71a8-411b-ad02-c5959d6c0acc", "mob_67 Tide Cultist 48"),
    ("fe4cd1a8-dd91-4385-ab8f-7d960c29fd40", "mob_66 Barnacle Knight 48"),
    ("c5cc8988-0091-4306-a2a4-2cdb5dd6c401", "mob_65 Siren 48"),
    ("1a96e37c-2610-4eb5-9229-a310c36c5f00", "mob_64 Abyssal Angler 48"),
    ("f721d9bf-0b96-4169-9ce5-0f441f3df565", "mob_63 Jellyfish Wraith 48"),
    ("70890253-5847-42f7-b314-e0f2fa2289a4", "mob_62 Coral Golem 48"),
    ("826683eb-c5ad-4b66-bf13-e35963d7bb70", "mob_61 Drowned Sailor 48"),
    ("00d2989d-8f4d-4b18-8d80-2726a0189c91", "mob_60 Deep One 48"),
    ("e4ce12bd-b859-4d81-b2e0-59cede8b5c5a", "mob_59 Monster Lord 48"),
    ("49e0a293-6f20-4075-b6c2-a4965629b215", "mob_58 Mirror Monster 48"),
    ("104b73af-61cf-4bce-93fa-65310fd97f31", "mob_57 Fetus Giant 48"),
    ("4f023f95-7841-40d2-b77b-4d6a8afe546d", "mob_56 Skinless One 48"),
    ("30c1f879-1982-43ac-aa8c-1543f3ba5c98", "mob_55 Bone Beast 48"),
    ("ec8b5b36-f12b-43ca-88e2-18600133cf80", "mob_54 Hanging Crawler 48"),
    ("5c94f4c9-1492-4532-9b98-74e7aad26ff6", "mob_53 Eye Monster 48"),
    ("590bd5e2-0e79-4d60-8446-bce4b3056145", "mob_52 Mouth Monster 48"),
    ("75e1161a-e47a-40c7-a5e6-b6c180922422", "mob_51 Fusion Beast 48"),
    ("33a62674-5d9e-40ad-8566-b78ee3db565e", "mob_50 Deformed Walker 48"),
    ("3095f200-7b27-410c-8e9a-a9e43fb26461", "mob_49 Archdemon 48"),
    ("aebda570-68b8-4f93-a881-05b56778c428", "mob_48 Hell Priest 48"),
    ("57630173-9a7c-4293-8231-0ced5df41292", "mob_46 Pillar Demon 48"),
    ("e29a0f48-fb86-4309-bf79-433bae75b735", "mob_47 Shadow Twin 48"),
    ("3d46a7de-1b0c-4ae2-b50e-8949e908a686", "mob_45 Winged Demon 48"),
    ("ffae2617-b405-4227-bbec-b9384d20905e", "mob_44 Torturer 48"),
    ("5360e11f-1976-4328-b3e7-d4307845ed2b", "mob_43 Hell Hound 48"),
    ("7193045f-3cff-463e-8665-333d39ee0cc4", "mob_42 Flesh Heap 48"),
    ("d9c3e0af-ad43-4f47-8881-d838dda822f0", "mob_41 Fallen Knight 48"),
    ("158b3a48-192a-4fb9-b6d9-a2260b76c5f5", "mob_40 Lesser Wraith 48"),
    ("06f82060-fca1-4efe-beba-cc29f5c586ee", "mob_39 Wild Arch-Apostle 48"),
    ("6f4bec16-4dca-42b1-a19c-e6b1792a8616", "mob_38 Spawning Apostle 48"),
    ("372a83e5-3824-4497-ba54-a36d33306151", "mob_37 Predator Apostle 48"),
    ("0880a3c0-ae45-4ed6-92d4-7554d664ff41", "mob_36 Serpent Apostle 48"),
    ("af66bdf2-3279-4269-a33a-2603ffdd5cc9", "mob_35 Beast Apostle 48"),
    ("80885931-72d7-4120-bdf6-bd09c34d5fcc", "mob_34 Corrosion Apostle 48"),
    ("f711eb04-9939-49ec-bf16-c22255e023fa", "mob_33 Small Yoma 48"),
    ("a94bf82d-27ac-4bcb-adc9-22b8b21e147d", "Beast Apostle 48"),
    ("95d12837-6297-465d-baad-a4cd52099c21", "Corrosion Apostle 48"),
    ("4a776060-5b98-4b9b-862d-eea46913b8b3", "Small Yoma 48"),
    ("3540e37f-d2ad-4e3f-9953-97ce068da6f1", "Boulder Apostle 48"),
    ("dee6590c-1ba0-4eac-ba0a-51e9635378ec", "Spike Apostle 48"),
    ("deff6787-c0aa-488c-abce-d21661e9dac7", "Hound Apostle 48"),
    ("99427529-bd1e-4278-9249-1c0e4cbf73d7", "Ice Devil 48"),
    ("27449bce-5092-4273-9cd7-3acec9ffb34c", "Icicle Bat 48"),
    ("8f39506b-2960-47bb-8eff-da75c461b621", "Blizzard Mage 48"),
    ("55037d5b-5ccf-44fd-8267-6c413e227ac3", "Glacier Golem 48"),
    ("6e59fa54-03f6-4150-9ad8-3f477f106205", "Ice Slime 48"),
    ("6b69dc4c-8727-4624-bbed-02ae699f7880", "Frostbite Zombie 48"),
    ("33e99c2b-b751-4c96-bfee-7870e991a4d0", "Ice Elemental 48 v2"),
    ("e3f094e3-a656-4ca2-88a6-fe00be98f80a", "Frost Wolf 48 v3"),
    ("a95b150d-06a4-491f-967c-86b9edd97553", "Ice Archer 48 v2"),
    ("8a984a03-11ff-4e07-9962-d464c6ed4b8b", "Frozen Warrior 48 v2"),
    ("6e9031b5-10b2-40be-b04e-94383d152bb2", "Vampiric Apostle 48"),
    ("667c4224-a7ed-48e8-a0af-4ebc3a82a7d6", "Giant Apostle 48"),
    ("be5cfd4a-7409-4692-99e0-beeeab6ca423", "Trap Apostle 48"),
    ("ca64289d-5ed4-4037-a467-739951f35960", "Fission Apostle 48"),
    ("16ed96bc-dabb-428c-85cc-424b436adf8b", "Mother Apostle 48"),
    ("2e5df6ff-7f2b-47e7-9922-a47dfd653202", "Wing Apostle 48 v2"),
    ("50537e67-8e06-4c67-97bc-18f36ee372b3", "Spider Apostle 48 v2"),
    ("5daf8aa2-83ef-45bf-81d7-1a02e7581d6a", "Berserker Apostle 48"),
    ("b5d7c296-830c-4b5d-a3d7-03bf55ab0191", "Womb Apostle 48 v2"),
    ("7e391f1b-f493-47bb-a2c4-439b51f0dd33", "Shadow Apostle 48 v2"),
    ("91734898-a482-41e5-8f5b-f4823e53ddb4", "Skeleton Archer 48"),
    ("b0fa61ed-de0c-4e76-8eca-517227107d7b", "Sorcerer 48"),
    ("1ac19222-dfc4-4562-b3b6-ca5e39f3d96e", "Alchemist 48 v2"),
    ("75b49f58-a7d8-48c1-8942-c435398463a4", "Lich 48 v2"),
    ("175a3a4f-4a93-43a4-b294-1279e01c19a9", "Shield Bearer 48"),
    ("bcb95657-0c14-401e-920a-6d451318ba6c", "Suicide Bomber 48"),
    ("26a9e3d6-3ca9-4f13-918e-d82e7789ed56", "Tank 48"),
    ("a6f6ec20-c135-4dcf-bd80-eeed7a0e1385", "Swarm 32"),
    ("ef734a43-a42c-4ae5-9950-65e5a8c0ba89", "Charger 48"),
    ("ab8d6968-77e4-4167-afb7-e5d4242b61ef", "Skeleton Melee 48"),
    ("bec90804-c6f4-469b-b033-689c5b86950f", "Exoduser Warrior 48 8dir"),
    ("11f2dd17-3cd3-4225-bf64-ad0f092d72f0", "HellRoadWarrior 48 8dir"),
    ("173bce2a-e800-4488-b578-99abdf7980e0", "Boss10_ChaosLord 48 8dir"),
    ("38611a65-5cd8-4ede-894a-1c286f9f0403", "Boss09_FallenAngel 48 8dir"),
    ("f846a2e4-f0cc-4f49-8893-8f72b8874850", "Boss08_DarkKnight 48 8dir"),
    ("7865492f-ff46-4420-a742-ebd868a18371", "Boss07_VoidBreaker 48 8dir"),
    ("9a0507f8-7da9-4f07-82b6-897aa2a6cf47", "Boss06_SkeletonKing 48 8dir"),
    ("9191ca8d-fe85-413b-8a17-14cf1b825415", "Boss05_ThunderGod 48 8dir"),
    ("c7a83b3d-e2fb-4964-9404-82d8cae45ed6", "Boss03_FlameLord 48 8dir"),
    ("6f49fd07-b72d-4aac-9ddd-d51fe8af3a44", "Boss04_AbyssEye 48 8dir"),
    ("2a36379c-2aee-49b9-a75b-60b2a77d5ef1", "Boss02_SpiderQueen 48 8dir"),
    ("b43df98b-6c76-4e0b-a843-5cb0f1a25310", "Boss03 Flame Lord 48 8dir"),
    ("45ebdd95-efb6-4dbb-8ce7-297f4fd5b20b", "Boss02 Poison Queen 48 8dir"),
    ("3ec5db09-8319-42ab-841c-2c95a5ee92e8", "Boss04 Abyss Eye 48 8dir"),
    ("dcaa87c1-fb0a-4b74-b3bd-26b299475021", "Boss01 Ice Knight 48 8dir"),
    ("ebad4ecf-3db6-4b03-bcd7-ef5c86e1444c", "Ice Knight 48"),
    ("8280e5cd-bd69-4637-b61f-74ba8e7c020b", "colossal ice knight 48 8dir"),
    ("d6a07b31-4417-4e71-a98b-4e5d8d951ec1", "dark fantasy warrior 48 8dir"),
    ("bbc91a7f-9346-4790-accb-1b45509ce80e", "dark fantasy skeleton 48 8dir"),
]

def main():
    print(f"Total characters to download: {len(CHARACTERS)}")
    ok = 0
    fail = 0
    skip = 0
    for i, (cid, name) in enumerate(CHARACTERS):
        result = download_character(cid, name, i+1)
        if result:
            ok += 1
        else:
            fail += 1
        # Small delay to avoid rate limiting
        if (i+1) % 10 == 0:
            time.sleep(0.5)

    print(f"\nDone! OK: {ok}, Failed: {fail}")
    print(f"Saved to: {OUT_DIR}")

if __name__ == '__main__':
    main()
