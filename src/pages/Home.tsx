// client/src/pages/Home.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, TextField, Card, CardMedia, CardContent, 
  IconButton, InputAdornment, Container, Menu, MenuItem,
  Popover, List, ListItem, ListItemText } from '@mui/material';
import { Search, FilterAlt, LocationOn, ArrowForward, KeyboardArrowDown } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';

// Custom images for categories
const imageStartup = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'; // Startup event image
// Shembuj të tjerë për evente startup:
const imageStartup2 = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80';
const imageStartup3 = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80';
const imageStartup4 = 'https://images.unsplash.com/photo-1515168833906-d2a3b82b3029?auto=format&fit=crop&w=800&q=80';
const imageStartup5 = 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=800&q=80';

const imageVullnetare = 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'; // Vullnetare
const imageBiznesSerioz = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'; // Biznes serioz

// Extra unique images for events
const image1 = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
const image2 = 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80';
const image3 = 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80';
const image4 = 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80';
const image5 = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80';
const image6 = 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80';
const image7 = 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=800&q=80';
const image8 = 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80';
const image9 = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
const image10 = 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80';
const image11 = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80';
const image12 = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80';
const image13 = 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80';
const image14 = 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80';
const image15 = 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80';
const image16 = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
const image17 = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80';

const eventImages = [
  imageStartup,
  imageStartup2,
  imageStartup3,
  imageStartup4,
  imageStartup5,
  imageVullnetare,
  imageBiznesSerioz
];

// Updated profile images
const profileImages = [
  'https://randomuser.me/api/portraits/women/12.jpg',
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/68.jpg',
  'https://randomuser.me/api/portraits/men/45.jpg',
  'https://randomuser.me/api/portraits/women/33.jpg',
  'https://randomuser.me/api/portraits/men/19.jpg'
];

// Mock data (similar to your React Native app)
const upcomingEvents = [
  {
    id: '1',
    title: 'InnovateX: The Future of...',
    location: '36 Guild Street London, USA',
    attendees: '30 Going',
    date: '10',
    image: imageStartup,
    profiles: [
      profileImages[0],
      profileImages[1],
      profileImages[2],
    ],
  },
  {
    id: '2',
    title: 'Startup Summit',
    location: 'Radius Gallery - SF',
    attendees: '10 Going',
    date: '10',
    image: imageStartup2,
    profiles: [
      profileImages[3],
      profileImages[4],
      profileImages[5],
    ],
  },
  {
    id: '3',
    title: 'Tech Conference 2025',
    location: 'Convention Center',
    attendees: '42 Going',
    date: '15',
    image: imageStartup3,
    profiles: [
      profileImages[1],
      profileImages[3],
      profileImages[5],
    ],
  },
  {
    id: '4',
    title: 'Community Gardening',
    location: 'Central Park',
    attendees: '18 Going',
    date: '12',
    image: image4,
    profiles: [
      profileImages[0],
      profileImages[2],
      profileImages[4],
    ],
  },
  {
    id: '5',
    title: 'Charity Run',
    location: 'Riverside Park',
    attendees: '25 Going',
    date: '20',
    image: image5,
    profiles: [
      profileImages[1],
      profileImages[3],
      profileImages[5],
    ],
  },
  {
    id: '6',
    title: 'Environmental Workshop',
    location: 'Green Community Center',
    attendees: '15 Going',
    date: '22',
    image: image6,
    profiles: [
      profileImages[0],
      profileImages[2],
      profileImages[4],
    ],
  },
  {
    id: '7',
    title: 'Beach Cleanup Drive',
    location: 'South Beach',
    attendees: '30 Going',
    date: '25',
    image: image7, 
    profiles: [
      profileImages[1],
      profileImages[3],
      profileImages[5],
    ],
  },
  {
    id: '8',
    title: 'Food Bank Volunteering',
    location: 'Downtown Food Bank',
    attendees: '22 Going',
    date: '28',
    image: image8,
    profiles: [
      profileImages[0],
      profileImages[2],
      profileImages[4],
    ],
  },
  {
    id: '9',
    title: 'Literacy Campaign',
    location: 'Community Library',
    attendees: '12 Going',
    date: '30',
    image: image9,
    profiles: [
      profileImages[1],
      profileImages[3],
      profileImages[5],
    ],
  },
  {
    id: '10',
    title: 'Animal Shelter Support',
    location: 'Happy Paws Shelter',
    attendees: '20 Going',
    date: '02',
    image: image10,
    profiles: [
      profileImages[0],
      profileImages[2],
      profileImages[4],
    ],
  },
  {
    id: '11',
    title: 'Homeless Shelter Drive',
    location: 'City Shelter',
    attendees: '35 Going',
    date: '05',
    image: image11,
    profiles: [
      profileImages[1],
      profileImages[3],
      profileImages[5],
    ],
  },
  {
    id: '12',
    title: 'Youth Mentorship Program',
    location: 'Youth Center',
    attendees: '15 Going',
    date: '08',
    image: image12,
    profiles: [
      profileImages[0],
      profileImages[2],
      profileImages[4],
    ],
  },
  {
    id: '13',
    title: 'Elderly Care Visit',
    location: 'Silver Years Home',
    attendees: '18 Going',
    date: '14',
    image: image13,
    profiles: [
      profileImages[1],
      profileImages[3],
      profileImages[5],
    ],
  },
  {
    id: '14',
    title: 'Community Garden Project',
    location: 'Urban Gardens',
    attendees: '25 Going',
    date: '16',
    image: image14,
    profiles: [
      profileImages[0],
      profileImages[2],
      profileImages[4],
    ],
  },
  {
    id: '15',
    title: 'Medical Camp Support',
    location: 'Public Hospital',
    attendees: '40 Going',
    date: '18',
    image: image15,
    profiles: [
      profileImages[1],
      profileImages[3],
      profileImages[5],
    ],
  },
  {
    id: '16',
    title: 'Park Restoration',
    location: 'Hillside Park',
    attendees: '22 Going',
    date: '22',
    image: image16,
    profiles: [
      profileImages[0],
      profileImages[2],
      profileImages[4],
    ],
  },
  {
    id: '17',
    title: 'School Support Program',
    location: 'Public School #5',
    attendees: '28 Going',
    date: '25',
    image: image17,
    profiles: [
      profileImages[1],
      profileImages[3],
      profileImages[5],
    ],
  },
];

