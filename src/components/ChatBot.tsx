import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  Paper, 
  Avatar,
  InputAdornment,
  Fab,
  Slide,
  CircularProgress
} from '@mui/material';
import { 
  Send as SendIcon, 
  Close as CloseIcon,
  Chat as ChatIcon,
  SmartToy as BotIcon
} from '@mui/icons-material';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: '1',
    text: 'Hi there! I\'m the VolunteerConnect assistant. How can I help you today?',
    sender: 'bot',
    timestamp: new Date()
  }
];

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Detect language (simple detection for Albanian specific characters)
    const isAlbanian = /[ëçÇË]/i.test(input) || 
                       /\b(si|une|ju|faleminderit|pershendetje|mire|diten|naten)\b/i.test(input);
    
    // Simulate AI response
    setTimeout(() => {
      let botResponse = "I'm not sure how to answer that. Could you please rephrase your question?";
      const userQuery = input.toLowerCase();
      
      // Albanian responses
      if (isAlbanian) {
        botResponse = "Më vjen keq, nuk e kuptoj pyetjen tuaj. A mund ta riformuloni?";
        
        // Greetings in Albanian
        if (userQuery.includes('pershendetje') || userQuery.includes('tungjatjeta') || 
            userQuery.includes('ckemi') || userQuery.includes('çkemi') || userQuery.includes('mire')) {
          botResponse = "Përshëndetje! Unë jam asistenti i VolunteerConnect. Si mund t'ju ndihmoj sot?";
        } 
        // NEW: Simple future events query - detect direct requests for events
        else if ((userQuery.includes('me jep') || userQuery.includes('më jep') || userQuery.includes('më trego') || 
                  userQuery.includes('na jep') || userQuery.includes('na trego') || userQuery.includes('cilat') || 
                  userQuery.includes('cilët') || userQuery.includes('cfare') || userQuery.includes('çfarë')) && 
                 (userQuery.includes('event') || userQuery.includes('ngjar') || userQuery.includes('aktivitet'))) {
        
          // Check if asking about future events
          if (userQuery.includes('ardhsh') || userQuery.includes('ardhmë') || userQuery.includes('tjera') || 
              userQuery.includes('do') || userQuery.includes('të tjera') || userQuery.includes('të reja')) {
            botResponse = "Eventet e ardhshme përfshijnë: 'Tirana Beach Cleanup' në plazhin e Durrësit më datë 12, 'Albanian Heritage Festival' në Sheshin Skënderbej më datë 20, 'Prishtina Youth Summit' në Bibliotekën Kombëtare të Prishtinës më datë 19, dhe 'Skopje City Volunteering' në qendër të Shkupit më datë 11. Për të parë më shumë detaje, ju lutem kontrolloni seksionin 'Upcoming' në faqen kryesore.";
          }
          // General events query
          else {
            botResponse = "Aktualisht kemi evente në të gjithë rajonin e Ballkanit. Në Shqipëri: 'Tirana Beach Cleanup' dhe 'Albanian Heritage Festival', në Kosovë: 'Prishtina Youth Summit', në Maqedoninë e Veriut: 'Skopje City Volunteering', dhe shumë të tjera. Për të parë të gjitha eventet, përdorni menunë 'Current Location' në krye të faqes.";
          }
        }
        
        // IMPROVED: More flexible detection for upcoming events
        else if (userQuery.includes('te ardhsh') || userQuery.includes('të ardhsh') || 
                 userQuery.includes('ardhme') || userQuery.includes('ardhshm') || // Catch more variations
                 userQuery.includes('do te') || userQuery.includes('do të') || 
                 userQuery.includes('vijen') || userQuery.includes('vijmë') || 
                 userQuery.includes('sot') || userQuery.includes('neser') || userQuery.includes('nesër') ||
                 userQuery.includes('jave') || userQuery.includes('javë') || 
                 userQuery.includes('muaj')) {
        
        botResponse = "Për të parë eventet e ardhshme, kemi: 'Tirana Beach Cleanup' në plazhin e Durrësit më datë 12, 'Albanian Heritage Festival' në Sheshin Skënderbej më datë 20, 'Prishtina Youth Summit' në Bibliotekën Kombëtare të Prishtinës më datë 19, dhe 'Belgrade River Cleanup' në lumin Sava më datë 09. Përdorni seksionin 'Upcoming' në faqen kryesore për më shumë informacion.";
      }
      
      // IMPROVED: Broader detection for questions about events in Albania or other countries
      else if (
        // Country detection - more flexibility in how countries are mentioned
        (userQuery.includes('shqip') || userQuery.includes('tirane') || userQuery.includes('tiranë') || 
         userQuery.includes('durres') || userQuery.includes('durrës') || userQuery.includes('vlore') || 
         userQuery.includes('vlorë') || userQuery.includes('shkoder') || userQuery.includes('shkodër') ||
         userQuery.includes('kosov') || userQuery.includes('prishtin') || 
         userQuery.includes('maqedon') || userQuery.includes('greqi') || 
         userQuery.includes('mali zi') || userQuery.includes('ballkan') ||
         userQuery.includes('serbi') || userQuery.includes('slloveni') || 
         userQuery.includes('kroaci') || userQuery.includes('bosnje') || userQuery.includes('bullgari')) &&
        
        // Event-related terms - broader vocabulary capture
        (userQuery.includes('event') || userQuery.includes('ngjar') || userQuery.includes('aktivitet') || 
         userQuery.includes('kam') || userQuery.includes('ka') || userQuery.includes('veprimtari') || 
         userQuery.includes('ndodh') || userQuery.includes('çfarë') || userQuery.includes('cfare') ||
         userQuery.includes('mundësi') || userQuery.includes('mundesi') || userQuery.includes('ku') ||
         userQuery.includes('vullnet') || userQuery.includes('me jep') || userQuery.includes('na jep') ||
         userQuery.includes('me treg') || userQuery.includes('më treg') || userQuery.includes('shfaq'))
      ) {
        // Check specific country mentions to provide country-specific responses
        if (userQuery.includes('shqip')) {
          botResponse = "Në Shqipëri kemi disa evente aktive në këtë moment: 'Tirana Beach Cleanup' në plazhin e Durrësit dhe 'Albanian Heritage Festival' në Sheshin Skënderbej në Tiranë. Për të parë më shumë detaje dhe datat e sakta, ju lutem zgjidhni 'Albania' nga menu e vendndodhjes në krye të faqes.";
        } 
        else if (userQuery.includes('kosov')) {
          botResponse = "Në Kosovë kemi eventin 'Prishtina Youth Summit' që do të mbahet në Bibliotekën Kombëtare të Prishtinës. Për të parë më shumë detaje dhe datat e sakta, ju lutem zgjidhni 'Kosovo' nga menu e vendndodhjes në krye të faqes.";
        }
        else if (userQuery.includes('maqedon')) {
          botResponse = "Në Maqedoninë e Veriut kemi eventin 'Skopje City Volunteering' në qendër të qytetit të Shkupit. Për të parë më shumë detaje dhe datat e sakta, ju lutem zgjidhni 'North Macedonia' nga menu e vendndodhjes në krye të faqes.";
        }
        else if (userQuery.includes('ballkan')) {
          botResponse = "Ne kemi shumë evente në të gjithë rajonin e Ballkanit! Mund të zgjidhni një vend specifik nga menu e vendndodhjes në krye të faqes kryesore. Kemi evente në Shqipëri, Kosovë, Maqedoninë e Veriut, Serbi, Mali i Zi, Greqi, Bullgari, dhe vende të tjera. Çdo vend ka evente unike që reflektojnë nevojat dhe kulturën lokale.";
        }
        else {
          botResponse = "Për të gjetur evente në atë zonë, ju lutem përdorni menunë 'Current Location' në krye të faqes. Kemi evente në të gjitha vendet e Ballkanit, duke përfshirë pastrimin e plazheve, festivale kulturore, nisma mjedisore dhe shumë mundësi të tjera vullnetarizmi.";
        }
      } 
      // Events nearby in Albanian - keep existing but enhance
      else if ((userQuery.includes('event') || userQuery.includes('ngjarj') || userQuery.includes('aktiv')) && 
               (userQuery.includes('afer') || userQuery.includes('afër') || userQuery.includes('pran') || 
                userQuery.includes('rreth'))) {
        botResponse = "Për të gjetur ngjarje pranë jush, ju lutem kontrolloni menunë 'Current Location' në krye të faqes kryesore. Mund të zgjidhni vendin tuaj dhe të shihni të gjitha ngjarjet që ndodhin atje, të renditura sipas afërsisë.";
      } 
      // Enhanced skill matching for volunteer questions
      else if (
        // Detect questions about needed skills/experience
        ((userQuery.includes('aftësi') || userQuery.includes('aftesi') || 
          userQuery.includes('eksperienc') || userQuery.includes('duhet') || userQuery.includes('nevojit')) &&
         (userQuery.includes('vullnetar') || userQuery.includes('event') || userQuery.includes('ngjarj')))
      ) {
        botResponse = "Shumica e eventeve tona mirëpresin vullnetarë të të gjitha niveleve të aftësive! Çdo listë eventi specifikon aftësitë ose kualifikimet e kërkuara. Kemi shumë mundësi që nuk kërkojnë përvojë të mëparshme—vetëm entuziazëm dhe gatishmëri për të ndihmuar. Ju mund të filtroni eventet sipas nivelit të aftësisë në opsionet e kërkimit.";
      } 
      // Enhanced event type detection
      else if (
        // Detect questions about environmental events
        ((userQuery.includes('mjedis') || userQuery.includes('pastrim') || userQuery.includes('plazh') ||
          userQuery.includes('natyr') || userQuery.includes('gjelbër') || userQuery.includes('gjelber')) &&
         (userQuery.includes('event') || userQuery.includes('ngjarj') || userQuery.includes('vullnetar') ||
          userQuery.includes('kam') || userQuery.includes('ka') || userQuery.includes('ku')))
      ) {
        botResponse = "Kemi shumë evente mjedisore! Nga pastrimi i plazheve tek ruajtja e pyjeve, mund t'i gjeni këto duke përdorur funksionin e kërkimit ose duke zgjedhur 'Mjedis/Environment' në filtrin e kategorive në faqen kryesore. Në Shqipëri, kemi eventin 'Tirana Beach Cleanup' që do të mbahet së shpejti.";
      }
      else if (
        // Detect questions about community events
        ((userQuery.includes('komunitet') || userQuery.includes('lokal') || userQuery.includes('lagj') ||
          userQuery.includes('fshat') || userQuery.includes('qytet')) &&
         (userQuery.includes('event') || userQuery.includes('ngjarj') || userQuery.includes('vullnetar') ||
          userQuery.includes('kam') || userQuery.includes('ka') || userQuery.includes('ku')))
      ) {
        botResponse = "Eventet komunitare janë shumë të popullarizuara në platformën tonë! Këto përfshijnë përmirësime në lagje, festivale lokale, kopshte komunitare dhe mbështetje për organizata lokale. Përdorni filtrin 'Komunitet/Community' për të gjetur këto evente në zonën tuaj.";
      } 
      // How to volunteer in Albanian
      else if ((userQuery.includes('vullnetar') || userQuery.includes('si')) && 
               (userQuery.includes('behem') || userQuery.includes('bëhem'))) {
        botResponse = "Për t'u bërë vullnetar në një event, hapni detajet e eventit dhe klikoni butonin 'Register'. Do të merrni konfirmim dhe udhëzime të mëtejshme me email.";
      }
      // Register/signup in Albanian
      else if (userQuery.includes('regjistro') || userQuery.includes('rregjistro') || 
               userQuery.includes('llogari') || userQuery.includes('anetare')) {
        botResponse = "Për t'u regjistruar si vullnetar, shkoni te faqja e regjistrimit dhe krijoni një llogari. Pasi të regjistroheni, mund të shfletoni eventet dhe të regjistroheni për ato që ju interesojnë.";
      }
      // Benefits in Albanian
      else if (userQuery.includes('perfit') || userQuery.includes('përfit') || 
               userQuery.includes('avantazh') || userQuery.includes('pse')) {
        botResponse = "Vullnetarizmi ka shumë përfitime! Ju lejon të ndihmoni komunitetin tuaj, të ndërtoni aftësi të reja, të takoni njerëz me të njëjtat interesa dhe të fitoni përvojë të vlefshme. Platforma jonë e bën të lehtë gjetjen e mundësive që përshtaten me interesat tuaja.";
      }
      // More inclusive queries about upcoming events
      else if ((userQuery.includes('te ardhsh') || userQuery.includes('të ardhsh') || 
                userQuery.includes('ardhshme') || userQuery.includes('do te') || userQuery.includes('do të') || 
                userQuery.includes('sot') || userQuery.includes('neser') || userQuery.includes('nesër') ||
                userQuery.includes('jave') || userQuery.includes('javë')) && 
               (userQuery.includes('event') || userQuery.includes('ngjarj') || 
                userQuery.includes('aktivitet') || userQuery.includes('kam') || userQuery.includes('ka'))) {
        botResponse = "Për të parë eventet e ardhshme, ju lutem kontrolloni seksionin 'Upcoming' në faqen kryesore. Nëse dëshironi të shihni eventet për një zonë të caktuar, mund të përdorni menunë 'Current Location' për të filtruar sipas vendndodhjes. Në ditët në vijim, kemi disa evente interesante në rajonin e Ballkanit.";
      }
      
      // Keep all other existing Albanian response conditions
      // ... [rest of the conditions]
    }
    // English responses (existing code)
    else {
      if (userQuery.includes('event') && userQuery.includes('near')) {
        botResponse = "To find events near you, please check the 'Current Location' dropdown at the top of the Home page. You can select your country and see all events happening there.";
      } 
      else if (userQuery.includes('volunteer') && userQuery.includes('how')) {
        botResponse = "To volunteer for an event, open the event details and click on the 'Register' button. You'll receive confirmation and further instructions by email.";
      }
      else if (userQuery.includes('join') || userQuery.includes('sign up') || userQuery.includes('register')) {
        botResponse = "To sign up as a volunteer, go to the signup page and create an account. Once you're registered, you can browse events and register for those that interest you.";
      }
      else if (userQuery.includes('benefits') || userQuery.includes('why volunteer')) {
        botResponse = "Volunteering has many benefits! It lets you help your community, build new skills, meet like-minded people, and gain valuable experience. Our platform makes it easy to find opportunities that match your interests.";
      }
      else if (userQuery.includes('cancel') || userQuery.includes('unregister')) {
        botResponse = "To cancel your participation in an event, go to your Profile page, find the event under 'My Events', and click the 'Cancel Registration' button.";
      }
      else if (userQuery.includes('contact') || userQuery.includes('help')) {
        botResponse = "For additional help, please contact our support team at support@volunteerconnect.com or visit the Help Center in the app menu.";
      }
      else if (userQuery.includes('create') && userQuery.includes('event')) {
        botResponse = "To create a new event, you must have an organizer account. Go to your Profile page, select 'Become an Organizer', and then you'll be able to create and manage events.";
      }
      else if (userQuery.includes('hello') || userQuery.includes('hi') || userQuery === 'hey') {
        botResponse = "Hello! I'm the VolunteerConnect assistant. How can I help you today?";
      }
      // Add your other existing English responses here
    }

    const botMessage: Message = {
      id: Date.now().toString(),
      text: botResponse,
      sender: 'bot',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  }, 1000); // Simulate processing delay
};
  
