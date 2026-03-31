# QR File Share

A web application that allows you to upload files and generate QR codes for automatic download.

## Features

- Upload files via drag & drop or file picker
- Generate QR codes for file sharing
- Automatic download when QR code is scanned
- Server-side file storage
- Delete individual files or clear all

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser and go to `http://localhost:3000`

## How to Use

1. Upload files by dragging them to the drop zone or clicking "Choose Files"
2. Click the "QR" button next to any uploaded file
3. Scan the generated QR code with your phone's camera
4. The file will automatically download

## API Endpoints

- `POST /upload` - Upload a file
- `GET /files` - Get list of uploaded files
- `GET /download/:id` - Download a file by ID
- `DELETE /files/:id` - Delete a file by ID

Files are stored in the `uploads/` directory.# fw
# fwe
# fwe
