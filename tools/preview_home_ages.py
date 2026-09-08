from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
base = root / 'assets/characters/seonhwa/home'
entries = [
    ('9~12세 · 기준', 'age-09-12/seonhwa-home-age09-12-concept-v1.png'),
    ('13~15세 · 정면 v3', 'age-13-15/seonhwa-home-age13-15-concept-v3.png'),
    ('16~17세 · 기존 시안', 'age-16-17/seonhwa-home-age16-17-concept-v1.png'),
    ('18세 이상 · 기존 시안', 'age-18-plus/seonhwa-home-age18-plus-concept-v1.png'),
]
sheet = Image.new('RGB', (1640, 760), '#f5f0e8')
draw = ImageDraw.Draw(sheet)
font = ImageFont.truetype('C:/Windows/Fonts/malgun.ttf', 23)
small = ImageFont.truetype('C:/Windows/Fonts/malgun.ttf', 17)
for i, (label, filename) in enumerate(entries):
    x = 16 + i * 408
    draw.text((x + 10, 18), label, font=font, fill='#3a3028')
    pic = Image.open(base / filename).convert('RGB')
    pic.thumbnail((392, 660), Image.Resampling.LANCZOS)
    sheet.paste(pic, (x + (392-pic.width)//2, 63))
draw.text((26, 719), '성장 비교용 시안 · 동일 표시 크기이며 실제 게임 내 키 비율은 아닙니다.', font=small, fill='#66584a')
target = base / 'seonhwa-home-all-ages-preview-v3.jpg'
sheet.save(target, quality=95)
print(target)