// Update recommendations with more reliable image URLs
const recommendations = [
  {
    id: '1',
    title: 'Environmental Workshop',
    location: 'Los Angeles',
    price: '$30.00',
    image: image6,
  },
  {
    id: '2',
    title: 'Community Support Drive',
    location: 'Florida',
    price: 'Free',
    image: image8,
  },
  {
    id: '3',
    title: 'Youth Education Summit',
    location: 'New York',
    price: '$20.00',
    image: image3,
  },
];

// Mock data for Now Events (events happening right now)
const nowEvents = [
  {
    id: 'now-1',
    title: 'Beach Cleanup Drive',
    location: 'Ocean Beach, San Francisco',
    attendees: '52 Going',
    date: 'NOW',
    image: image11, 
    profiles: [
      profileImages[0],
      profileImages[2],
      profileImages[4],
    ],
  },
  {
    id: 'now-2',
    title: 'Food Bank Distribution',
    location: 'Community Center',
    attendees: '28 Going',
    date: 'NOW',
    image: image8,
    profiles: [
      profileImages[1],
      profileImages[3],
      profileImages[5],
    ],
  },
  {
    id: 'now-3',
    title: 'Park Maintenance',
    location: 'Central Park',
    attendees: '15 Going',
    date: 'NOW',
    image: image4,
    profiles: [
      profileImages[0],
      profileImages[2],
      profileImages[4],
    ],
  },
];

// Mock data for Past Events
const pastEvents = [
  {
    id: 'past-1',
    title: 'Homeless Shelter Support',
    location: 'Downtown Shelter',
    attendees: '45 Attended',
    date: '05',
    image: image11, 
    profiles: [
      profileImages[1],
      profileImages[3],
      profileImages[5],
    ],
  },
  {
    id: 'past-2',
    title: 'River Cleanup Project',
    location: 'Riverside Park',
    attendees: '32 Attended',
    date: '02',
    image: image5,
    profiles: [
      profileImages[0],
      profileImages[2],
      profileImages[4],
    ],
  },
  {
    id: 'past-3',
    title: 'Animal Shelter Volunteering',
    location: 'Happy Paws Shelter',
    attendees: '18 Attended',
    date: '28',
    image: image10,
    profiles: [
      profileImages[1],
      profileImages[3],
      profileImages[5],
    ],
  },
];

// Define Balkan countries
const balkanCountries = [
  { name: 'Albania', code: 'AL' },
  { name: 'Bosnia and Herzegovina', code: 'BA' },
  { name: 'Bulgaria', code: 'BG' },
  { name: 'Croatia', code: 'HR' },
  { name: 'Greece', code: 'GR' },
  { name: 'Kosovo', code: 'XK' },
  { name: 'Montenegro', code: 'ME' },
  { name: 'North Macedonia', code: 'MK' },
  { name: 'Romania', code: 'RO' },
  { name: 'Serbia', code: 'RS' },
  { name: 'Slovenia', code: 'SI' }
];

