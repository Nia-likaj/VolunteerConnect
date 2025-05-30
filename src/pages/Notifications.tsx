import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Divider, 
  Tabs, 
  Tab, 
  Badge,
  CircularProgress,
  Chip
} from '@mui/material';
import { 
  Event as EventIcon, 
  Notifications as NotificationsIcon, 
  Done, 
  AccessTime,
  LocationOn
} from '@mui/icons-material';
import MainLayout from '../components/layouts/MainLayout';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, orderBy, limit, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

interface Notification {
  id: string;
  type: 'event' | 'message' | 'reminder';
  title: string;
  description: string;
  time: string;
  read: boolean;
  image?: string;
  eventId?: string;
  eventTime?: string;
  eventTitle?: string;
  eventLocation?: string;
}

// Mock data for notifications - we'll keep this as fallback
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'event',
    title: 'New Volunteer Event',
    description: 'Beach Cleanup event has been added near your location',
    time: '2 hours ago',
    read: false,
    image: '/images/event1.png',
    eventTitle: 'Beach Cleanup',
    eventTime: 'Sunday, June 2, 2025 at 9:00 AM',
    eventLocation: 'Main Beach'
  },
  {
    id: '2',
    type: 'message',
    title: 'Message from Organizer',
    description: 'Thanks for signing up for our food drive!',
    time: '5 hours ago',
    read: false,
  },
  {
    id: '3',
    type: 'reminder',
    title: 'Upcoming Event Reminder',
    description: 'Your volunteer event starts tomorrow at 9:00 AM',
    time: '1 day ago',
    read: true,
    image: '/images/event2.png'
  },
  {
    id: '4',
    type: 'event',
    title: 'Event Update',
    description: 'The park cleanup has been rescheduled to next Saturday',
    time: '2 days ago',
    read: true,
    image: '/images/profile1.jpg'
  }
];

