# Medical CT-Scan 3D Printing Web Application

Capstone project for BS in Computer Science, University of Maine

## Quick Start

1. Clone the repository
```bash
   git clone 
   cd Ochre-Capstone
```

2. Install dependencies
```bash
   npm install
```

3. Start development server
```bash
   npm run dev
```

4. Open browser to http://localhost:5173

## Tech Stack

- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **3D Visualization**: VTK.js
- **DICOM Processing**: VTK.js
- **Testing**: Selenium (to be added)

## Project Structure

- `docs/` - Project documentation (proposal, SRS)
- `src/webapp/` - React frontend application
- `tests/` - End-to-end tests (to be added)

## Features

- Upload medical CT scans (DICOM format)
- View 3D reconstructed models
- Segment anatomical structures (bone, skin, muscle)
- Export STL files for 3D printing
- Export G-code for printer-specific tissue characteristics
- All processing done locally (no server uploads)

## Team

- Israk Arafat
- Gregory Michaud
- Cooper Stepenkiw
- Bryan Sturdivant
- Ethan Wyman

## License

University of Maine - Laboratory for Convergent Science