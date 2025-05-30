import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardMedia, 
  Chip, 
  Divider,
  Avatar,
  IconButton,
  Stack,
  AvatarGroup,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Grid,
  InputAdornment
} from '@mui/material';
import { 
  LocationOn, 
  CalendarToday, 
  AccessTime, 
  ArrowBack,
  BookmarkBorder,
  Bookmark,
  Share,
  People,
  ContentCopy,
  Facebook,
  Twitter,
  WhatsApp,
  Email
} from '@mui/icons-material';
import { CreditCard, Lock } from '@mui/icons-material';
import MainLayout from '../components/layouts/MainLayout';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc, 
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { loadStripe } from '@stripe/stripe-js';
import DialogContentText from '@mui/material/DialogContentText';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

// Combined interface to handle all event types
interface Event {
  id: string;
  title: string;
  location: string;
  image: string;
  date?: string;
  time?: string;
  description?: string;
  attendees?: string | number;
  profiles?: string[];
  organizerName?: string;
  organizerImage?: string;
  country?: string;
  price?: string;
}

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');
  const [shareDialogOpen, setShareDialogOpen] = useState<boolean>(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [userEventData, setUserEventData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialRequirements: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [registrationStep, setRegistrationStep] = useState<'info' | 'payment'>('info');
  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Get the event data from localStorage if available
        const eventData = localStorage.getItem(`event-${id}`);
        
        if (eventData) {
          const parsedEvent = JSON.parse(eventData);
          
          // Generate descriptions based on event type and title if none exists
          const enhancedEvent = {
            ...parsedEvent,
            description: parsedEvent.description || generateEventDescription(parsedEvent),
            time: parsedEvent.time || generateEventTime(parsedEvent),
            organizerName: parsedEvent.organizerName || "Community Organizer"
          };
          
          setEvent(enhancedEvent);
          checkIfEventIsSaved(id);
          setLoading(false);
          return;
        }
        
        // If no data in localStorage, fetch from all potential sources
        const fetchFromAllSources = () => {
          // Get all event sources from localStorage
          const upcomingEvents = JSON.parse(localStorage.getItem('upcomingEvents') || '[]');
          const nowEvents = JSON.parse(localStorage.getItem('nowEvents') || '[]');
          const pastEvents = JSON.parse(localStorage.getItem('pastEvents') || '[]');
          const recommendations = JSON.parse(localStorage.getItem('recommendations') || '[]');
          
          // Get all country events
          const balkanCountryCodes = ['AL', 'BA', 'BG', 'HR', 'GR', 'XK', 'ME', 'MK', 'RO', 'RS', 'SI'];
          let countryEvents: Event[] = [];
          
          balkanCountryCodes.forEach(code => {
            const events = JSON.parse(localStorage.getItem(`events-${code}`) || '[]');
            countryEvents = [...countryEvents, ...events];
          });
          
          // Combine all sources
          const allEvents = [...upcomingEvents, ...nowEvents, ...pastEvents, ...recommendations, ...countryEvents];
          
          // Find the event by ID
          return allEvents.find((e: Event) => e.id === id);
        };
        
        // Try to find event from all sources
        const foundEvent = fetchFromAllSources();
        
        if (foundEvent) {
          // If found, prepare complete event data
          const completeEvent = {
            ...foundEvent,
            description: foundEvent.description || generateEventDescription(foundEvent),
            time: foundEvent.time || generateEventTime(foundEvent),
            organizerName: foundEvent.organizerName || "Community Organizer",
            organizerImage: foundEvent.profiles ? foundEvent.profiles[0] : "https://randomuser.me/api/portraits/women/12.jpg"
          };
          
          // Save to localStorage for future quick access
          localStorage.setItem(`event-${id}`, JSON.stringify(completeEvent));
          setEvent(completeEvent);
          checkIfEventIsSaved(id);
        } else {
          // If event is still not found, show fallback data
          setEvent({
            id: id || "",
            title: "Event Details",
            location: "Location information not available",
            image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
            description: "Event information not available. Please go back and try again.",
            date: new Date().toISOString().split('T')[0],
            time: "Time not specified",
            attendees: "Unknown",
            organizerName: "Unknown Organizer",
            organizerImage: "https://randomuser.me/api/portraits/lego/1.jpg",
            profiles: []
          });
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error("Error loading event:", err);
        setError("Failed to load event details");
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Check if the current event is saved in the user's favorites
  const checkIfEventIsSaved = async (eventId: string) => {
    if (!currentUser) return;
    
    try {
      // Check if the event exists in the user's favorites
      const savedEventRef = doc(db, `users/${currentUser.uid}/savedEvents/${eventId}`);
      const savedEventDoc = await getDoc(savedEventRef);
      
      setIsSaved(savedEventDoc.exists());
    } catch (error) {
      console.error("Error checking if event is saved:", error);
    }
  };

  // Generate detailed description based on event details
  const generateEventDescription = (event: Event): string => {
    // Check if event title contains keywords to customize description
    const title = event.title.toLowerCase();
    const location = event.location || '';
    const country = event.country || '';
    
    if (title.includes('cleanup') || title.includes('beach')) {
      return `Join us for this important environmental cleanup event at ${location}${country ? ` in ${country}` : ''}. We'll be working together to remove litter, plastic waste, and other pollutants to protect our natural environment. All cleaning supplies will be provided, but please bring water, sun protection, and wear comfortable clothing. This is a great opportunity to connect with environmentally conscious people and make a real difference in our community.`;
    }
    
    if (title.includes('tech') || title.includes('conference') || title.includes('summit') || title.includes('innovate')) {
      return `Don't miss this cutting-edge tech event at ${location}${country ? ` in ${country}` : ''}. Network with industry leaders, learn about the latest innovations, and participate in hands-on workshops. Perfect for professionals, entrepreneurs, and tech enthusiasts alike. The event will feature keynote speakers, panel discussions, and opportunities for Q&A with experts. Refreshments and lunch will be provided.`;
    }
    
    if (title.includes('community') || title.includes('volunteer')) {
      return `Be part of positive change in our community at ${location}${country ? ` in ${country}` : ''}. This volunteer event brings together people from all walks of life to support local initiatives and help those in need. No prior experience is necessary—just bring your enthusiasm and willingness to help. Together, we can make a significant impact and build stronger community bonds.`;
    }
    
    if (title.includes('workshop') || title.includes('education')) {
      return `Expand your knowledge and skills at this interactive workshop taking place at ${location}${country ? ` in ${country}` : ''}. Designed for all experience levels, this session will provide valuable insights and practical techniques you can apply immediately. Our expert facilitators will guide you through engaging activities and discussions. All materials will be provided, and participants will receive a certificate of completion.`;
    }
    
    if (title.includes('festival') || title.includes('heritage')) {
      return `Celebrate cultural richness and tradition at this vibrant festival in ${location}${country ? `, ${country}` : ''}. Experience authentic food, music, dance, and art that showcase our diverse heritage. Bring your family and friends to enjoy performances, exhibitions, and interactive activities throughout the day. This is an excellent opportunity to learn about and appreciate different cultural expressions in our community.`;
    }
    
    if (title.includes('garden') || title.includes('park') || title.includes('restoration')) {
      return `Help make our green spaces more beautiful and sustainable at ${location}${country ? ` in ${country}` : ''}. This environmental event focuses on planting native species, removing invasive plants, and general beautification of our shared outdoor spaces. No gardening experience is required—knowledgeable volunteers will provide guidance and tools. This is a wonderful way to learn about local ecology while enjoying the outdoors with like-minded community members.`;
    }
    
    if (title.includes('food') || title.includes('bank') || title.includes('homeless') || title.includes('shelter')) {
      return `Support those in need in our community at this humanitarian event at ${location}${country ? ` in ${country}` : ''}. We'll be working together to provide essential services and supplies to vulnerable populations. Your participation will make a direct and meaningful difference in people's lives. This is a rewarding opportunity to practice compassion and solidarity while connecting with other community-minded volunteers.`;
    }
    
    if (title.includes('youth') || title.includes('mentorship') || title.includes('literacy')) {
      return `Help shape the future by supporting young people at ${location}${country ? ` in ${country}` : ''}. This youth-focused event creates opportunities for learning, mentorship, and personal development. Your participation can inspire the next generation and provide them with valuable skills and confidence. No special expertise is required—just a genuine interest in helping young people thrive.`;
    }
    
    if (title.includes('animal') || title.includes('shelter') || title.includes('paws')) {
      return `Support our furry friends at this animal welfare event at ${location}${country ? ` in ${country}` : ''}. Whether you're helping with shelter maintenance, animal socialization, or adoption promotion, your contribution will improve the lives of animals in need. This is a perfect opportunity for animal lovers to make a tangible difference and connect with others who share their passion for animal welfare.`;
    }
    
    // Default description for other types of events
    return `Join us for this exciting event at ${location}${country ? ` in ${country}` : ''}. This is a great opportunity to connect with others in the community, learn something new, and make a positive impact. Whether you're a first-timer or a regular participant, you'll be welcomed into our community of engaged citizens working together for a better future.`;
  };

  // Generate event time based on event details
  const generateEventTime = (event: Event): string => {
    // If event is happening NOW, use current time + 2 hours
    if (event.date === 'NOW') {
      const now = new Date();
      const later = new Date(now);
      later.setHours(later.getHours() + 2);
      
      return `${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${later.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }
    
    // For past events, use morning time
    if (event.attendees && typeof event.attendees === 'string' && event.attendees.includes('Attended')) {
      return "9:00 AM - 12:00 PM";
    }
    
    // For other events, generate time based on event ID to be consistent
    const eventId = parseInt(event.id.replace(/[^0-9]/g, '')) || 0;
    const hours = (eventId % 12) + 8; // 8 AM to 8 PM
    const endHours = hours + 2; // Events last 2 hours
    
    const startTime = hours < 12 ? `${hours}:00 AM` : (hours === 12 ? "12:00 PM" : `${hours - 12}:00 PM`);
    const endTime = endHours < 12 ? `${endHours}:00 AM` : (endHours === 12 ? "12:00 PM" : `${endHours - 12}:00 PM`);
    
    return `${startTime} - ${endTime}`;
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Handle saving/unsaving events to Firebase
  const handleSaveEvent = async () => {
    if (!event) return;
    
    if (!currentUser) {
      // User not logged in, show login prompt
      setSnackbarMessage("Please log in to save events");
      setSnackbarSeverity("info");
      setSnackbarOpen(true);
      return;
    }
    
    try {
      const eventId = event.id;
      const savedEventRef = doc(db, `users/${currentUser.uid}/savedEvents/${eventId}`);
      
      if (isSaved) {
        // Remove from favorites
        await deleteDoc(savedEventRef);
        setIsSaved(false);
        setSnackbarMessage("Event removed from favorites");
        setSnackbarSeverity("info");
      } else {
        // Add to favorites
        // Create a Firebase-compatible object - no undefined values, no complex objects
        const firestoreEventData = {
          id: event.id,
          title: event.title,
          location: event.location,
          image: event.image,
          date: event.date || null,
          time: event.time || null,
          description: event.description || null,
          // Convert non-string attendees to string
          attendees: typeof event.attendees === 'number' ? 
            event.attendees.toString() : event.attendees || null,
          // Store only the first few profile URLs if they exist
          profiles: Array.isArray(event.profiles) ? 
            event.profiles.slice(0, 10) : null,
          organizerName: event.organizerName || null,
          organizerImage: event.organizerImage || null,
          country: event.country || null,
          price: event.price || null,
          savedAt: new Date().toISOString()
        };
        
        await setDoc(savedEventRef, firestoreEventData);
        setIsSaved(true);
        setSnackbarMessage("Event saved to favorites");
        setSnackbarSeverity("success");
      }
      
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error saving event:", error);
      setSnackbarMessage("Failed to save event. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Handle opening the share dialog
  const handleShareClick = () => {
    setShareDialogOpen(true);
  };

  // Handle copying the event link
  const handleCopyLink = () => {
    const eventUrl = `${window.location.origin}/event/${id}`;
    navigator.clipboard.writeText(eventUrl)
      .then(() => {
        setSnackbarMessage("Link copied to clipboard");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setShareDialogOpen(false);
      })
      .catch(() => {
        setSnackbarMessage("Failed to copy link");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  // Handle sharing to various platforms
  const handleShareToSocial = (platform: string) => {
    if (!event) return;
    
    const eventUrl = `${window.location.origin}/event/${id}`;
    const eventTitle = event.title;
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this event: ${eventTitle}`)}&url=${encodeURIComponent(eventUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`Check out this event: ${eventTitle} ${eventUrl}`)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(`Check out this event: ${eventTitle}`)}&body=${encodeURIComponent(`I thought you might be interested in this event: ${eventTitle}\n\n${eventUrl}`)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
      setShareDialogOpen(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Handle joining the event
  const handleJoinEvent = () => {
    if (!currentUser) {
      setSnackbarMessage("Please log in to register for this event");
      setSnackbarSeverity("info");
      setSnackbarOpen(true);
      return;
    }
    
    // Reset form data and errors before opening dialog
    setUserEventData({
      fullName: currentUser.displayName || '',
      email: currentUser.email || '',
      phone: '',
      specialRequirements: ''
    });
    setFormErrors({});
    setSelectedTicket('');
    setRegistrationStep('info'); // Start with info collection
    setJoinDialogOpen(true); // Open the dialog

    // For free events, we'll still show the form but skip payment
    // We'll handle this in the dialog flow
  };

  // Add this function to handle form input changes
  const handleUserDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserEventData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Add this function to validate the form
  const validateUserData = () => {
    const errors: {[key: string]: string} = {};
    
    if (!userEventData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!userEventData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(userEventData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!userEventData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add this function to proceed to payment after collecting user info
  const handleProceedToTicketSelection = () => {
    if (!validateUserData()) {
      return;
    }
    
    setRegistrationStep('payment');
  };

  // Handle ticket selection for payment step
  const handleTicketSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTicket(event.target.value);
  };

  // Update the handleProceedToPayment function
  const handleProceedToPayment = async () => {
    if (!selectedTicket || !event) {
      setSnackbarMessage("Please select a ticket option");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      setIsProcessingPayment(true);
      
      // Get the ticket details
      const [ticketType, priceString] = selectedTicket.split('-');
      const amount = parseInt(priceString);
      
      // Initialize Stripe with your publishable key
      const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error("Failed to initialize payment processor");
      }

      // Save registration to Firebase before payment
      const registrationRef = await saveEventRegistration({
        ticketType,
        price: amount,
        currency: 'EUR',
        paymentStatus: 'pending'
      });
      
      if (!registrationRef) {
        throw new Error("Failed to create registration record");
      }
      
      // For demo: simulate successful payment
      setTimeout(async () => {
        // Update the registration with payment success
        try {
          await updateDoc(doc(db, 'eventRegistrations', registrationRef.id), {
            paymentStatus: 'completed',
            paidAt: serverTimestamp()
          });
          
          setJoinDialogOpen(false);
          setSnackbarMessage("Payment successful! You're registered for the event.");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        } catch (error) {
          console.error("Error updating payment status:", error);
        } finally {
          setIsProcessingPayment(false);
        }
      }, 2000); // Simulate 2 second payment processing
    
    } catch (error) {
      console.error("Payment error:", error);
      setSnackbarMessage("Payment processing failed. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setIsProcessingPayment(false);
    }
  };

  // Add this function to save registration data to Firebase
  const saveEventRegistration = async (paymentDetails: {
    ticketType: string;
    price: number;
    currency: string;
    paymentStatus: string;
  } | null) => {
    if (!event || !currentUser) return null;
    
    try {
      const registrationsRef = collection(db, 'eventRegistrations');
      
      const registrationData = {
        eventId: event.id,
        eventTitle: event.title,
        eventImage: event.image,
        eventDate: event.date || null,
        eventTime: event.time || null,
        eventLocation: event.location || null,
        userId: currentUser.uid,
        userEmail: currentUser.email || userEventData.email,
        userDisplayName: currentUser.displayName || userEventData.fullName,
        fullName: userEventData.fullName,
        email: userEventData.email,
        phone: userEventData.phone,
        specialRequirements: userEventData.specialRequirements || null,
        registeredAt: serverTimestamp(),
        payment: paymentDetails,
        status: paymentDetails ? 'pending' : 'confirmed' // Free events are auto-confirmed
      };
      
      // Add to event registrations collection
      const docRef = await addDoc(registrationsRef, registrationData);
      
      // Also add to user's registered events for easy access
      await setDoc(doc(db, `users/${currentUser.uid}/registeredEvents/${event.id}`), {
        ...registrationData,
        registrationId: docRef.id
      });
      
      return docRef;
    } catch (error) {
      console.error("Error saving registration:", error);
      setSnackbarMessage("Failed to complete registration. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return null;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Container sx={{ mt: 2 }}>
          <Typography>Loading event details...</Typography>
        </Container>
      </MainLayout>
    );
  }

  if (error || !event) {
    return (
      <MainLayout>
        <Container sx={{ mt: 2 }}>
          <Typography color="error">
            {error || "Event not found"}
          </Typography>
          <Button onClick={handleBack} startIcon={<ArrowBack />}>
            Go Back
          </Button>
        </Container>
      </MainLayout>
    );
  }

  // Format date for display
  const displayDate = event.date === 'NOW' ? 'Today' : 
    (typeof event.date === 'string' && event.date.length <= 2) ? 
      `May ${event.date}, 2025` : // If it's just the day number, assume it's the current year and month
      "Date not specified";

  // Handle different attendees formats
  const attendeesDisplay = typeof event.attendees === 'number' 
    ? `${event.attendees} Going` 
    : event.attendees || "0 Going";

  return (
    <MainLayout>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="250"
          image={event.image}
          alt={event.title}
        />
        <IconButton 
          sx={{ position: 'absolute', top: 16, left: 16, bgcolor: 'rgba(255,255,255,0.8)' }}
          onClick={handleBack}
        >
          <ArrowBack />
        </IconButton>
      </Box>

      <Container sx={{ mt: -4, position: 'relative', zIndex: 2 }}>
        <Card sx={{ borderRadius: 3, boxShadow: 2, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h5" fontWeight="bold">
              {event.title}
            </Typography>
            <Box>
              <IconButton onClick={handleSaveEvent} color={isSaved ? "primary" : "default"}>
                {isSaved ? <Bookmark /> : <BookmarkBorder />}
              </IconButton>
              <IconButton onClick={handleShareClick}>
                <Share />
              </IconButton>
            </Box>
          </Box>

          {/* Organizer and Attendees Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            {/* Organizer */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                src={event.organizerImage || (event.profiles && event.profiles[0])} 
                sx={{ width: 24, height: 24, mr: 1 }} 
              />
              <Typography variant="body2">
                {event.organizerName || "Community Organizer"}
              </Typography>
            </Box>

            {/* Attendee Count */}
            <Chip 
              label={attendeesDisplay} 
              size="small" 
              sx={{ bgcolor: 'primary.light', color: 'primary.main' }}
              icon={<People sx={{ fontSize: 16 }} />}
            />
          </Box>

          {/* Attendee Profiles */}
          {event.profiles && event.profiles.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Attendees:
              </Typography>
              <AvatarGroup max={6} sx={{ justifyContent: 'flex-start' }}>
                {event.profiles.map((profile, index) => (
                  <Avatar key={index} src={profile} sx={{ width: 32, height: 32 }} />
                ))}
              </AvatarGroup>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Event Details */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CalendarToday fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
            <Typography variant="body2" fontWeight="medium">
              {displayDate}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccessTime fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
            <Typography variant="body2" fontWeight="medium">{event.time}</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
            <LocationOn fontSize="small" sx={{ color: 'text.secondary', mr: 1, mt: 0.3 }} />
            <Box>
              <Typography variant="body2" fontWeight="medium">{event.location}</Typography>
              {event.country && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {event.country}
                </Typography>
              )}
            </Box>
          </Box>

          {event.price && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="body2" fontWeight="bold" color={event.price === 'Free' ? 'green' : 'primary.main'}>
                Price: {event.price}
              </Typography>
            </Box>
          )}

          <Typography variant="h6" sx={{ mb: 1 }}>
            About this event
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
            {event.description}
          </Typography>

          <Button 
            variant="contained" 
            fullWidth 
            sx={{ borderRadius: 2, py: 1.5 }}
            onClick={handleJoinEvent}
          >
            {event.price && event.price !== 'Free' ? 'Register Now' : 'Join Event'}
          </Button>
        </Card>

        {/* Related Info Section */}
        <Card sx={{ borderRadius: 3, boxShadow: 2, p: 3, mt: 2, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Event Details
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              What to bring:
            </Typography>
            <Typography variant="body2">
              • Comfortable clothes
              {event.title.toLowerCase().includes('cleanup') && " • Gloves (if you have them)"}
              {event.title.toLowerCase().includes('beach') && " • Sun protection"}
              {event.title.toLowerCase().includes('garden') && " • Water bottle"}
              • Positive attitude
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Contact information:
            </Typography>
            <Typography variant="body2">
              events@community-support.org
            </Typography>
            <Typography variant="body2">
              +1 (555) 123-4567
            </Typography>
          </Box>
        </Card>
      </Container>
      
      {/* Registration Dialog */}
      <Dialog 
        open={joinDialogOpen} 
        onClose={() => !isProcessingPayment && setJoinDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        disableEscapeKeyDown={isProcessingPayment}
      >
        <DialogTitle>
          {registrationStep === 'info' ? 'Register for Event' : 'Select Ticket Type'}
        </DialogTitle>
        <DialogContent>
          {registrationStep === 'info' ? (
            // Step 1: Collect user information
            <Box sx={{ mt: 1 }}>
              <DialogContentText sx={{ mb: 2 }}>
          Please provide your information to register for {event.title}.
              </DialogContentText>
              <TextField
          name="fullName"
          label="Full Name"
          value={userEventData.fullName}
          onChange={handleUserDataChange}
          fullWidth
          required
          error={!!formErrors.fullName}
          helperText={formErrors.fullName}
          sx={{ mb: 2 }}
              />
              <TextField
          name="email"
          label="Email Address"
          value={userEventData.email}
          onChange={handleUserDataChange}
          fullWidth
          required
          type="email"
          error={!!formErrors.email}
          helperText={formErrors.email}
          sx={{ mb: 2 }}
              />
              <TextField
          name="phone"
          label="Phone Number"
          value={userEventData.phone}
          onChange={handleUserDataChange}
          fullWidth
          required
          error={!!formErrors.phone}
          helperText={formErrors.phone}
          sx={{ mb: 2 }}
              />
              <TextField
          name="specialRequirements"
          label="Special Requirements (Optional)"
          value={userEventData.specialRequirements}
          onChange={handleUserDataChange}
          fullWidth
          multiline
          rows={2}
          sx={{ mb: 2 }}
              />
            </Box>
          ) : (
            // Step 2: Select ticket and payment
            <>
              <DialogContentText sx={{ mb: 2 }}>
          Please select your preferred ticket option for this event.
              </DialogContentText>
              
              <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
          <FormLabel component="legend">Available Tickets</FormLabel>
          <RadioGroup value={selectedTicket} onChange={handleTicketSelection}>
            {/* Workshop tickets */}
            {event?.title.toLowerCase().includes('workshop') && (
              <>
                <FormControlLabel value="standard-20" control={<Radio />} label="Standard Ticket - €20" />
                <FormControlLabel value="premium-35" control={<Radio />} label="Premium Ticket (includes materials) - €35" />
                <FormControlLabel value="vip-50" control={<Radio />} label="VIP Ticket (includes lunch & materials) - €50" />
              </>
            )}
            
            {/* Conference tickets */}
            {event?.title.toLowerCase().includes('conference') && (
              <>
                <FormControlLabel value="basic-50" control={<Radio />} label="Basic Access - €50" />
                <FormControlLabel value="full-100" control={<Radio />} label="Full Conference Access - €100" />
                <FormControlLabel value="vip-150" control={<Radio />} label="VIP Access (includes lunch) - €150" />
                <FormControlLabel value="premium-200" control={<Radio />} label="Premium Access (all inclusive) - €200" />
              </>
            )}
            
            {/* Festival tickets */}
            {event?.title.toLowerCase().includes('festival') && (
              <>
                <FormControlLabel value="day-25" control={<Radio />} label="Day Pass - €25" />
                <FormControlLabel value="weekend-45" control={<Radio />} label="Weekend Pass - €45" />
                <FormControlLabel value="vip-75" control={<Radio />} label="VIP Weekend Pass - €75" />
              </>
            )}
            
            {/* Tech event tickets */}
            {event?.title.toLowerCase().includes('tech') && (
              <>
                <FormControlLabel value="basic-30" control={<Radio />} label="Basic Access - €30" />
                <FormControlLabel value="developer-60" control={<Radio />} label="Developer Pass - €60" />
                <FormControlLabel value="expert-100" control={<Radio />} label="Expert Access (all workshops) - €100" />
              </>
            )}
            
            {/* Cultural event tickets */}
            {(event?.title.toLowerCase().includes('culture') || event?.title.toLowerCase().includes('heritage')) && (
              <>
                <FormControlLabel value="regular-15" control={<Radio />} label="Regular Ticket - €15" />
                <FormControlLabel value="family-45" control={<Radio />} label="Family Pack (4 people) - €45" />
                <FormControlLabel value="supporter-35" control={<Radio />} label="Culture Supporter Ticket - €35" />
              </>
            )}
            
            {/* Default ticket options */}
            {!event?.title.toLowerCase().includes('workshop') && 
             !event?.title.toLowerCase().includes('conference') &&
             !event?.title.toLowerCase().includes('festival') &&
             !event?.title.toLowerCase().includes('tech') &&
             !event?.title.toLowerCase().includes('culture') &&
             !event?.title.toLowerCase().includes('heritage') && (
              <>
                <FormControlLabel value="standard-15" control={<Radio />} label="Standard Entry - €15" />
                <FormControlLabel value="supporter-30" control={<Radio />} label="Supporter Ticket - €30" />
              </>
            )}
          </RadioGroup>
              </FormControl>

              {/* Credit Card Form - Show when a ticket is selected */}
              {selectedTicket && (
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Payment Details
            </Typography>
            
            <TextField
              fullWidth
              label="Cardholder Name"
              placeholder="Name as appears on card"
              InputProps={{
                startAdornment: (
            <InputAdornment position="start">
              <CreditCard />
            </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              InputProps={{
                startAdornment: (
            <InputAdornment position="start">
              <CreditCard />
            </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Expiry Date"
                placeholder="MM/YY"
              />
              <TextField
                fullWidth
                label="CVC"
                placeholder="123"
                InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock fontSize="small" />
              </InputAdornment>
            ),
                }}
              />
            </Box>
            <Box sx={{ 
              bgcolor: 'background.paper', 
              p: 2, 
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              mt: 1
            }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                <Lock fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }}/> 
                Secure Payment
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your payment information is encrypted and secure. We do not store your credit card details.
              </Typography>
            </Box>
          </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              if (registrationStep === 'payment') {
                setRegistrationStep('info');
              } else {
                setJoinDialogOpen(false);
              }
            }} 
            disabled={isProcessingPayment}
          >
            {registrationStep === 'payment' ? 'Back' : 'Cancel'}
          </Button>
          <Button 
            onClick={registrationStep === 'info' ? handleProceedToTicketSelection : handleProceedToPayment} 
            color="primary" 
            variant="contained"
            disabled={isProcessingPayment || (registrationStep === 'payment' && !selectedTicket)}
          >
            {isProcessingPayment ? 'Processing...' : 
             (registrationStep === 'info' ? 'Continue to Tickets' : 'Complete Payment')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Share this event</DialogTitle>
        <DialogContent>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleShareToSocial('facebook')}>
                <ListItemIcon>
                  <Facebook color="primary" />
                </ListItemIcon>
                <ListItemText primary="Facebook" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleShareToSocial('twitter')}>
                <ListItemIcon>
                  <Twitter sx={{ color: '#1DA1F2' }} />
                </ListItemIcon>
                <ListItemText primary="Twitter" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleShareToSocial('whatsapp')}>
                <ListItemIcon>
                  <WhatsApp sx={{ color: '#25D366' }} />
                </ListItemIcon>
                <ListItemText primary="WhatsApp" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleShareToSocial('email')}>
                <ListItemIcon>
                  <Email color="action" />
                </ListItemIcon>
                <ListItemText primary="Email" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleCopyLink}>
                <ListItemIcon>
                  <ContentCopy color="action" />
                </ListItemIcon>
                <ListItemText primary="Copy Link" />
              </ListItemButton>
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default EventDetails;