import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, TextField, InputAdornment, Card, CardContent, Chip, IconButton } from '@mui/material';
import { Search, LocationOn, Adjust, FilterList } from '@mui/icons-material';
import MainLayout from '../components/layouts/MainLayout';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

// Mock data for events on the map
const mockEvents = [
  {
    id: '1',
    title: 'Pastrimi i Liqenit',
    location: 'Liqeni Artificial',
    distance: '1.2 km larg',
    date: '2025-05-28',
    time: '10:00',
    position: { lat: 41.3121, lng: 19.8218 }
  },
  {
    id: '2',
    title: 'Vullnetarizëm në Bankën e Ushqimit',
    location: 'Qendra Komunitare',
    distance: '0.8 km larg',
    date: '2025-05-29',
    time: '14:00',
    position: { lat: 41.3275, lng: 19.8187 }
  },
  {
    id: '3',
    title: 'Dita e Mirëmbajtjes së Parkut',
    location: 'Parku Rinia',
    distance: '2.0 km larg',
    date: '2025-06-01',
    time: '09:00',
    position: { lat: 41.3242, lng: 19.8167 }
  }
];

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 41.3275, // Updated to Tirana coordinates
  lng: 19.8187
};

// Define the libraries we need
const libraries = ['places'];

const Map: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [filteredEvents, setFilteredEvents] = useState(mockEvents);
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // Replace LoadScript with useJsApiLoader
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyCcjZIgHaUOBmM_mRVrPN175mRxbJO873U',
    libraries: libraries as any,
  });
  
  // Filter events when search value changes
  useEffect(() => {
    if (searchValue.trim() === '') {
      setFilteredEvents(mockEvents);
    } else {
      const filtered = mockEvents.filter(
        event => 
          event.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          event.location.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredEvents(filtered);
    }
  }, [searchValue]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  const centerOnUserLocation = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(15);
    }
  };

  // Only render the map when Google Maps is loaded
  if (!isLoaded) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
      <Typography>Loading Maps...</Typography>
    </Box>;
  }

  return (
    <MainLayout>
      <Box sx={{ position: 'relative', height: 'calc(100vh - 64px)' }}>
        {/* Google Map */}
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation || defaultCenter}
          zoom={13}
          onLoad={onMapLoad}
        >
          {/* Event markers */}
          {filteredEvents.map((event) => (
            <Marker
              key={event.id}
              position={event.position}
              onClick={() => setSelectedMarker(event.id)}
            />
          ))}

          {/* User location marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                scale: 8
              }}
            />
          )}

          {/* Info window for selected marker */}
          {selectedMarker && (
            <InfoWindow
              position={filteredEvents.find(event => event.id === selectedMarker)?.position}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div>
                <Typography variant="body1">
                  {filteredEvents.find(event => event.id === selectedMarker)?.title}
                </Typography>
                <Typography variant="body2">
                  {filteredEvents.find(event => event.id === selectedMarker)?.location}
                </Typography>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
        
        {/* Search bar */}
        <Box sx={{ position: 'absolute', top: 20, left: 0, right: 0, px: 2 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 1, 
              display: 'flex', 
              alignItems: 'center',
              borderRadius: 2
            }}
          >
            <TextField
              fullWidth
              placeholder="Search events near you"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              variant="standard"
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
                      <FilterList />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Paper>
        </Box>
        
        {/* Events list */}
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 20, 
            left: 0, 
            right: 0, 
            px: 2,
            maxHeight: '40%',
            overflowY: 'auto'
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
            {filteredEvents.map(event => (
              <Card 
                key={event.id} 
                sx={{ 
                  minWidth: 260,
                  borderRadius: 2,
                  boxShadow: 3,
                  cursor: 'pointer',
                  bgcolor: selectedMarker === event.id ? 'primary.light' : 'background.paper'
                }}
                onClick={() => {
                  setSelectedMarker(event.id);
                  if (mapRef.current) {
                    mapRef.current.panTo(event.position);
                    mapRef.current.setZoom(15);
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {event.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {event.location}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {event.distance}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                      label={new Date(event.date).toLocaleDateString()} 
                      size="small" 
                      sx={{ bgcolor: 'primary.light', color: 'primary.main' }}
                    />
                    <Chip 
                      label={event.time} 
                      size="small" 
                      sx={{ bgcolor: 'primary.light', color: 'primary.main' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Current location button */}
        <Box sx={{ position: 'absolute', bottom: 80, right: 20 }}>
          <IconButton 
            sx={{ bgcolor: 'white', boxShadow: 2 }}
            onClick={centerOnUserLocation}
          >
            <Adjust color="primary" />
          </IconButton>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default Map;