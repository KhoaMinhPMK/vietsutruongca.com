# Việt Sử Trường Ca: Tiếng Vọng Ngàn Năm

🎮 **Game nhập vai lịch sử 2D pixel art Việt Nam đầu tiên**

## 📖 Giới thiệu

"Việt Sử Trường Ca: Tiếng Vọng Ngàn Năm" là một web game RPG lấy cảm hứng từ Hollow Knight, được phát triển với HTML5, CSS3, JavaScript và WebGL. Game tái hiện lịch sử Việt Nam thời kỳ Văn Lang - Âu Lạc qua gameplay hấp dẫn và đồ họa pixel art đẹp mắt.

## ✨ Tính năng nổi bật

- 🎬 **Video background tự động**: Phát video nền với hiệu ứng fade từ giây 3-35
- 🌟 **Đồ họa 3D WebGL**: Hệ thống hạt và hiệu ứng 3D với Three.js
- 🎨 **Animations mượt mà**: GSAP ScrollTrigger với parallax effects
- 📱 **Responsive design**: Tối ưu cho mọi thiết bị
- 🎵 **Âm thanh sống động**: Hệ thống âm thanh phong phú
- 🏛️ **Yếu tố lịch sử**: Câu chuyện và nhân vật dựa trên sử Việt

## 🗂️ Cấu trúc dự án

```
webgame/
├── index.html                 # File HTML chính
├── assets/                    # Tài nguyên media
│   ├── vid.mp4               # Video nền chính
│   ├── a.jpg, b.jpg, c.jpg   # Hình ảnh câu chuyện
│   └── character-images.jpg   # Hình ảnh nhân vật
├── css/                       # Stylesheets
│   ├── main.css              # CSS chính và variables
│   ├── hero-section.css      # Styling cho hero section
│   ├── game-sections.css     # Styling cho các section game
│   └── animations.css        # Animations và effects
└── js/                        # JavaScript modules
    ├── main.js               # Controller chính
    ├── video-controller.js   # Quản lý video background
    ├── three-scene.js        # Three.js 3D graphics
    ├── particles.js          # Hệ thống hạt DOM
    ├── scroll-animations.js  # GSAP scroll animations
    └── navigation.js         # Navigation và interactions
```

## 🚀 Hướng dẫn chạy game

### Phương pháp 1: Mở trực tiếp
1. Mở file `index.html` trong trình duyệt web
2. Game sẽ tự động khởi tạo và hiển thị loading screen

### Phương pháp 2: Local server (Khuyến nghị)
```powershell
# Sử dụng Python
python -m http.server 8000

# Hoặc sử dụng Node.js
npx http-server

# Sau đó truy cập http://localhost:8000
```

## 🔧 Công nghệ sử dụng

### Frontend Framework
- **HTML5**: Cấu trúc semantic và accessibility
- **CSS3**: Custom properties, Grid, Flexbox, Animations
- **JavaScript ES6+**: Modules, Classes, Async/Await

### Libraries
- **Three.js**: 3D graphics và WebGL rendering
- **GSAP**: Animations và ScrollTrigger
- **Web APIs**: Performance, Intersection Observer

### Performance Optimizations
- **GPU Acceleration**: CSS transforms và WebGL
- **Lazy Loading**: Tối ưu tải tài nguyên
- **Debounced Events**: Tối ưu event handling
- **Prefers-reduced-motion**: Hỗ trợ accessibility

## 🎯 Hệ thống Game

### Video Controller
- **Timing Control**: Phát video từ giây 3-35, lặp lại
- **Fade Effects**: Smooth transitions giữa các chu kỳ
- **Performance**: Tối ưu cho các thiết bị yếu

### 3D Scene System
- **Particle Systems**: Hạt tương tác với mouse
- **Floating Geometry**: Các hình học 3D động
- **Responsive Rendering**: Tự động điều chỉnh quality

