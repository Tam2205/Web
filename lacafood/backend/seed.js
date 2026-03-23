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
      { name: 'Ga chien mam', description: 'Ga chien gion rum tam mam ot cay nong, thom lung', price: 89000, category: 'mon-nhau', isPromotion: true, promotionPrice: 69000, promotionEnd: promoEnd },
      { name: 'Canh ga chien nuoc mam', description: 'Canh ga chien vang uom, sot nuoc mam toi ot', price: 75000, category: 'mon-nhau' },
      { name: 'Bo luc lac', description: 'Bo Uc luc lac mem ngot, kem rau song', price: 120000, category: 'mon-nhau', isPromotion: true, promotionPrice: 95000, promotionEnd: promoEnd },
      { name: 'Muc chien gion', description: 'Muc tuoi chien gion, cham muoi tieu chanh', price: 95000, category: 'mon-nhau' },

      // Tra sua
      { name: 'Tra sua tran chau duong den', description: 'Tra sua thom beo, tran chau duong den Q deo', price: 35000, category: 'tra-sua', isPromotion: true, promotionPrice: 25000, promotionEnd: promoEnd },
      { name: 'Tra sua matcha', description: 'Matcha Nhat Ban thuong hang, vi dam ngot thanh', price: 40000, category: 'tra-sua' },
      { name: 'Tra dao cam sa', description: 'Tra dao thom mat, cam tuoi va sa thu gian', price: 30000, category: 'tra-sua' },
      { name: 'Tra sua oolong', description: 'Tra oolong rang lua, vi dam da beo ngot', price: 38000, category: 'tra-sua' },

      // Chien
      { name: 'Khoai tay chien', description: 'Khoai tay chien gion, kem tuong ca va pho mai', price: 25000, category: 'chien' },
      { name: 'Banh goi', description: 'Banh goi nhan thit, gion tan thom lung', price: 20000, category: 'chien' },
      { name: 'Nem ran', description: 'Nem ran truyen thong, nhan thit va rau', price: 30000, category: 'chien', isPromotion: true, promotionPrice: 22000, promotionEnd: promoEnd },
      { name: 'Ca vien chien', description: 'Ca vien chien gion, cham tuong ot', price: 25000, category: 'chien' },

      // Pho bun
      { name: 'Pho bo tai', description: 'Pho bo tai nam gau, nuoc dung ham xuong 12 tieng', price: 45000, category: 'pho-bun' },
      { name: 'Bun bo Hue', description: 'Bun bo Hue cay nong, day du topping', price: 50000, category: 'pho-bun', isPromotion: true, promotionPrice: 39000, promotionEnd: promoEnd },
      { name: 'Bun rieu cua', description: 'Bun rieu cua dong nau ca chua, dau hu chien', price: 40000, category: 'pho-bun' },
      { name: 'Pho ga', description: 'Pho ga ta tha vuon, nuoc trong vi ngot thanh', price: 42000, category: 'pho-bun' },

      // Com
      { name: 'Com tam suon bi', description: 'Com tam suon nuong than, bi, cha trung', price: 40000, category: 'com' },
      { name: 'Com ga xoi mo', description: 'Ga chien gion xoi mo, da gion thit mem', price: 45000, category: 'com' },
      { name: 'Com chien duong chau', description: 'Com chien trung, tom, lap xuong, dau Ha Lan', price: 38000, category: 'com', isPromotion: true, promotionPrice: 29000, promotionEnd: promoEnd },
      { name: 'Com rang bo luc lac', description: 'Com rang voi bo Uc luc lac mem ngot', price: 55000, category: 'com' },

      // Mon an vat
      { name: 'Banh trang tron', description: 'Banh trang tron sate, kho bo, trung cut', price: 20000, category: 'mon-an-vat' },
      { name: 'Xien que', description: 'Xien que du loai nuong sot cay', price: 15000, category: 'mon-an-vat' },
      { name: 'Tokbokki', description: 'Banh gao Han Quoc sot cay ngot', price: 35000, category: 'mon-an-vat', isPromotion: true, promotionPrice: 25000, promotionEnd: promoEnd },
      { name: 'Takoyaki', description: 'Banh bach tuoc kieu Nhat, 6 vien', price: 30000, category: 'mon-an-vat' },

      // Nuoc
      { name: 'Nuoc cam ep', description: 'Cam tuoi ep nguyen chat, giau vitamin C', price: 25000, category: 'nuoc' },
      { name: 'Sinh to bo', description: 'Bo sap deo beo, them sua dac', price: 30000, category: 'nuoc' },
      { name: 'Coca Cola', description: 'Coca Cola lon 330ml mat lanh', price: 15000, category: 'nuoc' },
      { name: 'Nuoc chanh day', description: 'Chanh day tuoi, ngot chua sang khoai', price: 20000, category: 'nuoc' },

      // Lau
      { name: 'Lau Thai Tom Yum', description: 'Lau Thai chua cay, hai san tuoi ngon (2-3 nguoi)', price: 199000, category: 'lau', isPromotion: true, promotionPrice: 159000, promotionEnd: promoEnd },
      { name: 'Lau ga la e', description: 'Ga ta nau la e thom nuc, rau rung (2-3 nguoi)', price: 180000, category: 'lau' },
      { name: 'Lau hai san', description: 'Lau hai san tong hop: tom, muc, ca, ngheu (3-4 nguoi)', price: 250000, category: 'lau' },
      { name: 'Lau bo nhung dam', description: 'Bo My thai lat mong, nhung dam thanh ngot (2-3 nguoi)', price: 220000, category: 'lau' }
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
