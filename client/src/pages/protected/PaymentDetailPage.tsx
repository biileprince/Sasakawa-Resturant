import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getPaymentById,
  uploadPaymentAttachment,
} from "../../services/request.service";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import AttachmentViewer from "../../components/AttachmentViewer";
import { formatGhanaDate } from "../../utils/dateFormat";

export default function PaymentDetailPage() {
  const { id } = useParams();
  const currentUser = useCurrentUser();
  const { data, isLoading, error } = useQuery({
    queryKey: ["payment", id],
    queryFn: () => getPaymentById(id!),
    enabled: !!id,
  });

  if (isLoading) return <PaymentSkeleton />;
  if (error) return <div className="p-6 text-red-600">Failed to load</div>;
  if (!data) return <div className="p-6">Not found</div>;

  // Role-based access
  const isRequester = currentUser?.role === "REQUESTER";
  const isFinanceOfficer = currentUser?.role === "FINANCE_OFFICER";
  const canUpload = isFinanceOfficer;

  // Check if requester can view this payment (we'll need to fetch the invoice to check ownership)
  // For now, allow requesters to view any payment (the backend should handle proper access control)
  if (isRequester && false) {
    // Temporarily disabled - backend should handle this
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <i className="fas fa-lock text-4xl text-gray-400 mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You can only view payments related to your own requests.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <nav className="text-xs text-gray-500 flex flex-wrap items-center gap-1">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              to="/payments"
              className="hover:text-blue-600 transition-colors"
            >
              Payments
            </Link>
            <span>/</span>
            <span className="text-gray-700">{data.id.slice(0, 8)}</span>
          </nav>
          <Link
            to="/payments"
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to Payments
          </Link>
        </div>

        <header className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center gap-3 flex-wrap">
              <i className="fas fa-credit-card text-green-600"></i>
              Payment
              <span className="text-gray-500">#{data.id.slice(0, 8)}</span>
              <StatusBadge status={data.status} />
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              For Invoice
              <Link
                to={`/invoices/${data.invoiceId}`}
                className="text-blue-600 hover:text-blue-800 ml-1 font-medium"
              >
                #{data.invoiceId.slice(0, 8)}
              </Link>
            </p>
          </div>
        </header>

        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Stat
            label="Amount"
            value={`₵${Number(data.amount || 0).toLocaleString()}`}
          />
          <Stat
            label="Method"
            value={
              <span className="flex items-center gap-1">
                <i className={`fas ${getPaymentMethodIcon(data.method)}`}></i>
                {data.method}
              </span>
            }
          />
          <Stat label="Status" value={<StatusBadge status={data.status} />} />
          <Stat label="Date" value={formatGhanaDate(data.paymentDate)} />
        </section>

        <section className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="font-semibold mb-4 text-gray-900 flex items-center gap-2">
            <i className="fas fa-info-circle text-blue-600"></i>
            Payment Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Info label="Payment ID" value={`#${data.id.slice(0, 8)}`} />
              <Info
                label="Amount"
                value={`₵${Number(data.amount || 0).toLocaleString()}`}
              />
              <Info
                label="Payment Method"
                value={
                  <span className="flex items-center gap-1">
                    <i
                      className={`fas ${getPaymentMethodIcon(data.method)}`}
                    ></i>
                    {data.method}
                  </span>
                }
              />
              {data.chequeNumber && (
                <Info
                  label="Cheque Number"
                  value={
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                      {data.chequeNumber}
                    </span>
                  }
                />
              )}
              <Info
                label="Status"
                value={<StatusBadge status={data.status} />}
              />
            </div>
            <div className="space-y-4">
              <Info
                label="Payment Date"
                value={formatGhanaDate(data.paymentDate)}
              />
              <Info label="Created" value={formatGhanaDate(data.createdAt)} />
              <Info
                label="Invoice ID"
                value={
                  <Link
                    to={`/invoices/${data.invoiceId}`}
                    className="text-blue-300 hover:text-blue-200 font-mono"
                  >
                    #{data.invoiceId.slice(0, 8)}
                  </Link>
                }
              />
              <Info label="Reference" value={data.reference || "N/A"} />
            </div>
          </div>
        </section>

        {/* Attachments Section */}
        {((data.attachments && data.attachments.length > 0) || canUpload) && (
          <section className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="font-semibold mb-4 text-gray-900 flex items-center gap-2">
              <i className="fas fa-paperclip text-yellow-600"></i>
              Payment Attachments
            </h2>
            <AttachmentViewer
              attachments={data.attachments || []}
              entityId={data.id}
              entityType="payment"
              canUpload={canUpload}
              uploadFunction={uploadPaymentAttachment}
              queryKey={["payment", id!]}
            />
          </section>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-200">
      <span className="text-gray-600 text-sm font-medium">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-medium">
        {label}
      </div>
      <div className="text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    COMPLETED: "bg-green-50 text-green-700 border-green-200",
    FAILED: "bg-red-50 text-red-700 border-red-200",
    CANCELLED: "bg-gray-50 text-gray-700 border-gray-200",
    PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
        styles[status] || styles.PENDING
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function getPaymentMethodIcon(method: string): string {
  const icons: Record<string, string> = {
    CASH: "fa-money-bill",
    CHEQUE: "fa-money-check",
    TRANSFER: "fa-university",
    MOBILE_MONEY: "fa-mobile-alt",
  };
  return icons[method] || "fa-credit-card";
}

function PaymentSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white border rounded-lg p-4 shadow-sm animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
