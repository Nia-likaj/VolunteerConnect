// client/src/components/layouts/MainLayout.tsx
import React, { useEffect, useState } from 'react';
import { Box, BottomNavigation, BottomNavigationAction, Paper, 
  Container, useMediaQuery, useTheme, Drawer, List,
  ListItem, ListItemIcon, ListItemText, ListItemButton, 
  Avatar, Typography, Divider, Skeleton } from '@mui/material';
import { 
  Home as HomeIcon, Notifications, LocationOn, 
  CalendarToday, Person, Logout as LogoutIcon 
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

interface MainLayoutProps {
  children: React.ReactNode;
}

interface FirebaseUser {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  uid: string;
}

interface UserData {
  name?: string;
  email?: string;
  avatar?: string;
  additionalInfo?: any;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If the user is not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Get current user from Firebase Auth
    const auth = getAuth();
    const firestore = getFirestore();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        const firebaseUser = user as FirebaseUser;
        
        try {
          // First get basic user data from auth
          let userData: UserData = {
            email: firebaseUser.email || undefined,
            name: firebaseUser.displayName || undefined,
            avatar: firebaseUser.photoURL || undefined
          };
          
          // Then try to get additional user data from Firestore if available
          try {
            const userDocRef = doc(firestore, "users", firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const firestoreData = userDoc.data();
              
              // Merge auth data with Firestore data (Firestore takes precedence)
              userData = {
                ...userData,
                name: firestoreData.name || userData.name,
                avatar: firestoreData.profileImage || userData.avatar,
                additionalInfo: firestoreData
              };
            }
          } catch (firestoreError) {
            console.error("Error fetching user data from Firestore:", firestoreError);
            // Continue with auth data if Firestore fails
          }
          
          setUserData(userData);
        } catch (error) {
          console.error("Error processing user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        // User is signed out
        setUserData(null);
        setLoading(false);
        navigate('/login');
      }
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, [isAuthenticated, navigate]);

  // If not authenticated or still loading, don't render anything
  if (!isAuthenticated || (loading && !userData)) return null;

  // Extract the current route for navigation highlighting
  const currentPath = location.pathname.split('/')[1] || 'home';

  const navItems = [
    { label: 'Home', icon: <HomeIcon />, path: '/home' },
    { label: 'Notifications', icon: <Notifications />, path: '/notifications' },
    { label: 'Map', icon: <LocationOn />, path: '/map' },
    { label: 'Calendar', icon: <CalendarToday />, path: '/calendar' },
    { label: 'Profile', icon: <Person />, path: '/profile' },
  ];

  // Get first name for greeting
  const firstName = userData?.name?.split(' ')[0] || 
                   userData?.email?.split('@')[0] || 
                   'User';

  // Add this function to handle logout
  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await auth.signOut();
      // No need to call navigate here since the onAuthStateChanged
      // listener will detect the logout and redirect automatically
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  return (
    <Box sx={{ pb: isMobile ? 7 : 0, display: 'flex' }}>
      {/* Sidebar for desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
              top: 'auto',
              display: 'flex',
              flexDirection: 'column', // Ensure flex direction is column
            },
          }}
        >
          {/* User profile section at the top */}
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mt: 2 
          }}>
            {loading ? (
              <Skeleton variant="circular" width={64} height={64} />
            ) : (
              <Avatar 
                alt={userData?.name || 'User'} 
                src={userData?.avatar || '/images/default-avatar.png'} 
                sx={{ 
                  width: 64, 
                  height: 64,
                  mb: 1
                }}
              />
            )}
            
            {loading ? (
              <Skeleton width={120} height={24} sx={{ mt: 1 }} />
            ) : (
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
                Hi, {firstName}
              </Typography>
            )}
            
            {loading ? (
              <Skeleton width={180} height={20} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                {userData?.email || 'user@example.com'}
              </Typography>
            )}
          </Box>
          
          <Divider sx={{ mt: 2, mb: 2 }} />
          
          {/* Navigation items - make this take up available space */}
          <Box sx={{ mt: 1, flexGrow: 1 }}>
            <List>
              {navItems.map((item) => (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    selected={`/${currentPath}` === item.path}
                    sx={{
                      '&.Mui-selected': {
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': {
                          color: 'primary.main',
                        }
                      }
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
          
          {/* Logout button at the bottom */}
          <Box sx={{ mt: 'auto', mb: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem disablePadding>
                <ListItemButton 
                  onClick={handleLogout}
                  sx={{
                    color: 'error.main',
                    '&:hover': {
                      bgcolor: 'error.light',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'error.main',
                    }
                  }}
                >
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>
      )}

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, width: '100%' }}>
        {children}
      </Box>

      {/* Bottom Navigation for mobile - keep as is */}
      {isMobile && (
        <Paper 
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}
          elevation={3}
        >
          <BottomNavigation
            value={currentPath}
            onChange={(_, newValue) => {
              navigate(`/${newValue}`);
            }}
            showLabels
          >
            <BottomNavigationAction label="Home" value="home" icon={<HomeIcon />} />
            <BottomNavigationAction label="Notifications" value="notifications" icon={<Notifications />} />
            <BottomNavigationAction label="Map" value="map" icon={<LocationOn />} />
            <BottomNavigationAction label="Calendar" value="calendar" icon={<CalendarToday />} />
            <BottomNavigationAction label="Profile" value="profile" icon={<Person />} />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};

export default MainLayout;