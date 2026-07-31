const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.timeLog.findMany();
  console.log(JSON.stringify(logs, null, 2));
}

main().catch(console.error);
