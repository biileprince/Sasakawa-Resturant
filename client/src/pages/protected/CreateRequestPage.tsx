//client/src/pages/protected/CreateRequestPage.tsx

import { useState, useEffect } from "react";
import {
  createRequest,
  getDepartments,
  uploadRequestAttachment,
} from "../../services/request.service";
import { useToast } from "../../contexts/ToastContext";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import { useNavigate } from "react-router-dom";
import { useAuthRequired } from "../../hooks/useAuthRequired";
import type { CreateServiceRequestInput } from "../../types/request";

// Food packages for different service types
const FOOD_PACKAGES = {
  "Breakfast Service": [
    {
      id: "breakfast_basic",
      name: "Basic Breakfast Package",
      pricePerPerson: 15,
      description: "Tea/Coffee, Bread, Butter, Jam",
      image:
        "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop",
      includes: [
        "Hot Tea/Coffee",
        "Fresh Bread",
        "Butter & Jam",
        "Sugar & Milk",
      ],
    },
    {
      id: "breakfast_standard",
      name: "Standard Breakfast Package",
      pricePerPerson: 25,
      description: "Tea/Coffee, Bread, Eggs, Sausage, Fruit",
      image:
        "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop",
      includes: [
        "Hot Tea/Coffee",
        "Fresh Bread",
        "Scrambled Eggs",
        "Sausages",
        "Fresh Fruit",
        "Juice",
      ],
    },
    {
      id: "breakfast_premium",
      name: "Premium Breakfast Package",
      pricePerPerson: 35,
      description:
        "Full Continental Breakfast with Local & International Options",
      image:
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop",
      includes: [
        "Continental Buffet",
        "Local Dishes",
        "Premium Coffee",
        "Fresh Juices",
        "Pastries",
        "Cereals",
      ],
    },
  ],
  "Lunch Service": [
    {
      id: "lunch_basic",
      name: "Basic Lunch Package",
      pricePerPerson: 30,
      description: "Rice, Stew, Protein, Water",
      image:
        "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
      includes: [
        "Jollof/White Rice",
        "Stew",
        "Chicken/Fish",
        "Water",
        "Fruits",
      ],
    },
    {
      id: "lunch_standard",
      name: "Standard Lunch Package",
      pricePerPerson: 45,
      description: "Rice, Stew, Protein, Vegetables, Fruit, Drink",
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
      includes: [
        "Jollof/Fried Rice",
        "Stew",
        "Grilled Protein",
        "Vegetables",
        "Salad",
        "Soft Drinks",
        "Dessert",
      ],
    },
    {
      id: "lunch_premium",
      name: "Premium Lunch Package",
      pricePerPerson: 60,
      description: "Multiple Options, Dessert, Premium Drinks",
      image:
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
      includes: [
        "Multiple Rice Options",
        "Variety of Proteins",
        "Gourmet Sides",
        "Premium Drinks",
        "Ice Cream",
        "Local Delicacies",
      ],
    },
    {
      id: "lunch_local",
      name: "Local Cuisine Package",
      pricePerPerson: 35,
      description: "Traditional Ghanaian Dishes",
      image:
        "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop",
      includes: [
        "Waakye/Banku",
        "Palm Nut Soup",
        "Tilapia/Goat",
        "Shito",
        "Kelewele",
        "Sobolo",
      ],
    },
  ],
  "Dinner Service": [
    {
      id: "dinner_basic",
      name: "Basic Dinner Package",
      pricePerPerson: 40,
      description: "Rice/Yam, Stew, Protein, Water",
      image:
        "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop",
      includes: [
        "Rice/Boiled Yam",
        "Tomato Stew",
        "Grilled Chicken",
        "Water",
        "Fruits",
      ],
    },
    {
      id: "dinner_standard",
      name: "Standard Dinner Package",
      pricePerPerson: 55,
      description: "Rice/Yam, Stew, Protein, Vegetables, Drink",
      image:
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop",
      includes: [
        "Jollof Rice/Fried Yam",
        "Rich Stew",
        "Premium Protein",
        "Steamed Vegetables",
        "Soft Drinks",
        "Side Salad",
      ],
    },
    {
      id: "dinner_premium",
      name: "Premium Dinner Package",
      pricePerPerson: 75,
      description: "Multi-course Dinner with Premium Options",
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
      includes: [
        "3-Course Meal",
        "Appetizer",
        "Main Course",
        "Dessert",
        "Wine/Premium Drinks",
        "Cheese Board",
      ],
    },
    {
      id: "dinner_buffet",
      name: "Buffet Dinner Package",
      pricePerPerson: 85,
      description: "All-you-can-eat Buffet Style",
      image:
        "https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=300&fit=crop",
      includes: [
        "Unlimited Buffet",
        "Multiple Cuisines",
        "Live Cooking Station",
        "Dessert Bar",
        "Premium Beverages",
        "Salad Bar",
      ],
    },
  ],
  "Special Events": [
    {
      id: "event_cocktail",
      name: "Cocktail Package",
      pricePerPerson: 50,
      description: "Finger Foods, Appetizers, Drinks",
      image:
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
      includes: [
        "Canapés",
        "Finger Foods",
        "Cocktails",
        "Wine",
        "Champagne",
        "Appetizer Platters",
      ],
    },
    {
      id: "event_gala",
      name: "Gala Dinner Package",
      pricePerPerson: 100,
      description: "3-course Gala Dinner with Premium Service",
      image:
        "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&h=300&fit=crop",
      includes: [
        "Welcome Cocktail",
        "3-Course Dinner",
        "Premium Wine Pairing",
        "Live Entertainment",
        "Decorative Setup",
        "Cake Cutting",
      ],
    },
    {
      id: "event_celebration",
      name: "Celebration Package",
      pricePerPerson: 80,
      description: "Party Food, Cake, Decorative Setup",
      image:
        "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop",
      includes: [
        "Party Platters",
        "Custom Cake",
        "Decorations",
        "Party Drinks",
        "Music Setup",
        "Photography Corner",
      ],
    },
  ],
  "Corporate Meetings": [
    {
      id: "meeting_light",
      name: "Light Refreshments",
      pricePerPerson: 20,
      description: "Tea/Coffee, Biscuits, Light Snacks",
      image:
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
      includes: [
        "Tea/Coffee",
        "Assorted Biscuits",
        "Light Snacks",
        "Water",
        "Fruits",
        "Note Pads",
      ],
    },
    {
      id: "meeting_full",
      name: "Full Meeting Package",
      pricePerPerson: 40,
      description: "Breakfast/Lunch, Refreshments, Water",
      image:
        "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=300&fit=crop",
      includes: [
        "Morning Breakfast",
        "Lunch",
        "2 Coffee Breaks",
        "Water Bottles",
        "Meeting Materials",
        "Wi-Fi Access",
      ],
    },
  ],
  "Academic Events": [
    {
      id: "academic_conference",
      name: "Conference Package",
      pricePerPerson: 35,
      description: "Breakfast, Lunch, 2 Coffee Breaks",
      image:
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop",
      includes: [
        "Welcome Breakfast",
        "Conference Lunch",
        "2 Coffee Breaks",
        "Conference Materials",
        "Name Tags",
        "Certificates",
      ],
    },
    {
      id: "academic_seminar",
      name: "Seminar Package",
      pricePerPerson: 25,
      description: "Light Meal, Refreshments",
      image:
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=300&fit=crop",
      includes: [
        "Light Lunch",
        "Tea/Coffee Break",
        "Snacks",
        "Seminar Materials",
        "Feedback Forms",
        "Networking Session",
      ],
    },
    {
      id: "academic_workshop",
      name: "Workshop Package",
      pricePerPerson: 30,
      description: "Lunch, Coffee Breaks, Snacks",
      image:
        "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop",
      includes: [
        "Workshop Lunch",
        "Morning Coffee",
        "Afternoon Break",
        "Hands-on Materials",
        "Take-home Resources",
        "Group Activities",
      ],
    },
  ],
};

