# 🎮 Hướng Dẫn Spawn NPCs

## Cách 1: Dùng Console Commands (Dễ nhất!) ⭐

### Bước 1: Mở Game
1. Chạy game (`index.html`)
2. Nhấn **F12** để mở Developer Console

### Bước 2: Xem Tọa Độ
- Di chuyển chuột trên map
- Nhìn góc trên bên trái màn hình
- Thấy dòng **Mouse: X, Y** màu xanh lá
- Đó chính là tọa độ world!

### Bước 3: Spawn NPCs

#### Spawn tại vị trí cụ thể:
```javascript
spawn("caolo", 200, 300)           // Spawn Cao Lỗ tại (200, 300)
spawn("caolo", 500, 400, "Lính 1") // Spawn với tên custom
```

#### Spawn tại vị trí chuột (Tiện nhất!):
```javascript
// Bước 1: Di chuột đến vị trí muốn đặt
// Bước 2: Gõ trong console:
spawnAt("caolo")                   // Spawn tại vị trí chuột
spawnAt("caolo", "Cao Lỗ số 1")   // Spawn với tên
```

#### Các lệnh khác:
```javascript
listNPCs()      // Xem danh sách tất cả NPCs
clearNPCs()     // Xóa tất cả NPCs
```

---

## Cách 2: Chỉnh Sửa Code

### Mở file: `js/ui/screens/Screen1.js`

### Tìm dòng ~206, bỏ comment:
```javascript
// Spawn 1 NPC:
this.spawnNPC('npc_caolo', 200, 300, 'sprites/caolo.png', {
    name: 'Cao Lỗ số 1'
});

// Hoặc spawn nhiều:
this.spawnNPCs([
    { type: 'npc_caolo', x: 100, y: 150, sprite: 'sprites/caolo.png' },
    { type: 'npc_caolo', x: 200, y: 250, sprite: 'sprites/caolo.png' },
    { type: 'npc_caolo', x: 300, y: 350, sprite: 'sprites/caolo.png' }
]);
```

---

## Cách 3: Dùng map_data.json

Chỉnh file `map_data.json` theo format:
```json
{
  "objects": [
    {
      "type": "npc_caolo",
      "spritePath": "sprites/caolo.png",
      "x": 200,
      "y": 300,
      "width": 30,
      "height": 50,
      "metadata": {
        "name": "Cao Lỗ",
        "animation": {
          "frameCount": 8,
          "frameTime": 100
        }
      }
    }
  ]
}
```

---

## 🎯 Workflow Khuyến Nghị

### Để đặt NPCs nhanh nhất:

1. **Chạy game** (`index.html`)
2. **Mở F12 Console**
3. **Di chuột** đến vị trí muốn đặt
4. **Nhìn tọa độ** Mouse: X, Y (màu xanh)
5. **Gõ console:** `spawnAt("caolo")`
6. **Lặp lại** cho các NPCs khác!

### Lưu lại vị trí:
- Sau khi đặt xong, gõ: `listNPCs()`
- Copy tọa độ ra notepad
- Paste vào `map_data.json` hoặc code `Screen1.js`

---

## 📝 Ví Dụ Thực Tế

```javascript
// Console workflow:
spawn("caolo", 100, 200)      // NPC 1
spawn("caolo", 300, 400)      // NPC 2
spawn("caolo", 500, 600)      // NPC 3

listNPCs()                     // Xem tất cả
// → Copy tọa độ từ output

clearNPCs()                    // Xóa hết để thử lại
```

Xong! Giờ bạn có thể đặt NPCs dễ dàng! 🎉
