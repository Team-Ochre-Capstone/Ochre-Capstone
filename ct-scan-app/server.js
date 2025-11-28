const express = require('express');
const exphbs = require('express-handlebars');
const multer = require('multer');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads - more permissive settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'dicom-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // More permissive file filtering
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.dcm' || 
        file.mimetype === 'application/dicom' || 
        file.mimetype === 'application/octet-stream' ||
        file.mimetype === '' || // Some browsers don't send mime type for .dcm
        file.originalname.toLowerCase().includes('.dcm')) {
      cb(null, true);
    } else {
      cb(new Error('Only DICOM (.dcm) files are allowed'), false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 1024 // 1GB limit
  }
});

// Session configuration
app.use(session({
  secret: 'medical-ct-scan-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Configure Handlebars with custom helpers
app.engine('hbs', exphbs.engine({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  helpers: {
    eq: function (a, b) {
      return a === b;
    },
    neq: function (a, b) {
      return a !== b;
    },
    formatFileSize: function (bytes) {
      if (!bytes || bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    formatDate: function (date) {
      return date ? new Date(date).toLocaleDateString() : 'N/A';
    }
  }
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make session available to all views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Routes
app.get('/', (req, res) => {
  res.render('upload', {
    title: 'Upload DICOM',
    activeTab: 'upload',
    fileInfo: req.session.fileInfo || null
  });
});

app.get('/preview', (req, res) => {
  // Allow access to preview even without files for demo
  res.render('preview', {
    title: '3D Preview',
    activeTab: 'preview',
    fileInfo: req.session.fileInfo || null
  });
});

app.get('/export', (req, res) => {
  res.render('export', {
    title: 'Export Model',
    activeTab: 'export',
    fileInfo: req.session.fileInfo || null
  });
});

app.get('/settings', (req, res) => {
  res.render('settings', {
    title: 'Help & Settings',
    activeTab: 'settings'
  });
});

// API Routes
app.post('/api/upload', upload.array('dicomFiles', 100), (req, res) => {
  try {
    console.log('Upload request received, files:', req.files?.length);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'No files were selected for upload' 
      });
    }

    // Basic DICOM validation (in real app, you'd parse DICOM headers)
    const validFiles = req.files.filter(file => {
      const ext = path.extname(file.originalname).toLowerCase();
      return ext === '.dcm' || file.originalname.toLowerCase().includes('.dcm');
    });

    if (validFiles.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid DICOM files found. Please upload files with .dcm extension.'
      });
    }

    // Store file info in session
    req.session.fileInfo = {
      fileName: validFiles[0].originalname,
      fileCount: validFiles.length,
      fileSize: validFiles.reduce((total, file) => total + file.size, 0),
      uploadTime: new Date().toISOString(),
      uploadedFiles: validFiles.map(file => ({
        originalName: file.originalname,
        size: file.size,
        uploadedName: file.filename,
        path: file.path
      })),
      // Add mock DICOM metadata for demo
      dicomMetadata: {
        patientName: 'Demo Patient',
        studyDate: new Date().toISOString().split('T')[0],
        modality: 'CT',
        sliceThickness: '0.5mm',
        dimensions: `512x512x${validFiles.length}`,
        spacing: '0.5mm'
      }
    };

    console.log('Files uploaded successfully:', validFiles.length);

    res.json({
      success: true,
      message: `Successfully uploaded ${validFiles.length} DICOM file(s)`,
      files: validFiles.map(file => ({
        originalName: file.originalname,
        size: file.size,
        uploadedName: file.filename
      })),
      fileInfo: req.session.fileInfo,
      redirect: '/preview'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error during file upload: ' + error.message 
    });
  }
});

// Demo DICOM processing endpoint
app.post('/api/process-tissue', (req, res) => {
  try {
    const { tissueType, huThreshold } = req.body;
    
    console.log('Processing tissue:', tissueType, 'HU:', huThreshold);
    
    // Simulate processing delay
    setTimeout(() => {
      // Generate realistic mock data based on tissue type
      const meshData = generateMockMeshData(tissueType, huThreshold);
      
      res.json({
        success: true,
        tissueType,
        huThreshold,
        meshData: meshData,
        processingTime: Math.random() * 2 + 1 // 1-3 seconds
      });
    }, 1500);
    
  } catch (error) {
    console.error('Tissue processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process tissue: ' + error.message
    });
  }
});

// Helper function for mock mesh data
function generateMockMeshData(tissueType, huThreshold) {
  const basePolygons = {
    bone: 150000,
    skin: 80000,
    muscle: 120000
  };
  
  const baseVertices = {
    bone: 75000,
    skin: 40000,
    muscle: 60000
  };
  
  // Add some variation based on HU threshold
  const huFactor = (huThreshold - 300) / 1000; // Normalize HU effect
  
  return {
    vertices: Math.floor(baseVertices[tissueType] * (1 + huFactor * 0.5)),
    polygons: Math.floor(basePolygons[tissueType] * (1 + huFactor * 0.3)),
    dimensions: '512x512x256',
    quality: 'High',
    fileSize: Math.floor(basePolygons[tissueType] * 0.0003) + ' MB'
  };
}

app.post('/api/export-model', (req, res) => {
  try {
    const { format, filename, tissueType } = req.body;
    
    console.log('Export request:', format, filename, tissueType);
    
    if (!filename || filename.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a filename'
      });
    }

    // Validate filename
    const invalidChars = /[<>:"/\\|?*]/g;
    if (invalidChars.test(filename)) {
      return res.status(400).json({
        success: false,
        error: 'Filename contains invalid characters'
      });
    }

    // Simulate export processing
    setTimeout(() => {
      const fileExtension = format === 'stl' ? '.stl' : '.gcode';
      const cleanFilename = filename.replace(/\.(stl|gcode)$/i, ''); // Remove existing extension
      const finalFilename = cleanFilename + fileExtension;
      const estimatedSize = Math.floor(Math.random() * 50) + 10;
      
      res.json({
        success: true,
        format,
        filename: finalFilename,
        tissueType,
        estimatedSize: `${estimatedSize} MB`,
        processingTime: Math.random() * 5 + 5, // 5-10 seconds
        downloadUrl: `/api/download/${finalFilename}`
      });
    }, 2000);
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      error: 'Export failed: ' + error.message
    });
  }
});

