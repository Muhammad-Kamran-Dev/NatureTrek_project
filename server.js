require('dotenv').config({ path: `${__dirname}/config.env` });
const app = require('./app');

const port = process.env.PORT;
// SERVER STARTED
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
