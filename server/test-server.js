const express = require('express');
const app = express();

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

const port = 4001;
app.listen(port, () => {
  console.log(`Test server listening on port ${port}`);
});
