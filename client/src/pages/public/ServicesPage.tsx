import { Link } from 'react-router-dom';

export default function ServicesPage() {
  const cateringServices = [
    {
      icon: 'fas fa-coffee',
      iconBg: 'from-accent-yellow-400 to-accent-yellow-600',
      title: 'Breakfast Service',
      description: 'Start your morning events right with our continental breakfast options, fresh pastries, and premium coffee service.',
      features: ['Continental breakfast platters', 'Fresh fruit arrangements', 'Premium coffee & tea service', 'Pastries and baked goods'],
      priceRange: 'From $8/person'
    },
    {
      icon: 'fas fa-utensils',
  iconBg: 'from-accent-green-400 to-accent-green-600',
      title: 'Lunch Service',
      description: 'Professional lunch catering for meetings, conferences, and seminars with diverse menu options.',
      features: ['Buffet-style service', 'Boxed lunch options', 'Vegetarian & vegan choices', 'Beverage service included'],
      priceRange: 'From $15/person'
    },
    {
      icon: 'fas fa-moon',
      iconBg: 'from-primary-400 to-primary-600',
      title: 'Dinner Service',
      description: 'Elegant dinner service for formal events, galas, and special university celebrations.',
      features: ['Plated dinner service', 'Buffet options available', 'Wine and beverage service', 'Custom menu planning'],
      priceRange: 'From $25/person'
    },
    {
      icon: 'fas fa-birthday-cake',
      iconBg: 'from-accent-red-400 to-accent-red-600',
      title: 'Special Events',
      description: 'Customized catering for graduations, award ceremonies, and milestone celebrations.',
      features: ['Custom theme menus', 'Dessert stations', 'Special dietary accommodations', 'Event coordination'],
      priceRange: 'Custom pricing'
    },
    {
      icon: 'fas fa-users',
      iconBg: 'from-primary-400 to-primary-600',
      title: 'Corporate Meetings',
      description: 'Professional catering solutions for board meetings, workshops, and business events.',
      features: ['Meeting room setup', 'A/V equipment support', 'Working lunch options', 'Coffee break service'],
      priceRange: 'From $12/person'
    },
    {
      icon: 'fas fa-graduation-cap',
      iconBg: 'from-accent-green-400 to-accent-green-600',
      title: 'Academic Events',
      description: 'Specialized catering for conferences, symposiums, and academic gatherings.',
      features: ['Conference-style service', 'Poster session catering', 'Welcome receptions', 'Networking events'],
      priceRange: 'From $18/person'
    }
  ];

  const venueOptions = [
    {
      name: 'Conference Rooms',
      description: 'Modern conference facilities with full A/V support',
      capacity: 'Up to 50 people',
      icon: 'fas fa-presentation-screen'
    },
    {
      name: 'Banquet Hall',
      description: 'Elegant space for formal dinners and ceremonies',
      capacity: 'Up to 200 people',
      icon: 'fas fa-building'
    },
    {
      name: 'Outdoor Pavilion',
      description: 'Beautiful outdoor setting for casual gatherings',
      capacity: 'Up to 150 people',
      icon: 'fas fa-tree'
    },
    {
      name: 'Lecture Halls',
      description: 'Academic setting with catering service support',
      capacity: 'Up to 300 people',
      icon: 'fas fa-chalkboard-teacher'
    }
  ];

  const additionalServices = [
    {
      icon: 'fas fa-clipboard-check',
      iconBg: 'from-accent-green-400 to-accent-green-600',
      title: 'Event Planning',
      description: 'Complete event coordination services from conception to execution.',
      features: ['Timeline management', 'Vendor coordination', 'Setup & breakdown', 'Day-of coordination']
    },
    {
      icon: 'fas fa-microphone',
      iconBg: 'from-accent-yellow-400 to-accent-yellow-600',
      title: 'A/V Support',
      description: 'Professional audio-visual equipment and technical support.',
      features: ['Sound systems', 'Projection equipment', 'Lighting setup', 'Technical assistance']
    },
    {
      icon: 'fas fa-wine-glass',
      iconBg: 'from-accent-red-400 to-accent-red-600',
      title: 'Bar Service',
      description: 'Professional bartending and beverage service for all occasions.',
      features: ['Licensed bartenders', 'Premium beverages', 'Custom cocktails', 'Wine selection']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative section-background py-24">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up text-white">
            <div className="glass-hero max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-shadow-hero">
                Our <span className="text-white font-bold">Services</span>
              </h1>
              <p className="text-xl text-gray-100 max-w-3xl mx-auto mb-8 text-shadow-elegant">
                Professional catering & Item 13 services for departments and associations at Sasakawa Restaurant
              </p>
              <div className="inline-flex items-center gap-2 glass-white rounded-full px-6 py-3">
                <i className="fas fa-award text-accent-yellow-600"></i>
                <span className="text-primary-700 font-medium">Excellence in University Catering</span>
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
                Complete <span className="text-primary-600">Catering Solutions</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                From intimate meetings to grand celebrations, we provide exceptional catering services tailored to your needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cateringServices.map((service, index) => (
                <div 
                  key={index} 
                  className="group bg-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 scroll-reveal"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${service.iconBg} rounded-2xl flex items-center justify-center text-white text-xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <i className={service.icon}></i>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-accent-green transition-colors duration-300">
                      {service.title}
                    </h3>
                    <div className="text-sm font-semibold text-accent-green bg-accent-green-50 px-3 py-1 rounded-full inline-block mb-3">
                      {service.priceRange}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <i className="fas fa-check-circle text-accent-green text-xs"></i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link 
                    to="/requests/new"
                    className="inline-flex items-center gap-2 text-accent-green hover:text-accent-green-dark font-medium text-sm group-hover:gap-3 transition-all duration-300"
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

      {/* Additional Services */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-24">
            <div className="text-center mb-16 scroll-reveal">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <i className="fas fa-plus"></i>
                Additional Services
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Enhanced <span className="text-accent-green">Event Support</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Complete your event with our comprehensive support services designed to make every detail perfect
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {additionalServices.map((service, index) => (
                <div 
                  key={index} 
                  className="group bg-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 scroll-reveal"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${service.iconBg} rounded-2xl flex items-center justify-center text-white text-xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <i className={service.icon}></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <i className="fas fa-check-circle text-accent-green-500 text-xs"></i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Venue Options */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <div className="text-center mb-16 scroll-reveal">
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <i className="fas fa-map-marker-alt"></i>
                Venue Options
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Perfect <span className="text-primary-600">Venues</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Choose from our variety of professional venues, each designed to create the perfect atmosphere for your event
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {venueOptions.map((venue, index) => (
                <div 
                  key={index} 
                  className="group bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 text-center scroll-reveal"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center text-gray-600 text-xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <i className={venue.icon}></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                    {venue.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                    {venue.description}
                  </p>
                  <div className="text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full inline-block">
                    {venue.capacity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center scroll-reveal">
            <div className="bg-primary-600 rounded-2xl p-12 text-white shadow-primary">
              <h2 className="text-3xl font-bold mb-4">Ready to Plan Your Event?</h2>
              <p className="text-primary-100 mb-8 max-w-2xl mx-auto text-lg">
                Let us help you create a memorable experience for your next university event with our professional catering services.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/requests/new"
                  className="btn-yellow inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold shadow-yellow hover:shadow-xl transition-all duration-300 hover:scale-105"
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
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