// Mock events data by country
const eventsByCountry = {
  AL: [
    {
      id: 'al-1',
      title: 'Tirana Beach Cleanup',
      location: 'Durrës Beach',
      attendees: '24 Going',
      date: '12',
      image: image1,
      profiles: [profileImages[0], profileImages[1], profileImages[2]],
      country: 'Albania'
    },
    {
      id: 'al-2',
      title: 'Albanian Heritage Festival',
      location: 'Skanderbeg Square, Tirana',
      attendees: '87 Going',
      date: '20',
      image: image2,
      profiles: [profileImages[3], profileImages[4], profileImages[5]],
      country: 'Albania'
    }
  ],
  BA: [
    {
      id: 'ba-1',
      title: 'River Cleanup Sarajevo',
      location: 'Miljacka River',
      attendees: '42 Going',
      date: '14',
      image: image3,
      profiles: [profileImages[0], profileImages[2], profileImages[4]],
      country: 'Bosnia and Herzegovina'
    }
  ],
  BG: [
    {
      id: 'bg-1',
      title: 'Sofia Park Restoration',
      location: 'Borisova Garden, Sofia',
      attendees: '35 Going',
      date: '18',
      image: image4,
      profiles: [profileImages[1], profileImages[3], profileImages[5]],
      country: 'Bulgaria'
    }
  ],
  HR: [
    {
      id: 'hr-1',
      title: 'Adriatic Coastal Cleanup',
      location: 'Split Beaches',
      attendees: '63 Going',
      date: '08',
      image: image5,
      profiles: [profileImages[0], profileImages[2], profileImages[4]],
      country: 'Croatia'
    }
  ],
  GR: [
    {
      id: 'gr-1',
      title: 'Athens Historical Tour',
      location: 'Acropolis, Athens',
      attendees: '50 Going',
      date: '16',
      image: image6,
      profiles: [profileImages[1], profileImages[3], profileImages[5]],
      country: 'Greece'
    },
    {
      id: 'gr-2',
      title: 'Island Coastal Cleanup',
      location: 'Mykonos Island',
      attendees: '28 Going',
      date: '22',
      image: image7,
      profiles: [profileImages[0], profileImages[2], profileImages[4]],
      country: 'Greece'
    }
  ],
  XK: [
    {
      id: 'xk-1',
      title: 'Prishtina Youth Summit',
      location: 'National Library, Prishtina',
      attendees: '45 Going',
      date: '19',
      image: image8,
      profiles: [profileImages[1], profileImages[3], profileImages[5]],
      country: 'Kosovo'
    }
  ],
  ME: [
    {
      id: 'me-1',
      title: 'Kotor Bay Cleaning Initiative',
      location: 'Bay of Kotor',
      attendees: '32 Going',
      date: '15',
      image: image9,
      profiles: [profileImages[0], profileImages[2], profileImages[4]],
      country: 'Montenegro'
    }
  ],
  MK: [
    {
      id: 'mk-1',
      title: 'Skopje City Volunteering',
      location: 'City Center, Skopje',
      attendees: '38 Going',
      date: '11',
      image: image10,
      profiles: [profileImages[1], profileImages[3], profileImages[5]],
      country: 'North Macedonia'
    }
  ],
  RO: [
    {
      id: 'ro-1',
      title: 'Bucharest Community Garden',
      location: 'Herăstrău Park, Bucharest',
      attendees: '40 Going',
      date: '17',
      image: image11,
      profiles: [profileImages[0], profileImages[2], profileImages[4]],
      country: 'Romania'
    }
  ],
  RS: [
    {
      id: 'rs-1',
      title: 'Belgrade River Cleanup',
      location: 'Sava River, Belgrade',
      attendees: '55 Going',
      date: '09',
      image: image12,
      profiles: [profileImages[1], profileImages[3], profileImages[5]],
      country: 'Serbia'
    }
  ],
  SI: [
    {
      id: 'si-1',
      title: 'Ljubljana Environmental Workshop',
      location: 'Tivoli City Park, Ljubljana',
      attendees: '29 Going',
      date: '21',
      image: image13,
      profiles: [profileImages[0], profileImages[2], profileImages[4]],
      country: 'Slovenia'
    }
  ],
};

