import { useState } from "react";

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState("breakfast");

  const menuCategories = {
    breakfast: {
      title: "Breakfast Menu",
      icon: "fas fa-coffee",
      color: "from-accent-yellow-500 to-accent-yellow-600",
      items: [
        {
          name: "Continental Breakfast Platter",
          description:
            "Fresh pastries, croissants, muffins, fresh fruit, yogurt, and premium coffee",
          image: "🥐",
          price: "From $12/person",
          dietary: ["Vegetarian Options Available"],
          popular: true,
        },
        {
          name: "Executive Breakfast",
          description:
            "Scrambled eggs, bacon, sausages, hash browns, fresh fruit, and beverages",
          image: "🍳",
          price: "From $16/person",
          dietary: ["Gluten-Free Options"],
        },
        {
          name: "Healthy Start Breakfast",
          description:
            "Greek yogurt parfait, fresh berries, granola, whole grain toast, and herbal teas",
          image: "🥣",
          price: "From $14/person",
          dietary: ["Vegan", "Gluten-Free"],
        },
        {
          name: "Coffee Break Special",
          description:
            "Assorted pastries, cookies, premium coffee, tea, and fresh fruit",
          image: "☕",
          price: "From $8/person",
          dietary: ["Vegetarian"],
        },
      ],
    },
    lunch: {
      title: "Lunch Menu",
      icon: "fas fa-utensils",
      color: "from-accent-green-500 to-accent-green-600",
      items: [
        {
          name: "Business Lunch Buffet",
          description:
            "Mixed green salad, grilled chicken, fish fillet, rice pilaf, seasonal vegetables",
          image: "🍽️",
          price: "From $22/person",
          dietary: ["Gluten-Free Options", "Vegetarian Protein"],
          popular: true,
        },
        {
          name: "International Cuisine",
          description:
            "Rotating international dishes featuring Asian, Mediterranean, and African cuisines",
          image: "🌍",
          price: "From $25/person",
          dietary: ["Vegan Options", "Halal Available"],
        },
        {
          name: "Sandwich & Wrap Station",
          description:
            "Gourmet sandwiches, wraps, soup of the day, and fresh salads",
          image: "🥪",
          dietary: ["Vegetarian", "Vegan Options"],
        },
        {
          name: "Power Lunch Box",
          description:
            "Individual boxed meals with protein, starch, vegetables, fruit, and dessert",
          image: "🍱",
          dietary: ["Customizable", "Allergy-Friendly"],
        },
      ],
    },
    dinner: {
      title: "Dinner Menu",
      icon: "fas fa-moon",
      color: "from-primary-500 to-primary-600",
      items: [
        {
          name: "Formal Dinner Service",
          description:
            "Three-course plated dinner with appetizer, main course, and dessert",
          image: "🍽️",
          dietary: ["Customizable Menu"],
        },
        {
          name: "Gala Buffet",
          description:
            "Premium buffet with carving station, seafood, gourmet sides, and dessert bar",
          image: "🦞",
          dietary: ["Pescatarian", "Vegetarian"],
        },
        {
          name: "Cultural Celebration",
          description:
            "Traditional dishes celebrating various cultural cuisines and festivals",
          image: "🎉",
          dietary: ["Authentic Recipes", "Dietary Accommodations"],
        },
        {
          name: "Wine & Dine Experience",
          description:
            "Multi-course dinner with wine pairings and sommelier service",
          image: "🍷",
          dietary: ["Premium Selection"],
        },
      ],
    },
    beverages: {
      title: "Beverages & Refreshments",
      items: [
        {
          name: "Premium Coffee Service",
          description:
            "Espresso, cappuccino, latte, americano with barista service",
          image: "☕",
          dietary: ["Dairy-Free Milk Options"],
        },
        {
          name: "Refreshment Station",
          description:
            "Assorted soft drinks, juices, sparkling water, and iced teas",
          image: "🥤",
          dietary: ["Sugar-Free Options"],
        },
        {
          name: "Tea Service",
          description:
            "Selection of premium teas, herbal infusions, and traditional service",
          image: "🍵",
          dietary: ["Caffeine-Free Options"],
        },
        {
          name: "Smoothie Bar",
          description:
            "Fresh fruit smoothies, protein shakes, and healthy beverages",
          image: "🥤",
          dietary: ["Vegan", "Protein-Enhanced"],
        },
      ],
    },
  };

  const tabs = [
    { id: "breakfast", label: "Breakfast", icon: "fas fa-coffee" },
    { id: "lunch", label: "Lunch", icon: "fas fa-utensils" },
    { id: "dinner", label: "Dinner", icon: "fas fa-moon" },
    { id: "beverages", label: "Beverages", icon: "fas fa-glass-water" },
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Hero Section */}
      <section className="relative light-background py-20 lg:py-24 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="backdrop-blur-sm bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white">
                <span className="block">Our</span>
                <span className="block text-white font-bold">Menu</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-light text-white/90 leading-relaxed">
                Discover our diverse culinary offerings designed to make your
                university events memorable
              </p>
              <p className="text-lg mb-10 max-w-2xl mx-auto text-white/80 leading-relaxed">
                From continental breakfast to elegant dinners, featuring both
                local Ghanaian dishes and international cuisine
              </p>

              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3">
                <i className="fas fa-utensils text-accent-yellow-400"></i>
                <span className="text-white font-medium">
                  Operating Hours: 8:00 AM - 8:00 PM (Mon-Sat)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-8 max-w-2xl mx-auto">
          <nav className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <i className={`${tab.icon} text-sm`}></i>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Menu Content */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {menuCategories[activeTab as keyof typeof menuCategories].title}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {menuCategories[activeTab as keyof typeof menuCategories].items.map(
              (item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.name}
                    </h3>
                    {"popular" in item && item.popular && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {item.description}
                  </p>
                  {"price" in item && item.price && (
                    <p className="text-blue-600 font-medium mb-3">
                      {item.price}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {item.dietary.map((diet, dietIndex) => (
                      <span
                        key={dietIndex}
                        className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                      >
                        {diet}
                      </span>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 rounded-lg p-8 text-center text-white shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Custom Menu Planning</h2>
          <p className="text-blue-100 mb-6 leading-relaxed">
            Need something specific? We can customize any menu to fit your event
            requirements and dietary needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/requests/new"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200"
            >
              <i className="fas fa-plus-circle"></i>
              Request Custom Menu
            </a>
            <a
              href="/services"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-200"
            >
              <i className="fas fa-concierge-bell"></i>
              View Services
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
