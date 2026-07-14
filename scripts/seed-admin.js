const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ADMIN_PHONES = ['09133374162', '09134292329'];
async function main() {
  console.log('Seeding admin users for server 202.133.91.13...');
  for (const phone of ADMIN_PHONES) {
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      if (existing.role !== 'admin') {
        await prisma.user.update({ where: { id: existing.id }, data: { role: 'admin', isActive: true } });
        console.log(`✓ Updated ${phone} to admin`);
      } else {
        console.log(`✓ ${phone} is already admin`);
      }
    } else {
      await prisma.user.create({ data: { phone, role: 'admin', isActive: true, firstName: 'Admin', lastName: 'User' } });
      console.log(`✓ Created admin: ${phone}`);
    }
  }
  console.log('\n✅ Admin users seeded successfully!');
  console.log('Admin phone numbers:');
  ADMIN_PHONES.forEach(p => console.log(`  - ${p}`));
  await prisma.$disconnect();
}
main().catch(e => { console.error('❌ Error:', e); process.exit(1); });