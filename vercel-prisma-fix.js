// Verifica se está rodando na Vercel
if (process.env.VERCEL) {
  const fs = require('fs');
  const path = require('path');
  
  // Cria link simbólico para o Prisma Client
  const prismaClientPath = path.join(__dirname, 'node_modules/.prisma/client');
  const prismaLinkPath = path.join(__dirname, 'node_modules/@prisma/client');
  
  if (!fs.existsSync(prismaLinkPath)) {
    fs.symlinkSync(prismaClientPath, prismaLinkPath, 'dir');
  }
}