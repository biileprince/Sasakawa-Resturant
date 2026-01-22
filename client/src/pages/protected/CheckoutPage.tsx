//client/src/pages/protected/CheckoutPage.tsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../contexts/ToastContext";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import { useAuthRequired } from "../../hooks/useAuthRequired";
import {
  createRequest,
  getDepartments,
  uploadRequestAttachment,
} from "../../services/request.service";

interface Department {
  id: string;
  name: string;
  code: string;
  costCentre?: string;
}

export default function CheckoutPage() {
  useAuthRequired();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { items, getTotalPrice, clearCart, removeItem, updateQuantity } =
    useCart();
  const { push } = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showCustomDepartment, setShowCustomDepartment] = useState(false);
  const [customDepartmentName, setCustomDepartmentName] = useState("");

  // Form data for event details
  const [formData, setFormData] = useState({
    eventName: "",
    eventDate: "",
    venue: "",
    fundingSource: "",
    contactPhone: "",
    description: "",
    departmentId: "",
  });

  // Fetch departments
  useEffect(() => {
    getDepartments()
      .then(setDepartments)
      .catch((err) => {
        console.error("Failed to fetch departments:", err);
        push("Failed to load departments", "error");
      });
  }, [push]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter((file) => {
        const validTypes = [
          "application/pdf",
          "image/jpeg",
          "image/png",
          "image/gif",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        const maxSize = 10 * 1024 * 1024; // 10MB
        return validTypes.includes(file.type) && file.size <= maxSize;
      });
      setAttachments((prev) => [...prev, ...validFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const getTotalAttendees = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getServiceTypes = () => {
    return [...new Set(items.map((item) => item.serviceType))].join(", ");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      push("Please add at least one package to your cart", "error");
      return;
    }

    // Validate required fields
    if (
      !formData.eventName ||
      !formData.eventDate ||
      !formData.venue ||
      !formData.fundingSource
    ) {
      push("Please fill in all required fields", "error");
      return;
    }

    // Check department - either selected or custom
    if (!formData.departmentId && !customDepartmentName.trim()) {
      push("Please select a department or enter a custom department name", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // Build cart summary for description
      const cartSummary = items
        .map(
          (item) =>
            `- ${item.name} (${item.serviceType}): ${item.quantity} guests @ GH₵${item.pricePerPerson}/person = GH₵${(item.pricePerPerson * item.quantity).toLocaleString()}`
        )
        .join("\n");

      const packageDetails = items.map((item) => ({
        packageId: item.packageId,
        packageName: item.name,
        serviceType: item.serviceType,
        quantity: item.quantity,
        pricePerPerson: item.pricePerPerson,
        subtotal: item.pricePerPerson * item.quantity,
      }));

      // Build department info for description if custom
      const departmentInfo = showCustomDepartment && customDepartmentName.trim()
        ? `\n\n--- Custom Department ---\nDepartment: ${customDepartmentName.trim()}`
        : "";

      // Create the request with all cart items
      const requestData = {
        eventName: formData.eventName,
        eventDate: formData.eventDate,
        venue: formData.venue,
        estimateAmount: getTotalPrice(),
        attendees: getTotalAttendees(),
        serviceType: getServiceTypes(),
        fundingSource: formData.fundingSource,
        contactPhone: formData.contactPhone || undefined,
        description: formData.description
          ? `${formData.description}${departmentInfo}\n\n--- Cart Summary ---\n${cartSummary}`
          : `${departmentInfo ? departmentInfo + '\n\n' : ''}--- Cart Summary ---\n${cartSummary}`,
        departmentId: formData.departmentId || departments[0]?.id, // Use first department as fallback for custom
        // Package information (using first item as primary for backwards compatibility)
        selectedPackageId: items[0]?.packageId,
        packageName:
          items.length > 1
            ? `Multiple Packages (${items.length})`
            : items[0]?.name,
        pricePerPerson: items[0]?.pricePerPerson || 0,
        // Store full cart details as JSON in description or additional field
        cartItems: JSON.stringify(packageDetails),
      };

      const request = await createRequest(requestData);

      // Upload attachments if any
      if (attachments.length > 0) {
        for (const file of attachments) {
          try {
            await uploadRequestAttachment(request.id, file);
          } catch (err) {
            console.error("Failed to upload attachment:", err);
          }
        }
      }

      // Clear cart after successful submission
      clearCart();

      push(`Your service request #${request.requestNo} has been submitted successfully!`, "success");

      navigate(`/requests/${request.id}`);
    } catch (err: unknown) {
      console.error("Failed to submit request:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to submit request";
      push(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-shopping-cart text-4xl text-gray-400"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some packages to your cart before checking out.
          </p>
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <i className="fas fa-utensils"></i>
            Browse Packages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              to="/packages"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <i className="fas fa-arrow-left text-xl"></i>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
              <p className="text-gray-600">Complete your service request</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Items */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-shopping-cart text-blue-600"></i>
                  Your Cart ({items.length} items)
                </h2>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {item.serviceType}
                            </p>
                            <p className="text-sm text-blue-600 font-medium">
                              GH₵ {item.pricePerPerson}/person
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-sm text-gray-600">Guests:</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                              className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            >
                              <i className="fas fa-minus text-xs"></i>
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  item.id,
                                  Math.max(1, parseInt(e.target.value) || 1)
                                )
                              }
                              className="w-16 text-center border rounded py-1"
                              min="1"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            >
                              <i className="fas fa-plus text-xs"></i>
                            </button>
                          </div>
                          <span className="ml-auto font-semibold text-gray-900">
                            GH₵{" "}
                            {(
                              item.pricePerPerson * item.quantity
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Link
                    to="/packages"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2"
                  >
                    <i className="fas fa-plus"></i>
                    Add More Packages
                  </Link>
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-calendar-alt text-blue-600"></i>
                  Event Details
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="eventName"
                      value={formData.eventName}
                      onChange={handleInputChange}
                      placeholder="e.g., Annual Faculty Meeting"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Venue <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleInputChange}
                      placeholder="e.g., Main Auditorium"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    {!showCustomDepartment ? (
                      <>
                        <select
                          name="departmentId"
                          value={formData.departmentId}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name} ({dept.code})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomDepartment(true);
                            setFormData((prev) => ({ ...prev, departmentId: "" }));
                          }}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <i className="fas fa-plus text-xs"></i>
                          My department is not listed
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={customDepartmentName}
                          onChange={(e) => setCustomDepartmentName(e.target.value)}
                          placeholder="Enter your department name"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomDepartment(false);
                            setCustomDepartmentName("");
                          }}
                          className="mt-2 text-sm text-gray-600 hover:text-gray-700 flex items-center gap-1"
                        >
                          <i className="fas fa-arrow-left text-xs"></i>
                          Select from list instead
                        </button>
                      </>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Funding Source <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="fundingSource"
                      value={formData.fundingSource}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Funding Source</option>
                      <option value="Department Budget">Department Budget</option>
                      <option value="Research Grant">Research Grant</option>
                      <option value="External Sponsor">External Sponsor</option>
                      <option value="University Fund">University Fund</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      placeholder="e.g., 024 123 4567"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Any special requirements, dietary restrictions, or additional information..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-paperclip text-blue-600"></i>
                  Attachments (Optional)
                </h2>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex flex-col items-center"
                  >
                    <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                    <span className="text-gray-600">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-sm text-gray-400 mt-1">
                      PDF, DOC, DOCX, JPG, PNG (max 10MB each)
                    </span>
                  </label>
                </div>

                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <i className="fas fa-file text-blue-600"></i>
                          <span className="text-sm text-gray-700">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium text-gray-900">
                        GH₵ {(item.pricePerPerson * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Total Guests</span>
                    <span>{getTotalAttendees()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Services</span>
                    <span>{getServiceTypes()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 mt-4 pt-4 border-t">
                    <span>Total Estimate</span>
                    <span className="text-blue-600">
                      GH₵ {getTotalPrice().toLocaleString()}
                    </span>
                  </div>
                </div>

                {currentUser && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-600">Requesting as:</p>
                    <p className="font-medium text-gray-900">
                      {currentUser.name}
                    </p>
                    <p className="text-sm text-gray-500">{currentUser.email}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Submit Request
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Your request will be reviewed by your department approver
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
