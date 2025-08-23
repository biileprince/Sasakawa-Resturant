import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useCurrentUser } from '../../contexts/CurrentUserContext';

export default function HomePage() {
  const { isSignedIn } = useUser();
  const current = useCurrentUser();
  return (
    <div className="space-y-20">
      <Hero isSignedIn={!!isSignedIn} />
      <ServiceHighlights />
      <HowItWorks />
      <FeaturedMenuItems />
      {current && <QuickActions current={current} />}
      <Testimonials />
      <CTASection isSignedIn={!!isSignedIn} />
    </div>
  );
}

function Hero({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gray-900">
      {/* Simplified background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
      
      {/* Subtle animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-40 h-40 bg-green-500/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-white">
              <span className="block">Sasakawa</span>
              <span className="block text-green-400">
                Restaurant
              </span>
            </h1>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-white/20">
              <i className="fas fa-sparkles text-yellow-300"></i>
              <span className="text-green-100 font-medium">Service Request System</span>
            </div>
          </div>
          
          <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed font-light">
              Transform your university catering experience with our streamlined request system. 
              Submit requests, track approvals, and manage transactions for all your campus dining events.
            </p>
          </div>
          
          <div className="animate-fade-in-up flex flex-col sm:flex-row gap-6 justify-center" style={{animationDelay: '0.4s'}}>
            <Link 
              to="/services" 
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-900 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <i className="fas fa-concierge-bell mr-3 group-hover:scale-110 transition-transform duration-300"></i>
              Explore Our Services
            </Link>
            {isSignedIn ? (
              <Link 
                to="/requests/new" 
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <i className="fas fa-plus-circle mr-3 group-hover:rotate-90 transition-transform duration-300"></i>
                Submit New Request
              </Link>
            ) : (
              <Link 
                to="/sign-in" 
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <i className="fas fa-sign-in-alt mr-3 group-hover:translate-x-1 transition-transform duration-300"></i>
                Get Started
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="animate-fade-in-up mt-20 grid grid-cols-1 md:grid-cols-3 gap-8" style={{animationDelay: '0.6s'}}>
            <div className="text-center bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-green-200">Events Served</div>
            </div>
            <div className="text-center bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-green-200">Support Available</div>
            </div>
            <div className="text-center bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <div className="text-green-200">Satisfaction Rate</div>
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
      icon: 'fas fa-coffee',
      iconBg: 'from-orange-400 to-orange-600',
      title: 'Breakfast Catering',
      description: 'Start your events right with continental breakfast, pastries, and premium coffee service.',
      features: ['Continental breakfast', 'Fresh pastries', 'Premium coffee']
    },
    {
      icon: 'fas fa-utensils',
      iconBg: 'from-green-400 to-green-600',
      title: 'Lunch & Dinner',
      description: 'Professional catering for meetings, conferences, and formal university functions.',
      features: ['Buffet service', 'Plated meals', 'Dietary options']
    },
    {
      icon: 'fas fa-calendar-star',
      iconBg: 'from-purple-400 to-purple-600',
      title: 'Special Events',
      description: 'Custom catering for graduations, galas, and university celebrations.',
      features: ['Custom menus', 'Event planning', 'Special decorations']
    },
    {
      icon: 'fas fa-map-marker-alt',
      iconBg: 'from-blue-400 to-blue-600',
      title: 'Multiple Venues',
      description: 'Conference rooms, banquet halls, outdoor spaces, and lecture halls available.',
      features: ['Indoor venues', 'Outdoor spaces', 'Mobile service']
    }
  ];

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 scroll-reveal">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <i className="fas fa-star"></i>
            Professional Catering Services
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Excellence in Every
            <span className="text-green-600"> Event</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive catering solutions designed specifically for university events and academic gatherings
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 scroll-reveal"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${service.iconBg} rounded-2xl flex items-center justify-center text-white text-xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <i className={service.icon}></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">
                {service.title}
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {service.description}
              </p>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                    <i className="fas fa-check-circle text-green-500 text-xs"></i>
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
      step: '01',
      icon: 'fas fa-file-plus',
      title: 'Submit Request',
      description: 'Department staff submit detailed service requests with event information and requirements.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      step: '02', 
      icon: 'fas fa-check-circle',
      title: 'Department Approval',
      description: 'Department heads review and approve requests before they proceed to catering.',
      color: 'from-green-500 to-green-600'
    },
    {
      step: '03',
      icon: 'fas fa-concierge-bell',
      title: 'Service Delivery',
      description: 'Our professional team delivers exceptional catering service for your event.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      step: '04',
      icon: 'fas fa-file-invoice-dollar',
      title: 'Invoice & Payment',
      description: 'Finance officers manage invoices and payments through our streamlined system.',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <section className="relative bg-gray-50 py-24">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 scroll-reveal">
          <div className="inline-flex items-center gap-2 bg-white shadow-sm text-gray-600 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-gray-200">
            <i className="fas fa-route"></i>
            Simple Process
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It
            <span className="text-green-600"> Works</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our streamlined process ensures smooth service delivery from initial request to final payment
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection lines for desktop */}
          <div className="hidden lg:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 to-orange-200"></div>
          
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative text-center scroll-reveal bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
              style={{animationDelay: `${index * 0.2}s`}}
            >
              <div className="relative mb-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center text-white text-lg mx-auto shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                  <i className={step.icon}></i>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                  {step.step}
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16 scroll-reveal" style={{animationDelay: '0.8s'}}>
          <Link 
            to="/services" 
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <i className="fas fa-arrow-right"></i>
            Start Your Request
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturedMenuItems() {
  const menuItems = [
    {
      image: '🥐',
      name: 'Continental Breakfast',
      description: 'Fresh pastries, fruit, and premium coffee'
    },
    {
      image: '🍽️',
      name: 'Business Lunch',
      description: 'Professional lunch buffet with diverse options'
    },
    {
      image: '🍷',
      name: 'Formal Dinner',
      description: 'Multi-course dinner with wine pairings'
    },
    {
      image: '☕',
      name: 'Coffee Service',
      description: 'Barista-quality coffee and refreshments'
    }
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Menu Items
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Discover our signature offerings designed for university events
          </p>
          <Link 
            to="/menu" 
            className="inline-block text-green-600 hover:text-green-700 font-semibold text-lg"
          >
            View Full Menu →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {menuItems.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
              <div className="p-6 text-center">
                <div className="text-4xl mb-4">{item.image}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickActions({ current }: { current: any }) {
  const caps = current.capabilities || {};
  const actions = [
    caps.canCreateRequest && { 
      label: 'New Service Request', 
      to: '/requests/new', 
      icon: '📝',
      color: 'indigo',
      description: 'Submit a new catering request'
    },
    caps.canApproveRequests && { 
      label: 'Pending Approvals', 
      to: '/approvals', 
      icon: '✅',
      color: 'green',
      description: 'Review pending requests'
    },
    caps.canCreateInvoice && { 
      label: 'Manage Invoices', 
      to: '/invoices', 
      icon: '📄',
      color: 'blue',
      description: 'View and manage invoices'
    },
    caps.canCreatePayment && { 
      label: 'Record Payments', 
      to: '/payments', 
      icon: '💳',
      color: 'purple',
      description: 'Process payment records'
    },
  ].filter(Boolean) as { label: string; to: string; icon: string; color: string; description: string }[];

  if (actions.length === 0) return null;

  return (
    <section className="bg-blue-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <p className="text-xl text-gray-600">Access your most-used features</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {actions.map((action, index) => (
            <Link 
              key={index}
              to={action.to} 
              className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow group border border-gray-200"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                {action.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{action.label}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const testimonials = [
    {
      quote: "The new system has streamlined our event planning process significantly. What used to take days now takes minutes.",
      author: "Dr. Sarah Johnson",
      role: "Department Head, Computer Science"
    },
    {
      quote: "Managing finances for university events has never been easier. The invoice and payment tracking is excellent.",
      author: "Michael Chen",
      role: "Finance Officer"
    },
    {
      quote: "The catering quality and service coordination through this platform is outstanding. Our events run smoothly.",
      author: "Prof. Maria Rodriguez",
      role: "Event Coordinator, Business School"
    }
  ];

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our University Says
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hear from departments using our service request system
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-lg shadow-md p-6 border border-gray-200">
              <p className="text-gray-600 mb-4 italic">"{testimonial.quote}"</p>
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-900">{testimonial.author}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Request Service?
          </h2>
          <p className="text-xl text-green-100 mb-10 leading-relaxed">
            Join university departments already streamlining their catering needs. 
            Quick approvals, transparent tracking, and exceptional service await.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {isSignedIn ? (
              <>
                <Link 
                  to="/requests/new"
                  className="group bg-white text-green-600 hover:bg-gray-50 px-10 py-5 rounded-xl text-lg font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-3"
                >
                  <i className="fas fa-paper-plane group-hover:translate-x-1 transition-transform duration-300"></i>
                  Request Service Now
                </Link>
                <Link 
                  to="/requests"
                  className="group bg-transparent hover:bg-white/10 text-white px-10 py-5 rounded-xl text-lg font-bold transition-all duration-300 border-2 border-white hover:border-gray-200 flex items-center justify-center gap-3"
                >
                  <i className="fas fa-list-alt group-hover:scale-110 transition-transform duration-300"></i>
                  View My Requests
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/requests/new"
                  className="group bg-white text-green-600 hover:bg-gray-50 px-10 py-5 rounded-xl text-lg font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-3"
                >
                  <i className="fas fa-rocket group-hover:translate-y-1 transition-transform duration-300"></i>
                  Request Service
                </Link>
                <Link 
                  to="/services"
                  className="group bg-transparent hover:bg-white/10 text-white px-10 py-5 rounded-xl text-lg font-bold transition-all duration-300 border-2 border-white hover:border-gray-200 flex items-center justify-center gap-3"
                >
                  <i className="fas fa-info-circle group-hover:scale-110 transition-transform duration-300"></i>
                  Learn More
                </Link>
              </>
            )}
          </div>
          {!isSignedIn && (
            <p className="text-green-200 mt-6 text-sm">
              You'll be asked to sign in when you click "Request Service"
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
