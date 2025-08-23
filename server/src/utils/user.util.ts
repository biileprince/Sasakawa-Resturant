import { PrismaClient, Role } from '@prisma/client';
import { clerkClient } from '@clerk/clerk-sdk-node';

const prisma = new PrismaClient();

export async function ensureUserInDb(clerkUserId: string) {
  // 1. Fast path by clerkId
  let user = await prisma.user.findFirst({ where: { clerkId: clerkUserId } });
  if (user) return user;

  // 2. Fetch from Clerk
  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  const email = clerkUser.emailAddresses?.[0]?.emailAddress || `user-${clerkUserId}@example.com`;
  const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'New User';

  // 3. Defensive: check if a record already exists with same email (race or prior import)
  user = await prisma.user.findFirst({ where: { email } });
  if (user) {
    if (user.clerkId !== clerkUserId) {
      // Attempt to reconcile by updating clerkId if it's currently pointing at an orphaned / legacy value
      try {
        user = await prisma.user.update({ where: { id: user.id }, data: { clerkId: clerkUserId } });
        console.warn('[ensureUserInDb] Reconciled differing clerkId for existing email', { email, was: user.clerkId, now: clerkUserId });
      } catch (err) {
        console.warn('[ensureUserInDb] Email already associated with different clerkId and update failed', { email, existingClerkId: user.clerkId, incoming: clerkUserId });
      }
      return user;
    }
    return user;
  }

  // 4. Attempt create; handle race (P2002) by re-query
  try {
    user = await prisma.user.create({
      data: { 
        clerkId: clerkUserId, 
        email, 
        name,
        role: 'REQUESTER' // Default role for new users
      },
    });
    return user;
  } catch (e: any) {
    if (e?.code === 'P2002') {
      // Unique conflict (likely concurrent create). Re-query by clerkId then email.
      const after = await prisma.user.findFirst({ where: { clerkId: clerkUserId } })
        || await prisma.user.findFirst({ where: { email } });
      if (after) return after;
    }
    console.error('[ensureUserInDb] Failed creating user', e);
    throw e;
  }
}

export function computeCapabilities(role: Role) {
  return {
    canCreateRequest: true,
    canApproveRequest: ['APPROVER','FINANCE_OFFICER','ADMIN'].includes(role),
    canCreateInvoice: ['FINANCE_OFFICER','FINANCE_CLERK','ADMIN'].includes(role),
    canCreatePayment: ['FINANCE_OFFICER','FINANCE_CLERK','ADMIN'].includes(role),
    canViewDashboard: ['FINANCE_OFFICER','ADMIN'].includes(role),
  };
}
