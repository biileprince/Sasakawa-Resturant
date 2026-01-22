//client/src/pages/protected/PackageManagementPage.tsx

import { useState, useEffect } from "react";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import { useToast } from "../../contexts/ToastContext";
import { useAuthRequired } from "../../hooks/useAuthRequired";
import api from "../../services/apiClient";

interface FoodPackage {
  id: string;
  packageId: string;
  name: string;
  category: string;
  pricePerPerson: number;
  description: string;
  image: string;
  includes: string[];
  isActive: boolean;
  sortOrder: number;
}

const CATEGORIES = [
  "Breakfast Service",
  "Lunch Service",
  "Dinner Service",
  "Special Events",
  "Corporate Meetings",
  "Academic Events",
];

// Default placeholder for missing images
const DEFAULT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='Arial' font-size='16' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function PackageManagementPage() {
  useAuthRequired();
  const currentUser = useCurrentUser();
  const { push } = useToast();

  const [packages, setPackages] = useState<FoodPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<FoodPackage | null>(
    null
  );
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    packageId: "",
    name: "",
    category: "",
    pricePerPerson: 0,
    description: "",
    image: "",
    includes: [] as string[],
    isActive: true,
    sortOrder: 0,
  });
  const [includeInput, setIncludeInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Check permissions
  const canManagePackages =
    currentUser?.role === "FINANCE_OFFICER" ||
    currentUser?.role === "APPROVER";

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/food-packages/admin");
      setPackages(response.data);
    } catch (error) {
      console.error("Error fetching packages:", error);
      push("Failed to load packages", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (pkg?: FoodPackage) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        packageId: pkg.packageId,
        name: pkg.name,
        category: pkg.category,
        pricePerPerson: Number(pkg.pricePerPerson),
        description: pkg.description,
        image: pkg.image,
        includes: pkg.includes,
        isActive: pkg.isActive,
        sortOrder: pkg.sortOrder,
      });
    } else {
      setEditingPackage(null);
      setFormData({
        packageId: "",
        name: "",
        category: "",
        pricePerPerson: 0,
        description: "",
        image: "",
        includes: [],
        isActive: true,
        sortOrder: packages.length,
      });
    }
    setIncludeInput("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPackage(null);
    setImageFile(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? parseFloat(value) || 0
            : value,
    }));
  };

  const handleAddInclude = () => {
    if (includeInput.trim() && !formData.includes.includes(includeInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        includes: [...prev.includes, includeInput.trim()],
      }));
      setIncludeInput("");
    }
  };

  const handleRemoveInclude = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      includes: prev.includes.filter((i) => i !== item),
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      push("Please select a valid image file (JPEG, PNG, GIF, or WebP)", "error");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      push("Image size must be less than 5MB", "error");
      return;
    }

    setImageFile(file);
    setIsUploadingImage(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await api.post('/food-packages/upload-image', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData((prev) => ({
        ...prev,
        image: response.data.imageUrl,
      }));
      push("Image uploaded successfully", "success");
    } catch (error) {
      console.error('Error uploading image:', error);
      push("Failed to upload image", "error");
      setImageFile(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.packageId || !formData.name || !formData.category) {
      push("Please fill in all required fields", "error");
      return;
    }

    if (!formData.image) {
      push("Please upload an image for the package", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingPackage) {
        await api.put(`/food-packages/${editingPackage.id}`, formData);
        push("Package updated successfully", "success");
      } else {
        await api.post("/food-packages", formData);
        push("Package created successfully", "success");
      }
      handleCloseModal();
      fetchPackages();
    } catch (error: any) {
      console.error("Error saving package:", error);
      push(error.response?.data?.error || "Failed to save package", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (pkg: FoodPackage) => {
    if (
      !confirm(
        `Are you sure you want to delete "${pkg.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/food-packages/${pkg.id}`);
      push("Package deleted successfully", "success");
      fetchPackages();
    } catch (error) {
      console.error("Error deleting package:", error);
      push("Failed to delete package", "error");
    }
  };

  const handleToggleActive = async (pkg: FoodPackage) => {
    try {
      await api.put(`/food-packages/${pkg.id}`, {
        ...pkg,
        isActive: !pkg.isActive,
      });
      push(`Package ${pkg.isActive ? "deactivated" : "activated"} successfully`, "success");
      fetchPackages();
    } catch (error) {
      console.error("Error toggling package:", error);
      push("Failed to update package status", "error");
    }
  };

  const handleSeedPackages = async () => {
    if (
      !confirm(
        "This will seed default packages to the database. Continue only if the database is empty."
      )
    ) {
      return;
    }

    try {
      await api.post("/food-packages/seed");
      push("Default packages seeded successfully", "success");
      fetchPackages();
    } catch (error: any) {
      console.error("Error seeding packages:", error);
      push(error.response?.data?.error || "Failed to seed packages", "error");
    }
  };

  const filteredPackages =
    activeFilter === "all"
      ? packages
      : packages.filter((p) => p.category === activeFilter);

  if (!canManagePackages) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <i className="fas fa-lock text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to manage food packages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Package Management
              </h1>
              <p className="text-gray-600">
                Manage food packages for the catering service
              </p>
            </div>
            <div className="flex gap-3">
              {packages.length === 0 && (
                <button
                  onClick={handleSeedPackages}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-database"></i>
                  Seed Default Packages
                </button>
              )}
              <button
                onClick={() => handleOpenModal()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <i className="fas fa-plus"></i>
                Add Package
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-6 overflow-x-auto">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All ({packages.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === cat
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {cat} ({packages.filter((p) => p.category === cat).length})
              </button>
            ))}
          </div>
        </div>

        {/* Packages Table */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading packages...</p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <i className="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No packages found
            </h3>
            <p className="text-gray-500 mb-4">
              {packages.length === 0
                ? "Get started by seeding default packages or creating a new one."
                : "No packages in this category."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Package
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price/Person
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPackages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={pkg.image || DEFAULT_IMAGE}
                            alt={pkg.name}
                            className="w-12 h-12 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                            }}
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {pkg.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {pkg.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {pkg.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        GH₵ {Number(pkg.pricePerPerson).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(pkg)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            pkg.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {pkg.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(pkg)}
                            className="text-blue-600 hover:text-blue-800 p-2"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(pkg)}
                            className="text-red-600 hover:text-red-800 p-2"
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl my-8">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPackage ? "Edit Package" : "Add New Package"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="packageId"
                    value={formData.packageId}
                    onChange={handleInputChange}
                    placeholder="e.g., breakfast_premium"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Premium Breakfast Package"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Person (GH₵){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="pricePerPerson"
                    value={formData.pricePerPerson}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Brief description of the package"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Package Image <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`cursor-pointer ${isUploadingImage ? 'opacity-50' : ''}`}
                  >
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center">
                        <i className="fas fa-spinner fa-spin text-3xl text-blue-500 mb-2"></i>
                        <span className="text-sm text-gray-600">Uploading...</span>
                      </div>
                    ) : formData.image ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={formData.image}
                          alt="Package preview"
                          className="w-32 h-24 object-cover rounded-lg mb-2"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                          }}
                        />
                        <span className="text-sm text-blue-600">Click to change image</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                        <span className="text-sm text-gray-600">Click to upload image</span>
                        <span className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF, WebP (max 5MB)</span>
                      </div>
                    )}
                  </label>
                </div>
                {!formData.image && !isUploadingImage && (
                  <p className="mt-1 text-xs text-red-500">Image is required</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What's Included
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={includeInput}
                    onChange={(e) => setIncludeInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddInclude();
                      }
                    }}
                    placeholder="e.g., Fresh Juice"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddInclude}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.includes.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveInclude(item)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Sort Order:</label>
                  <input
                    type="number"
                    name="sortOrder"
                    value={formData.sortOrder}
                    onChange={handleInputChange}
                    min="0"
                    className="w-20 border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      {editingPackage ? "Update Package" : "Create Package"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
