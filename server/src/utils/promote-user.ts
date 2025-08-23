import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Promote a user to APPROVER or FINANCE_OFFICER role
 * Usage: npm run promote-user <email> <role>
 */
async function promoteUser(email: string, role: Role) {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { department: true }
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      console.log('💡 Make sure the user has signed up through Clerk first');
      return;
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role },
      include: { department: true }
    });

    console.log('✅ User promoted successfully!');
    console.log(`📧 Email: ${updatedUser.email}`);
    console.log(`👤 Name: ${updatedUser.name}`);
    console.log(`🎭 Role: ${updatedUser.role}`);
    console.log(`🏢 Department: ${updatedUser.department?.name || 'Not assigned'}`);
    
    // Show capabilities
    const capabilities = computeCapabilities(updatedUser.role);
    console.log('\n🔐 User Capabilities:');
    console.log(`  - Can create requests: ${capabilities.canCreateRequest}`);
    console.log(`  - Can approve requests: ${capabilities.canApproveRequest}`);
    console.log(`  - Can create invoices: ${capabilities.canCreateInvoice}`);
    console.log(`  - Can create payments: ${capabilities.canCreatePayment}`);
    console.log(`  - Can view dashboard: ${capabilities.canViewDashboard}`);

  } catch (error) {
    console.error('❌ Error promoting user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function computeCapabilities(role: Role) {
  return {
    canCreateRequest: true,
    canApproveRequest: ['APPROVER','FINANCE_OFFICER'].includes(role),
    canCreateInvoice: ['FINANCE_OFFICER'].includes(role),
    canCreatePayment: ['FINANCE_OFFICER'].includes(role),
    canViewDashboard: ['FINANCE_OFFICER'].includes(role),
  };
}

// CLI usage
const email = process.argv[2];
const role = process.argv[3] as Role;

if (!email || !role) {
  console.log('Usage: npm run promote-user <email> <role>');
  console.log('Roles: APPROVER, FINANCE_OFFICER');
  console.log('Example: npm run promote-user john@example.com APPROVER');
  process.exit(1);
}

if (!['APPROVER', 'FINANCE_OFFICER'].includes(role)) {
  console.error('❌ Invalid role. Use: APPROVER or FINANCE_OFFICER');
  process.exit(1);
}

promoteUser(email, role);
