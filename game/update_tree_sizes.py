import json

# Load map_data.json
with open('map_data.json', 'r', encoding='utf-8') as f:
    map_data = json.load(f)

# Update all tree0 objects to double size (64 -> 128)
tree_count = 0
for obj in map_data['objects']:
    if obj['type'] == 'tree0':
        obj['width'] = 128
        obj['height'] = 128
        tree_count += 1

# Save updated map_data.json
with open('map_data.json', 'w', encoding='utf-8') as f:
    json.dump(map_data, f, indent=2, ensure_ascii=False)

print(f"✅ Updated {tree_count} trees to size 128x128")
