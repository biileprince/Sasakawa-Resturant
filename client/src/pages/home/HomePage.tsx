import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useCurrentUser } from "../../contexts/CurrentUserContext";

export default function HomePage() {
  const { isSignedIn } = useUser();
  return (
    <div className="space-y-20">
      <Hero isSignedIn={!!isSignedIn} />
      <ServiceHighlights />
      <HowItWorks />
      <FeaturedMenuItems />
      <CTASection isSignedIn={!!isSignedIn} />
    </div>
  );
}

function Hero({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden main-background">
      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl max-w-5xl mx-auto">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
                <span className="block">Sasakawa</span>
                <span className="block text-white font-bold">Restaurant</span>
              </h1>
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg">
                <div className="w-5 h-5 bg-gradient-to-b from-red-600 to-blue-600 rounded-sm flex items-center justify-center">
                  <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                </div>
                <span className="text-primary-700 font-medium">
                  Professional Catering Services
                </span>
              </div>
            </div>

            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <p className="text-xl md:text-2xl text-white/95 max-w-4xl mx-auto mb-12 leading-relaxed font-medium">
                Quality dining services for university departments, student
                associations, and special events. Streamlined ordering system
                with diverse menu options tailored to your needs.
              </p>
            </div>

            <div
              className="animate-fade-in-up flex flex-col sm:flex-row gap-6 justify-center"
              style={{ animationDelay: "0.4s" }}
            >
              <Link
                to="/services"
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-flex items-center justify-center gap-3"
              >
                <i className="fas fa-concierge-bell"></i>
                Explore Our Services
              </Link>
              {isSignedIn ? (
                <Link
                  to="/packages"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-flex items-center justify-center gap-3"
                >
                  <i className="fas fa-shopping-cart"></i>
                  Order Now
                </Link>
              ) : (
                <Link
                  to="/packages"
                  className="bg-white/90 hover:bg-white text-primary-700 hover:text-primary-800 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-flex items-center justify-center gap-3"
                >
                  <i className="fas fa-utensils"></i>
                  Browse Packages
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceHighlights() {
  const services = [
    {
      icon: "fas fa-coffee",
      iconBg: "from-orange-500 to-orange-600",
      title: "Breakfast Catering",
      description:
        "Fresh morning meals perfect for early meetings, workshops, and academic conferences.",
      features: [
        "Continental breakfast",
        "Fresh pastries",
        "Premium coffee service",
      ],
    },
    {
      icon: "fas fa-utensils",
      iconBg: "from-green-500 to-green-600",
      title: "Lunch & Dinner Service",
      description:
        "Complete meal solutions for departmental meetings, student events, and formal functions.",
      features: ["Buffet service", "Plated meals", "Dietary accommodations"],
    },
    {
      icon: "fas fa-birthday-cake",
      iconBg: "from-purple-500 to-purple-600",
      title: "Special Events",
      description:
        "Customized catering for graduations, academic celebrations, and university ceremonies.",
      features: [
        "Custom menu planning",
        "Event coordination",
        "Professional presentation",
      ],
    },
    {
      icon: "fas fa-clock",
      iconBg: "from-blue-500 to-blue-600",
      title: "Flexible Scheduling",
      description:
        "Reliable service delivery that adapts to your academic calendar and event timing.",
      features: ["On-time delivery", "Flexible timing", "Quick setup service"],
    },
  ];

  return (
    <section className="bg-gradient-to-br from-gray-50 via-white to-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 scroll-reveal">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <i className="fas fa-utensils"></i>
            Complete Catering Solutions
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Professional Service for
            <span className="text-primary-600"> Every Occasion</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive catering services designed to meet the diverse needs
            of university departments, student organizations, and academic
            events.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 scroll-reveal"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`w-16 h-16 bg-gradient-to-br ${service.iconBg} rounded-2xl flex items-center justify-center text-white text-xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
              >
                <i className={service.icon}></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                {service.title}
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {service.description}
              </p>
              <ul className="space-y-2">
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: "fas fa-plus-circle",
      title: "Create Service Request",
      description:
        "Request a service with detailed event info, menu preferences, and special requirements through our easy-to-use form.",
    },
    {
      step: "02",
      icon: "fas fa-check-circle",
      title: "Approval Workflow",
      description:
        "Department heads and approvers review requests in real-time. Automated notifications keep everyone informed.",
    },
    {
      step: "03",
      icon: "fas fa-file-invoice-dollar",
      title: "Invoice Generation",
      description:
        "Finance officers create detailed invoices with transparent pricing. All financial records are tracked digitally.",
    },
    {
      step: "04",
      icon: "fas fa-credit-card",
      title: "Payment Processing",
      description:
        "Secure payment recording with multiple methods. Real-time payment status updates and automated receipts.",
    },
  ];

  return (
    <section className=" py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How Our System Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Simple, efficient workflow that transforms catering management into
            a seamless digital process.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xl mx-auto mb-4">
                  <i className={step.icon}></i>
                </div>
                <div className="text-sm font-medium text-blue-600 mb-2">
                  Step {step.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
          >
            <i className="fas fa-shopping-cart"></i>
            Start Your Order
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturedMenuItems() {
  const menuCategories = [
    {
      category: "Breakfast & Brunch",
      icon: "fas fa-coffee",
      description: "Start your events right with our hearty morning selections",
    },
    {
      category: "Lunch Packages",
      icon: "fas fa-utensils",
      description: "Professional midday dining solutions for all occasions",
    },
    {
      category: "Formal Dinners",
      icon: "fas fa-wine-glass",
      description: "Elegant dining experiences for special celebrations",
    },
    {
      category: "Refreshments",
      icon: "fas fa-cookie-bite",
      description: "Keep your guests energized throughout your events",
    },
  ];

  return (
    <section className=" py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Menu Categories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Explore our diverse catering options designed for all types of
            events
          </p>
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
          >
            <i className="fas fa-shopping-cart"></i>
            Browse All Packages
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuCategories.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xl mx-auto mb-4">
                <i className={category.icon}></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {category.category}
              </h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {category.description}
              </p>
              <Link
                to="/packages"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
              >
                <i className="fas fa-shopping-cart"></i>
                Order Now
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Request Service?
          </h2>
          <p className="text-xl text-primary-100 mb-10 leading-relaxed">
            Join university departments in streamlining their catering needs.
            Quick approvals, transparent tracking, and exceptional service
            delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {isSignedIn ? (
              <>
                <Link
                  to="/packages"
                  className="bg-white hover:bg-gray-50 text-primary-700 px-10 py-5 rounded-xl text-lg font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-3"
                >
                  <i className="fas fa-shopping-cart"></i>
                  Order Now
                </Link>
                <Link
                  to="/requests"
                  className="bg-primary-800/50 hover:bg-primary-800/70 text-white px-10 py-5 rounded-xl text-lg font-bold transition-all duration-300 border-2 border-primary-400/50 hover:border-primary-300 flex items-center justify-center gap-3"
                >
                  <i className="fas fa-list-alt"></i>
                  View My Requests
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/packages"
                  className="bg-white hover:bg-gray-50 text-primary-700 px-10 py-5 rounded-xl text-lg font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-3"
                >
                  <i className="fas fa-utensils"></i>
                  Browse Packages
                </Link>
                <Link
                  to="/services"
                  className="bg-primary-800/50 hover:bg-primary-800/70 text-white px-10 py-5 rounded-xl text-lg font-bold transition-all duration-300 border-2 border-primary-400/50 hover:border-primary-300 flex items-center justify-center gap-3"
                >
                  <i className="fas fa-info-circle"></i>
                  Learn More
                </Link>
              </>
            )}
          </div>
          {!isSignedIn && (
            <p className="text-primary-200 mt-6 text-sm">
              You'll be asked to sign in when you click "Request Service"
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
