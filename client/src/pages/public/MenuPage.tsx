import { useState } from 'react';

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState('breakfast');

  const menuCategories = {
    breakfast: {
      title: 'Breakfast Menu',
      icon: 'fas fa-coffee',
      color: 'from-accent-yellow-500 to-accent-yellow-600',
      items: [
        {
          name: 'Continental Breakfast Platter',
          description: 'Fresh pastries, croissants, muffins, fresh fruit, yogurt, and premium coffee',
          image: '🥐',
          price: 'From $12/person',
          dietary: ['Vegetarian Options Available'],
          popular: true
        },
        {
          name: 'Executive Breakfast',
          description: 'Scrambled eggs, bacon, sausages, hash browns, fresh fruit, and beverages',
          image: '🍳',
          price: 'From $16/person',
          dietary: ['Gluten-Free Options']
        },
        {
          name: 'Healthy Start Breakfast',
          description: 'Greek yogurt parfait, fresh berries, granola, whole grain toast, and herbal teas',
          image: '🥣',
          price: 'From $14/person',
          dietary: ['Vegan', 'Gluten-Free']
        },
        {
          name: 'Coffee Break Special',
          description: 'Assorted pastries, cookies, premium coffee, tea, and fresh fruit',
          image: '☕',
          price: 'From $8/person',
          dietary: ['Vegetarian']
        }
      ]
    },
    lunch: {
      title: 'Lunch Menu',
      icon: 'fas fa-utensils',
      color: 'from-accent-green-500 to-accent-green-600',
      items: [
        {
          name: 'Business Lunch Buffet',
          description: 'Mixed green salad, grilled chicken, fish fillet, rice pilaf, seasonal vegetables',
          image: '🍽️',
          price: 'From $22/person',
          dietary: ['Gluten-Free Options', 'Vegetarian Protein'],
          popular: true
        },
        {
          name: 'International Cuisine',
          description: 'Rotating international dishes featuring Asian, Mediterranean, and African cuisines',
          image: '🌍',
          price: 'From $25/person',
          dietary: ['Vegan Options', 'Halal Available']
        },
        {
          name: 'Sandwich & Wrap Station',
          description: 'Gourmet sandwiches, wraps, soup of the day, and fresh salads',
          image: '🥪',
          dietary: ['Vegetarian', 'Vegan Options']
        },
        {
          name: 'Power Lunch Box',
          description: 'Individual boxed meals with protein, starch, vegetables, fruit, and dessert',
          image: '🍱',
          dietary: ['Customizable', 'Allergy-Friendly']
        }
      ]
    },
    dinner: {
      title: 'Dinner Menu',
      icon: 'fas fa-moon',
      color: 'from-primary-500 to-primary-600',
      items: [
        {
          name: 'Formal Dinner Service',
          description: 'Three-course plated dinner with appetizer, main course, and dessert',
          image: '🍽️',
          dietary: ['Customizable Menu']
        },
        {
          name: 'Gala Buffet',
          description: 'Premium buffet with carving station, seafood, gourmet sides, and dessert bar',
          image: '🦞',
          dietary: ['Pescatarian', 'Vegetarian']
        },
        {
          name: 'Cultural Celebration',
          description: 'Traditional dishes celebrating various cultural cuisines and festivals',
          image: '🎉',
          dietary: ['Authentic Recipes', 'Dietary Accommodations']
        },
        {
          name: 'Wine & Dine Experience',
          description: 'Multi-course dinner with wine pairings and sommelier service',
          image: '🍷',
          dietary: ['Premium Selection']
        }
      ]
    },
    beverages: {
      title: 'Beverages & Refreshments',
      items: [
        {
          name: 'Premium Coffee Service',
          description: 'Espresso, cappuccino, latte, americano with barista service',
          image: '☕',
          dietary: ['Dairy-Free Milk Options']
        },
        {
          name: 'Refreshment Station',
          description: 'Assorted soft drinks, juices, sparkling water, and iced teas',
          image: '🥤',
          dietary: ['Sugar-Free Options']
        },
        {
          name: 'Tea Service',
          description: 'Selection of premium teas, herbal infusions, and traditional service',
          image: '🍵',
          dietary: ['Caffeine-Free Options']
        },
        {
          name: 'Smoothie Bar',
          description: 'Fresh fruit smoothies, protein shakes, and healthy beverages',
          image: '🥤',
          dietary: ['Vegan', 'Protein-Enhanced']
        }
      ]
    }
  };

  const tabs = [
    { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { id: 'lunch', label: 'Lunch', icon: '🌞' },
    { id: 'dinner', label: 'Dinner', icon: '🌙' },
    { id: 'beverages', label: 'Beverages', icon: '☕' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative light-background py-20 lg:py-24 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="backdrop-blur-sm bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white">
                <span className="block">Our</span>
                <span className="block text-white font-bold">
                  Menu
                </span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-light text-white/90 leading-relaxed">
                Discover our diverse culinary offerings designed to make your university events memorable
              </p>
              <p className="text-lg mb-10 max-w-2xl mx-auto text-white/80 leading-relaxed">
                From continental breakfast to elegant dinners, featuring both local Ghanaian dishes and international cuisine
              </p>
              
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3">
                <i className="fas fa-utensils text-accent-yellow-400"></i>
                <span className="text-white font-medium">Operating Hours: 8:00 AM - 8:00 PM (Mon-Sat)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
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
        
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {menuCategories[activeTab as keyof typeof menuCategories].items.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 border hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="text-4xl flex-shrink-0">
                  {item.image}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.dietary.map((diet, dietIndex) => (
                      <span
                        key={dietIndex}
                        className="inline-block bg-accent-green-100 text-accent-green-800 text-xs px-2 py-1 rounded-full"
                      >
                        {diet}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 rounded-lg p-8 mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">What Makes Our Menu Special</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-accent-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Fresh Ingredients</h4>
            <p className="text-gray-600 text-sm">Locally sourced, seasonal ingredients prepared daily by our experienced chefs</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Dietary Accommodations</h4>
            <p className="text-gray-600 text-sm">Comprehensive options for all dietary needs including vegan, gluten-free, and allergen-friendly meals</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Quality Assurance</h4>
            <p className="text-gray-600 text-sm">All our catering services meet the highest food safety and quality standards</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg p-8 text-center text-white shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Custom Menu Planning</h2>
        <p className="text-primary-100 mb-6 leading-relaxed">
          Need something specific? We can customize any menu to fit your event requirements and dietary needs.
        </p>
        <div className="space-x-4">
          <a
            href="/requests/new"
            className="inline-block bg-accent-yellow-500 hover:bg-accent-yellow-600 text-white px-6 py-3 rounded-md font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Request Custom Menu
          </a>
          <a
            href="/services"
            className="inline-block border-2 border-white/30 text-white px-6 py-3 rounded-md font-semibold hover:bg-white/10 transition-all duration-300"
          >
            View Services
          </a>
        </div>
      </div>
      </div>
    </div>
  );
}
