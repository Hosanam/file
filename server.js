const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure files directory exists
const filesDir = path.join(__dirname, 'files');
if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir);
}

// Create default folder for static serve
const defaultDir = path.join(__dirname, 'defoult');
if (!fs.existsSync(defaultDir)) {
    fs.mkdirSync(defaultDir);
}

// Create a default file for QR download (no upload required)
const defaultFileName = 'defoult.pdf';
const defaultFilePath = path.join(defaultDir, defaultFileName);
if (!fs.existsSync(defaultFilePath)) {
    fs.writeFileSync(defaultFilePath, 'QR File Share default file: this file is saved as "defoult.pdf".');
}

// API Routes - must come BEFORE static middleware
app.get('/api/download/:id', (req, res) => {
    const fileId = req.params.id;
    
    // Check default file first
    if (fileId === 'defoult') {
        if (fs.existsSync(defaultFilePath)) {
            return res.download(defaultFilePath);
        }
    }
    
    // Check files folder - match by file ID (filename without extension)
    const files = fs.readdirSync(filesDir);
    const file = files.find(f => path.parse(f).name === fileId);

    if (!file) {
        return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(filesDir, file);
    res.download(filePath);
});

app.get('/api/files', (req, res) => {
    const fileList = [];
    
    try {
        const files = fs.readdirSync(filesDir);
        const fileItems = files
            .filter(file => file.toLowerCase() !== 'defoult.pdf')
            .map(file => {
                const filePath = path.join(filesDir, file);
                try {
                    const stats = fs.statSync(filePath);
                    const fileId = path.parse(file).name;

                    return {
                        id: fileId,
                        name: file,
                        size: stats.size,
                        uploadDate: stats.mtime.toISOString()
                    };
                } catch (err) {
                    console.error(`Error reading file ${file}:`, err);
                    return null;
                }
            })
            .filter(item => item !== null);
        
        fileList.push(...fileItems);
    } catch (err) {
        console.error('Error reading files directory:', err);
    }

    // Add default file from defoult folder at the start
    if (fs.existsSync(defaultFilePath)) {
        try {
            const stats = fs.statSync(defaultFilePath);
            fileList.unshift({
                id: 'defoult',
                name: 'defoult.pdf',
                size: stats.size,
                uploadDate: stats.mtime.toISOString()
            });
        } catch (err) {
            console.error('Error reading default file:', err);
        }
    }

    res.json(fileList);
});

// Backward compatibility routes
app.get('/download/:id', (req, res) => {
    res.redirect(`/api/download/${req.params.id}`);
});

app.get('/files', (req, res) => {
    res.redirect('/api/files');
});

// Static file serving - AFTER API routes
app.use(express.static(path.join(__dirname)));

function startServer(port) {
    const server = app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
        console.log(`Available files in: ${filesDir}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            const nextPort = port + 1;
            console.warn(`Port ${port} in use. Trying ${nextPort}...`);
            startServer(nextPort);
        } else {
            console.error('Server error:', err);
            process.exit(1);
        }
    });
}

startServer(PORT);