export default function CreateRequestPage() {
  useAuthRequired(); // Redirect to sign-in if not authenticated
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { push } = useToast();

  // Form state
  const [formData, setFormData] = useState<CreateServiceRequestInput>({
    eventName: "",
    eventDate: "",
    venue: "",
    estimateAmount: 0,
    attendees: 1,
    serviceType: "",
    fundingSource: "",
    contactPhone: "",
    description: "",
    departmentId: "",
    departmentName: "",
    phone: "",
  });

  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [showPackageModal, setShowPackageModal] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<
    { id: string; name: string; code: string }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const usingNewDept =
    !formData.departmentId && (formData.departmentName?.length || 0) > 0;

  // Get available packages based on selected service type
  const availablePackages = formData.serviceType
    ? FOOD_PACKAGES[formData.serviceType as keyof typeof FOOD_PACKAGES] || []
    : [];

  // Get selected package details
  const selectedPackageDetails = availablePackages.find(
    (pkg) => pkg.id === selectedPackage
  );

  // Auto-calculate estimate amount when package or attendees change
  useEffect(() => {
    if (selectedPackageDetails && formData.attendees > 0) {
      const calculatedAmount =
        selectedPackageDetails.pricePerPerson * formData.attendees;
      setFormData((prev) => ({ ...prev, estimateAmount: calculatedAmount }));
    }
  }, [selectedPackage, formData.attendees, selectedPackageDetails]);

  // Reset package selection when service type changes
  useEffect(() => {
    setSelectedPackage("");
    setFormData((prev) => ({ ...prev, estimateAmount: 0 }));
  }, [formData.serviceType]);

  useEffect(() => {
    (async () => {
      try {
        const list = await getDepartments();
        setDepartments(list);
      } catch (_) {
        // ignore
      }
    })();
  }, []);

  // File handling functions
  const handleFileSelect = (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);

    // Validate files
    const validFiles = fileArray.filter((file) => {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        push(
          `File "${file.name}" is too large. Maximum size is 10MB.`,
          "error"
        );
        return false;
      }

      // Check file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
      ];

      if (!allowedTypes.includes(file.type)) {
        push(`File "${file.name}" has an unsupported format.`, "error");
        return false;
      }

      return true;
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    setIsDragOver(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev - 1);
    if (dragCounter <= 1) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileSelect(droppedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileName: string, fileType: string) => {
    if (fileType.startsWith("image/")) return "fas fa-image text-green-500";
    if (fileType === "application/pdf") return "fas fa-file-pdf text-red-500";
    if (fileType.includes("word")) return "fas fa-file-word text-blue-500";
    if (fileType.includes("excel") || fileType.includes("spreadsheet"))
      return "fas fa-file-excel text-green-600";
    if (fileType.includes("text")) return "fas fa-file-alt text-gray-500";

    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "fas fa-file-pdf text-red-500";
      case "doc":
      case "docx":
        return "fas fa-file-word text-blue-500";
      case "xls":
      case "xlsx":
        return "fas fa-file-excel text-green-600";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "fas fa-image text-green-500";
      case "txt":
        return "fas fa-file-alt text-gray-500";
      default:
        return "fas fa-file text-gray-400";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (!formData.departmentId && !formData.departmentName)
        throw new Error("Department required");
      if (!formData.serviceType) throw new Error("Service type required");
      if (
        formData.serviceType &&
        availablePackages.length > 0 &&
        !selectedPackage
      )
        throw new Error(
          "Please select a food package for " + formData.serviceType
        );
      if (!currentUser?.phone && !formData.phone)
        throw new Error("Personal phone number required");

      // Create the request first
      const created = await createRequest({
        ...formData,
        contactPhone: formData.contactPhone || undefined,
        departmentId: formData.departmentId || undefined,
        departmentName: usingNewDept ? formData.departmentName : undefined,
        phone:
          !currentUser?.phone && formData.phone ? formData.phone : undefined,
        // Add food package information
        selectedPackageId: selectedPackage || undefined,
        packageName: selectedPackageDetails?.name || undefined,
        pricePerPerson: selectedPackageDetails?.pricePerPerson || undefined,
      });

      // Upload files if any
      if (files.length > 0) {
        try {
          await Promise.all(
            files.map((file) => uploadRequestAttachment(created.id, file))
          );
          push(
            `Request created with ${files.length} file(s) uploaded`,
            "success"
          );
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
          push("Request created but some files failed to upload", "error");
        }
      } else {
        push("Request created", "success");
      }

      navigate(`/requests/${created.id}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to create request";
      setError(msg);
      push(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen section-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg">
              <i className="fas fa-plus text-primary-600 text-xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Create Service Request
              </h1>
              <p className="text-gray-200">
                Submit a new service request for catering services
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="form-container-compact">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Information Section */}
            <div className="form-section">
              <div className="form-section-title">
                <i className="fas fa-calendar-alt mr-3 text-primary-600"></i>
                Event Information
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Event Name *</label>
                  <input
                    type="text"
                    value={formData.eventName}
                    onChange={(e) =>
                      setFormData({ ...formData, eventName: e.target.value })
                    }
                    required
                    className="form-input"
                    placeholder="Enter the name of your event"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Event Date *</label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) =>
                      setFormData({ ...formData, eventDate: e.target.value })
                    }
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Venue *</label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) =>
                      setFormData({ ...formData, venue: e.target.value })
                    }
                    required
                    className="form-input"
                    placeholder="Event location or venue name"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Service Type *</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) =>
                      setFormData({ ...formData, serviceType: e.target.value })
                    }
                    required
                    className="form-select"
                  >
                    <option value="">Select service type...</option>
                    <option value="Breakfast Service">Breakfast Service</option>
                    <option value="Lunch Service">Lunch Service</option>
                    <option value="Dinner Service">Dinner Service</option>
                    <option value="Special Events">Special Events</option>
                    <option value="Corporate Meetings">
                      Corporate Meetings
                    </option>
                    <option value="Academic Events">Academic Events</option>
                  </select>
                </div>

                {/* Food Package Selection - Show only when service type is selected */}
                {formData.serviceType && availablePackages.length > 0 && (
                  <div className="form-field">
                    <label className="form-label">
                      <i className="fas fa-utensils mr-2 text-primary-600"></i>
                      Food Package *
                    </label>

                    {/* Package Selection Button */}
                    <button
                      type="button"
                      onClick={() => setShowPackageModal(true)}
                      className={`w-full p-4 text-left border-2 border-dashed rounded-lg transition-all duration-200 ${
                        selectedPackageDetails
                          ? "border-green-300 bg-green-50"
                          : "border-gray-300 hover:border-primary-400 hover:bg-primary-50"
                      }`}
                    >
                      {selectedPackageDetails ? (
                        <div className="flex items-center space-x-4">
                          <img
                            src={selectedPackageDetails.image}
                            alt={selectedPackageDetails.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {selectedPackageDetails.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {selectedPackageDetails.description}
                            </p>
                            <p className="text-sm font-medium text-green-600 mt-1">
                              ₵{selectedPackageDetails.pricePerPerson} per
                              person
                            </p>
                          </div>
                          <div className="text-green-600">
                            <i className="fas fa-check-circle text-xl"></i>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <i className="fas fa-plus-circle text-3xl text-gray-400 mb-2"></i>
                          <p className="text-gray-600 font-medium">
                            Select Food Package
                          </p>
                          <p className="text-sm text-gray-500">
                            Browse available packages for {formData.serviceType}
                          </p>
                        </div>
                      )}
                    </button>
                  </div>
                )}

                <div className="form-field">
                  <label className="form-label">Number of Attendees *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.attendees}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        attendees: Number(e.target.value),
                      })
                    }
                    required
                    className="form-input"
                    placeholder="Expected number of attendees"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.contactPhone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPhone: e.target.value })
                    }
                    className="form-input"
                    placeholder="Contact phone number for this event"
                    pattern="[+]?[0-9\s\-\(\)]+"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    <i className="fas fa-info-circle mr-1"></i>
                    phone number specific to this event for coordination
                  </p>
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Event Description</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="form-textarea"
                  placeholder="Provide additional details about your event (optional)"
                  rows={4}
                />
              </div>
            </div>

            {/* Financial Information Section */}
            <div className="form-section">
              <div className="form-section-title">
                <span className="mr-3 text-primary-600 font-bold text-lg">
                  ₵
                </span>
                Financial Information
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Estimate Amount (GHS) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.estimateAmount}
                      required
                      className="form-input pl-8 bg-gray-50"
                      placeholder="0.00"
                      readOnly
                    />
                  </div>
                  {selectedPackageDetails && formData.attendees > 0 && (
                    <p className="text-sm text-green-600 mt-2">
                      <i className="fas fa-calculator mr-1"></i>
                      Auto-calculated: ₵{
                        selectedPackageDetails.pricePerPerson
                      }{" "}
                      × {formData.attendees} attendees = ₵
                      {formData.estimateAmount.toFixed(2)}
                    </p>
                  )}
                  {!selectedPackageDetails && (
                    <p className="text-sm text-gray-500 mt-1">
                      <i className="fas fa-info-circle mr-1"></i>
                      Amount will be calculated automatically when you select a
                      food package and enter number of attendees
                    </p>
                  )}
                </div>

                <div className="form-field">
                  <label className="form-label">Funding Source *</label>
                  <select
                    value={formData.fundingSource}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fundingSource: e.target.value,
                      })
                    }
                    required
                    className="form-select"
                  >
                    <option value="">Select funding source...</option>
                    <option value="departmental_budget">
                      Departmental Budget
                    </option>
                    <option value="project_funds">Project Funds</option>
                    <option value="external_grant">External Grant</option>
                    <option value="student_fees">Student Fees</option>
                    <option value="university_funds">University Funds</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Department Information Section */}
            <div className="form-section">
              <div className="form-section-title">
                <i className="fas fa-building mr-3 text-primary-600"></i>
                Department Information
              </div>

              <div className="space-y-4">
                <div className="form-field">
                  <label className="form-label">Select Department *</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        departmentId: e.target.value,
                        departmentName: "",
                      });
                    }}
                    className="form-select"
                    disabled={(formData.departmentName?.length || 0) > 0}
                  >
                    <option value="">Select existing department...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-4 text-sm text-gray-500 bg-white">
                    OR
                  </span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                <div className="form-field">
                  <label className="form-label">Your Department Name</label>
                  <input
                    type="text"
                    placeholder="Enter your department name"
                    value={formData.departmentName}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        departmentName: e.target.value,
                        departmentId: "",
                      });
                    }}
                    className="form-input"
                    disabled={!!formData.departmentId}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    <i className="fas fa-info-circle mr-1"></i>
                    If your department is not listed above, please enter its
                    name here
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Contact Information Section - Only show if user has no phone */}
            {!currentUser?.phone && (
              <div className="form-section">
                <div className="form-section-title">
                  <i className="fas fa-user mr-3 text-primary-600"></i>
                  Personal Contact Information
                </div>

                <div className="form-field">
                  <label className="form-label">Your Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                    }}
                    className="form-input"
                    required={!currentUser?.phone}
                    pattern="[+]?[0-9\s\-\(\)]+"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    <i className="fas fa-info-circle mr-1"></i>
                    This will be saved to your profile for future requests
                  </p>
                </div>
              </div>
            )}

            {/* Attachments Section */}
            <div className="form-section">
              <div className="form-section-title">
                <i className="fas fa-paperclip mr-3 text-primary-600"></i>
                Attachments (Optional)
              </div>

              {/* Drag and Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                  isDragOver
                    ? "border-primary-400 bg-primary-50 scale-[1.02]"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="attachments"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileSelect(e.target.files);
                    }
                  }}
                />
                <label htmlFor="attachments" className="cursor-pointer block">
                  <div className="text-center">
                    <i
                      className={`fas fa-cloud-upload-alt text-4xl mb-4 transition-colors ${
                        isDragOver ? "text-primary-500" : "text-gray-400"
                      }`}
                    ></i>
                    <div className="text-lg font-medium text-gray-700 mb-2">
                      {isDragOver ? (
                        <span className="text-primary-600 font-semibold">
                          Drop files here to upload
                        </span>
                      ) : (
                        "Click to upload files or drag and drop"
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mb-4">
                      PDF, DOC, DOCX, XLS, XLSX, PNG, JPG up to 10MB each
                    </div>
                    {!isDragOver && (
                      <div className="mt-4">
                        <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                          <i className="fas fa-plus mr-2"></i>
                          Choose Files
                        </span>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Selected Files List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Selected Files ({files.length}):
                  </h4>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <i
                          className={`${getFileIcon(
                            file.name,
                            file.type
                          )} text-xl`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 text-sm text-gray-600">
                <i className="fas fa-info-circle mr-1 text-blue-500"></i>
                You can attach relevant documents such as event proposals,
                budgets, or supporting materials.
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-accent-red-50 border border-accent-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-triangle text-accent-red-600 mr-2"></i>
                  <span className="text-accent-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="form-submit-section">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-yellow"
              >
                <i className="fas fa-times mr-2"></i>
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary btn-shimmer"
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Creating Request...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    Create Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Food Package Selection Modal */}
        {showPackageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999] overflow-y-auto">
            <div className="bg-white rounded-lg max-w-6xl w-full my-8 flex flex-col max-h-[calc(100vh-4rem)]">
              {/* Modal Header - Fixed */}
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      <i className="fas fa-utensils mr-3 text-primary-600"></i>
                      Choose Food Package
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Select a package for:{" "}
                      <span className="font-semibold">
                        {formData.serviceType}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPackageModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <i className="fas fa-times text-2xl"></i>
                  </button>
                </div>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="p-6 overflow-y-auto flex-1 min-h-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availablePackages.map((pkg: any) => (
                    <div
                      key={pkg.id}
                      className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                        selectedPackage === pkg.id
                          ? "border-green-500 bg-green-50 transform scale-105 shadow-lg"
                          : "border-gray-200 hover:border-primary-400 hover:shadow-md"
                      }`}
                      onClick={() => {
                        setSelectedPackage(pkg.id);
                        setShowPackageModal(false);
                      }}
                    >
                      {/* Package Image */}
                      <div className="relative">
                        <img
                          src={pkg.image}
                          alt={pkg.name}
                          className="w-full h-48 object-cover"
                        />
                        {selectedPackage === pkg.id && (
                          <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-2">
                            <i className="fas fa-check text-sm"></i>
                          </div>
                        )}
                        <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full">
                          <span className="font-bold">
                            ₵{pkg.pricePerPerson}/person
                          </span>
                        </div>
                      </div>

                      {/* Package Details */}
                      <div className="p-4">
                        <h4 className="font-bold text-lg text-gray-900 mb-2">
                          {pkg.name}
                        </h4>
                        <p className="text-gray-600 text-sm mb-3">
                          {pkg.description}
                        </p>

                        {/* Package Includes */}
                        <div className="mb-4">
                          <h5 className="font-semibold text-gray-800 mb-2 text-sm">
                            Package Includes:
                          </h5>
                          <ul className="space-y-1">
                            {pkg.includes.map((item: string, index: number) => (
                              <li
                                key={index}
                                className="text-xs text-gray-600 flex items-center"
                              >
                                <i className="fas fa-check text-green-500 mr-2 text-xs"></i>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Select Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPackage(pkg.id);
                            setShowPackageModal(false);
                          }}
                          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                            selectedPackage === pkg.id
                              ? "bg-green-500 text-white"
                              : "bg-primary-600 text-white hover:bg-primary-700"
                          }`}
                        >
                          {selectedPackage === pkg.id ? (
                            <>
                              <i className="fas fa-check mr-2"></i>
                              Selected
                            </>
                          ) : (
                            <>
                              <i className="fas fa-plus mr-2"></i>
                              Select Package
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer - Fixed */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <i className="fas fa-info-circle mr-2"></i>
                    Prices are per person. Final amount will be calculated based
                    on number of attendees.
                  </div>
                  <button
                    onClick={() => setShowPackageModal(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
