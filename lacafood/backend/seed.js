const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Food = require('./models/Food');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    await User.deleteMany({});
    await Food.deleteMany({});

    // Create admin
    const salt = await bcrypt.genSalt(12);
    const adminPass = await bcrypt.hash('admin123', salt);
    await User.create({
      name: 'Admin',
      email: 'admin@lacafood.com',
      password: adminPass,
      phone: '0123456789',
      address: 'LacaFood HQ',
      role: 'admin'
    });

    // Create user
    const userPass = await bcrypt.hash('user123', salt);
    await User.create({
      name: 'Nguoi Dung',
      email: 'user@lacafood.com',
      password: userPass,
      phone: '0987654321',
      address: '123 Duong ABC, Quan 1, TP.HCM',
      role: 'user'
    });

    // Promotion end (3 days from now)
    const promoEnd = new Date();
    promoEnd.setDate(promoEnd.getDate() + 3);

    const foods = [
      // Mon nhau
      { name: 'Mực khô nướng', description: 'Mực khô nướng trên cồn, xé tơi, chấm tương ớt; vị ngọt, dai và thơm nồng.', image: "", price: 89000, category: 'mon-nhau', isPromotion: true, promotionPrice: 69000, promotionEnd: promoEnd },
      { name: 'Trâu gác bếp', description: 'Thịt trâu hun khói dai, ngọt, thơm mùi mắc khén và hạt dỗi đặc trưng vùng cao.', image: "", price: 75000, category: 'mon-nhau' },
      { name: 'Bò lúc lắc', description: 'Bò Úc lúc lắc mềm ngọt, kèm rau sống', image: "", price: 120000, category: 'mon-nhau', isPromotion: true, promotionPrice: 95000, promotionEnd: promoEnd },
      { name: 'Đậu hũ lướt ván', description: 'Đậu hũ tươi chiên vàng lớp vỏ nhưng bên trong vẫn mềm mịn như tan trong miệng.', image: "", price: 95000, category: 'mon-nhau' },

      // Trà sữa
      { name: 'Trà sữa trân châu đường đen', description: 'Trà sữa thơm béo, trân châu đường đen Q dẻo', image: "", price: 35000, category: 'tra-sua', isPromotion: true, promotionPrice: 25000, promotionEnd: promoEnd },
      { name: 'Trà sữa matcha', description: 'Matcha Nhật Bản thượng hạng, vị đậm ngọt thanh', image: "", price: 40000, category: 'tra-sua' },
      { name: 'Trà đào cam sả', description: 'Trà đào thơm mát, cam tươi và sả thư giãn', image: "", price: 30000, category: 'tra-sua' },
      { name: 'Trà sữa oolong', description: 'Trà oolong rang lửa, vị đậm đà béo ngọt', image: "", price: 38000, category: 'tra-sua' },

      // Chiên
      { name: 'Khoai tây chiên', description: 'Khoai tây chiên giòn, kèm tương cà và phô mai', price: 25000, category: 'chien' },
      { name: 'Bánh gối', description: 'Bánh gối nhân thịt, giòn tan thơm lừng', price: 20000, category: 'chien' },
      { name: 'Nem rán', description: 'Nem rán truyền thống, nhân thịt và rau', price: 30000, category: 'chien', isPromotion: true, promotionPrice: 22000, promotionEnd: promoEnd },
      { name: 'Cá viên chiên', description: 'Cá viên chiên giòn, chấm tương ớt', price: 25000, category: 'chien' },

      // Pho bun
      { name: 'Phở bò tái', description: 'Phở bò tái nạm gầu, nước dùng hầm xương 12 tiếng', price: 45000, category: 'pho-bun' },
      { name: 'Bún bò Huế', description: 'Bún bò Huế cay nồng, đầy đủ topping', price: 50000, category: 'pho-bun', isPromotion: true, promotionPrice: 39000, promotionEnd: promoEnd },
      { name: 'Bún riêu cua', description: 'Bún riêu cua đồng nấu cà chua, đậu hũ chiên', price: 40000, category: 'pho-bun' },
      { name: 'Phở gà', description: 'Phở gà ta thả vườn, nước trong vị ngọt thanh', price: 42000, category: 'pho-bun' },

      // Com
      { name: 'Cơm tấm sườn bì', description: 'Cơm tấm sườn nướng than, bì, chả trứng', price: 40000, category: 'com' },
      { name: 'Cơm gà xối mỡ', description: 'Gà chiên giòn xối mỡ, da giòn thịt mềm', price: 45000, category: 'com' },
      { name: 'Cơm chiên dương châu', description: 'Cơm chiên trứng, tôm, lạp xưởng, đậu Hà Lan', price: 38000, category: 'com', isPromotion: true, promotionPrice: 29000, promotionEnd: promoEnd },
      { name: 'Cơm rang bò lúc lắc', description: 'Cơm rang với bò Úc lúc lắc mềm ngọt', price: 55000, category: 'com' },

      // Món ăn vặt
      { name: 'Bánh tráng trộn', description: 'Bánh tráng trộn sate, khô bò, trứng cút', price: 20000, category: 'mon-an-vat' },
      { name: 'Xiên que', description: 'Xiên que đủ loại nướng sốt cay', price: 15000, category: 'mon-an-vat' },
      { name: 'Tokbokki', description: 'Bánh gạo Hàn Quốc sốt cay ngọt', price: 35000, category: 'mon-an-vat', isPromotion: true, promotionPrice: 25000, promotionEnd: promoEnd },
      { name: 'Takoyaki', description: 'Bánh bạch tuộc kiểu Nhật, 6 viên', price: 30000, category: 'mon-an-vat' },

      // Nuoc
      { name: 'Nước cam ép', description: 'Cam tươi ép nguyên chất, giàu vitamin C', price: 25000, category: 'nuoc' },
      { name: 'Sinh tố bơ', description: 'Bơ sáp dẻo béo, thêm sữa đặc', price: 30000, category: 'nuoc' },
      { name: 'Coca Cola', description: 'Coca Cola lon 330ml mát lạnh', price: 15000, category: 'nuoc' },
      { name: 'Nước chanh dây', description: 'Chanh dây tươi, ngọt chua sảng khoái', price: 20000, category: 'nuoc' },

      // Lẩu
      { name: 'Lẩu Thái Tom Yum', description: 'Ẩu Thái chua cay, hải sản tươi ngon (2-3 người)', price: 199000, category: 'lau', isPromotion: true, promotionPrice: 159000, promotionEnd: promoEnd },
      { name: 'Lẩu gà lá é', description: 'Gà ta nấu lá é thơm nức, rau rừng (2-3 người)', price: 180000, category: 'lau' },
      { name: 'Lẩu hải sản', description: 'Lẩu hải sản tổng hợp: tôm, mực, cá, nghêu (3-4 người)', price: 250000, category: 'lau' },
      { name: 'Lẩu bò nhúng dấm', description: 'Bò Mỹ thái lát mỏng, nhúng dấm thanh ngọt (2-3 người)', price: 220000, category: 'lau' }
    ];

    await Food.insertMany(foods);

    console.log('Seed data inserted successfully!');
    console.log('Admin: admin@lacafood.com / admin123');
    console.log('User: user@lacafood.com / user123');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedDB();
