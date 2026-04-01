export interface ItineraryItem {
  day: number;
  title: string;
  activities: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  price: number;
  duration: string;
  image: string;
  category: 'Adventure' | 'Relaxation' | 'Culture' | 'Luxury' | 'Family' | 'Transport';
  itinerary?: ItineraryItem[];
  rating?: number;
  reviewCount?: number;
}

export const DESTINATIONS: Destination[] = [
  {
    id: '1',
    name: 'Santorini',
    country: 'Greece',
    description: 'Experience the iconic blue domes and breathtaking sunsets of the Aegean Sea.',
    price: 1299,
    duration: '7 Days',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=800',
    category: 'Relaxation',
    rating: 4.9,
    reviewCount: 128,
    itinerary: [
      { day: 1, title: 'Arrival in Fira', activities: 'Check-in to your boutique hotel and enjoy a welcome dinner overlooking the caldera.' },
      { day: 2, title: 'Oia Sunset Tour', activities: 'Explore the charming streets of Oia and witness the world-famous sunset.' },
      { day: 3, title: 'Volcano & Hot Springs', activities: 'Boat trip to Nea Kameni volcano and a dip in the therapeutic hot springs.' },
      { day: 4, title: 'Akrotiri Excavations', activities: 'Visit the prehistoric city preserved by volcanic ash.' },
      { day: 5, title: 'Wine Tasting', activities: 'Sample local Assyrtiko wines at traditional wineries.' },
      { day: 6, title: 'Beach Day', activities: 'Relax at the Red Beach or Perissa Black Sand Beach.' },
      { day: 7, title: 'Departure', activities: 'Last-minute souvenir shopping before heading to the airport.' }
    ]
  },
  {
    id: '2',
    name: 'Kyoto',
    country: 'Japan',
    description: 'Immerse yourself in ancient temples, traditional tea houses, and serene bamboo forests.',
    price: 1899,
    duration: '10 Days',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800',
    category: 'Culture',
    rating: 4.8,
    reviewCount: 95,
    itinerary: [
      { day: 1, title: 'Arrival in Kyoto', activities: 'Transfer from Osaka and settle into your Ryokan.' },
      { day: 2, title: 'Gion District', activities: 'Walk through the historic geisha district and visit Yasaka Shrine.' },
      { day: 3, title: 'Arashiyama Bamboo Grove', activities: 'Stroll through the iconic bamboo forest and visit Tenryu-ji Temple.' },
      { day: 4, title: 'Kinkaku-ji (Golden Pavilion)', activities: 'Marvel at the stunning gold-leaf-covered Zen temple.' },
      { day: 5, title: 'Nara Day Trip', activities: 'Meet the friendly deer at Nara Park and see the Great Buddha at Todai-ji.' },
      { day: 6, title: 'Tea Ceremony', activities: 'Participate in a traditional Japanese tea ceremony.' },
      { day: 7, title: 'Fushimi Inari-taisha', activities: 'Hike through the thousands of vermilion torii gates.' },
      { day: 8, title: 'Nishiki Market', activities: 'Explore "Kyoto\'s Kitchen" and sample local delicacies.' },
      { day: 9, title: 'Philosopher\'s Path', activities: 'A peaceful walk along the canal lined with cherry trees.' },
      { day: 10, title: 'Departure', activities: 'Final breakfast and transfer to the airport.' }
    ]
  },
  {
    id: '3',
    name: 'Swiss Alps',
    country: 'Switzerland',
    description: 'Majestic peaks and crystal-clear lakes await in this alpine paradise.',
    price: 2499,
    duration: '8 Days',
    image: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&q=80&w=800',
    category: 'Adventure',
    rating: 4.7,
    reviewCount: 72,
    itinerary: [
      { day: 1, title: 'Arrival in Interlaken', activities: 'Welcome dinner with views of the Eiger, Mönch, and Jungfrau.' },
      { day: 2, title: 'Jungfraujoch', activities: 'Train ride to the "Top of Europe" at 3,454 meters.' },
      { day: 3, title: 'Lauterbrunnen Valley', activities: 'Visit the valley of 72 waterfalls and hike to Staubbach Falls.' },
      { day: 4, title: 'Paragliding Adventure', activities: 'Tandem paragliding flight over Interlaken.' },
      { day: 5, title: 'Lake Brienz Cruise', activities: 'Relaxing boat trip on the turquoise waters of Lake Brienz.' },
      { day: 6, title: 'Grindelwald First', activities: 'Cliff walk and adventure activities like the First Flyer.' },
      { day: 7, title: 'Schilthorn', activities: 'Visit the Piz Gloria revolving restaurant from James Bond.' },
      { day: 8, title: 'Departure', activities: 'Scenic train ride back to Zurich for departure.' }
    ]
  },
  {
    id: '4',
    name: 'Bali',
    country: 'Indonesia',
    description: 'Tropical beaches, lush rice terraces, and vibrant spiritual culture.',
    price: 999,
    duration: '12 Days',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800',
    category: 'Relaxation',
    rating: 4.6,
    reviewCount: 156,
    itinerary: [
      { day: 1, title: 'Arrival in Ubud', activities: 'Transfer to your jungle villa and enjoy a Balinese massage.' },
      { day: 2, title: 'Tegalalang Rice Terrace', activities: 'Visit the stunning rice fields and the Sacred Monkey Forest.' },
      { day: 3, title: 'Mount Batur Sunrise Hike', activities: 'Early morning trek to the volcano summit for sunrise.' },
      { day: 4, title: 'Tirta Empul Temple', activities: 'Participate in a traditional water purification ritual.' },
      { day: 5, title: 'Uluwatu Temple', activities: 'Watch the Kecak Fire Dance at sunset on the cliffside.' },
      { day: 6, title: 'Seminyak Beach', activities: 'Relax on the beach and enjoy the vibrant nightlife.' },
      { day: 7, title: 'Nusa Penida Day Trip', activities: 'Visit Kelingking Beach and Angel\'s Billabong.' },
      { day: 8, title: 'Yoga & Wellness', activities: 'A full day of yoga classes and spa treatments.' },
      { day: 9, title: 'Cooking Class', activities: 'Learn to cook authentic Balinese dishes.' },
      { day: 10, title: 'Tanah Lot', activities: 'Visit the iconic sea temple at sunset.' },
      { day: 11, title: 'Shopping in Canggu', activities: 'Last-minute shopping for local crafts and clothing.' },
      { day: 12, title: 'Departure', activities: 'Transfer to Denpasar airport.' }
    ]
  },
  {
    id: '5',
    name: 'Maasai Mara',
    country: 'Kenya',
    description: 'Witness the great migration and the magnificent Big Five in their natural habitat.',
    price: 3200,
    duration: '6 Days',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800',
    category: 'Adventure',
    rating: 4.9,
    reviewCount: 45,
    itinerary: [
      { day: 1, title: 'Arrival in Nairobi', activities: 'Transfer to Wilson Airport for a flight to the Mara.' },
      { day: 2, title: 'Full Day Game Drive', activities: 'Search for lions, leopards, elephants, and rhinos.' },
      { day: 3, title: 'Hot Air Balloon Safari', activities: 'Soar over the plains at dawn followed by a champagne breakfast.' },
      { day: 4, title: 'Maasai Village Visit', activities: 'Learn about the culture and traditions of the Maasai people.' },
      { day: 5, title: 'Mara River Crossing', activities: 'Witness the dramatic river crossing during the migration.' },
      { day: 6, title: 'Departure', activities: 'Final morning game drive and flight back to Nairobi.' }
    ]
  },
  {
    id: '6',
    name: 'Amalfi Coast',
    country: 'Italy',
    description: 'Dramatic cliffs and colorful villages overlooking the sparkling Mediterranean.',
    price: 2100,
    duration: '9 Days',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=800',
    category: 'Luxury',
    rating: 4.8,
    reviewCount: 88,
    itinerary: [
      { day: 1, title: 'Arrival in Positano', activities: 'Check-in to your luxury hotel and enjoy dinner with a view.' },
      { day: 2, title: 'Path of the Gods Hike', activities: 'Breathtaking coastal hike from Bomerano to Nocelle.' },
      { day: 3, title: 'Capri Island Boat Tour', activities: 'Visit the Blue Grotto and swim in the crystal-clear waters.' },
      { day: 4, title: 'Ravello Gardens', activities: 'Visit Villa Cimbrone and Villa Rufolo for stunning views.' },
      { day: 5, title: 'Amalfi Town & Cathedral', activities: 'Explore the historic town and its magnificent cathedral.' },
      { day: 6, title: 'Cooking Class in Sorrento', activities: 'Learn to make fresh pasta and limoncello.' },
      { day: 7, title: 'Pompeii Day Trip', activities: 'Guided tour of the ancient Roman city preserved by Vesuvius.' },
      { day: 8, title: 'Beach Club Day', activities: 'Relax at a private beach club in Positano.' },
      { day: 9, title: 'Departure', activities: 'Transfer to Naples for your flight home.' }
    ]
  },
  {
    id: '7',
    name: 'Disneyland Paris',
    country: 'France',
    description: 'Magical adventures for the whole family with iconic characters and thrilling rides.',
    price: 850,
    duration: '4 Days',
    image: 'https://images.unsplash.com/photo-1544085311-11a028465b03?auto=format&fit=crop&q=80&w=800',
    category: 'Family',
    rating: 4.7,
    reviewCount: 210,
    itinerary: [
      { day: 1, title: 'Arrival & Main Street', activities: 'Check-in to a Disney hotel and explore Main Street U.S.A.' },
      { day: 2, title: 'Disneyland Park', activities: 'Full day of rides in Fantasyland, Adventureland, and Discoveryland.' },
      { day: 3, title: 'Walt Disney Studios Park', activities: 'Experience the world of Marvel and Pixar.' },
      { day: 4, title: 'Character Breakfast & Departure', activities: 'Meet your favorite characters before heading home.' }
    ]
  },
  {
    id: '8',
    name: 'Luxury Sports Car Rental',
    country: 'Germany',
    description: 'Drive the Autobahn in style with our fleet of high-performance luxury sports cars.',
    price: 450,
    duration: 'Per Day',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
    category: 'Transport',
    rating: 4.9,
    reviewCount: 34,
    itinerary: [
      { day: 1, title: 'Vehicle Handover', activities: 'Pick up your Porsche or Mercedes and get a briefing on the Autobahn.' }
    ]
  },
  {
    id: '9',
    name: 'Great Barrier Reef',
    country: 'Australia',
    description: 'Explore the world\'s largest coral reef system with family-friendly snorkeling tours.',
    price: 1500,
    duration: '5 Days',
    image: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&q=80&w=800',
    category: 'Family',
    rating: 4.8,
    reviewCount: 67,
    itinerary: [
      { day: 1, title: 'Arrival in Cairns', activities: 'Welcome dinner and briefing on reef safety.' },
      { day: 2, title: 'Outer Reef Snorkeling', activities: 'Full day boat trip to the vibrant coral gardens.' },
      { day: 3, title: 'Kuranda Rainforest', activities: 'Scenic railway and skyrail journey through the rainforest.' },
      { day: 4, title: 'Green Island Eco-Tour', activities: 'Explore the island and its surrounding reef.' },
      { day: 5, title: 'Departure', activities: 'Final breakfast and transfer to Cairns airport.' }
    ]
  },
  {
    id: '10',
    name: 'Tesla Model S Rental',
    country: 'USA',
    description: 'Experience the future of driving with our premium electric vehicle rentals.',
    price: 200,
    duration: 'Per Day',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800',
    category: 'Transport',
    rating: 4.7,
    reviewCount: 52,
    itinerary: [
      { day: 1, title: 'EV Handover', activities: 'Pick up your Tesla and learn about the Supercharger network.' }
    ]
  },
  {
    id: '11',
    name: 'Safari Adventure',
    country: 'South Africa',
    description: 'An educational and exciting wildlife experience tailored for children and families.',
    price: 2800,
    duration: '7 Days',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800',
    category: 'Family',
    rating: 4.9,
    reviewCount: 41,
    itinerary: [
      { day: 1, title: 'Arrival in Johannesburg', activities: 'Transfer to a family-friendly safari lodge.' },
      { day: 2, title: 'Junior Ranger Program', activities: 'Kids learn about tracking animals and conservation.' },
      { day: 3, title: 'Morning & Evening Game Drives', activities: 'Spot the Big Five with expert guides.' },
      { day: 4, title: 'Bush Walk', activities: 'Educational walk focusing on smaller creatures and plants.' },
      { day: 5, title: 'Stargazing Night', activities: 'Learn about the southern hemisphere constellations.' },
      { day: 6, title: 'Wildlife Rehabilitation Center', activities: 'Visit a center helping injured animals.' },
      { day: 7, title: 'Departure', activities: 'Final game drive and transfer back to Johannesburg.' }
    ]
  },
  {
    id: '12',
    name: 'Machu Picchu',
    country: 'Peru',
    description: 'Discover the lost city of the Incas on a guided historical journey.',
    price: 1750,
    duration: '6 Days',
    image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&q=80&w=800',
    category: 'Culture',
    rating: 4.9,
    reviewCount: 112,
    itinerary: [
      { day: 1, title: 'Arrival in Cusco', activities: 'Acclimatize to the altitude and explore the historic center.' },
      { day: 2, title: 'Sacred Valley Tour', activities: 'Visit Pisac Market and Ollantaytambo Fortress.' },
      { day: 3, title: 'Train to Aguas Calientes', activities: 'Scenic train ride along the Urubamba River.' },
      { day: 4, title: 'Machu Picchu Guided Tour', activities: 'Explore the magnificent Inca citadel at sunrise.' },
      { day: 5, title: 'Return to Cusco', activities: 'Free time to explore Cusco\'s artisan markets.' },
      { day: 6, title: 'Departure', activities: 'Transfer to Cusco airport for your flight home.' }
    ]
  }
];
