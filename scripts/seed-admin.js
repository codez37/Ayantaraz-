const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ADMIN_PHONES = ['09133374162', '09134292329'];
async function main() {
  console.log('Seeding admin users...');
  for (const phone of ADMIN_PHONES) {
    try {
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing) {
        if (existing.role !== 'admin') {
          await prisma.user.update({
            where: { id: existing.id },
            data: { role: 'admin', isActive: true, firstName: 'Admin', lastName: 'User' }
          });
          console.log('Updated ' + phone + ' to admin');
        } else {
          console.log(phone + ' is already admin');
        }
      } else {
        await prisma.user.create({
          data: { phone: phone, role: 'admin', isActive: true, firstName: 'Admin', lastName: 'User', email: phone + '@ayantaraz.ir' }
        });
        console.log('Created admin: ' + phone);
      }
    } catch (error) {
      console.error('Error processing ' + phone + ':', error);
    }
  }
  console.log('Admin users seeded successfully!');
  await prisma.$disconnect();
}
main().catch(e => { console.error('Error:', e); process.exit(1); });