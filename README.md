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

## What This Project Is

This capstone project is a client-side web application that takes a medical CT scan (in DICOM format) and turns it into files ready for 3D printing. Specifically, it can produce:

- **Polygonal .stl model** of anatomy (e.g., skull/bone) suitable for 3D printing or further processing
- **.gcode file** that, when printed, mimics the X-ray attenuation properties (density/opacity) of the original tissue

All processing happens in the user’s web browser on their own machine: no servers, no cloud, no uploads. This is to protect medical privacy and make the tool easy to run on any common desktop platform.

## Application Capabilities

### Upload CT Data

- Accept a DICOM file or folder of CT slices from the local machine
- Validate and parse into a 3D voxel volume with associated metadata (spacing, orientation, etc.)

### Select Anatomy to Focus On

- Choose between bone, skin, or muscle
- Apply appropriate Hounsfield Unit thresholds/presets to segment the chosen tissue

### Preview the 3D Result

- Render an interactive 3D preview in the browser (rotate, zoom, inspect)
- Allow threshold tweaks/view adjustments before export

### Export for 3D Printing

- Export a polygon mesh as .stl using a Marching Cubes–based surface extraction
- Export 3D-printer instructions as .gcode that encode geometry and tissue-mimicking properties
- Let the user pick the file name and local download location

### Portability, Testing, and Safety

- Run fully on the client (offline after initial load)
- Work across Chrome/Firefox/Safari and major OSes
- Include an automated test suite (e.g., Selenium/Playwright)

## Typical End-to-End Workflow

1. **Launch** app in browser (no install, just static web assets)
2. **Upload** CT scan (DICOM file or series)
3. **Choose** tissue type: bone/skin/muscle
4. **Preview and adjust**:
   - See a 3D rendering of the segmented anatomy
   - Adjust thresholds/modes until satisfied
5. **Export**:
   - Choose output format: .stl or .gcode
   - App generates the file and triggers a browser download
6. **Use externally**:
   - .stl → slicer → standard 3D printer
   - .gcode → printer or slicer, for density-mimicking prints