// Format timestamp
const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
  
return (
  <>
    {/* Chat button */}
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      <Fab 
        color="primary" 
        onClick={toggleChat}
        aria-label="chat"
      >
        <ChatIcon />
      </Fab>
    </Box>
    
    {/* Chat window */}
    <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
      <Paper 
        elevation={5} 
        sx={{ 
          position: 'fixed', 
          bottom: 80, 
          right: 20, 
          width: { xs: '90%', sm: 350 },
          height: 450,
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000
        }}
      >
        {/* Chat header */}
        <Box 
          sx={{ 
            p: 2, 
            bgcolor: 'primary.main', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.dark', mr: 1 }}>
              <BotIcon />
            </Avatar>
            <Typography variant="h6">VolunteerConnect AI</Typography>
          </Box>
          <IconButton 
            size="small" 
            onClick={toggleChat} 
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        
        {/* Chat messages */}
        <Box 
          sx={{ 
            p: 2, 
            flexGrow: 1, 
            overflowY: 'auto',
            bgcolor: '#f5f5f5'
          }}
        >
          {messages.map(message => (
            <Box 
              key={message.id} 
              sx={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 2
              }}
            >
              {message.sender === 'bot' && (
                <Avatar 
                  sx={{ 
                    mr: 1, 
                    bgcolor: 'primary.main',
                    width: 32,
                    height: 32,
                    alignSelf: 'flex-end'
                  }}
                >
                  <BotIcon fontSize="small" />
                </Avatar>
              )}
              
              <Box
                sx={{
                  maxWidth: '70%',
                  p: 1.5,
                  bgcolor: message.sender === 'user' ? 'primary.main' : 'white',
                  color: message.sender === 'user' ? 'white' : 'text.primary',
                  borderRadius: 2,
                  boxShadow: 1
                }}
              >
                <Typography variant="body2">{message.text}</Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block',
                      textAlign: message.sender === 'user' ? 'right' : 'left',
                      color: message.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                      mt: 0.5
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </Typography>
                </Box>
              </Box>
            ))}
            {isTyping && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, mt: 1 }}>
                <Avatar 
                  sx={{ 
                    mr: 1, 
                    bgcolor: 'primary.main',
                    width: 32,
                    height: 32
                  }}
                >
                  <BotIcon fontSize="small" />
                </Avatar>
                <Box 
                  sx={{ 
                    p: 1.5,
                    bgcolor: 'white',
                    borderRadius: 2,
                    boxShadow: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <CircularProgress size={12} sx={{ mr: 1 }} />
                  <Typography variant="body2">Typing...</Typography>
                </Box>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
          
          {/* Chat input */}
          <Box 
            component="form"
            onSubmit={handleSubmit}
            sx={{ 
              p: 2,
              borderTop: 1,
              borderColor: 'divider'
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ask about events or help..."
              value={input}
              onChange={handleInputChange}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      type="submit" 
                      color="primary"
                      disabled={!input.trim() || isTyping}
                    >
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </Paper>
      </Slide>
    </>
  );
};

export default ChatBot;