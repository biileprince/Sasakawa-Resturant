import { PrismaClient, Role, RequestStatus, InvoiceStatus, PaymentStatus, PaymentMethod, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Sasakawa Restaurant Service Request System...');

  // 1. Departments
  const departmentData = [
    { name: 'Computer Science', code: 'CS', costCentre: 'CS001' },
    { name: 'Business School', code: 'BUS', costCentre: 'BUS001' },
    { name: 'Engineering', code: 'ENG', costCentre: 'ENG001' },
    { name: 'Liberal Arts', code: 'LA', costCentre: 'LA001' },
    { name: 'Finance Office', code: 'FIN', costCentre: 'FIN001' },
  ];

  const departments: Record<string, string> = {};
  for (const dept of departmentData) {
    const d = await prisma.department.upsert({
      where: { code: dept.code },
      update: { ...dept },
      create: { ...dept },
    });
    departments[dept.name] = d.id;
  }
  console.log('Departments ensured:', Object.keys(departments));

  // 2. Users (placeholder clerkIds; will be reconciled when real Clerk users sign in)
  const usersSeed: { email: string; name: string; role: Role; clerkId: string; department?: string; phone?: string }[] = [
    { 
      email: 'approver.cs@sasakawa.edu', 
      name: 'Dr. Sarah Johnson', 
      role: 'APPROVER', 
      clerkId: 'seed_approver_cs', 
      department: 'Computer Science',
      phone: '+1-555-0101'
    },
    { 
      email: 'approver.bus@sasakawa.edu', 
      name: 'Prof. Maria Rodriguez', 
      role: 'APPROVER', 
      clerkId: 'seed_approver_bus', 
      department: 'Business School',
      phone: '+1-555-0102'
    },
    { 
      email: 'finance.officer@sasakawa.edu', 
      name: 'Michael Chen', 
      role: 'FINANCE_OFFICER', 
      clerkId: 'seed_fin_off', 
      department: 'Finance Office',
      phone: '+1-555-0201'
    },
    { 
      email: 'requester.cs@sasakawa.edu', 
      name: 'Alice Cooper', 
      role: 'REQUESTER', 
      clerkId: 'seed_req_cs', 
      department: 'Computer Science',
      phone: '+1-555-0301'
    },
    { 
      email: 'requester.bus@sasakawa.edu', 
      name: 'Bob Wilson', 
      role: 'REQUESTER', 
      clerkId: 'seed_req_bus', 
      department: 'Business School',
      phone: '+1-555-0302'
    },
    { 
      email: 'requester.eng@sasakawa.edu', 
      name: 'Carol Davis', 
      role: 'REQUESTER', 
      clerkId: 'seed_req_eng', 
      department: 'Engineering',
      phone: '+1-555-0303'
    },
  ];

  const users: Record<string, string> = {}; // email -> id
  for (const u of usersSeed) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { 
        role: u.role, 
        departmentId: u.department ? departments[u.department] : undefined,
        phone: u.phone 
      },
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        clerkId: u.clerkId, // placeholder; ensureUserInDb may later update this to real Clerk userId
        departmentId: u.department ? departments[u.department] : undefined,
        phone: u.phone,
      },
    });
    users[u.email] = user.id;
  }
  console.log('Users ensured:', Object.keys(users));

  // Update departments with default approvers
  await prisma.department.update({
    where: { id: departments['Computer Science'] },
    data: { approverId: users['approver.cs@sasakawa.edu'] }
  });
  await prisma.department.update({
    where: { id: departments['Business School'] },
    data: { approverId: users['approver.bus@sasakawa.edu'] }
  });

  // 3. Service Requests (only create if table mostly empty)
  const existingRequests = await prisma.serviceRequest.count();
  if (existingRequests === 0) {
    const requester1 = users['requester.cs@sasakawa.edu'];
    const requester2 = users['requester.bus@sasakawa.edu'];
    const requester3 = users['requester.eng@sasakawa.edu'];
    const approver1 = users['approver.cs@sasakawa.edu'];
    const approver2 = users['approver.bus@sasakawa.edu'];

    // Generate unique request numbers
    const generateRequestNo = () => `REQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

    const requestData = [
      {
        requestNo: generateRequestNo(),
        eventName: 'Annual Computer Science Conference',
        eventDate: new Date('2025-09-15T09:00:00Z'),
        venue: 'Main Conference Hall',
        estimateAmount: 5000.00,
        attendees: 150,
        serviceType: 'Special Events',
        description: 'Annual CS conference with keynote speakers, lunch, and coffee breaks',
        fundingSource: 'Department Budget',
        contactPhone: '+1-555-0301',
        status: RequestStatus.SUBMITTED,
        requesterId: requester1,
        departmentId: departments['Computer Science'],
      },
      {
        requestNo: generateRequestNo(),
        eventName: 'Business School Board Meeting',
        eventDate: new Date('2025-08-25T14:00:00Z'),
        venue: 'Executive Boardroom',
        estimateAmount: 1500.00,
        attendees: 25,
        serviceType: 'Corporate Meetings',
        description: 'Quarterly board meeting with working lunch',
        fundingSource: 'Administrative Budget',
        contactPhone: '+1-555-0302',
        status: RequestStatus.APPROVED,
        requesterId: requester2,
        approverId: approver2,
        departmentId: departments['Business School'],
        approvalDate: new Date(),
      },
      {
        requestNo: generateRequestNo(),
        eventName: 'Engineering Graduation Ceremony',
        eventDate: new Date('2025-12-15T10:00:00Z'),
        venue: 'University Auditorium',
        estimateAmount: 10000.00,
        attendees: 500,
        serviceType: 'Special Events',
        description: 'Graduation ceremony with formal dinner reception',
        fundingSource: 'Special Events Fund',
        contactPhone: '+1-555-0303',
        status: RequestStatus.FULFILLED,
        requesterId: requester3,
        approverId: approver1,
        departmentId: departments['Engineering'],
        approvalDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      },
    ];

    const createdRequests = [] as string[];
    for (const r of requestData) {
      const created = await prisma.serviceRequest.create({ data: r });
      createdRequests.push(created.id);
    }
    console.log('Service Requests created:', createdRequests.length);

    // 4. Invoices for approved/fulfilled requests
    const financeOfficer = users['finance.officer@sasakawa.edu'];
    
    const inv1 = await prisma.invoice.create({
      data: {
        invoiceNo: `INV-${new Date().getFullYear()}-001`,
        requestId: createdRequests[1], // Business School Board Meeting
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        grossAmount: 1200.00,
        taxAmount: 120.00,
        netAmount: 1320.00,
        status: InvoiceStatus.SUBMITTED,
        createdById: financeOfficer,
      },
    });
    
    const inv2 = await prisma.invoice.create({
      data: {
        invoiceNo: `INV-${new Date().getFullYear()}-002`,
        requestId: createdRequests[2], // Engineering Graduation Ceremony
        invoiceDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
        grossAmount: 8500.00,
        taxAmount: 850.00,
        netAmount: 9350.00,
        status: InvoiceStatus.PAID,
        createdById: financeOfficer,
      },
    });
    
    console.log('Invoices created:', [inv1.id, inv2.id]);

    // 5. Payments for paid invoice
    await prisma.payment.create({
      data: {
        paymentNo: `PAY-${new Date().getFullYear()}-001`,
        invoiceId: inv2.id,
        amount: 9350.00,
        method: PaymentMethod.TRANSFER,
        status: PaymentStatus.PROCESSED,
        paymentDate: new Date(),
        reference: 'TXN-12345678',
        createdById: financeOfficer,
      },
    });
    console.log('Payment recorded for invoice', inv2.id);

    // 6. Sample Notifications
    await prisma.notification.create({
      data: {
        userId: users['approver.cs@sasakawa.edu'], // Add required userId
        type: NotificationType.REQUEST_SUBMITTED,
        title: 'New Service Request Submitted',
        message: 'A new service request for Annual Computer Science Conference has been submitted and is awaiting approval.',
        recipientEmail: 'approver.cs@sasakawa.edu',
        requestId: createdRequests[0],
      },
    });

    await prisma.notification.create({
      data: {
        userId: users['finance.officer@sasakawa.edu'], // Add required userId
        type: NotificationType.INVOICE_CREATED,
        title: 'Invoice Generated',
        message: 'Invoice INV-2025-002 has been generated for Engineering Graduation Ceremony.',
        recipientEmail: 'finance.officer@sasakawa.edu',
        invoiceId: inv2.id,
        emailSent: true,
        emailSentAt: new Date(),
      },
    });

    console.log('Sample notifications created');

    // 7. Sample Audit Logs
    await prisma.auditLog.create({
      data: {
        userId: requester1,
        action: 'CREATE_REQUEST',
        details: 'Created service request for Annual Computer Science Conference',
        entityType: 'ServiceRequest',
        entityId: createdRequests[0],
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Seeding)',
        requestId: createdRequests[0],
      },
    });

    console.log('Sample audit logs created');

  } else {
    console.log('Service Requests table not empty; skipping request/invoice/payment seed.');
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error('Seed failure', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
