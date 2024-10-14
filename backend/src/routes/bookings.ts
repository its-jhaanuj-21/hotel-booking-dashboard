// backend/src/routes/bookings.ts
import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

interface Booking {
  arrival_date_year: number;
  arrival_date_month: string;
  arrival_date_day_of_month: number;
  adults: number;
  children: number;
  babies: number;
  country: string;
}

const router = Router();

let bookings: Booking[] = [];

// Function to load CSV data
const loadCSV = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const csvFilePath = path.join(__dirname, '../data/hotel_bookings_1000.csv');

    fs.access(csvFilePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('CSV file not found:', csvFilePath);
        return reject(new Error('CSV file not found'));
      }

      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
          // Parse and push booking data
          const booking: Booking = {
            arrival_date_year: parseInt(data.arrival_date_year, 10),
            arrival_date_month: data.arrival_date_month,
            arrival_date_day_of_month: parseInt(data.arrival_date_day_of_month, 10),
            adults: parseInt(data.adults, 10),
            children: parseInt(data.children, 10),
            babies: parseInt(data.babies, 10),
            country: data.country,
          };
          bookings.push(booking);
        })
        .on('end', () => {
          console.log('CSV file successfully processed');
          resolve();
        })
        .on('error', (error) => {
          console.error('Error processing CSV file:', error);
          reject(error);
        });
    });
  });
};

// Helper to convert month name to number
const monthToNumber = (month: string): number => {
  const date = new Date(`${month} 1, 2020`); // Year doesn't matter
  return date.getMonth() + 1;
};

// GET /api/bookings?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/', (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  // Validate query parameters
  if (
    typeof startDate !== 'string' ||
    typeof endDate !== 'string' ||
    !startDate ||
    !endDate
  ) {
    return res.status(400).json({
      message: 'startDate and endDate are required and must be in YYYY-MM-DD format',
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check for invalid dates
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ message: 'Invalid date format' });
  }

  // Filter bookings within date range
  const filtered = bookings.filter((booking) => {
    const monthNumber = monthToNumber(booking.arrival_date_month);
    const bookingDate = new Date(
      booking.arrival_date_year,
      monthNumber - 1,
      booking.arrival_date_day_of_month
    );
    return bookingDate >= start && bookingDate <= end;
  });

  res.json(filtered);
});

export { router as bookingsRouter, loadCSV };
