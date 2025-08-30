const fs = require('fs');
const path = require('path');

// Create a test file to simulate PAN document upload
const testUploadsDir = path.join(__dirname, 'backend', 'uploads');
if (!fs.existsSync(testUploadsDir)) {
  fs.mkdirSync(testUploadsDir, { recursive: true });
}

// Create a test PDF file
const testFilePath = path.join(testUploadsDir, 'test-pan-document.pdf');
if (!fs.existsSync(testFilePath)) {
  fs.writeFileSync(testFilePath, 'This is a test PAN document content');
  console.log('✅ Created test PAN document:', testFilePath);
}

console.log('Test setup complete. You can now test the document upload functionality by:');
console.log('1. Starting the backend server (if not already running)');
console.log('2. Registering a new vendor/center with a PAN document upload');
console.log('3. Checking the ApplicationsComponent to see if documents are displayed');
console.log('');
console.log('The backend routes are already configured to handle document uploads and:');
console.log('- auth.js: Saves document metadata to user.documents array');
console.log('- users.js: Returns documents in vendor/center API responses');
console.log('- ApplicationsComponent.tsx: Displays document information');
