import json
with open('C:/Users/moji/ayantaraz/apps/api/src/modules/tax-engine/seed/tax-law-knowledge.json', 'r', encoding='utf-8') as f:
    d = json.load(f)
print(f"Title: {d['title']}")
print(f"Chapters: {len(d['chapters'])}")
for i, ch in enumerate(d['chapters'][:5]):
    print(f"  {i+1}. {ch['title'][:60]} — {len(ch['articles'])} articles")
    for a in ch['articles'][:2]:
        print(f"     ماده {a['number']}: {a['text'][:80]}...")
        if a.get('notes'):
            for n in a['notes'][:1]:
                print(f"       └─ {n[:80]}...")
print("...")
# Check last few chapters
for ch in d['chapters'][-3:]:
    print(f"  {ch['title'][:60]} — {len(ch['articles'])} articles")
# Verify notes count
total_notes = sum(len(a.get('notes',[])) for ch in d['chapters'] for a in ch['articles'])
print(f"\nTotal notes (تبصره): {total_notes}")
