const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 

async function main() { 
  const logs = await prisma.loginLog.findMany({ 
    where: { badge: '1222' }, 
    orderBy: { createdAt: 'desc' } 
  }); 
  console.log(JSON.stringify(logs, null, 2)); 
} 

main().finally(() => prisma.$disconnect());
