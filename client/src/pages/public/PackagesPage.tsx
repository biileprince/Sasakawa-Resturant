//client/src/pages/public/PackagesPage.tsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../contexts/ToastContext";
import api from "../../services/apiClient";

// Default placeholder for missing images
const DEFAULT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='Arial' font-size='16' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

// Default packages (fallback if API fails)
const DEFAULT_PACKAGES = {
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

interface Package {
  id: string;
  name: string;
  pricePerPerson: number;
  description: string;
  image: string;
  includes: string[];
}

interface PackagesByCategory {
  [category: string]: Package[];
}

export default function PackagesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [packages, setPackages] = useState<PackagesByCategory>(DEFAULT_PACKAGES);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [quantity, setQuantity] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem, getItemCount, getTotalPrice } = useCart();
  const { push } = useToast();

  // Fetch packages from API
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await api.get("/food-packages");
        if (response.data && Object.keys(response.data).length > 0) {
          setPackages(response.data);
        }
      } catch {
        // Use default packages if API fails
        console.log("Using default packages");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const categories = ["All", ...Object.keys(packages)];

  const getFilteredPackages = () => {
    if (activeCategory === "All") {
      return Object.entries(packages).flatMap(([category, pkgs]) =>
        pkgs.map((pkg) => ({ ...pkg, category }))
      );
    }
    return (packages[activeCategory] || []).map((pkg) => ({
      ...pkg,
      category: activeCategory,
    }));
  };

  const handleAddToCart = (pkg: Package & { category: string }) => {
    addItem({
      packageId: pkg.id,
      name: pkg.name,
      serviceType: pkg.category,
      pricePerPerson: pkg.pricePerPerson,
      quantity: quantity,
      description: pkg.description,
      image: pkg.image,
      includes: pkg.includes,
    });
    push(`${pkg.name} for ${quantity} guests added to your cart`, "success");
    setSelectedPackage(null);
    setQuantity(10);
  };

  const filteredPackages = getFilteredPackages();
  const cartItemCount = getItemCount();
  const cartTotal = getTotalPrice();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative light-background py-16 lg:py-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white">
              Food Packages
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-6">
              Browse our curated selection of catering packages and add them to
              your cart. Perfect for any university event.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3">
              <i className="fas fa-info-circle text-accent-yellow-400"></i>
              <span className="text-white font-medium">
                Select packages and proceed to checkout to complete your request
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Cart Summary */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Link
            to="/checkout"
            className="flex items-center gap-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-full shadow-2xl transition-all duration-200 hover:scale-105"
          >
            <div className="relative">
              <i className="fas fa-shopping-cart text-xl"></i>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartItemCount}
              </span>
            </div>
            <div className="text-left">
              <p className="text-sm opacity-80">Cart Total</p>
              <p className="font-bold">GH₵ {cartTotal.toLocaleString()}</p>
            </div>
            <i className="fas fa-arrow-right ml-2"></i>
          </Link>
        </div>
      )}

      {/* Category Tabs */}
      <div className="sticky top-16 z-40 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-4 gap-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeCategory === category
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-200 group"
              >
                {/* Package Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={pkg.image || DEFAULT_IMAGE}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {pkg.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/90 backdrop-blur-sm text-blue-600 font-bold text-sm px-3 py-1 rounded-full">
                      GH₵ {pkg.pricePerPerson}/person
                    </span>
                  </div>
                </div>

                {/* Package Details */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {pkg.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{pkg.description}</p>

                  {/* Includes Preview */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {pkg.includes.slice(0, 3).map((item, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                      >
                        {item}
                      </span>
                    ))}
                    {pkg.includes.length > 3 && (
                      <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">
                        +{pkg.includes.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => setSelectedPackage(pkg)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-plus"></i>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredPackages.length === 0 && (
          <div className="text-center py-20">
            <i className="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No packages found
            </h3>
            <p className="text-gray-500">
              Try selecting a different category or check back later.
            </p>
          </div>
        )}
      </div>

      {/* Package Detail Modal */}
      {selectedPackage && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setSelectedPackage(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Image */}
            <div className="relative h-56">
              <img
                src={selectedPackage.image}
                alt={selectedPackage.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedPackage(null)}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
              <div className="absolute bottom-4 left-4">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {"category" in selectedPackage
                    ? (selectedPackage as Package & { category: string }).category
                    : "Package"}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedPackage.name}
                </h2>
                <span className="text-2xl font-bold text-blue-600">
                  GH₵ {selectedPackage.pricePerPerson}
                  <span className="text-sm font-normal text-gray-500">
                    /person
                  </span>
                </span>
              </div>

              <p className="text-gray-600 mb-6">{selectedPackage.description}</p>

              {/* What's Included */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  What's Included:
                </h3>
                <ul className="grid grid-cols-2 gap-2">
                  {selectedPackage.includes.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-gray-700 text-sm"
                    >
                      <i className="fas fa-check text-green-500"></i>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block font-semibold text-gray-900 mb-2">
                  Number of Guests:
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 5))}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-24 text-center border border-gray-300 rounded-lg py-2 text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 5)}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>

              {/* Subtotal */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    GH₵{" "}
                    {(
                      selectedPackage.pricePerPerson * quantity
                    ).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  GH₵ {selectedPackage.pricePerPerson} × {quantity} guests
                </p>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() =>
                  handleAddToCart(
                    selectedPackage as Package & { category: string }
                  )
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <i className="fas fa-shopping-cart"></i>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
