import json
import random

# Load current map_data.json
with open('map_data.json', 'r', encoding='utf-8') as f:
    map_data = json.load(f)

# Generate 100 trees with random positions
trees = []
for i in range(1, 101):
    x = random.randint(200, 3800)
    y = random.randint(200, 2680)
    
    tree = {
        "id": f"tree_{i}",
        "type": "tree0",
        "spritePath": "assets/objects/interactive/tree0.png",
        "stumpPath": "assets/objects/interactive/tree1.png",
        "x": x,
        "y": y,
        "width": 64,
        "height": 64,
        "zIndex": 55,
        "collidable": True,
        "interactable": True,
        "metadata": {
            "name": "Cây gỗ",
            "treeId": i
        }
    }
    trees.append(tree)

# Add trees to existing objects
map_data['objects'].extend(trees)
map_data['objectCount'] = len(map_data['objects'])

# Save updated map_data.json
with open('map_data.json', 'w', encoding='utf-8') as f:
    json.dump(map_data, f, indent=2, ensure_ascii=False)

print(f"✅ Added {len(trees)} trees to map_data.json")
print(f"Total objects: {map_data['objectCount']}")
