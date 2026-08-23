import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/"assets"/"schedule-layers-v2"
DATA={
"classics":("고전 수업","calligraphy","../../backgrounds/phase-scenes/study.webp","npc/tutor/idle",("props/book-stack","effects/open-manuscript","failures/scattered-books","failures/ink-spill")),
"masonry":("석공 보조","masonry","../../backgrounds/phase-scenes/woodwork.webp","npc/mason/idle",("props/chisel-block","effects/fitted-wall","failures/cracked-stone","failures/wobbling-stack")),
"clinichelp":("의원 보조","clinichelp","../../backgrounds/phase-scenes/clinic.webp","npc/physician/idle",("props/herb-mortar","effects/medicine-packets","failures/spilled-herbs","failures/wrong-medicine")),
"innhelp":("주막 운영 보조","merchanthelp","../../backgrounds/pixel-activities/close/market-errand-v2.webp","npc/hostess/idle",("props/meal-tray","effects/payment","failures/spilled-tray","failures/mixed-orders")),
"ferryhelp":("나루터 운송 보조","ferryhelp","../../backgrounds/phase-scenes/ferry.webp","npc/ferryman/idle",("props/boat-cargo","effects/stacked-parcels","failures/loose-parcel","failures/wet-crate")),
"merchanthelp":("상점 판매 보조","merchanthelp","../../backgrounds/phase-scenes/merchant.webp","npc/merchant/idle",("props/goods-display","effects/coin-exchange","failures/toppled-goods","failures/wrong-change")),
"accounting":("회계 보조","arithmetic","../../backgrounds/pixel-activities/close/arithmetic-room.webp","npc/accountant/idle",("props/abacus-ledger","effects/balanced-tally","failures/scattered-coins","failures/wrong-ledger")),
"tutoring":("글공부 지도","calligraphy","../../backgrounds/pixel-activities/close/study-room-clear.webp","npc/tutor/idle",("props/writing-desk","effects/praised-pages","failures/scattered-papers","failures/ink-blot")),
}
for activity,(name,hero,background,npc,layers) in DATA.items():
    patterns={}
    for key,prefix in zip(("success-a","success-b","fail-a","fail-b"),layers):
        folder,stem=prefix.split("/"); patterns[key]={"layer":"effects" if folder=="effects" else "props" if folder=="props" else "failures","frames":[f"{prefix}-{i}.png" for i in range(1,4)]}
    spec={"version":"2.0.0","activityId":activity,"nameKo":name,"status":"review","existingHeroFrames":[f"../../characters/seonhwa/schedule-actions/{hero}-pixel-{i}.png" for i in range(1,4)],"existingBackground":background,"animation":{"sequence":[1,2,3],"loopCount":3,"frameDurationMs":300},"npc":{"id":npc.split('/')[1],"frames":[f"{npc}-{i}.png" for i in range(1,4)]},"patterns":patterns,"placement":{"heroLeft":"30%","floorBottom":"4%","npcLeft":"77%","npcScale":0.82,"propLeft":"51%","propBottom":"3%","effectLeft":"53%","effectBottom":"3%"},"layerOrder":["existing-background","npc","existing-seonhwa","props","effects","failures"]}
    (BASE/activity/"manifest.json").write_text(json.dumps(spec,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("wrote",len(DATA),"remaining manifests")
