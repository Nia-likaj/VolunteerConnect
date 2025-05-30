// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  TextField,
  Typography,
  Paper,
  useTheme,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import {
  Language as LanguageIcon,
  Lock as LockIcon,
  DarkMode as DarkModeIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import MainLayout from '../components/layouts/MainLayout';
import { getAuth, onAuthStateChanged, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getFirestore } from 'firebase/firestore';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  
  // User profile data
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    avatar: '',
    uid: ''
  });
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  
  // Form states
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Fetch user data from Firebase when component mounts
  useEffect(() => {
    const auth = getAuth();
    const firestore = getFirestore();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        try {
          console.log("Current user:", user); // For debugging
          
          // First set basic user data from auth
          let userDataFromAuth = {
            name: user.displayName || 'User',
            email: user.email || '',
            avatar: user.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg',
            uid: user.uid
          };
          
          // Get additional user data from Firestore
          try {
            const userDocRef = doc(firestore, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const firestoreData = userDoc.data();
              console.log("Firestore data:", firestoreData); // For debugging
              
              // Use the same field names as in MainLayout
              userDataFromAuth = {
                ...userDataFromAuth,
                name: firestoreData.name || userDataFromAuth.name,
                avatar: firestoreData.profileImage || userDataFromAuth.avatar
              };
            }
          } catch (firestoreError) {
            console.error("Error fetching Firestore data:", firestoreError);
          }
          
          setUserData(userDataFromAuth);
          setEditedName(userDataFromAuth.name);
          setEditedEmail(userDataFromAuth.email);
          
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        // User is signed out, redirect to login
        navigate('/login');
      }
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

  // Password dialog handlers
  const handleOpenPasswordDialog = () => {
    setPasswordDialogOpen(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
  };

  const handleChangePassword = async () => {
    // Basic validation
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    
    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user && user.email) {
        // Re-authenticate user before changing password
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        
        // Close dialog and show success message
        setPasswordDialogOpen(false);
        alert("Password updated successfully");
      }
    } catch (error: any) {
      console.error("Error updating password:", error);
      
      if (error.code === 'auth/wrong-password') {
        setPasswordError("Current password is incorrect");
      } else {
        setPasswordError("Failed to update password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Help dialog handler
  const handleOpenHelpDialog = () => {
    setHelpDialogOpen(true);
  };

  const handleCloseHelpDialog = () => {
    setHelpDialogOpen(false);
  };

  // Existing handlers
  const handleOpenEditDialog = () => {
    setEditedName(userData.name);
    setEditedEmail(userData.email);
    setEditDialogOpen(true);
  };
  
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };
  
  const handleSaveChanges = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const firestore = getFirestore();
      
      if (user) {
        setLoading(true);
        
        // Update profile in Firebase Authentication
        await updateProfile(user, {
          displayName: editedName
        });
        
        // Update profile in Firestore using the correct field name (name)
        const userDocRef = doc(firestore, "users", userData.uid);
        await updateDoc(userDocRef, {
          name: editedName // Use 'name' instead of 'displayName'
        });
        
        // Update local state
        setUserData({
          ...userData,
          name: editedName
        });
        
        setEditDialogOpen(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ py: 4, px: 2, textAlign: 'center' }}>
        <Avatar
          src={userData.avatar}
          sx={{ width: 100, height: 100, margin: '0 auto' }}
        />
        {/* Display the name with a clear fallback */}
        <Typography variant="h6" sx={{ mt: 2 }}>
          {userData.name || 'User'}
        </Typography>
        <Typography color="textSecondary">
          {userData.email || 'No email available'}
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<EditIcon />}
          sx={{ mt: 2, mb: 3 }}
          onClick={handleOpenEditDialog}
        >
          Edit
        </Button>

        <List sx={{ width: '100%', maxWidth: 360, mx: 'auto' }}>
          <Paper sx={{ mb: 1, bgcolor: '#f5f5f5', borderRadius: '8px' }}>
            <ListItem component="button" onClick={handleOpenPasswordDialog}>
              <ListItemIcon><LockIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Change Password" />
            </ListItem>
          </Paper>

          <Paper sx={{ mb: 1, bgcolor: '#f5f5f5', borderRadius: '8px' }}>
            <ListItem component="button" onClick={handleOpenHelpDialog}>
              <ListItemIcon><HelpIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Help" />
            </ListItem>
          </Paper>

          <Paper sx={{ mb: 1, bgcolor: '#f5f5f5', borderRadius: '8px' }}>
            <ListItem component="button" onClick={handleLogout}>
              <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
              <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
            </ListItem>
          </Paper>
        </List>
        
        {/* Edit Profile Dialog */}
        <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              type="text"
              fullWidth
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              value={editedEmail}
              onChange={(e) => setEditedEmail(e.target.value)}
              disabled
              helperText="Email cannot be changed without verification"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>Cancel</Button>
            <Button onClick={handleSaveChanges} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog open={passwordDialogOpen} onClose={handleClosePasswordDialog}>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Current Password"
              type="password"
              fullWidth
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="New Password"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Confirm New Password"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePasswordDialog}>Cancel</Button>
            <Button 
              onClick={handleChangePassword} 
              variant="contained" 
              color="primary"
              disabled={!currentPassword || !newPassword || !confirmPassword}
            >
              Update Password
            </Button>
          </DialogActions>
        </Dialog>

        {/* Help Dialog */}
        <Dialog open={helpDialogOpen} onClose={handleCloseHelpDialog} maxWidth="md">
          <DialogTitle>Help & Support</DialogTitle>
          <DialogContent>
            <Typography variant="h6" gutterBottom>Frequently Asked Questions</Typography>
            
            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
              How do I join an event?
            </Typography>
            <Typography variant="body1" paragraph>
              To join an event, navigate to the Map or Calendar page, find an event that interests you,
              and click on it. Then press the "Join" button on the event details page.
            </Typography>
            
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              How do I create my own volunteering event?
            </Typography>
            <Typography variant="body1" paragraph>
              Currently, only verified organizations can create events. If you represent an organization,
              please contact us to verify your account.
            </Typography>
            
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              How can I get help with a technical issue?
            </Typography>
            <Typography variant="body1" paragraph>
              For technical support, please email us at support@volunteerapp.com with details of your issue.
            </Typography>
            
            <Typography variant="h6" sx={{ mt: 3 }}>Contact Us</Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              Email: support@volunteerapp.com<br />
              Phone: +355 69 123 4567<br />
              Hours: Monday-Friday, 9:00-17:00
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseHelpDialog} variant="contained" color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default Profile;
