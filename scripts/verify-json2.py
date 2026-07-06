import json
with open('C:/Users/moji/ayantaraz/apps/api/src/modules/tax-engine/seed/tax-law-knowledge.json', 'r', encoding='utf-8') as f:
    d = json.load(f)
for i, ch in enumerate(d['chapters']):
    if len(ch['articles']) >= 3:
        print(f"Ch {i}: {ch['title'][:60]} — {len(ch['articles'])} articles")
        for a in ch['articles'][:3]:
            print(f"  ماده {a['number']}: {a['text'][:100]}...")
