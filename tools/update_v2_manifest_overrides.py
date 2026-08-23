import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]/"assets"/"schedule-layers-v2"

farm_path=ROOT/"farmwork"/"manifest.json"
farm=json.loads(farm_path.read_text(encoding="utf-8"))
farm["failureHeroFrames"]=[f"../../characters/seonhwa/base-actions/carry-walk-right/carry-walk-right-{i}.png" for i in range(1,4)]
farm_path.write_text(json.dumps(farm,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

loom_path=ROOT/"loomwork"/"manifest.json"
loom=json.loads(loom_path.read_text(encoding="utf-8"))
loom["placement"]["npcScale"]=1
loom_path.write_text(json.dumps(loom,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

# Adult schedule NPCs share one visual scale. Childcare intentionally keeps
# its smaller child ratio.
adult_ids=["kitchenhelp","painting","music","dance","sewing","copying","woodwork","loomwork","farmwork","swordsmanship","spellcraft","classics","masonry","clinichelp","innhelp","ferryhelp","merchanthelp","accounting","tutoring"]
for activity_id in adult_ids:
    path=ROOT/activity_id/"manifest.json"
    data=json.loads(path.read_text(encoding="utf-8"))
    data["placement"]["npcScale"]=1
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("updated farmwork hero override and active adult NPC scales")
