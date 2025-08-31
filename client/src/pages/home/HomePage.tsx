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
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden main-background">
      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl max-w-5xl mx-auto">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
                <span className="block">Sasakawa</span>
                <span className="block text-white font-bold">
                  Restaurant
                </span>
              </h1>
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg">
                <i className="fas fa-utensils text-primary-600"></i>
                <span className="text-primary-700 font-medium">Professional Catering Services</span>
              </div>
            </div>
            
            <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <p className="text-xl md:text-2xl text-white/95 max-w-4xl mx-auto mb-12 leading-relaxed font-medium">
                Quality dining services for university departments, student associations, and special events. 
                Streamlined ordering system with diverse menu options tailored to your needs.
              </p>
            </div>
            
            <div className="animate-fade-in-up flex flex-col sm:flex-row gap-6 justify-center" style={{animationDelay: '0.4s'}}>
              <Link 
                to="/services" 
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-flex items-center justify-center gap-3"
              >
                <i className="fas fa-concierge-bell"></i>
                Explore Our Services
              </Link>
              {isSignedIn ? (
                <Link 
                  to="/requests/new" 
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-flex items-center justify-center gap-3"
                >
                  <i className="fas fa-plus-circle"></i>
                  Submit New Request
                </Link>
              ) : (
                <Link 
                  to="/sign-in" 
                  className="bg-white/90 hover:bg-white text-primary-700 hover:text-primary-800 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-flex items-center justify-center gap-3"
                >
                  <i className="fas fa-sign-in-alt"></i>
                  Get Started
                </Link>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="animate-fade-in-up mt-16 grid grid-cols-1 md:grid-cols-3 gap-8" style={{animationDelay: '0.6s'}}>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-white/80">Events Served</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-white mb-2">12hrs</div>
              <div className="text-white/80">Daily Service (8AM-8PM)</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <div className="text-white/80">Satisfaction Rate</div>
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
      iconBg: 'from-orange-500 to-orange-600',
      title: 'Breakfast Catering',
      description: 'Fresh morning meals perfect for early meetings, workshops, and academic conferences.',
      features: ['Continental breakfast', 'Fresh pastries', 'Premium coffee service']
    },
    {
      icon: 'fas fa-utensils',
      iconBg: 'from-green-500 to-green-600',
      title: 'Lunch & Dinner Service',
      description: 'Complete meal solutions for departmental meetings, student events, and formal functions.',
      features: ['Buffet service', 'Plated meals', 'Dietary accommodations']
    },
    {
      icon: 'fas fa-birthday-cake',
      iconBg: 'from-purple-500 to-purple-600',
      title: 'Special Events',
      description: 'Customized catering for graduations, academic celebrations, and university ceremonies.',
      features: ['Custom menu planning', 'Event coordination', 'Professional presentation']
    },
    {
      icon: 'fas fa-clock',
      iconBg: 'from-blue-500 to-blue-600',
      title: 'Flexible Scheduling',
      description: 'Reliable service delivery that adapts to your academic calendar and event timing.',
      features: ['On-time delivery', 'Flexible timing', 'Quick setup service']
    }
  ];

  return (
    <section className="bg-white py-20">
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
            Comprehensive catering services designed to meet the diverse needs of university departments, 
            student organizations, and academic events.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 scroll-reveal"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${service.iconBg} rounded-2xl flex items-center justify-center text-white text-xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
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
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-500">
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
      step: '01',
      icon: 'fas fa-edit',
      title: 'Submit Request',
      description: 'Department staff submit detailed service requests with event information and requirements.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      step: '02', 
      icon: 'fas fa-user-shield',
      title: 'Department Approval',
      description: 'Department heads review and approve requests before they proceed to catering.',
      color: 'from-accent-green-500 to-accent-green-600'
    },
    {
      step: '03',
      icon: 'fas fa-utensils',
      title: 'Service Delivery',
      description: 'Our professional team delivers exceptional catering service for your event.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      step: '04',
      icon: 'fas fa-receipt',
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
            <span className="text-primary-600"> Works</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our streamlined process ensures smooth service delivery from initial request to final payment
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection lines for desktop */}
          <div className="hidden lg:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-green-200 to-orange-200"></div>
          
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative text-center scroll-reveal bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              style={{animationDelay: `${index * 0.2}s`}}
            >
              <div className="relative mb-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center text-white text-lg mx-auto shadow-lg group-hover:scale-110 transition-all duration-300`}>
                  <i className={step.icon}></i>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                  {step.step}
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
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
            to="/requests/new" 
            className="inline-flex items-center gap-2 bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <i className="fas fa-plus-circle"></i>
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
            className="inline-block text-primary-600 hover:text-primary-700 font-semibold text-lg"
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
    <section className="bg-primary-50 py-16">
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
    <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Request Service?
          </h2>
          <p className="text-xl text-primary-100 mb-10 leading-relaxed">
            Join university departments in streamlining their catering needs. 
            Quick approvals, transparent tracking, and exceptional service delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {isSignedIn ? (
              <>
                <Link 
                  to="/requests/new"
                  className="bg-white hover:bg-gray-50 text-primary-700 px-10 py-5 rounded-xl text-lg font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-3"
                >
                  <i className="fas fa-plus-circle"></i>
                  Request Service Now
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
                  to="/requests/new"
                  className="bg-white hover:bg-gray-50 text-primary-700 px-10 py-5 rounded-xl text-lg font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-3"
                >
                  <i className="fas fa-utensils"></i>
                  Request Service
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
