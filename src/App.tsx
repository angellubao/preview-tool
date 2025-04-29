import { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper,
  Grid as MuiGrid,
  Snackbar,
  Alert,
  Stack,
  IconButton,
  useTheme,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

interface Banner {
  url: string;
  width: number;
  height: number;
  title: string;
}

// Create a typed Grid component
const Grid = MuiGrid as typeof MuiGrid & {
  defaultProps: { component: string };
};

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const theme = useTheme();
  const [url, setUrl] = useState('');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('Preview');
  const iframeRefs = useRef<(HTMLIFrameElement | null)[]>([]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleAddBanner = () => {
    if (url.trim()) {
      const getTitleFromUrl = (url: string) => {
        const parts = url.trim().split('/');
        // Remove last part if it's a file
        if (parts[parts.length - 1].includes('.')) {
          parts.pop();
        }
        const folderName = parts[parts.length - 1] || 'BANNER';
        return folderName.replace(/_/g, ' ').toUpperCase();
      };
  
      setBanners([
        ...banners,
        {
          url: url.trim(),
          width: 0,
          height: 0,
          title: getTitleFromUrl(url),
        },
      ]);
  
      setUrl('');
    }
  };
  

  const generatePreviewHTML = () => {
    // Sort banners by height descending, then by title alphabetically
    banners.sort((a, b) => {
      const aDimensions = getDimensionsFromFilename(a.url) || {};
      const bDimensions = getDimensionsFromFilename(b.url) || {};

      const aHeight = a.height > 0 ? a.height : (aDimensions.height || 677);
      const bHeight = b.height > 0 ? b.height : (bDimensions.height || 677);

      if (bHeight !== aHeight) {
        return bHeight - aHeight; // First sort by height descending
      } else {
        return (a.title || '').localeCompare(b.title || ''); // Then sort by title alphabetically
      }
    });

    const bannerHTML = banners.map((banner) => {
      const filenameDimensions = getDimensionsFromFilename(banner.url);
      const width = banner.width > 0 ? banner.width : (filenameDimensions?.width || 340);
      const height = banner.height > 0 ? banner.height : (filenameDimensions?.height || 677);

      return `
        <div style="margin: 0 20px; ${width >= 728 ? 'width: 100%;' : ''}">
          <h3 style="margin: 0 0 5px 0; font-size: 16px;">${banner.title}</h3>
          <p style="text-align: left; color: #666666; font-size: 12px; margin: 0 0 5px 0;">
            Size: ${width === 340 && height === 677 ? 'Responsive' : `${width} × ${height}px`}
          </p>
          <div style="width: ${width}px; height: ${height}px; ${width >= 728 ? 'margin: 0;' : 'margin: 0 auto;'} overflow: hidden;">
            <iframe 
              src="${banner.url}" 
              style="width: 100%; height: 100%; border: none;"
              title="${banner.title}"
            ></iframe>
          </div>
        </div>
      `;
    }).join('');
  
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${previewTitle}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 1200px;
              margin: 0 auto;
              padding: 20px;
              transition: background-color 0.3s, color 0.3s;
              background-color: #ffffff;
              color: #000000;
              position: relative;
            }
            body.dark-mode {
              background-color: #2d2d2d;
              color: #e0e0e0;
            }
            h1 {
              text-align: center;
              margin-bottom: 50px;
              font-size: 24px;
              color: #00C784;
            }
            .banners-container {
              display: flex;
              flex-wrap: wrap;
              justify-content: flex-start;
              gap: 30px 0;
              padding: 0 20px;
            }
            .banners-container > div {
              flex: 0 0 auto;
            }
            .banners-container > div[style*="width: 100%"] {
              flex: 0 0 100%;
            }
            .theme-toggle, .trackings-button {
              position: fixed;
              top: 20px;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              border: 1px solid #ddd;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: background-color 0.3s;
              z-index: 999;
            }
            .theme-toggle {
              right: 20px;
              background: #fff;
            }
            .trackings-button {
              right: 70px;
              background: #fff;
            }
            .dark-mode .theme-toggle, .dark-mode .trackings-button {
              background: #2d2d2d;
              border-color: #404040;
              color: #e0e0e0;
            }
            .popup-content {
              display: none;
              position: fixed;
              top: 100px;
              left: 50%;
              background: white;
              // padding: 40px 20px 20px 20px;
              width: 400px;
              height: 300px;
              border-radius: 10px;
              overflow-y: auto;
              box-shadow: 0 5px 15px rgba(0,0,0,0.3);
              resize: both;
              overflow: auto;
              z-index: 1001;
              cursor: auto;
            }
            .popup-header {
              position: sticky;
              z-index: 1;
              top: 0;
              left: 0;
              right: 0;
              height: 40px;
              background: #f5f5f5;
              border-top-left-radius: 10px;
              border-top-right-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0 10px;
              cursor: move;
              user-select: none;
            }
            .popup-header h2 {
              margin: 0;
              font-size: 16px;
            }
            .popup-close {
              background: none;
              border: none;
              font-size: 18px;
              cursor: pointer;
              color: #333;
              transition: color 0.3s;
            }

            .dark-mode .popup-close {
              color: #fff;
            }
            .popup-content ul {
              padding: 10px;
              text-align: left;
              margin-top: 10px;
            }
            .popup-content ul li {
              margin-bottom: 10px;
              word-break: break-word;
              font-size: 12px;
              color: #333;
            }

            .tracking-list {
              flex: 1 1 auto;
              overflow-y: auto; /* scroll if needed */
              margin: 0;
              padding: 10px;
              list-style: none;
            }

            .popup-footer {
              padding: 10px;
              // background: #f9f9f9;
              // border-top: 1px solid #ccc;
              text-align: center;
            }

            .copy-btn {
              padding: 8px 16px;
              background: #00C784;
              color: #fff;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              transition: background 0.3s;
            }
            .copy-btn:active {
              background: #009e6b;
            }
            .dark-mode .popup-content {
              background: #333;
              color: #eee;
            }
            .dark-mode .popup-header {
              background: #444;
            }
            .dark-mode .popup-content ul li {
              color: #ccc;
            }
            .dark-mode .popup-content button.copy-btn {
              background: #00C784;
            }
            .dark-mode .popup-content button.copy-btn:active {
              background: #009e6b;
            }
            .clear-btn {
              padding: 8px 16px;
              background: #ccc;
              color: #333;
              border: none;
              border-radius: 5px;
              cursor: pointer;
            }
            .dark-mode .popup-content button.clear-btn {
              background: #ccc;
            }
            .tracking-item {
              display: flex;
              justify-content: space-between; /* Large space between spans */
              padding: 5px 12px;
              border-bottom: 1px solid #ddd;
            }

            .tracking-item .label {
              font-weight: bold;
            }

            .tracking-item .banner-name {
              color: #666;
              margin-left: 40px; /* optional if you want extra manual space too */
            }

          </style>
        </head>
        <body>
          <button class="theme-toggle" onclick="toggleTheme()">🌙</button>
          <button class="trackings-button" onclick="togglePopup()">📋</button>
          
          <h1>${previewTitle}</h1>
          <div class="banners-container">
            ${bannerHTML}
          </div>
  
          <!-- Popup -->
          <div id="popup" class="popup-content">
            <div id="popup-header" class="popup-header">
              <h2>Events</h2>
              <div class="popup-header-buttons">
                <button class="copy-btn" onclick="copyAll()">Copy</button>
                <button class="popup-close" onclick="togglePopup()">✖</button>
              </div>
            </div>
            <ul id="tracking-list"></ul>
            <footer class="popup-footer">
              <button class="clear-btn" onclick="clearList()">Clear 🧹</button>
            </footer>
          </div>

  
          <script>
            function toggleTheme() {
              document.body.classList.toggle('dark-mode');
              const isDarkMode = document.body.classList.contains('dark-mode');
              localStorage.setItem('darkMode', isDarkMode);
            }
  
            if (localStorage.getItem('darkMode') === 'true') {
              document.body.classList.add('dark-mode');
            } else {
              document.body.classList.remove('dark-mode');
            }
  
            // const banners = ${JSON.stringify(banners)};
  
            function togglePopup() {
              const popup = document.getElementById('popup');
              const list = document.getElementById('tracking-list');
              if (popup.style.display === 'none' || popup.style.display === '') {
                // list.innerHTML = '';
                popup.style.display = 'block';
              } else {
                popup.style.display = 'none';
              }
            }
            function clearList() {
              const list = document.getElementById('tracking-list');
              list.innerHTML = '';
            }
            function copyAll() {
              const listItems = document.querySelectorAll('#tracking-list li');
              // const text = Array.from(listItems).map(li => li.textContent).join('\\n');
              const text = Array.from(listItems).map(li => {
                const labelSpan = li.querySelector('.label');
                return labelSpan ? labelSpan.textContent : '';
              }).join('\\n');

              navigator.clipboard.writeText(text).then(() => {
                // alert('Copied!');
              }).catch((err) => {
                console.error('Failed to copy: ', err);
              });
            }
  
            dragElement(document.getElementById("popup"), document.getElementById("popup-header"));
  
            function dragElement(elmnt, dragHandle) {
              let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
              if (dragHandle) {
                dragHandle.onmousedown = dragMouseDown;
              } else {
                elmnt.onmousedown = dragMouseDown;
              }
  
              function dragMouseDown(e) {
                e = e || window.event;
                e.preventDefault();
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag;
              }
  
              function elementDrag(e) {
                e = e || window.event;
                e.preventDefault();
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
              }
  
              function closeDragElement() {
                document.onmouseup = null;
                document.onmousemove = null;
              }

              window.addEventListener('message', function(event) {
              if (event.data && event.data.type === 'trackEvent') {
                // console.log('Received from iframe:', event.data.reportLabel);

                const trackingList = document.getElementById('tracking-list');

                // Create a new list item
                const listItem = document.createElement('li');
                listItem.className = 'tracking-item'; // Add class for styling

                // Safely create span elements for reportLabel and bannerHTML
                const labelSpan = document.createElement('span');
                labelSpan.className = 'label';
                labelSpan.textContent = event.data.reportLabel; // Assigning report label to left side

                // Find the iframe that sent the message
                let matchingTitle = '';
                const iframes = document.querySelectorAll('iframe');
                iframes.forEach((iframe) => {
                  if (iframe.contentWindow === event.source) {
                    matchingTitle = iframe.getAttribute('title') || '';
                  }
                });

                const bannerSpan = document.createElement('span');
                bannerSpan.className = 'banner-name';
                bannerSpan.textContent = matchingTitle;

                // Append spans to the list item
                listItem.appendChild(labelSpan);
                listItem.appendChild(bannerSpan);

                // Append the new list item to the tracking list
                trackingList.appendChild(listItem);
              }
            });

            }
          </script>
        </body>
      </html>
    `;
  };
  


  const handleSave = () => {
    try {
      const htmlContent = generatePreviewHTML();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'banner-preview.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSaveSuccess(true);
    } catch (error) {
      console.error('Error saving preview:', error);
    }
  };

  const handleTitleChange = (index: number, newTitle: string) => {
    setBanners(prevBanners => {
      const newBanners = [...prevBanners];
      newBanners[index] = {
        ...newBanners[index],
        title: newTitle
      };
      return newBanners;
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddBanner();
    }
  };

  const getDimensionsFromMeta = (content: string): { width: number; height: number } | null => {
    const match = content.match(/width=(\d+),height=(\d+)/);
    if (match) {
      return {
        width: parseInt(match[1], 10),
        height: parseInt(match[2], 10)
      };
    }
    return null;
  };

  const getDimensionsFromFilename = (url: string): { width: number; height: number } | null => {
    const match = url.match(/(\d+)x(\d+)/);
    if (match) {
      return {
        width: parseInt(match[1], 10),
        height: parseInt(match[2], 10)
      };
    }
    return null;
  };

  const handleIframeLoad = (index: number) => {
    const iframe = iframeRefs.current[index];
    if (iframe) {
      try {
        // First try to get dimensions from filename
        let dimensions = getDimensionsFromFilename(banners[index].url);

        // If no dimensions found in filename, try to get from meta tags
        if (!dimensions) {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              const metaTags = iframeDoc.getElementsByTagName('meta');
              for (let i = 0; i < metaTags.length; i++) {
                const content = metaTags[i].getAttribute('content');
                if (content) {
                  dimensions = getDimensionsFromMeta(content);
                  if (dimensions) break;
                }
              }
            }
          } catch (error) {
            console.log('Cannot access iframe content due to cross-origin restrictions');
          }
        }

        // If still no dimensions found, use default size
        if (!dimensions) {
          dimensions = { width: 340, height: 677 };
        }

        setBanners(prevBanners => {
          const newBanners = [...prevBanners];
          newBanners[index] = {
            ...newBanners[index],
            width: dimensions!.width,
            height: dimensions!.height
          };
          return newBanners;
        });
      } catch (error) {
        console.error('Error setting banner dimensions:', error);
        // Set default size on error
        setBanners(prevBanners => {
          const newBanners = [...prevBanners];
          newBanners[index] = {
            ...newBanners[index],
            width: 340,
            height: 677
          };
          return newBanners;
        });
      }
    }
  };

  const handleDeleteBanner = (indexToDelete: number) => {
    setBanners(prevBanners => prevBanners.filter((_, index) => index !== indexToDelete));
  };

  const appTheme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      background: {
        default: darkMode ? '#2d2d2d' : '#ffffff',
        paper: darkMode ? '#2d2d2d' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#e0e0e0' : '#000000',
        secondary: darkMode ? '#b0b0b0' : '#666666',
      },
    },
  });

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" color=" #00C784">
            Banner Preview Tool
          </Typography>
          <Box>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={banners.length === 0}
              sx={{ ml: 2,
                backgroundColor: '#00C784',
                '&:hover': {
                  backgroundColor: '#00b374',
                },}}
            >
              Save
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Stack spacing={2}>
            <Box sx={{ width: '500px' }}>
              <TextField
                fullWidth
                label="Preview Page Title"
                variant="outlined"
                value={previewTitle}
                onChange={(e) => setPreviewTitle(e.target.value)}
                placeholder="Enter title for the preview page"
                onFocus={(e) => e.target.select()}
              />
            </Box>
            <Stack direction="row" spacing={2}>
              <Box sx={{ width: '500px' }}>
                <TextField
                  fullWidth
                  label="Enter Banner URL"
                  variant="outlined"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="https://example.com/banner_300x600.html"
                />
              </Box>
              <Box>
                <Button
                  variant="contained"
                  onClick={handleAddBanner}
                  sx={{ height: '56px', minWidth: '56px', 
                    backgroundColor: '#00C784',
                    '&:hover': {
                      backgroundColor: '#00b374',
                    },}}
                >
                  <AddIcon />
                </Button>
              </Box>
            </Stack>
          </Stack>
        </Box>

        <Snackbar
          open={saveSuccess}
          autoHideDuration={3000}
          onClose={() => setSaveSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setSaveSuccess(false)} severity="success" sx={{ width: '100%' }}>
            Banners saved successfully!
          </Alert>
        </Snackbar>

        <Grid container spacing={3}>
          {banners.map((banner, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper elevation={3} sx={{ p: 2, height: '100%', position: 'relative' }}>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteBanner(index)}
                  sx={{
                    position: 'absolute',
                    right: -15,
                    top: -15,
                    bgcolor: '#aaa',
                    boxShadow: 1,
                    '&:hover': {
                      bgcolor: '#00C784',
                      color: 'white'
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
                <TextField
                  fullWidth
                  variant="standard"
                  value={banner.title}
                  onChange={(e) => handleTitleChange(index, e.target.value)}
                  onFocus={(e) => e.target.select()}
                  sx={{ 
                    mb: 1,
                    '& .MuiInputBase-root': {
                      fontSize: '1rem',
                      fontWeight: '500'
                    }
                  }}
                />
                {(banner.width > 0 || getDimensionsFromFilename(banner.url)) && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    Size: {banner.width === 340 && banner.height === 677 ? 'Responsive' : `${banner.width} × ${banner.height}px`}
                  </Typography>
                )}
                <Box
                  sx={{
                    width: `${banner.width}px`,
                    height: `${banner.height}px`,
                    position: 'relative',
                    overflow: 'visible',
                    borderRadius: 1,
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mt: 2
                  }}
                >
                  <Box
                    component="iframe"
                    ref={(el: HTMLIFrameElement | null) => {
                      iframeRefs.current[index] = el;
                    }}
                    src={banner.url}
                    onLoad={() => handleIframeLoad(index)}
                    sx={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      display: 'block',
                    }}
                    title={banner.title}
                  />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
