const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultImages = [
  { url: '/gallery/1.png', type: 'GALERI' },
  { url: '/gallery/3.png', type: 'GALERI' },
  { url: '/gallery/6.png', type: 'GALERI' },
  { url: '/gallery/8.png', type: 'GALERI' },
  { url: '/gallery/9.png', type: 'GALERI' },
  { url: '/gallery/Adsz_tasarm_2.png', type: 'GALERI' },
  { url: '/gallery/image.png', type: 'GALERI' },
  { url: '/gallery/lapdtoren3.png', type: 'GALERI' },
  { url: '/gallery/lspd7.png', type: 'GALERI' },
  { url: '/gallery/saspbenz.png', type: 'GALERI' },
  { url: '/gallery/saspbenz2.png', type: 'GALERI' },
  { url: '/gallery/statecar.png', type: 'GALERI' },
  { url: '/gallery/statecar3.png', type: 'GALERI' },
  { url: '/gallery/statecar5.png', type: 'GALERI' },
  { url: '/gallery/statecar7.png', type: 'GALERI' }
];

async function main() {
  const existingImages = await prisma.siteImage.findMany({
    where: { type: 'GALERI' }
  });
  
  const existingUrls = new Set(existingImages.map(img => img.url));
  let added = 0;

  for (const img of defaultImages) {
    if (!existingUrls.has(img.url)) {
      await prisma.siteImage.create({ data: img });
      added++;
    }
  }

  console.log(`Eklendi: ${added} görsel.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
