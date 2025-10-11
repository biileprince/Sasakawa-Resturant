import { Link } from "react-router-dom";

export default function ServicesPage() {
  const cateringServices = [
    {
      icon: "fas fa-coffee",
      iconBg: "from-accent-yellow-400 to-accent-yellow-600",
      title: "Breakfast Service",
      description:
        "Start your morning events right with our continental breakfast options, fresh pastries, and premium coffee service.",
      features: [
        "Continental breakfast platters",
        "Fresh fruit arrangements",
        "Premium coffee & tea service",
        "Pastries and baked goods",
      ],
      priceRange: "From $8/person",
    },
    {
      icon: "fas fa-plate-wheat",
      iconBg: "from-accent-green-400 to-accent-green-600",
      title: "Lunch Service",
      description:
        "Professional lunch catering for meetings, conferences, and seminars with diverse menu options.",
      features: [
        "Buffet-style service",
        "Boxed lunch options",
        "Vegetarian & vegan choices",
        "Beverage service included",
      ],
      priceRange: "From $15/person",
    },
    {
      icon: "fas fa-moon",
      iconBg: "from-primary-400 to-primary-600",
      title: "Dinner Service",
      description:
        "Elegant dinner service for formal events, galas, and special university celebrations.",
      features: [
        "Plated dinner service",
        "Buffet options available",
        "Wine and beverage service",
        "Custom menu planning",
      ],
      priceRange: "From $25/person",
    },
    {
      icon: "fas fa-birthday-cake",
      iconBg: "from-accent-red-400 to-accent-red-600",
      title: "Special Events",
      description:
        "Customized catering for graduations, award ceremonies, and milestone celebrations.",
      features: [
        "Custom theme menus",
        "Dessert stations",
        "Special dietary accommodations",
        "Event coordination",
      ],
      priceRange: "Custom pricing",
    },
    {
      icon: "fas fa-users",
      iconBg: "from-blue-500 to-blue-600",
      title: "Corporate Meetings",
      description:
        "Professional catering solutions for board meetings, workshops, and business events.",
      features: [
        "Meeting room setup",
        "Working lunch options",
        "Coffee break service",
        "Professional presentation",
      ],
      priceRange: "From $12/person",
    },
    {
      icon: "fas fa-university",
      iconBg: "from-purple-400 to-purple-600",
      title: "Academic Events",
      description:
        "Specialized catering for conferences, symposiums, and academic gatherings.",
      features: [
        "Conference-style service",
        "Poster session catering",
        "Welcome receptions",
        "Networking events",
      ],
      priceRange: "From $18/person",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative section-background py-24">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <div className="backdrop-blur-sm bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                Our <span className="text-white font-bold">Services</span>
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
                Professional catering & Item 13 services for departments and
                associations at Sasakawa Restaurant
              </p>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3">
                <i className="fas fa-award text-accent-yellow-400"></i>
                <span className="text-white font-medium">
                  Excellence in University Catering
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Catering Services */}
          <div className="mb-24">
            <div className="text-center mb-16 scroll-reveal">
              <div className="inline-flex items-center gap-2 bg-accent-green-100 text-accent-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <i className="fas fa-concierge-bell"></i>
                Catering Options
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Complete{" "}
                <span className="text-primary-600">Catering Solutions</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                From intimate meetings to grand celebrations, we provide
                exceptional catering services tailored to your needs
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cateringServices.map((service, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 scroll-reveal hover:scale-105"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${service.iconBg} rounded-2xl flex items-center justify-center text-white text-xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <i className={service.icon}></i>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                      {service.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-500"
                      >
                        <i className="fas fa-check-circle text-primary-500 text-xs"></i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/requests/new"
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm group-hover:gap-3 transition-all duration-300"
                  >
                    Request Service
                    <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center scroll-reveal">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-12 text-white shadow-xl">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Plan Your Event?
              </h2>
              <p className="text-primary-100 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                Let us help you create a memorable experience for your next
                university event with our professional catering services.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/requests/new"
                  className="bg-accent-yellow-500 hover:bg-accent-yellow-600 text-white inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <i className="fas fa-plus-circle"></i>
                  Submit Service Request
                </Link>
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 bg-transparent text-white px-8 py-4 rounded-xl font-semibold border-2 border-white/30 hover:bg-white/10 transition-all duration-300"
                >
                  <i className="fas fa-utensils"></i>
                  View Menu
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