const Notifications: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const userId = auth.currentUser.uid;
        console.log("Current user ID:", userId);
        
        // Get event registrations for the current user
        const registrationsQuery = query(
          collection(db, "eventRegistrations"),
          where("userId", "==", userId)
          // Temporarily removing these to make sure we get all registrations
          // orderBy("createdAt", "desc"), 
          // limit(20)
        );
        
        const registrationsSnapshot = await getDocs(registrationsQuery);
        
        console.log(`Found ${registrationsSnapshot.size} event registrations`);
        
        if (registrationsSnapshot.empty) {
          console.log("No event registrations found for this user");
          setNotifications(mockNotifications);
          setLoading(false);
          return;
        }
        
        const notificationsData: Notification[] = [];
        
        for (const registration of registrationsSnapshot.docs) {
          const regData = registration.data();
          console.log("Registration document ID:", registration.id);
          console.log("Registration data:", regData);
          
          // Check if eventId exists
          if (!regData.eventId) {
            console.error("Registration missing eventId:", regData);
            continue;
          }
          
          try {
            // Get event details
            const eventDoc = await getDoc(doc(db, "events", regData.eventId));
            
            if (eventDoc.exists()) {
              const eventData = eventDoc.data();
              console.log("Event data:", eventData);
              
              // Format timestamp properly
              let timeString = 'Recently';
              if (regData.createdAt) {
                try {
                  // Handle both Firestore Timestamp objects and date strings
                  const timestamp = regData.createdAt instanceof Timestamp 
                    ? regData.createdAt.toDate() 
                    : new Date(regData.createdAt);
                  timeString = timestamp.toLocaleString();
                } catch (err) {
                  console.error("Error formatting timestamp:", err);
                }
              }
              
              // Format event time properly
              let eventTimeFormatted = '';
              if (eventData.date || eventData.startTime || eventData.eventDate || eventData.time) {
                try {
                  // Try to get date and time from the event data
                  const dateValue = eventData.date || eventData.eventDate;
                  const timeValue = eventData.startTime || eventData.time;
                  
                  if (dateValue) {
                    // If date is a Timestamp object
                    if (dateValue instanceof Timestamp) {
                      const date = dateValue.toDate();
                      eventTimeFormatted = date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      });
                      
                      // Add time if available
                      if (timeValue) {
                        eventTimeFormatted += ` at ${timeValue}`;
                      }
                    } else {
                      // If date is a string or other format
                      eventTimeFormatted = `${dateValue}`;
                      if (timeValue) eventTimeFormatted += ` at ${timeValue}`;
                    }
                  } else if (timeValue) {
                    eventTimeFormatted = `at ${timeValue}`;
                  }
                } catch (err) {
                  console.error("Error formatting event time:", err);
                  eventTimeFormatted = 'Date not specified';
                }
              }
              
              notificationsData.push({
                id: registration.id,
                eventId: regData.eventId,
                type: 'event',
                title: `You joined: ${eventData.title || 'New Event'}`,
                description: `You've successfully registered for "${eventData.title || 'an event'}"`,
                time: timeString,
                // Check both possible field names for read status
                read: regData.notificationRead || regData.read || false,
                image: eventData.imageUrl || eventData.image || undefined,
                // Add the new fields
                eventTitle: eventData.title || 'Event',
                eventTime: eventTimeFormatted,
                eventLocation: eventData.location || eventData.address || eventData.venue || 'Location not specified'
              });
            } else {
              console.log(`Event ${regData.eventId} not found`);
              // Still add a notification even if event details not found
              notificationsData.push({
                id: registration.id,
                eventId: regData.eventId,
                type: 'event',
                title: 'Event Registration',
                description: 'You registered for an event',
                time: regData.createdAt ? new Date(regData.createdAt.toDate()).toLocaleString() : 'Recently',
                read: regData.notificationRead || regData.read || false
              });
            }
          } catch (err) {
            console.error("Error fetching event data:", err);
          }
        }
        
        console.log("Final notifications data:", notificationsData);
        
        if (notificationsData.length === 0) {
          // If we couldn't get any real notifications, use mock data
          setNotifications(mockNotifications);
        } else {
          // Only use real notifications
          setNotifications(notificationsData);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications(mockNotifications);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // Refresh notifications when the component mounts
    const refreshInterval = setInterval(() => {
      fetchNotifications();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(refreshInterval);
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const markAsRead = async (id: string) => {
    // Update in UI first for quick feedback
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    
    // Also update in Firebase if it's an event registration notification
    try {
      const docRef = doc(db, "eventRegistrations", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log("Marking notification as read:", id);
        // Only update if it's an event registration document
        await updateDoc(docRef, {
          notificationRead: true,
          read: true // Add both field names to be safe
        });
        console.log("Successfully marked notification as read in Firestore");
      } else {
        console.log("Document doesn't exist:", id);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    // Update all notifications as read in UI
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    
    // Update Firebase records
    try {
      if (!auth.currentUser) return;
      
      const userId = auth.currentUser.uid;
      const registrationsQuery = query(
        collection(db, "eventRegistrations"),
        where("userId", "==", userId),
        where("notificationRead", "==", false)
      );
      
      const registrationsSnapshot = await getDocs(registrationsQuery);
      
      const updatePromises = registrationsSnapshot.docs.map(registration => 
        updateDoc(doc(db, "eventRegistrations", registration.id), {
          notificationRead: true,
          read: true,
          updatedAt: serverTimestamp()
        })
      );
      
      await Promise.all(updatePromises);
      console.log(`Marked ${registrationsSnapshot.size} notifications as read`);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  const getFilteredNotifications = () => {
    if (tabValue === 0) return notifications;
    return notifications.filter(notification => !notification.read);
  };

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'event':
        return <EventIcon color="primary" />;
      case 'reminder':
        return <AccessTime color="secondary" />;
      default:
        return <NotificationsIcon color="action" />;
    }
  };

  return (
    <MainLayout>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">Notifications</Typography>
          {notifications.length > 0 && (
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ cursor: 'pointer' }}
              onClick={markAllAsRead}
            >
              Mark all as read
            </Typography>
          )}
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="notification tabs">
            <Tab label="All" />
            <Tab 
              label={
                <Badge badgeContent={unreadCount} color="error">
                  <Typography>Unread</Typography>
                </Badge>
              } 
            />
          </Tabs>
        </Box>

        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Loading notifications...
              </Typography>
            </Box>
          ) : getFilteredNotifications().length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                No notifications to display
              </Typography>
            </Box>
          ) : (
            getFilteredNotifications().map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  alignItems="flex-start" 
                  onClick={() => markAsRead(notification.id)}
                  sx={{ 
                    bgcolor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.05)',
                    cursor: 'pointer',
                    flexDirection: 'column'
                  }}
                >
                  <Box sx={{ display: 'flex', width: '100%' }}>
                    <ListItemAvatar>
                      {notification.image ? (
                        <Avatar alt="Notification image" src={notification.image} />
                      ) : (
                        <Avatar>
                          {getNotificationIcon(notification.type)}
                        </Avatar>
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography 
                            variant="subtitle1"
                            fontWeight={notification.read ? 'normal' : 'bold'}
                          >
                            {notification.title}
                          </Typography>
                          {notification.read && <Done fontSize="small" color="success" />}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            sx={{ display: 'block' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {notification.description}
                          </Typography>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                          >
                            {notification.time}
                          </Typography>
                        </>
                      }
                    />
                  </Box>
                  
                  {/* Event details section */}
                  {notification.type === 'event' && notification.eventTitle && (
                    <Box 
                      sx={{ 
                        mt: 1, 
                        ml: 7, 
                        p: 1.5, 
                        backgroundColor: 'background.paper',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        width: 'calc(100% - 56px)'
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                        {notification.eventTitle}
                      </Typography>
                      
                      {notification.eventTime && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <AccessTime fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2">{notification.eventTime}</Typography>
                        </Box>
                      )}
                      
                      {notification.eventLocation && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2">{notification.eventLocation}</Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </ListItem>
                {index < getFilteredNotifications().length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            ))
          )}
        </List>
      </Box>
    </MainLayout>
  );
};

export default Notifications;