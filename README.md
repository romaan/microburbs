# Microburbs Development Explorer

A React-based web application for exploring property development data through the Microburbs API. This tool provides an intuitive interface for searching property development information and visualizing comprehensive data about locations, zoning, and development potential.

## 🌟 Features

- **Property Search**: Search for properties using address queries or GPS coordinates
- **Interactive Dashboard**: View key metrics and development data in an organized layout
- **Demo Mode**: Explore the interface with sample data without requiring API access
- **Real-time Data**: Fetch live property development data from the Microburbs API
- **Responsive Design**: Modern, mobile-friendly interface built with Tailwind CSS
- **Data Visualization**: Smart categorization and formatting of property data

## 🛠️ Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Linting**: ESLint with TypeScript support
- **Development**: Hot module replacement and fast refresh

## 📋 Prerequisites

- **Node.js**: Version 20.19+ or 22.12+ (required for Vite 7)
- **npm**: Package manager (comes with Node.js)

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/romaan/microburbs.git
   cd microburbs-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

## 🎯 Usage

### Demo Mode (Recommended for Development)

Click the **"Demo"** button to load sample property data and explore all features without requiring API access.

### Live Search

1. **Address Search**: Enter a property address (e.g., "123 George St, Sydney NSW")
2. **Coordinate Search**: Optionally provide latitude and longitude for precise location
3. **Click Search**: Fetch real data from the Microburbs API

### Data Sections

The application organizes property data into several sections:

- **Overview**: Key property metrics and summary information
- **Zoning**: Zoning codes, floor space ratios, and height limits
- **Lot Details**: Area, frontage, depth, and corner property status
- **Overlays**: Planning overlays and restrictions
- **Nearby Amenities**: Schools, transport, walkability scores
- **Council Information**: Development applications and processing times

## 🏗️ Project Structure

```
src/
├── api.ts          # API functions and data fetching logic
├── App.tsx         # Main application component
├── types.ts        # TypeScript type definitions
├── main.tsx        # Application entry point
├── index.css       # Global styles and Tailwind imports
└── assets/         # Static assets
```

### Key Files

#### `src/api.ts`
- **`fetchDevelopment()`**: Fetches real property data from the API
- **`loadDemo()`**: Returns mock data for demonstration
- **`prettyError()`**: Formats error messages for user display
- **Caching**: Implements in-memory caching for API responses

#### `src/App.tsx`
- Main application component with search interface
- Data processing and visualization logic
- Responsive layout with summary cards and detailed sections

#### `src/types.ts`
- **`DevData`**: Property development data structure
- **`FetchArgs`**: Search parameters interface

## 🔧 Configuration

### API Endpoint

The application is configured to use the Microburbs API sandbox:
```
/mb/report_generator/api/sandbox/property/development
```

### Environment Setup

For production deployment, ensure:
- API endpoints are accessible
- CORS is properly configured
- Environment variables are set for different stages

## 🎨 Styling

The project uses **Tailwind CSS 4** for styling with:
- Custom card components
- Responsive grid layouts
- Interactive hover states
- Loading animations
- Color-coded data types (numbers, booleans, text, JSON)

## 🐛 Development Notes

### Known Issues

1. **Node.js Version**: Ensure you're using Node.js 20.19+ or 22.12+
2. **API Access**: Live search requires access to the Microburbs API
3. **CORS**: API calls may require proper CORS configuration in production

### Error Handling

The application includes comprehensive error handling:
- Network request failures
- Invalid API responses
- User-friendly error messages
- Request cancellation support

## 🧪 Testing

To test the application:

1. **Use Demo Mode**: Click "Demo" to test with sample data
2. **Check Build**: Run `npm run build` to verify production readiness
3. **Lint Code**: Run `npm run lint` to check code quality

## 📦 Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

The build outputs to the `dist/` directory and includes:
- Optimized JavaScript bundles
- Minified CSS
- Static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run linting: `npm run lint`
5. Test the build: `npm run build`
6. Commit your changes: `git commit -m 'Add feature'`
7. Push to the branch: `git push origin feature-name`
8. Submit a pull request

## 📄 License

This project is private and proprietary to Microburbs.

## 🔗 Related Links

- [Microburbs Website](https://www.microburbs.com.au)
- [API Sandbox](https://www.microburbs.com.au/report_generator/api/sandbox/property/development)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

**Note**: For development and testing, use the Demo mode to explore features without requiring API access. The live search functionality requires access to the Microburbs API infrastructure.

## 📸 Screenshot

[Microburbs Development Explorer Screenshot](./screenshot/screen.png)

*The Microburbs Development Explorer interface showing property search functionality and data visualization*