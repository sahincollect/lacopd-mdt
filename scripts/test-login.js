const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  const badge = '02200';
  const password = 'Sahin!123';

  console.log('DB URL prefix:', process.env.DATABASE_URL?.substring(0, 50));

  const officer = await prisma.officer.findUnique({ where: { badge } });

  if (!officer) {
    console.log('❌ Badge bulunamadı:', badge);
    await prisma.$disconnect();
    return;
  }

  console.log('✅ Officer bulundu:', officer.name, '| role:', officer.role, '| status:', officer.status);
  console.log('   Hash (ilk 30):', officer.password.substring(0, 30));

  const isValid = await bcrypt.compare(password, officer.password);
  console.log('🔑 Şifre kontrolü:', isValid ? '✅ DOĞRU' : '❌ YANLIŞ');

  await prisma.$disconnect();
}

testLogin().catch(e => {
  console.error('Hata:', e.message);
  process.exit(1);
});
