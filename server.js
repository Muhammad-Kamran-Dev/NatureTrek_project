const app = require('./app');

const port = 5000;

// SERVER STARTED
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