app.get('/api/download/:filename', (req, res) => {
  const { filename } = req.params;
  
  try {
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    if (filename.endsWith('.stl')) {
      res.setHeader('Content-Type', 'application/sla');
      // Generate a simple STL file content
      const stlContent = generateMockSTLContent();
      res.send(stlContent);
    } else if (filename.endsWith('.gcode')) {
      res.setHeader('Content-Type', 'text/plain');
      // Generate simple G-code
      const gcodeContent = generateMockGCode();
      res.send(gcodeContent);
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid file format requested'
      });
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: 'Download failed: ' + error.message
    });
  }
});

// Mock file content generators
function generateMockSTLContent() {
  return `solid Medical_CT_Model
facet normal 0 0 0
  outer loop
    vertex 0 0 0
    vertex 1 0 0
    vertex 0 1 0
  endloop
endfacet
endsolid Medical_CT_Model`;
}

function generateMockGCode() {
  return `; G-code for Medical CT Model
; Generated by Medical CT 3D Modeling App
G21 ; Set units to millimeters
G90 ; Use absolute coordinates
G28 ; Home all axes
; Model data would be here...
M30 ; End of program`;
}

// Clear session endpoint
app.post('/api/clear-session', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session clear error:', err);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to clear session' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Session cleared successfully' 
    });
  });
});

// Get session info endpoint (for debugging)
app.get('/api/session-info', (req, res) => {
  res.json({
    sessionId: req.sessionID,
    fileInfo: req.session.fileInfo || null,
    sessionData: req.session
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Application error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false,
        error: 'File too large. Maximum size is 1GB.' 
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        success: false,
        error: 'Too many files. Maximum is 100 files.' 
      });
    }
  }
  
  res.status(500).json({ 
    success: false,
    error: 'Application error: ' + error.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    activeTab: ''
  });
});

app.listen(PORT, () => {
  console.log(`Medical CT 3D Modeling app running on http://localhost:${PORT}`);
  console.log(`Upload directory: ${path.join(__dirname, 'uploads')}`);
});