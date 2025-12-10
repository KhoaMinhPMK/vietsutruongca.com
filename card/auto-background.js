/**
 * Auto Background Script
 * Tự động tìm ảnh trong folder hiện tại và set làm background cho hero section
 */
(function () {
    'use strict';

    // Danh sách các extension ảnh hỗ trợ
    const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    // Lấy đường dẫn folder hiện tại
    const currentPath = window.location.pathname;
    const folderPath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);

    /**
     * Thử load ảnh và set làm background
     */
    function trySetBackground(imageName) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(imageName);
            img.onerror = () => reject();
            img.src = imageName;
        });
    }

    /**
     * Tìm ảnh trong folder với các pattern phổ biến
     */
    async function findAndSetBackground() {
        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) {
            console.log('❌ Không tìm thấy .hero-section');
            return;
        }

        // Các pattern tên file thường dùng
        const commonNames = [
            'background', 'bg', 'hero', 'cover', 'main', 'banner',
            'image', 'img', 'pic', 'photo', 'thumbnail'
        ];

        // Thử với số từ 1-100 (cho các file như 79.jpg)
        const numberPatterns = [];
        for (let i = 1; i <= 100; i++) {
            numberPatterns.push(String(i));
        }

        const allPatterns = [...numberPatterns, ...commonNames];

        // Thử từng pattern và extension
        for (const ext of imageExtensions) {
            for (const name of allPatterns) {
                try {
                    const imagePath = `${name}.${ext}`;
                    await trySetBackground(imagePath);

                    // Tìm thấy ảnh - set background
                    heroSection.style.background = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('${imagePath}')`;
                    heroSection.style.backgroundSize = 'cover';
                    heroSection.style.backgroundPosition = 'center';
                    heroSection.style.backgroundAttachment = 'fixed';

                    console.log(`✅ Auto background set: ${imagePath}`);
                    return;
                } catch (e) {
                    // Ảnh không tồn tại, thử tiếp
                }
            }
        }

        console.log('⚠️ Không tìm thấy ảnh nào trong folder');
    }

    // Chạy khi DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', findAndSetBackground);
    } else {
        findAndSetBackground();
    }
})();
