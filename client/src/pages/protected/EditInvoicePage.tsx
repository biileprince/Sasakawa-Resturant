import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getInvoiceById,
  updateInvoice,
  uploadInvoiceAttachment,
} from "../../services/request.service";
import { useToast } from "../../contexts/ToastContext";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import AttachmentViewer from "../../components/AttachmentViewer";

export default function EditInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { push } = useToast();
  const currentUser = useCurrentUser();
  const qc = useQueryClient();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => getInvoiceById(id!),
    enabled: !!id,
  });

  const [form, setForm] = useState({
    invoiceDate: "",
    dueDate: "",
    grossAmount: "",
    taxAmount: "",
    netAmount: "",
    status: "",
  });

  useEffect(() => {
    if (invoice) {
      setForm({
        invoiceDate: invoice.invoiceDate
          ? new Date(invoice.invoiceDate).toISOString().split("T")[0]
          : "",
        dueDate: invoice.dueDate
          ? new Date(invoice.dueDate).toISOString().split("T")[0]
          : "",
        grossAmount: Number(invoice.grossAmount || 0).toString(),
        taxAmount: Number(invoice.taxAmount || 0).toString(),
        netAmount: Number(invoice.netAmount || 0).toString(),
        status: invoice.status || "",
      });
    }
  }, [invoice]);

  // Calculate net amount when gross or tax changes
  const updateNetAmount = (gross: string, tax: string) => {
    const grossNum = parseFloat(gross) || 0;
    const taxNum = parseFloat(tax) || 0;
    const net = grossNum + taxNum;
    setForm((f) => ({ ...f, netAmount: net.toString() }));
  };

  const updateMut = useMutation({
    mutationFn: async () =>
      updateInvoice(id!, {
        invoiceDate: form.invoiceDate,
        dueDate: form.dueDate,
        grossAmount: Number(form.grossAmount),
        taxAmount: Number(form.taxAmount),
        netAmount: Number(form.netAmount),
        status: form.status,
      }),
    onSuccess: () => {
      push("Invoice updated successfully", "success");
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["invoice", id] });
      navigate("/invoices");
    },
    onError: (error: any) => {
      console.error("Invoice update error:", error);
      const message =
        error?.response?.data?.message || "Failed to update invoice";
      push(message, "error");
    },
  });

  const canEdit = currentUser?.role === "FINANCE_OFFICER";

  if (!canEdit) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">
            You don't have permission to edit invoices.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Invoice not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Invoice</h1>
        <button
          onClick={() => navigate("/invoices")}
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back to Invoices
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Invoice Information
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>Invoice ID:</strong> {invoice.id}
            </p>
            <p>
              <strong>Invoice No:</strong> {invoice.invoiceNo}
            </p>
            <p>
              <strong>Request ID:</strong> {invoice.requestId}
            </p>
            <p>
              <strong>Current Status:</strong>
              <span
                className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  invoice.status === "SUBMITTED"
                    ? "bg-blue-100 text-blue-800"
                    : invoice.status === "VERIFIED"
                    ? "bg-yellow-100 text-yellow-800"
                    : invoice.status === "APPROVED_FOR_PAYMENT"
                    ? "bg-green-100 text-green-800"
                    : invoice.status === "PAID"
                    ? "bg-green-100 text-green-800"
                    : invoice.status === "PARTIALLY_PAID"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {invoice.status?.replace(/_/g, " ")}
              </span>
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateMut.mutate();
          }}
          className="space-y-4"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={form.invoiceDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, invoiceDate: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-3">
              Amount Breakdown
            </h4>
            <p className="text-xs text-blue-700 mb-3">
              <strong>Gross Amount:</strong> The base amount before taxes or
              fees
              <br />
              <strong>Tax Amount:</strong> Additional taxes/fees to be added
              <br />
              <strong>Net Amount:</strong> Total amount due (Gross + Tax)
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gross Amount (GHS)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={form.grossAmount}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, grossAmount: e.target.value }));
                    updateNetAmount(e.target.value, form.taxAmount);
                  }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Amount (GHS)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={form.taxAmount}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, taxAmount: e.target.value }));
                    updateNetAmount(form.grossAmount, e.target.value);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Net Amount (GHS)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={form.netAmount}
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  Calculated automatically
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value }))
              }
              required
            >
              <option value="SUBMITTED">Submitted</option>
              <option value="VERIFIED">Verified</option>
              <option value="APPROVED_FOR_PAYMENT">Approved for Payment</option>
              <option value="PAID">Paid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/invoices")}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMut.isPending}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {updateMut.isPending ? "Updating..." : "Update Invoice"}
            </button>
          </div>
        </form>
      </div>

      {/* Invoice Attachments Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <i className="fas fa-paperclip text-yellow-600"></i>
          Invoice Attachments
        </h3>
        <AttachmentViewer
          attachments={invoice.attachments || []}
          entityId={invoice.id}
          entityType="invoice"
          canUpload={true}
          uploadFunction={uploadInvoiceAttachment}
          queryKey={["invoice", id!]}
          compact={true}
        />
      </div>
    </div>
  );
}
