const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  const badge = '02200';
  const password = 'Sahin!123';
  const name = 'Şahin';
  const rank = 'Komiser';
  const role = 'admin';
  const department = 'Yönetim';

  // Check if already exists
  const existing = await prisma.officer.findUnique({ where: { badge } });
  if (existing) {
    console.log(`✅ Badge ${badge} zaten mevcut. role=${existing.role}`);
    // Update to admin just in case
    const updated = await prisma.officer.update({
      where: { badge },
      data: { role: 'admin' }
    });
    console.log('🔄 Role admin olarak güncellendi:', updated.name);
    await prisma.$disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const officer = await prisma.officer.create({
    data: {
      badge,
      password: hashedPassword,
      name,
      rank,
      department,
      role,
      status: 'APPROVED',
    }
  });

  console.log('✅ Admin hesabı oluşturuldu:');
  console.log(`   Rozet  : ${officer.badge}`);
  console.log(`   İsim   : ${officer.name}`);
  console.log(`   Rütbe  : ${officer.rank}`);
  console.log(`   Rol    : ${officer.role}`);
  console.log(`   Şifre  : ${password} (hashlenmiş olarak kaydedildi)`);

  await prisma.$disconnect();
}

createAdmin().catch(e => {
  console.error('❌ Hata:', e.message);
  process.exit(1);
});