### Animation System
- **Scroll Animations**: Parallax và reveal effects
- **Stagger Animations**: Hiệu ứng tuần tự
- **Performance Monitoring**: FPS tracking

### Navigation System
- **Smooth Scrolling**: Navigation mượt mà
- **Mobile Menu**: Responsive hamburger menu
- **Scroll Spy**: Active state tracking

## 🎮 Gameplay Features

### Story Mode
- **Interactive Narrative**: Câu chuyện tương tác
- **Historical Accuracy**: Dựa trên sử liệu thực
- **Character Development**: Phát triển nhân vật

### Combat System
- **Hollow Knight Inspired**: Platformer combat
- **Skill Trees**: Hệ thống kỹ năng phong phú
- **Boss Battles**: Các trận đánh boss epic

### World Exploration
- **Open World**: Thế giới mở rộng lớn
- **Hidden Secrets**: Bí mật và easter eggs
- **Cultural Elements**: Yếu tố văn hóa Việt

## 🔍 Debugging và Troubleshooting

### Console Logging
Game cung cấp logging chi tiết:
```javascript
// Kiểm tra trạng thái game
console.log(window.GameApp.isReady());

// Lấy controller cụ thể
const videoController = window.GameUtils.getController('VideoController');
```

### Performance Monitoring
```javascript
// Theo dõi performance
window.GameUtils.performance.mark('custom-event');
window.GameUtils.performance.measure('load-time', 'navigationStart', 'custom-event');
```

### Common Issues
1. **Video không phát**: Kiểm tra đường dẫn `assets/vid.mp4`
2. **3D không hiển thị**: Kiểm tra WebGL support
3. **Animations lag**: Giảm complexity hoặc disable animations

## 🌟 Tối ưu Performance

### Video Optimization
- **Format**: MP4 H.264 tối ưu cho web
- **Resolution**: Cân bằng chất lượng và kích thước
- **Compression**: Tối ưu bitrate

### 3D Optimization
- **LOD System**: Level of detail tự động
- **Frustum Culling**: Chỉ render objects trong view
- **Particle Limits**: Giới hạn số lượng particles

### CSS Optimization
- **CSS Containment**: Tối ưu reflow/repaint
- **Transform3d**: Kích hoạt GPU acceleration
- **Will-change**: Hint cho browser optimization

## 🎨 Customization

### Themes
Thay đổi color scheme trong `css/main.css`:
```css
:root {
    --primary-color: #ffd700;
    --secondary-color: #8B4513;
    --accent-color: #DC143C;
}
```

### Animations
Điều chỉnh timing trong `js/scroll-animations.js`:
```javascript
const animationConfig = {
    duration: 1.5,
    ease: "power2.out",
    stagger: 0.1
};
```

## 📦 Build và Deployment

### Development
```powershell
# Clone project
git clone [repository-url]
cd webgame

# Chạy local server
python -m http.server 8000
```

### Production
```powershell
# Minify CSS
npx csso-cli css/main.css -o css/main.min.css

# Minify JavaScript
npx terser js/main.js -o js/main.min.js

# Optimize images
npx imagemin assets/*.jpg --out-dir=assets/optimized
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Tạo Pull Request

## 📝 License

Dự án này được phát hành dưới MIT License. Xem file `LICENSE` để biết thêm chi tiết.

## 👥 Credits

- **Game Design**: Inspired by Hollow Knight
- **Historical Research**: Dựa trên sử liệu Việt Nam
- **Art Style**: Pixel art với Vietnamese aesthetics
- **Music**: Traditional Vietnamese instruments

## 📞 Liên hệ

- **Email**: contact@vietsutruongca.com
- **Discord**: [Game Community](discord-link)
- **Facebook**: [Fan Page](facebook-link)

---

🇻🇳 **Tự hào văn hóa Việt - Kế thừa truyền thống - Vươn tầm thế giới**
"# vietsutruongca.com" 
