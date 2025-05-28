# Lead Scraper

A web application that helps find cafes, schools, and restaurants in Surat, Vadodara, and Ahmedabad using SerpAPI (Google Search API).

## Features

- Search for businesses by city, category, and area
- Real-time data fetching using SerpAPI's Google Maps integration
- Rich business information including ratings, reviews, and hours
- Business thumbnails and images
- No database required - all data is fetched dynamically
- Responsive design that works on all devices

## Setup

1. Clone this repository
2. Install Node.js if you haven't already (https://nodejs.org/)
3. Install the required dependencies:
   ```bash
   npm install
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
5. Open `index.html` in your web browser

## Usage

1. Select a city from the dropdown (Surat, Vadodara, or Ahmedabad)
2. Choose a category (Cafe, School, or Restaurant)
3. Enter the area name (e.g., "Katargam" for Surat)
4. Click the Search button
5. View the results below, including:
   - Business name and address
   - Contact information
   - Ratings and reviews
   - Business hours
   - Thumbnail images

## Technical Details

The application uses:

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js with Express
- API: SerpAPI (Google Maps integration)
  - Provides comprehensive local business data
  - Includes ratings, reviews, and business hours
  - Offers business images and thumbnails

## Note

The application uses SerpAPI's free tier which includes:

- 100 searches per month
- Access to Google Maps data
- No credit card required for free tier

## License

MIT License
