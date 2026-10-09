/* EasyBeauty sample data
   Demo professionals for the Gombe State (Nigeria) pilot market.
   Swap this file for a real API/database later — everything else
   reads from the `PROFESSIONALS` array below. */

const PROFESSIONALS = [
  {
    id: "amina-yusuf",
    name: "Amina Yusuf",
    service: "Hairstylist",
    location: "Bolari, Gombe",
    priceMin: 5000,
    priceMax: 15000,
    whatsapp: "2348031112201",
    photo: "https://images.pexels.com/photos/37874679/pexels-photo-37874679.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    portfolio: [
      "https://picsum.photos/seed/amina1/500/380",
      "https://picsum.photos/seed/amina2/500/380",
      "https://picsum.photos/seed/amina3/500/380"
    ],
    description: "Specialist in braids, weave installations and natural hair styling. Over 6 years of experience serving clients across Gombe.",
    rating: 4.8,
    reviews: [
      { name: "Zainab O.", rating: 5, comment: "Amina did an amazing job on my knotless braids. Neat and fast!", date: "2026-08-12" },
      { name: "Ruth P.", rating: 4.5, comment: "Very professional and my hair lasted for weeks.", date: "2026-07-30" }
    ]
  },
  {
    id: "fatima-bello",
    name: "Fatima Bello",
    service: "Makeup Artist",
    location: "Pantami, Gombe",
    priceMin: 10000,
    priceMax: 30000,
    whatsapp: "2348031112202",
    photo: "https://images.pexels.com/photos/38272154/pexels-photo-38272154.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    portfolio: [
      "https://picsum.photos/seed/fatima1/500/380",
      "https://picsum.photos/seed/fatima2/500/380",
      "https://picsum.photos/seed/fatima3/500/380"
    ],
    description: "Bridal and event makeup artist known for flawless, long-lasting looks tailored to every skin tone.",
    rating: 4.9,
    reviews: [
      { name: "Hauwa M.", rating: 5, comment: "Best makeup artist in Gombe! My bridal look was perfect.", date: "2026-08-20" },
      { name: "Chidinma A.", rating: 5, comment: "So gentle and skilled. Booking her again for sure.", date: "2026-06-14" }
    ]
  },
  {
    id: "hadiza-musa",
    name: "Hadiza Musa",
    service: "Nail Technician",
    location: "Jekada Fari, Gombe",
    priceMin: 3000,
    priceMax: 8000,
    whatsapp: "2348031112203",
    photo: "https://images.pexels.com/photos/39054377/pexels-photo-39054377.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    portfolio: [
      "https://picsum.photos/seed/hadiza1/500/380",
      "https://picsum.photos/seed/hadiza2/500/380",
      "https://picsum.photos/seed/hadiza3/500/380"
    ],
    description: "Gel, acrylic and nail art specialist. Clean, hygienic tools and creative designs for every occasion.",
    rating: 4.6,
    reviews: [
      { name: "Amaka N.", rating: 4.5, comment: "Loved my nail art, very detailed work.", date: "2026-07-02" },
      { name: "Blessing T.", rating: 4.5, comment: "Affordable and long-lasting gel nails.", date: "2026-05-19" }
    ]
  },
  {
    id: "zainab-ibrahim",
    name: "Zainab Ibrahim",
    service: "Lash Technician",
    location: "GRA, Gombe",
    priceMin: 4000,
    priceMax: 10000,
    whatsapp: "2348031112204",
    photo: "https://images.pexels.com/photos/39816440/pexels-photo-39816440.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    portfolio: [
      "https://picsum.photos/seed/zainab1/500/380",
      "https://picsum.photos/seed/zainab2/500/380",
      "https://picsum.photos/seed/zainab3/500/380"
    ],
    description: "Classic and volume lash extensions applied with precision and care for a natural, glam finish.",
    rating: 4.7,
    reviews: [
      { name: "Fatima K.", rating: 5, comment: "My lashes looked so natural yet glam. Highly recommend!", date: "2026-08-01" },
      { name: "Mercy J.", rating: 4.5, comment: "Very clean workspace and friendly.", date: "2026-06-27" }
    ]
  },
  {
    id: "blessing-okon",
    name: "Blessing Okon",
    service: "Hairstylist",
    location: "Tudun Wada, Gombe",
    priceMin: 6000,
    priceMax: 20000,
    whatsapp: "2348031112205",
    photo: "https://images.pexels.com/photos/37967692/pexels-photo-37967692.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    portfolio: [
      "https://picsum.photos/seed/blessing1/500/380",
      "https://picsum.photos/seed/blessing2/500/380",
      "https://picsum.photos/seed/blessing3/500/380"
    ],
    description: "Expert in silk press, wig installs and creative color styling for modern, low-maintenance looks.",
    rating: 4.5,
    reviews: [
      { name: "Ngozi E.", rating: 4.5, comment: "My silk press was so sleek and smooth.", date: "2026-07-18" },
      { name: "Aisha D.", rating: 4.5, comment: "Great with wig installs, very neat finish.", date: "2026-05-05" }
    ]
  },
  {
    id: "maryam-sani",
    name: "Maryam Sani",
    service: "Makeup Artist",
    location: "Nasarawo, Gombe",
    priceMin: 12000,
    priceMax: 35000,
    whatsapp: "2348031112206",
    photo: "https://images.pexels.com/photos/34991785/pexels-photo-34991785.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    portfolio: [
      "https://picsum.photos/seed/maryam1/500/380",
      "https://picsum.photos/seed/maryam2/500/380",
      "https://picsum.photos/seed/maryam3/500/380"
    ],
    description: "Luxury bridal makeup and gele styling with over 8 years of experience across Northern Nigeria.",
    rating: 5.0,
    reviews: [
      { name: "Sadiya B.", rating: 5, comment: "Absolutely flawless. Worth every naira.", date: "2026-08-25" },
      { name: "Grace O.", rating: 5, comment: "The gele alone was a masterpiece!", date: "2026-07-09" }
    ]
  },
  {
    id: "rahama-adamu",
    name: "Rahama Adamu",
    service: "Nail Technician",
    location: "Federal Low-cost, Gombe",
    priceMin: 3500,
    priceMax: 9000,
    whatsapp: "2348031112207",
    photo: "https://images.pexels.com/photos/39134411/pexels-photo-39134411.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    portfolio: [
      "https://picsum.photos/seed/rahama1/500/380",
      "https://picsum.photos/seed/rahama2/500/380",
      "https://picsum.photos/seed/rahama3/500/380"
    ],
    description: "Friendly nail technician offering manicures, pedicures and custom nail art at student-friendly prices.",
    rating: 4.4,
    reviews: [
      { name: "Peace I.", rating: 4, comment: "Good value for the price.", date: "2026-06-30" },
      { name: "Halima Y.", rating: 4.5, comment: "Nails came out really pretty.", date: "2026-04-22" }
    ]
  },
  {
    id: "chioma-eze",
    name: "Chioma Eze",
    service: "Lash Technician",
    location: "Bolari, Gombe",
    priceMin: 5000,
    priceMax: 12000,
    whatsapp: "2348031112208",
    photo: "https://images.pexels.com/photos/10476512/pexels-photo-10476512.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    portfolio: [
      "https://picsum.photos/seed/chioma1/500/380",
      "https://picsum.photos/seed/chioma2/500/380",
      "https://picsum.photos/seed/chioma3/500/380"
    ],
    description: "Certified lash technician specializing in hybrid and mega volume sets that last up to 4 weeks.",
    rating: 4.8,
    reviews: [
      { name: "Esther M.", rating: 5, comment: "My lashes lasted almost a month! So worth it.", date: "2026-08-05" },
      { name: "Fadila S.", rating: 4.5, comment: "Very hygienic and gentle application.", date: "2026-06-11" }
    ]
  },
  {
    id: "halima-abubakar",
    name: "Halima Abubakar",
    service: "Hairstylist",
    location: "Pantami, Gombe",
    priceMin: 7000,
    priceMax: 18000,
    whatsapp: "2348031112209",
    photo: "https://images.pexels.com/photos/39134398/pexels-photo-39134398.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    portfolio: [
      "https://picsum.photos/seed/halima1/500/380",
      "https://picsum.photos/seed/halima2/500/380",
      "https://picsum.photos/seed/halima3/500/380"
    ],
    description: "Passionate about protective styles — cornrows, twists and weave-on that protect natural hair growth.",
    rating: 4.9,
    reviews: [
      { name: "Victoria U.", rating: 5, comment: "Best cornrows I've had in Gombe, so neat and even.", date: "2026-08-15" },
      { name: "Amina T.", rating: 4.5, comment: "Gentle hands, my scalp didn't hurt at all.", date: "2026-07-01" }
    ]
  },
  {
    id: "grace-danladi",
    name: "Grace Danladi",
    service: "Makeup Artist",
    location: "Jekada Fari, Gombe",
    priceMin: 8000,
    priceMax: 25000,
    whatsapp: "2348031112210",
    photo: "https://images.pexels.com/photos/37864840/pexels-photo-37864840.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    portfolio: [
      "https://picsum.photos/seed/grace1/500/380",
      "https://picsum.photos/seed/grace2/500/380",
      "https://picsum.photos/seed/grace3/500/380"
    ],
    description: "Soft-glam and natural makeup looks for everyday events, graduations and photoshoots.",
    rating: 4.6,
    reviews: [
      { name: "Deborah K.", rating: 4.5, comment: "Loved how natural yet glowing my makeup looked.", date: "2026-07-22" },
      { name: "Maimuna L.", rating: 4.5, comment: "Great for my graduation photos!", date: "2026-06-03" }
    ]
  }
];

const SERVICES = [...new Set(PROFESSIONALS.map(p => p.service))].sort();
const LOCATIONS = [...new Set(PROFESSIONALS.map(p => p.location))].sort();
