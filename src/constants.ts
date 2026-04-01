export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  price: number;
  duration: string;
  image: string;
  category: 'Adventure' | 'Relaxation' | 'Culture' | 'Luxury' | 'Family' | 'Transport';
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
    category: 'Relaxation'
  },
  {
    id: '2',
    name: 'Kyoto',
    country: 'Japan',
    description: 'Immerse yourself in ancient temples, traditional tea houses, and serene bamboo forests.',
    price: 1899,
    duration: '10 Days',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800',
    category: 'Culture'
  },
  {
    id: '3',
    name: 'Swiss Alps',
    country: 'Switzerland',
    description: 'Majestic peaks and crystal-clear lakes await in this alpine paradise.',
    price: 2499,
    duration: '8 Days',
    image: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&q=80&w=800',
    category: 'Adventure'
  },
  {
    id: '4',
    name: 'Bali',
    country: 'Indonesia',
    description: 'Tropical beaches, lush rice terraces, and vibrant spiritual culture.',
    price: 999,
    duration: '12 Days',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800',
    category: 'Relaxation'
  },
  {
    id: '5',
    name: 'Maasai Mara',
    country: 'Kenya',
    description: 'Witness the great migration and the magnificent Big Five in their natural habitat.',
    price: 3200,
    duration: '6 Days',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800',
    category: 'Adventure'
  },
  {
    id: '6',
    name: 'Amalfi Coast',
    country: 'Italy',
    description: 'Dramatic cliffs and colorful villages overlooking the sparkling Mediterranean.',
    price: 2100,
    duration: '9 Days',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=800',
    category: 'Luxury'
  },
  {
    id: '7',
    name: 'Disneyland Paris',
    country: 'France',
    description: 'Magical adventures for the whole family with iconic characters and thrilling rides.',
    price: 850,
    duration: '4 Days',
    image: 'https://images.unsplash.com/photo-1544085311-11a028465b03?auto=format&fit=crop&q=80&w=800',
    category: 'Family'
  },
  {
    id: '8',
    name: 'Luxury Sports Car Rental',
    country: 'Germany',
    description: 'Drive the Autobahn in style with our fleet of high-performance luxury sports cars.',
    price: 450,
    duration: 'Per Day',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
    category: 'Transport'
  },
  {
    id: '9',
    name: 'Great Barrier Reef',
    country: 'Australia',
    description: 'Explore the world\'s largest coral reef system with family-friendly snorkeling tours.',
    price: 1500,
    duration: '5 Days',
    image: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&q=80&w=800',
    category: 'Family'
  },
  {
    id: '10',
    name: 'Tesla Model S Rental',
    country: 'USA',
    description: 'Experience the future of driving with our premium electric vehicle rentals.',
    price: 200,
    duration: 'Per Day',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800',
    category: 'Transport'
  },
  {
    id: '11',
    name: 'Safari Adventure',
    country: 'South Africa',
    description: 'An educational and exciting wildlife experience tailored for children and families.',
    price: 2800,
    duration: '7 Days',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800',
    category: 'Family'
  },
  {
    id: '12',
    name: 'Machu Picchu',
    country: 'Peru',
    description: 'Discover the lost city of the Incas on a guided historical journey.',
    price: 1750,
    duration: '6 Days',
    image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&q=80&w=800',
    category: 'Culture'
  }
];
