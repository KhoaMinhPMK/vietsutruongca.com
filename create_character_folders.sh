#!/bin/bash

# Script tạo thư mục và file index cho các nhân vật lịch sử
# Sử dụng template từ hungvuong

# Danh sách các nhân vật
characters=(
    "hungvuong"
    "thucphan"
    "aulac"
    "thanhcoloa"
    "giotohungvuong"
    "nolienchau"
    "trungnhi"
    "melinh"
    "khoinghiahaibatrung"
    "khoinghiaphunghung"
    "nuocvanxuan"
    "trieuquocdat"
    "chienthangbachdang938"
    "daicoviet"
    "khangchienchongtong981"
    "thaihauduongvannga"
    "lelongdinh"
    "dinhtienhoang"
    "vualythaito"
    "doidovethanglong"
    "namquocsonha"
    "vualythanhtong"
    "lythaitong"
    "lycaotong"
    "lychieuhoang"
    "phathoangtrannhantong"
    "hichtuongsi"
    "chienthangbachdang1288"
    "macdinhchi"
    "phamngulao"
    "thanhnhaho"
    "caicachhoquyly"
    "leloi"
    "khoinghialamson"
    "binhngodaicao"
    "honguyentrung"
    "vualethaito"
    "vualethanhtong"
    "lelai"
    "luongthevinh"
    "thaihaunguyenthianh"
    "lebangco"
    "macdangdung"
    "nguyenkim"
    "letrangtong"
    "letrunghung"
    "nhamac"
    "kinhdocaobang"
    "trinhtung"
    "songgianh"
    "daoduytu"
    "luythay"
    "nguyenhoang"
    "trinhtrang"
    "taysontamkiet"
    "nguyennhac"
    "chienthangrachgamxoaimut"
    "chinhsachvuaquangtrung"
    "buithixuan"
    "tranquangdieu"
    "quochieuvuagialong"
    "vuaminhmang"
    "nguyencongtru"
    "caobaquat"
    "levanduyet"
    "bahuyenthanhquan"
    "khoinghiacanvuong"
    "truongdinh"
    "vuahamnghi"
    "nosungbandaosontra"
    "nguyentrungtruc"
    "hiepuocpa-to-not-giapthan"
    "vuadongkhanh"
    "vuathanhthai"
    "vuabaodai"
    "vuaduytan"
    "nhanguyen"
    "vanlang"
    "aulac"
    "trieuda"
    "trungtrac"
    "batrieu"
    "lybi"
    "maithucloan-maihacde"
    "phunghung"
    "khucthuadu"
    "ngoquyen"
    "lehoan-ledaihanh"
    "lythanhtong"
    "lynhantong"
    "lythuongkiet"
    "tranthaitong"
    "trannhantong"
    "tranhungdao"
    "hoquyly"
    "honguyentrung"
    "macdangdung"
    "trinhnguyenphantranh"
    "quangtrungnguyenhue"
    "nguyentriphuong"
    "vuatuduc"
    "vuahiephoa"
    "vuaduytan"
    "vuabaodai"
)

# Đường dẫn template
TEMPLATE_PATH="card/hungvuong/index.html"
CARD_DIR="card"

# Kiểm tra xem template có tồn tại không
if [ ! -f "$TEMPLATE_PATH" ]; then
    echo "❌ Không tìm thấy template file: $TEMPLATE_PATH"
    exit 1
fi

echo "🚀 Bắt đầu tạo thư mục và file cho ${#characters[@]} nhân vật..."

# Đọc nội dung template
TEMPLATE_CONTENT=$(cat "$TEMPLATE_PATH")

# Tạo thư mục và file cho từng nhân vật
for i in "${!characters[@]}"; do
    character="${characters[$i]}"
    image_number=$((i + 1))
    
    # Tạo thư mục
    mkdir -p "$CARD_DIR/$character"
    
    # Tạo file index.html từ template
    # Thay đổi số ảnh từ 1.jpg thành {image_number}.jpg
    echo "$TEMPLATE_CONTENT" | sed "s/url('1\.jpg')/url('${image_number}.jpg')/g" > "$CARD_DIR/$character/index.html"
    
    echo "✅ Đã tạo: $CARD_DIR/$character/index.html (ảnh: ${image_number}.jpg)"
done

echo ""
echo "🎉 Hoàn thành! Đã tạo ${#characters[@]} thư mục và file index.html"
echo ""
echo "📝 Các bước tiếp theo:"
echo "1. Thêm ảnh tương ứng (1.jpg, 2.jpg, ..., ${#characters[@]}.jpg) vào từng thư mục"
echo "2. Chỉnh sửa nội dung trong file index.html của từng nhân vật:"
echo "   - Thay đổi title, hero-title, hero-subtitle, hero-period"
echo "   - Cập nhật 4 info-card với thông tin phù hợp"
echo "   - Sửa timeline với 4 mốc quan trọng"
echo "   - Cập nhật memorial-section"
echo ""
echo "💡 Template chuẩn đã được sao chép, chỉ cần thay đổi nội dung!"
