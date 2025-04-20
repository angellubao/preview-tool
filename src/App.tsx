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
import { SelectChangeEvent } from '@mui/material';

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
  const [previewTitle, setPreviewTitle] = useState('Banner Preview');
  const iframeRefs = useRef<(HTMLIFrameElement | null)[]>([]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleAddBanner = () => {
    if (url.trim()) {
      setBanners([...banners, { url: url.trim(), width: 0, height: 0, title: `Banner ${banners.length + 1}` }]);
      setUrl('');
    }
  };

  const generatePreviewHTML = () => {
    const bannerHTML = banners.map((banner) => {
      const filenameDimensions = getDimensionsFromFilename(banner.url);
      const width = banner.width > 0 ? banner.width : (filenameDimensions?.width || 340);
      const height = banner.height > 0 ? banner.height : (filenameDimensions?.height || 677);

      return `
        <div style="margin: 0 20px; ${width >= 728 ? 'width: 100%;' : ''}">
          <h3 style="margin: 0 0 5px 0; font-size: 16px;">${banner.title}</h3>
          <p style="text-align: left; color: #666666; font-size: 12px; margin: 0 0 5px 0;">Size: ${width === 340 && height === 677 ? 'Responsive' : `${width} × ${height}px`}</p>
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
            }
            body.dark-mode {
              background-color: #2d2d2d;
              color: #e0e0e0;
            }
            h1 {
              text-align: center;
              margin-bottom: 50px;
              font-size: 24px;
            }
            h3 {
              font-weight: 500;
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
            .banners-container > div[style*="width: 100%"] > div {
              margin-left: 0 !important;
            }
            .dark-mode .banner-title {
              color: #e0e0e0;
            }
            .dark-mode .banner-size {
              color: #b0b0b0;
            }
            .dark-mode .banner-container {
              border-color: #404040;
            }
            .theme-toggle {
              position: fixed;
              top: 20px;
              right: 20px;
              background: #fff;
              border: 1px solid #ddd;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: background-color 0.3s;
            }
            .dark-mode .theme-toggle {
              background: #2d2d2d;
              border-color: #404040;
              color: #e0e0e0;
            }
            @media (max-width: 768px) {
              .banners-container {
                flex-direction: column;
                align-items: center;
                gap: 30px 0;
              }
              .banners-container > div {
                width: 100%;
              }
              .theme-toggle {
                top: 10px;
                right: 10px;
              }
            }
          </style>
        </head>
        <body>
          <button class="theme-toggle" onclick="toggleTheme()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </button>
          <h1>${previewTitle}</h1>
          <div class="banners-container">
            ${bannerHTML}
          </div>
          <script>
            function toggleTheme() {
              document.body.classList.toggle('dark-mode');
              const isDarkMode = document.body.classList.contains('dark-mode');
              localStorage.setItem('darkMode', isDarkMode);
            }
            
            // Check for saved theme preference, default to light mode
            if (localStorage.getItem('darkMode') === 'true') {
              document.body.classList.add('dark-mode');
            } else {
              document.body.classList.remove('dark-mode');
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
          <Typography variant="h4" component="h1">
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
              sx={{ ml: 2 }}
            >
              Save
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Stack spacing={2}>
            <Box sx={{ width: '300px' }}>
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
              <Box sx={{ width: '300px' }}>
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
                  sx={{ height: '56px', minWidth: '56px' }}
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

        <Grid container spacing={2}>
          {banners.map((banner, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper elevation={3} sx={{ p: 2, height: '100%', position: 'relative' }}>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteBanner(index)}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    '&:hover': {
                      bgcolor: 'error.light',
                      color: 'white'
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
                <TextField
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
