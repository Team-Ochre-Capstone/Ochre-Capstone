// Global application state
const AppState = {
    currentFile: null,
    tissueType: 'bone',
    huThreshold: 300,
    renderQuality: 'high',
    backgroundColor: 'light-gray',
    showGrid: true,
    autoOptimize: true,
    defaultExport: 'stl'
};

// Common utility functions
class CTApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.updateAppStatus();
    }

    setupEventListeners() {
        // Global error handler
        window.addEventListener('error', this.handleGlobalError.bind(this));
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', this.handlePopState.bind(this));
    }

    handleGlobalError(event) {
        console.error('Global error:', event.error);
        this.showNotification('An unexpected error occurred', 'error');
    }

    handlePopState(event) {
        // Update UI based on navigation
        this.updateActiveNav();
    }

    updateActiveNav() {
        const currentPath = window.location.pathname;
        const navTabs = document.querySelectorAll('.nav-tab');
        
        navTabs.forEach(tab => {
            const link = tab.querySelector('a');
            if (link && link.getAttribute('href') === currentPath) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }

    // File handling utilities
    validateDICOMFile(file) {
        const maxSize = 1024 * 1024 * 1024; // 1GB
        const allowedExtensions = ['.dcm'];
        const allowedTypes = ['application/dicom', 'application/octet-stream'];

        // Check file size
        if (file.size > maxSize) {
            throw new Error(`File too large. Maximum size is 1GB.`);
        }

        // Check file extension
        const fileExtension = file.name.toLowerCase().slice(-4);
        if (!allowedExtensions.includes(fileExtension)) {
            throw new Error('Invalid file type. Only DICOM (.dcm) files are allowed.');
        }

        // Check MIME type (if available)
        if (file.type && !allowedTypes.includes(file.type)) {
            throw new Error('Invalid file type. Only DICOM files are allowed.');
        }

        return true;
    }

    // Session storage utilities
    saveToSession(key, value) {
        try {
            sessionStorage.setItem(`ct-app-${key}`, JSON.stringify(value));
        } catch (error) {
            console.warn('Could not save to session storage:', error);
        }
    }

    getFromSession(key) {
        try {
            const item = sessionStorage.getItem(`ct-app-${key}`);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.warn('Could not read from session storage:', error);
            return null;
        }
    }

    clearSession() {
        try {
            const keys = Object.keys(sessionStorage);
            keys.forEach(key => {
                if (key.startsWith('ct-app-')) {
                    sessionStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.warn('Could not clear session storage:', error);
        }
    }

    // Settings management
    loadSettings() {
        try {
            const settings = this.getFromSession('settings') || {};
            Object.assign(AppState, settings);
            this.applySettings();
        } catch (error) {
            console.warn('Could not load settings:', error);
        }
    }

    saveSettings() {
        try {
            this.saveToSession('settings', {
                renderQuality: AppState.renderQuality,
                backgroundColor: AppState.backgroundColor,
                showGrid: AppState.showGrid,
                autoOptimize: AppState.autoOptimize,
                defaultExport: AppState.defaultExport
            });
        } catch (error) {
            console.warn('Could not save settings:', error);
        }
    }

    applySettings() {
        // Apply settings to UI elements if they exist
        if (document.getElementById('render-quality')) {
            document.getElementById('render-quality').value = AppState.renderQuality;
        }
        if (document.getElementById('background-color')) {
            document.getElementById('background-color').value = AppState.backgroundColor;
        }
        if (document.getElementById('show-grid')) {
            document.getElementById('show-grid').checked = AppState.showGrid;
        }
        if (document.getElementById('auto-optimize')) {
            document.getElementById('auto-optimize').checked = AppState.autoOptimize;
        }
        if (document.getElementById('default-export')) {
            document.getElementById('default-export').value = AppState.defaultExport;
        }
    }

    // Notification system
    showNotification(message, type = 'info', duration = 5000) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.global-notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `global-notification alert alert-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'slideOut 0.3s ease-in';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        }

        return notification;
    }

    // API communication
    async apiRequest(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(endpoint, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            this.showNotification(error.message || 'Network error occurred', 'error');
            throw error;
        }
    }

    // File upload handler
    async uploadDICOMFiles(files) {
        const formData = new FormData();
        
        // Validate files first
        for (let file of files) {
            try {
                this.validateDICOMFile(file);
                formData.append('dicomFiles', file);
            } catch (error) {
                this.showNotification(`Skipping ${file.name}: ${error.message}`, 'warning');
            }
        }

        if (formData.getAll('dicomFiles').length === 0) {
            throw new Error('No valid DICOM files to upload');
        }

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const result = await response.json();
            
            // Store file info in app state
            if (result.files && result.files.length > 0) {
                AppState.currentFile = result.files[0];
                this.saveToSession('currentFile', AppState.currentFile);
            }

            this.showNotification(result.message, 'success');
            return result;

        } catch (error) {
            this.showNotification(error.message, 'error');
            throw error;
        }
    }

    // 3D Preview utilities
    updatePreviewStats(polygons, performance) {
        const polygonsEl = document.getElementById('polygons');
        const performanceEl = document.getElementById('performance');
        
        if (polygonsEl) polygonsEl.textContent = polygons.toLocaleString();
        if (performanceEl) performanceEl.textContent = `${performance} FPS`;
    }

    // Export utilities
    generateExportFilename(baseName, format, tissueType) {
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        return `${baseName}_${tissueType}_${timestamp}`;
    }

    validateExportFilename(filename) {
        const invalidChars = /[<>:"/\\|?*]/g;
        const maxLength = 128;

        if (!filename || filename.trim().length === 0) {
            throw new Error('Filename cannot be empty');
        }

        if (filename.length > maxLength) {
            throw new Error(`Filename must be less than ${maxLength} characters`);
        }

        if (invalidChars.test(filename)) {
            throw new Error('Filename contains invalid characters');
        }

        return filename.trim();
    }

    // Performance monitoring
    startPerformanceMonitor() {
        if (this.performanceInterval) return;

        this.performanceInterval = setInterval(() => {
            const now = performance.now();
            if (this.lastFrameTime) {
                const fps = Math.round(1000 / (now - this.lastFrameTime));
                this.updatePreviewStats(AppState.polygons || 0, fps);
            }
            this.lastFrameTime = now;
        }, 1000);
    }

    stopPerformanceMonitor() {
        if (this.performanceInterval) {
            clearInterval(this.performanceInterval);
            this.performanceInterval = null;
        }
    }

    // Cleanup
    destroy() {
        this.stopPerformanceMonitor();
        this.clearSession();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.ctApp = new CTApp();
    
    // Add CSS for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .global-notification {
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
    `;
    document.head.appendChild(style);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CTApp, AppState };
}