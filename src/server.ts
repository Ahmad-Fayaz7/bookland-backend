import app from './app.js';
import 'dotenv/config';

// eslint-disable-next-line no-undef
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Server is running on port: ' + port);
});
