import ExcelJS from 'exceljs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ExportOptions {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}

/**
 * Export invoices to Excel format
 */
export async function exportInvoicesToExcel(options: ExportOptions = {}): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Invoices');

  // Set up headers
  const headers = [
    'Invoice No',
    'Request ID', 
    'Event Name',
    'Service Type',
    'Department',
    'Requester',
    'Invoice Date',
    'Due Date', 
    'Gross Amount (GHS)',
    'Tax Amount (GHS)',
    'Net Amount (GHS)',
    'Status',
    'Total Paid (GHS)',
    'Balance (GHS)',
    'Created Date'
  ];

  worksheet.addRow(headers);

  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '4472C4' }
  };
  headerRow.alignment = { horizontal: 'center' };

  // Build filter conditions
  let whereClause: any = {};
  
  if (options.dateFrom || options.dateTo) {
    whereClause.invoiceDate = {};
    if (options.dateFrom) {
      whereClause.invoiceDate.gte = new Date(options.dateFrom);
    }
    if (options.dateTo) {
      whereClause.invoiceDate.lte = new Date(options.dateTo);
    }
  }

  if (options.status) {
    whereClause.status = options.status;
  }

  // Fetch invoices with related data
  const invoices = await prisma.invoice.findMany({
    where: whereClause,
    include: {
      request: {
        include: {
          requester: { select: { name: true, email: true } },
          department: { select: { name: true, code: true } }
        }
      },
      payments: {
        where: {
          status: {
            not: 'CANCELLED' // Exclude cancelled payments from totals
          }
        }
      },
      createdBy: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Add data rows
  invoices.forEach(invoice => {
    const totalPaid = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const balance = Number(invoice.netAmount) - totalPaid;

    const row = [
      invoice.invoiceNo,
      invoice.request.id,
      invoice.request.eventName,
      invoice.request.serviceType,
      invoice.request.department?.name || '',
      invoice.request.requester.name,
      invoice.invoiceDate.toISOString().split('T')[0],
      invoice.dueDate.toISOString().split('T')[0],
      Number(invoice.grossAmount),
      Number(invoice.taxAmount),
      Number(invoice.netAmount),
      invoice.status,
      totalPaid,
      balance,
      invoice.createdAt.toISOString().split('T')[0]
    ];

    worksheet.addRow(row);
  });

  // Auto-fit columns
  worksheet.columns.forEach(column => {
    let maxLength = 0;
    if (column.eachCell) {
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
    }
    column.width = Math.min(Math.max(maxLength + 2, 10), 50);
  });

  // Add borders to all cells with data
  const dataRange = `A1:O${invoices.length + 1}`;
  worksheet.getCell(dataRange).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  // Generate Excel buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Export payments to Excel format
 */
export async function exportPaymentsToExcel(options: ExportOptions = {}): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Payments');

  // Set up headers
  const headers = [
    'Payment No',
    'Invoice No',
    'Request ID',
    'Event Name',
    'Service Type', 
    'Department',
    'Requester',
    'Payment Date',
    'Amount (GHS)',
    'Method',
    'Reference',
    'Status',
    'Created By',
    'Created Date'
  ];

  worksheet.addRow(headers);

  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '70AD47' }
  };
  headerRow.alignment = { horizontal: 'center' };

  // Build filter conditions
  let whereClause: any = {};
  
  if (options.dateFrom || options.dateTo) {
    whereClause.paymentDate = {};
    if (options.dateFrom) {
      whereClause.paymentDate.gte = new Date(options.dateFrom);
    }
    if (options.dateTo) {
      whereClause.paymentDate.lte = new Date(options.dateTo);
    }
  }

  if (options.status) {
    whereClause.status = options.status;
  }

  // Fetch payments with related data
  const payments = await prisma.payment.findMany({
    where: whereClause,
    include: {
      invoice: {
        include: {
          request: {
            include: {
              requester: { select: { name: true, email: true } },
              department: { select: { name: true, code: true } }
            }
          }
        }
      },
      createdBy: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Add data rows
  payments.forEach(payment => {
    const row = [
      payment.paymentNo,
      payment.invoice.invoiceNo,
      payment.invoice.request.id,
      payment.invoice.request.eventName,
      payment.invoice.request.serviceType,
      payment.invoice.request.department?.name || '',
      payment.invoice.request.requester.name,
      payment.paymentDate.toISOString().split('T')[0],
      Number(payment.amount),
      payment.method,
      payment.reference || '',
      payment.status,
      payment.createdBy.name,
      payment.createdAt.toISOString().split('T')[0]
    ];

    worksheet.addRow(row);
  });

  // Auto-fit columns
  worksheet.columns.forEach(column => {
    let maxLength = 0;
    if (column.eachCell) {
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
    }
    column.width = Math.min(Math.max(maxLength + 2, 10), 50);
  });

  // Add borders to all cells with data
  const dataRange = `A1:N${payments.length + 1}`;
  worksheet.getCell(dataRange).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  // Generate Excel buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
