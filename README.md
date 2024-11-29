# URL Time Tracker Chrome Extension

This Chrome extension tracks the time spent on different websites and displays the statistics in a pie chart.

## Features

- Tracks active tab browsing time
- Records time spent on different domains
- Visualizes time distribution using a pie chart
- Persists data using Chrome's storage API
- Export statistics as PNG or JPEG images
- Supports multiple languages (English and Chinese)

## Installation

### From Chrome Web Store
1. Visit the Chrome Web Store page (coming soon)
2. Click "Add to Chrome"

### For Development
1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the extension
4. Open Chrome and go to `chrome://extensions/`
5. Enable "Developer mode" in the top right
6. Click "Load unpacked" and select the `dist` directory

## Development

### Prerequisites
- Node.js 14.x or higher
- npm 6.x or higher

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Usage

- The extension automatically tracks your browsing time
- Click the extension icon in the toolbar to view statistics
- The pie chart shows the percentage of time spent on each domain
- Use the download buttons to save the chart as PNG or JPEG
- Click "Reset Statistics" to clear all data

## Privacy

This extension does not collect or transmit any personal data. All browsing statistics are stored locally on your device. See our [Privacy Policy](PRIVACY.md) for more details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Version History

- 1.0.0
  - Initial release
  - Basic time tracking functionality
  - Pie chart visualization
  - Export to PNG/JPEG feature

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

- [Chart.js](https://www.chartjs.org/) for the charting library
- Icons made by [Author] from [Source]