// Modify the Home component to include location selection
const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  
  // Country selection state
  const [selectedCountry, setSelectedCountry] = useState<string>('Albania');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('AL');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Get country-specific events
  const countryEvents = eventsByCountry[selectedCountryCode as keyof typeof eventsByCountry] || [];
  
  // Combine all events for search, including country-specific ones
  const allEvents = useMemo(() => {
    // Flatten the eventsByCountry object into an array
    const countryEventsArray = Object.values(eventsByCountry).flat();
    return [...nowEvents, ...upcomingEvents, ...pastEvents, ...countryEventsArray];
  }, []);
  
  const handleCountryClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCountryClose = () => {
    setAnchorEl(null);
  };

  const handleCountrySelect = (country: string, code: string) => {
    setSelectedCountry(country);
    setSelectedCountryCode(code);
    handleCountryClose();
  };

 
  // Update the handleEventClick function in the Home component
  const handleEventClick = (eventId: string) => {
    // Find the event in any of our data sources
    const event = 
      nowEvents.find(e => e.id === eventId) ||
      upcomingEvents.find(e => e.id === eventId) ||
      pastEvents.find(e => e.id === eventId) ||
      recommendations.find(e => e.id === eventId) ||
      countryEvents.find(e => e.id === eventId) ||
      searchResults.find(e => e.id === eventId);
    
    // If event is found, store it in localStorage for the details page
    if (event) {
      localStorage.setItem(`event-${eventId}`, JSON.stringify(event));
    }
    
    // Also store all event collections for fallback
    localStorage.setItem('upcomingEvents', JSON.stringify(upcomingEvents));
    localStorage.setItem('nowEvents', JSON.stringify(nowEvents));
    localStorage.setItem('pastEvents', JSON.stringify(pastEvents));
    localStorage.setItem('recommendations', JSON.stringify(recommendations));
    localStorage.setItem(`events-${selectedCountryCode}`, JSON.stringify(countryEvents));
    
    // Navigate to the event details page
    navigate(`/event/${eventId}`);
    setShowSearchResults(false); // Hide results after clicking
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setShowSearchResults(false);
      return;
    }
    
    // Filter events based on search query, include country events
    const filteredResults = allEvents.filter(event => 
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      event.location.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(filteredResults);
    setShowSearchResults(true);
  };
  
  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#search-container') && !target.closest('#search-results')) {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to render event lists (Now, Upcoming, Past)
  const renderEventList = (events: any[], label: React.ReactNode, badgeColor = '#FAD2D2', textColor = '#F08A8A') => (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="600">{label}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer' }}>
          See All
        </Typography>
      </Box>

      {events.length > 0 ? (
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
          {events.map(event => (
            <Box 
              key={event.id} 
              sx={{ 
                minWidth: 250,
                flexShrink: 0
              }}
            >
              <Card 
                sx={{ 
                  width: '100%', 
                  borderRadius: 3,
                  boxShadow: 2,
                  cursor: 'pointer',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                onClick={() => handleEventClick(event.id)}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="120"
                    image={event.image}
                    alt={event.title}
                    sx={{ borderRadius: 2 }}
                  />
                  <Box sx={{ 
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    bgcolor: badgeColor,
                    borderRadius: '50%',
                    width: 35,
                    height: 35,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Typography sx={{ color: textColor, fontWeight: 'bold', fontSize: event.date === 'NOW' ? '0.7rem' : '0.9rem' }}>
                      {event.date}
                    </Typography>
                  </Box>
                </Box>

                <CardContent>
                  <Typography variant="body1" fontWeight="bold" noWrap>
                    {event.title}
                  </Typography>
                  
                  {/* Attendees with profile images */}
                  <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                    <Box sx={{ display: 'flex', mr: 1 }}>
                      {event.profiles.map((profile: string | undefined, index: number) => (
                        <Box 
                          key={index}
                          component="img"
                          src={profile}
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            borderRadius: '50%',
                            border: '2px solid white',
                            marginLeft: index > 0 ? -1 : 0
                          }}
                        />
                      ))}
                    </Box>
                    <Typography variant="caption" color="primary.main">
                      {event.attendees}
                    </Typography>
                  </Box>
                  
                  {/* Location */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                      {event.location}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No events available in this category
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <MainLayout>
      {/* Header with search */}
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        py: 3,
        mb: 4,
        position: 'relative',
      }}>
        <Container>
          {/* Location and Filter */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onClick={handleCountryClick}
            >
              <Box sx={{ textAlign: 'center', ml: 4 }}>
                <Typography variant="caption">Current Location</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" fontWeight="bold">{selectedCountry}</Typography>
                  <KeyboardArrowDown sx={{ ml: 0.5, fontSize: '1rem' }} />
                </Box>
              </Box>
            </Box>
            <IconButton 
              sx={{ 
                bgcolor: 'primary.dark',
                borderRadius: 2,
                p: 1
              }} 
              size="small"
            >
              <FilterAlt fontSize="small" sx={{ color: 'white' }} />
            </IconButton>
          </Box>

          {/* Country Selection Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCountryClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                maxHeight: 300,
                width: 200,
              },
            }}
          >
            {balkanCountries.map((country) => (
              <MenuItem 
                key={country.code} 
                onClick={() => handleCountrySelect(country.name, country.code)}
                selected={selectedCountry === country.name}
              >
                {country.name}
              </MenuItem>
            ))}
          </Menu>
          
          {/* Search bar */}
          <Box id="search-container" sx={{ position: 'relative' }}>
            <TextField
              placeholder="Search events..."
              variant="standard"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'white' }} />
                  </InputAdornment>
                ),
                disableUnderline: true,
                sx: { 
                  color: 'white', 
                  fontSize: '1.2rem',
                  '&::placeholder': {
                    color: 'white',
                    opacity: 0.7
                  },
                  '& input': {
                    color: 'white'
                  }
                }
              }}
              sx={{ 
                my: 1,
                px: 2
              }}
            />
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchQuery.trim() !== '' && (
              <Box 
                id="search-results"
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  bgcolor: 'white',
                  boxShadow: 3,
                  borderRadius: 2,
                  maxHeight: 400,
                  overflowY: 'auto',
                  mt: 1,
                  zIndex: 1000,
                }}
              >
                {searchResults.length > 0 ? (
                  searchResults.map(event => (
                    <Box 
                      key={event.id}
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        p: 1.5,
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                      }}
                      onClick={() => handleEventClick(event.id)}
                    >
                      <Box 
                        component="img" 
                        src={event.image} 
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          borderRadius: 1,
                          mr: 2
                        }}
                        alt={event.title}
                      />
                      <Box>
                        <Typography variant="body1" fontWeight="bold" color="text.primary">
                          {event.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <LocationOn fontSize="small" color="action" sx={{ fontSize: 16 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                            {event.location}
                          </Typography>
                        </Box>
                        {event.country && (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                            {event.country}
                          </Typography>
                        )}
                      </Box>
                      <Box 
                        sx={{ 
                          ml: 'auto',
                          bgcolor: event.date === 'NOW' ? '#DDFFE7' : 
                                  (event.attendees.includes('Attended') ? '#F0F0F0' : '#FAD2D2'),
                          color: event.date === 'NOW' ? '#4CAF50' : 
                                (event.attendees.includes('Attended') ? '#757575' : '#F08A8A'),
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {event.date === 'NOW' ? 'Now' : 
                        event.attendees.includes('Attended') ? 'Past' : 'Upcoming'}
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      No events found for "{searchQuery}"
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      <Container>
        {/* Country-specific events section with special styling */}
        {renderEventList(countryEvents, 
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="600">{selectedCountry} Events</Typography>
            <Box 
              sx={{ 
                ml: 2, 
                bgcolor: '#E3F2FD', 
                color: '#1976D2', 
                px: 1.5, 
                py: 0.5, 
                borderRadius: 5,
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}
            >
              {countryEvents.length} events
            </Box>
          </Box>, 
          '#E3F2FD', '#1976D2')}
        
        {/* Now events section */}
        {renderEventList(nowEvents, "Happening Now", '#DDFFE7', '#4CAF50')}
        
        {/* Upcoming events section */}
        {renderEventList(upcomingEvents, "Upcoming", '#FAD2D2', '#F08A8A')}
        
        {/* Past events section */}
        {renderEventList(pastEvents, "Past Events", '#F0F0F0', '#757575')}

        {/* Recommendations section - keep as is */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="600">Recommendations for you</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer' }}>
              See All
            </Typography>
          </Box>

          {recommendations.map(item => (
            <Card 
              key={item.id}
              sx={{ 
                display: 'flex',
                mb: 2,
                borderRadius: 3,
                boxShadow: 1,
                cursor: 'pointer',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 },
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onClick={() => handleEventClick(item.id)}
            >
              <CardMedia
                component="img"
                sx={{ width: 100, height: 100, borderRadius: 2, m: 1 }}
                image={item.image}
                alt={item.title}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {item.location}
                </Typography>
                <Typography 
                  variant="body2" 
                  fontWeight="bold"
                  sx={{ 
                    color: item.price === 'Free' ? 'green' : 'primary.main',
                    mt: 0.5
                  }}
                >
                  {item.price}
                </Typography>
              </Box>
            </Card>
          ))}
        </Box>
      </Container>
    </MainLayout>
  );
};

export default Home;