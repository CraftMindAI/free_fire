const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rooms = await prisma.room.findMany();
  for (const room of rooms) {
    const count = await prisma.booking.count({
      where: { roomId: room.id, status: 'confirmed' }
    });
    
    if (count !== room.currentPlayers) {
      console.log(`Fixing room ${room.id}: ${room.currentPlayers} -> ${count}`);
      await prisma.room.update({
        where: { id: room.id },
        data: { currentPlayers: count }
      });
    }
  }
  console.log("Done syncing player counts.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
