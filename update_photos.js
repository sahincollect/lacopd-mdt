require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const names = [
    'SEAN MCKEEVER', 'Sean McKeever', 'sean mckeever',
    'ZED CLARK', 'Zed Clark', 'zed clark',
    'LEON LEWI', 'Leon Lewi', 'leon lewi',
    'Louis Rogers', 'LOUIS ROGERS', 'louis rogers'
  ];
  
  const result = await prisma.officer.updateMany({
    where: {
      name: {
        in: names
      }
    },
    data: {
      profileImage: null
    }
  });
  console.log(`Updated ${result.count} records.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
