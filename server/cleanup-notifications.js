import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupNotifications() {
  try {
    // Delete notifications with null userId
    const result = await prisma.notification.deleteMany({
      where: {
        userId: null
      }
    });
    
    console.log(`Deleted ${result.count} notifications with null userId`);
    
    // Also delete all existing notifications to start fresh
    const allResult = await prisma.notification.deleteMany({});
    console.log(`Deleted ${allResult.count} total notifications`);
    
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupNotifications();
