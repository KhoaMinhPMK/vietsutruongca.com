# 📚 HƯỚNG DẪN CHỈNH SỬA TEMPLATE NHÂN VẬT

## 🎯 Template đã được tạo cho 104 nhân vật với cấu trúc:

```
card/
├── hungvuong/ (Template gốc - đã hoàn thành)
├── thucphan/ (ảnh: 2.jpg)
├── aulac/ (ảnh: 3.jpg)
├── ...
└── vuabaodai/ (ảnh: 104.jpg)
```

## 🔧 CÁC BƯỚC CHỈNH SỬA CHO TỪNG NHÂN VẬT:

### 1. 📸 **Thêm hình ảnh:**
- Đặt file ảnh với tên tương ứng vào thư mục nhân vật
- Ví dụ: `card/thucphan/2.jpg`, `card/aulac/3.jpg`

### 2. ✏️ **Chỉnh sửa nội dung trong index.html:**

#### **A. Thông tin Hero Section:**
```html
<!-- Dòng 6 -->
<title>[Tên Nhân Vật] - [Danh hiệu]</title>

<!-- Dòng 307-309 -->
<h1 class="hero-title">[TÊN NHÂN VẬT]</h1>
<p class="hero-subtitle">[Chức vụ/Danh hiệu]</p>
<div class="hero-period">[Thời kỳ - Sự kiện quan trọng]</div>
```

#### **B. 4 Thẻ thông tin (Info Cards):**
```html
<!-- Card 1: Dòng 320-324 -->
<i class="fas fa-[icon] info-icon"></i>
<h3 class="info-title">[Tiêu đề Card 1]</h3>
<p class="info-text">[Nội dung mô tả...]</p>

<!-- Card 2: Dòng 327-331 -->
<!-- Card 3: Dòng 334-338 -->
<!-- Card 4: Dòng 341-345 -->
```

#### **C. Timeline (4 mốc quan trọng):**
```html
<!-- Mốc 1: Dòng 353-357 -->
<h3 class="info-title">[Sự kiện 1]</h3>
<p>[Mô tả chi tiết...]</p>

<!-- Mốc 2: Dòng 362-366 -->
<!-- Mốc 3: Dòng 371-375 -->
<!-- Mốc 4: Dòng 380-384 -->
```

#### **D. Memorial Section:**
```html
<!-- Dòng 390-396 -->
<i class="fas fa-[icon] memorial-icon"></i>
<h2 class="memorial-title">[Tên sự kiện kỷ niệm]</h2>
<p class="memorial-date">[Ngày tháng]</p>
<p class="memorial-description">[Ý nghĩa...]</p>
```

## 🎨 **FONT AWESOME ICONS GỢI Ý:**

### **Vua chúa:**
- `fas fa-crown` (vương miện)
- `fas fa-chess-king` (vua)
- `fas fa-gem` (ngọc quý)

### **Tướng lĩnh:**
- `fas fa-shield-alt` (khiên)
- `fas fa-sword` (kiếm)
- `fas fa-helmet-battle` (mũ chiến)

### **Địa điểm:**
- `fas fa-landmark` (cung điện)
- `fas fa-mountain` (núi)
- `fas fa-city` (thành phố)

### **Văn hóa:**
- `fas fa-book` (sách)
- `fas fa-scroll` (cuộn sách)
- `fas fa-pen-fancy` (bút)

### **Chiến tranh:**
- `fas fa-flag` (cờ)
- `fas fa-fire` (lửa)
- `fas fa-bolt` (sét)

### **Tôn giáo/Tâm linh:**
- `fas fa-seedling` (cây non)
- `fas fa-dove` (chim bồ câu)
- `fas fa-star` (ngôi sao)

## 📝 **VÍ DỤ MẪU - TRẦN HƯNG ĐẠO:**

```html
<title>Trần Hưng Đạo - Đại Tướng Quân Triều Trần</title>

<h1 class="hero-title">TRẦN HƯNG ĐẠO</h1>
<p class="hero-subtitle">Đại Tướng Quân Triều Trần</p>
<div class="hero-period">Thế kỷ 13 - Chống quân Mông Cổ</div>

<!-- Card 1 -->
<i class="fas fa-shield-alt info-icon"></i>
<h3 class="info-title">Danh Tướng Vĩ Đại</h3>
<p class="info-text">Đại tướng quân triều Trần, người đã ba lần đánh bại quân Mông Cổ xâm lược...</p>

<!-- Memorial -->
<h2 class="memorial-title">Ngày Mặt Trận Tổ Quốc</h2>
<p class="memorial-date">18 tháng 12 hằng năm</p>
```

## 🔄 **QUY TRÌNH LÀM VIỆC:**

1. **Chọn nhân vật** cần chỉnh sửa
2. **Chuẩn bị hình ảnh** (đúng số thứ tự)
3. **Nghiên cứu thông tin** lịch sử
4. **Chỉnh sửa file HTML** theo template
5. **Kiểm tra** trên trình duyệt
6. **Hoàn thành** và chuyển sang nhân vật tiếp theo

## 💡 **LƯU Ý:**

- ✅ **Giữ nguyên** toàn bộ CSS và structure
- ✅ **Chỉ thay đổi** nội dung text và tên file ảnh
- ✅ **Đảm bảo** file ảnh có tên đúng theo số thứ tự
- ✅ **Kiểm tra** responsive trên mobile
- ✅ **Thống nhất** phong cách viết giữa các nhân vật

---

**🎯 Template này đảm bảo tính nhất quán và chuyên nghiệp cho toàn bộ bộ sưu tập nhân vật lịch sử Việt Nam!**
