// backend/src/server.ts
import app from './app';
import { loadCSV } from './routes/bookings';

const PORT = process.env.PORT || 5000;

// Load CSV data before starting the server
loadCSV()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to load CSV data:', error);
    process.exit(1); // Exit the process with failure
  });
