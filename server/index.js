const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve JSON data
app.get('/json', (req, res) => {
  res.json({ message: 'Hello from the server!' });
});

// Additional middleware to handle SPA (Single Page Application) routing;
// this redirects any non-API routes back to your React application's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
