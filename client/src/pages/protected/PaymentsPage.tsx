import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getPayments,
  createPayment,
  deletePayment,
  getInvoices,
  exportPaymentsExcel,
  uploadPaymentAttachment,
} from "../../services/request.service";
import { useToast } from "../../contexts/ToastContext";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import { Link } from "react-router-dom";
import ExportModal from "../../components/ExportModal";
import AttachmentViewer from "../../components/AttachmentViewer";
import { formatGhanaDate } from "../../utils/dateFormat";

export default function PaymentsPage() {
  const { push } = useToast();
  const currentUser = useCurrentUser();
  const qc = useQueryClient();
  const { data: allPayments, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: getPayments,
  });
  const { data: allInvoices } = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  });
  const [form, setForm] = useState({
    invoiceId: "",
    amount: "",
    method: "",
    reference: "",
    chequeNumber: "",
    paymentDate: new Date().toISOString().split("T")[0],
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [formAttachments, setFormAttachments] = useState<any[]>([]);
  const [createdPayment, setCreatedPayment] = useState<any>(null);
  const [showAttachments, setShowAttachments] = useState(false);

  // Role-based access
  const isRequester = currentUser?.role === "REQUESTER";
  const isFinanceOfficer = currentUser?.role === "FINANCE_OFFICER";

  // Requesters can only see payments for their own invoices
  const payments = isRequester
    ? allPayments?.filter(
        (payment: any) =>
          payment.invoice?.request?.requesterId === currentUser?.id
      )
    : allPayments;

  // Filter invoices for payment creation (only finance officers can create payments)
  const invoices = isFinanceOfficer ? allInvoices : [];

  // Filter invoices that can be paid
  const payableInvoices =
    invoices?.filter((inv: any) =>
      [
        "SUBMITTED",
        "VERIFIED",
        "APPROVED_FOR_PAYMENT",
        "PARTIALLY_PAID",
      ].includes(inv.status)
    ) || [];

  const createMut = useMutation({
    mutationFn: async () =>
      createPayment({
        invoiceId: form.invoiceId,
        amount: Number(form.amount),
        method: form.method as "CHEQUE" | "TRANSFER" | "MOBILE_MONEY" | "CASH",
        reference: form.reference || undefined,
        chequeNumber:
          form.method === "CHEQUE" ? form.chequeNumber || undefined : undefined,
        paymentDate: form.paymentDate,
      }),
    onSuccess: async (payment) => {
      push("Payment recorded successfully", "success");

      // Upload attachments if any were selected
      if (formAttachments.length > 0) {
        try {
          for (const attachment of formAttachments) {
            if (attachment.file) {
              await uploadPaymentAttachment(payment.id, attachment.file);
            }
          }
          push("Payment attachments uploaded successfully", "success");
        } catch (error) {
          console.error("Error uploading attachments:", error);
          push(
            "Payment created but some attachments failed to upload",
            "error"
          );
        }
      }

      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      setCreatedPayment(payment);
      setShowAttachments(true);
      setForm({
        invoiceId: "",
        amount: "",
        method: "",
        reference: "",
        chequeNumber: "",
        paymentDate: new Date().toISOString().split("T")[0],
      });
      setFormAttachments([]);
    },
    onError: (error: any) => {
      console.error("Payment creation error:", error);
      const message =
        error?.response?.data?.message || "Failed to create payment";
      push(message, "error");
    },
  });

  const deleteMut = useMutation({
    mutationFn: deletePayment,
    onSuccess: () => {
      push("Payment deleted successfully", "success");
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error: any) => {
      console.error("Payment deletion error:", error);
      const message =
        error?.response?.data?.message || "Failed to delete payment";
      push(message, "error");
    },
  });

  const canCreate = isFinanceOfficer;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Payments Management
        </h1>
        <div className="flex items-center space-x-4">
          {isFinanceOfficer && (
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <i className="fas fa-file-excel mr-2"></i>
              Export Excel
            </button>
          )}
          <div className="text-sm text-gray-500">
            Total Payments: {payments?.length || 0}
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          Payment Overview
        </h3>
        <div className="text-sm text-blue-800">
          <p>Manage payment records for invoices.</p>
        </div>
      </div>

      {canCreate && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Record New Payment
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMut.mutate();
            }}
            className="space-y-4"
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Invoice
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={form.invoiceId}
                  onChange={(e) => {
                    const selectedInvoice = payableInvoices.find(
                      (inv: any) => inv.id === e.target.value
                    );
                    setForm((f) => ({
                      ...f,
                      invoiceId: e.target.value,
                      amount: selectedInvoice?.netAmount?.toString() || "",
                    }));
                  }}
                  required
                >
                  <option value="">Select an invoice to pay...</option>
                  {payableInvoices.map((inv: any) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNo || inv.id.slice(0, 8)} -{" "}
                      {inv.request?.eventName} (GHS{" "}
                      {Number(inv.netAmount || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={form.paymentDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, paymentDate: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Amount (GHS)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={form.method}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, method: e.target.value }))
                  }
                  required
                >
                  <option value="">Select payment method...</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="TRANSFER">Bank Transfer</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Number
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={form.reference}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, reference: e.target.value }))
                  }
                  placeholder="Transaction reference (optional)"
                />
              </div>
              {form.method === "CHEQUE" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cheque Number
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={form.chequeNumber}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, chequeNumber: e.target.value }))
                    }
                    placeholder="Enter cheque number"
                  />
                </div>
              )}
            </div>

            {/* Payment Attachments Section in Form */}
            <div className="border-t border-gray-200 pt-3">
              <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                <i className="fas fa-paperclip text-yellow-600 text-sm"></i>
                Payment Attachments (Optional)
              </h3>
              <div className="bg-gray-50 rounded-md p-2 max-w-sm max-h-32 overflow-y-auto">
                <AttachmentViewer
                  attachments={formAttachments}
                  entityId="temp-payment-form"
                  entityType="temp"
                  canUpload={true}
                  uploadFunction={async (file: File) => {
                    // Store files temporarily in state for later upload after payment creation
                    const fileWithId = {
                      id: Math.random().toString(36),
                      filename: file.name,
                      fileSize: file.size,
                      fileType: file.type,
                      file: file, // Store the actual file for later upload
                    };
                    setFormAttachments((prev) => [...prev, fileWithId]);
                    return fileWithId;
                  }}
                  onDelete={(attachmentId: string) => {
                    setFormAttachments((prev) =>
                      prev.filter((att) => att.id !== attachmentId)
                    );
                  }}
                  compact={true}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={
                  createMut.isPending ||
                  !form.invoiceId ||
                  !form.amount ||
                  !form.method
                }
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMut.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Recording...
                  </>
                ) : (
                  <>
                    <i className="fas fa-credit-card mr-2"></i>
                    Record Payment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment Attachments Section - Show after creating a payment */}
      {showAttachments && createdPayment && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <i className="fas fa-paperclip text-yellow-600"></i>
              Payment Attachments
            </h3>
            <button
              onClick={() => setShowAttachments(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-800">
              <i className="fas fa-check-circle mr-2"></i>
              <span className="font-medium">
                Payment Recorded Successfully!
              </span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Payment #
              {createdPayment.paymentNo || createdPayment.id?.slice(0, 8)} - Add
              attachments below if needed.
            </p>
          </div>
          <div className="max-h-40 overflow-y-auto">
            <AttachmentViewer
              attachments={createdPayment.attachments || []}
              entityId={createdPayment.id}
              entityType="payment"
              canUpload={true}
              uploadFunction={uploadPaymentAttachment}
              queryKey={["payments"]}
              compact={true}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Payments</h3>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Payment No</Th>
                    <Th>Invoice</Th>
                    <Th>Event</Th>
                    <Th>Amount</Th>
                    <Th>Method</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          <i className="fas fa-credit-card text-4xl text-gray-300 mb-4"></i>
                          <p className="text-lg font-medium">
                            No payments found
                          </p>
                          <p className="text-sm">
                            Record your first payment to get started.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    payments?.map((payment: any) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <Td>
                          <div className="font-medium text-primary-600">
                            {payment.paymentNo || payment.id.slice(0, 8)}
                          </div>
                        </Td>
                        <Td>
                          <div className="text-sm text-gray-900">
                            {payment.invoice?.invoiceNo ||
                              payment.invoiceId?.slice(0, 8) ||
                              "-"}
                          </div>
                        </Td>
                        <Td>
                          <div className="text-sm text-gray-900">
                            {payment.invoice?.request?.eventName || "-"}
                          </div>
                        </Td>
                        <Td>
                          <div className="text-sm font-medium text-gray-900">
                            GHS {Number(payment.amount || 0).toFixed(2)}
                          </div>
                        </Td>
                        <Td>
                          <div className="space-y-1">
                            <PaymentMethodBadge method={payment.method} />
                            {payment.chequeNumber && (
                              <div className="text-xs text-gray-500 font-mono">
                                #{payment.chequeNumber}
                              </div>
                            )}
                          </div>
                        </Td>
                        <Td>
                          <div className="text-sm text-gray-900">
                            {payment.paymentDate
                              ? formatGhanaDate(payment.paymentDate)
                              : "-"}
                          </div>
                        </Td>
                        <Td>
                          <PaymentStatusBadge status={payment.status} />
                        </Td>
                        <Td>
                          <div className="flex space-x-2">
                            <Link
                              to={`/payments/${payment.id}`}
                              className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                            >
                              View
                            </Link>
                            {isFinanceOfficer && (
                              <Link
                                to={`/payments/${payment.id}/edit`}
                                className="text-orange-600 hover:text-orange-900 text-sm font-medium"
                              >
                                Edit
                              </Link>
                            )}
                            {isFinanceOfficer &&
                              payment.status === "CANCELLED" && (
                                <button
                                  onClick={() => {
                                    if (
                                      confirm(
                                        "Are you sure you want to delete this cancelled payment? This action cannot be undone."
                                      )
                                    ) {
                                      deleteMut.mutate(payment.id);
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                                  disabled={deleteMut.isPending}
                                >
                                  {deleteMut.isPending
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              )}
                          </div>
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              {payments?.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <i className="fas fa-credit-card text-4xl text-gray-300 mb-4"></i>
                    <p className="text-lg font-medium">No payments found</p>
                    <p className="text-sm">
                      Record your first payment to get started.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4">
                  {payments?.map((payment: any) => (
                    <div
                      key={payment.id}
                      className="glass-card p-4 border border-primary-100"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 mb-1">
                            {payment.invoice?.request?.eventName || "Payment"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            #{payment.paymentNo || payment.id.slice(0, 8)}
                          </p>
                        </div>
                        <PaymentStatusBadge status={payment.status} />
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            Invoice
                          </p>
                          <p className="text-gray-900">
                            {payment.invoice?.invoiceNo ||
                              payment.invoiceId?.slice(0, 8) ||
                              "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            Payment Date
                          </p>
                          <p className="text-gray-900">
                            {payment.paymentDate
                              ? formatGhanaDate(payment.paymentDate)
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            Amount
                          </p>
                          <p className="text-gray-900 font-medium">
                            GHS {Number(payment.amount || 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            Method
                          </p>
                          <div className="space-y-1">
                            <PaymentMethodBadge method={payment.method} />
                            {payment.chequeNumber && (
                              <div className="text-xs text-gray-500 font-mono">
                                #{payment.chequeNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-end space-x-3">
                          <Link
                            to={`/payments/${payment.id}`}
                            className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                          >
                            View
                          </Link>
                          {isFinanceOfficer && (
                            <Link
                              to={`/payments/${payment.id}/edit`}
                              className="text-orange-600 hover:text-orange-900 text-sm font-medium"
                            >
                              Edit
                            </Link>
                          )}
                          {isFinanceOfficer &&
                            payment.status === "CANCELLED" && (
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      "Are you sure you want to delete this cancelled payment? This action cannot be undone."
                                    )
                                  ) {
                                    deleteMut.mutate(payment.id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-900 text-sm font-medium"
                                disabled={deleteMut.isPending}
                              >
                                {deleteMut.isPending ? "Deleting..." : "Delete"}
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Payments"
        exportFunction={exportPaymentsExcel}
        filename="payments_export"
      />
    </div>
  );
}

function Th({ children, className = "" }: any) {
  return (
    <th
      className={`px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }: any) {
  return (
    <td className={`px-3 sm:px-6 py-4 whitespace-nowrap ${className}`}>
      {children}
    </td>
  );
}

function TableSkeleton({ rows, cols }: { rows: number; cols: number }) {
  return (
    <div className="animate-pulse">
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="grid"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}
          >
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-8 m-1 bg-gray-200 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentMethodBadge({ method }: { method: string }) {
  const getMethodClass = (method: string) => {
    switch (method?.toLowerCase()) {
      case "cheque":
        return "bg-blue-100 text-blue-800";
      case "transfer":
        return "bg-green-100 text-green-800";
      case "mobile_money":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodClass(
        method
      )}`}
    >
      {method?.replace(/_/g, " ")}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const getStatusClass = (status: string) => {
    const baseClass = "status-badge";
    switch (status?.toLowerCase()) {
      case "processed":
        return `${baseClass} status-approved`;
      case "cleared":
        return `${baseClass} status-fulfilled`;
      case "cancelled":
        return `${baseClass} status-rejected`;
      default:
        return `${baseClass} status-draft`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "processed":
        return "fas fa-check-circle";
      case "cleared":
        return "fas fa-check-double";
      case "cancelled":
        return "fas fa-times-circle";
      default:
        return "fas fa-clock";
    }
  };

  return (
    <div className="status-wrapper">
      <span className={getStatusClass(status)}>
        <i className={`${getStatusIcon(status)} mr-1`}></i>
        {status}
      </span>
    </div>
  );
}
