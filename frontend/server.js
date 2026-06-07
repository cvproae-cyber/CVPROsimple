const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Vertex AI Proxy Endpoint
app.post('/api-proxy', async (req, res) => {
  const { originalUrl, headers, method, body } = req.body;
  
  // Security check: verify the internal header from interceptor
  if (req.headers['x-app-proxy'] !== 'ga7BzVOhKQgwlfxUM51ZE_CdKBB2EBlS') {
    return res.status(403).send('Forbidden');
  }

  try {
    const response = await axios({
      url: originalUrl,
      method: method,
      headers: {
        ...headers,
        'Host': 'aiplatform.googleapis.com'
      },
      data: body,
      responseType: 'stream'
    });

    response.data.pipe(res);
  } catch (error) {
    console.error('Proxy Error:', error.message);
    res.status(error.response?.status || 500).send(error.response?.data || 'Proxy Error');
  }
});

// Handle React Routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Frontend server running on port ${port}`);
});