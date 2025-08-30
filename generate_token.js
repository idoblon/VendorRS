const jwt = require('jsonwebtoken');

// Use the JWT_SECRET you provided
const JWT_SECRET = '4ce1bc35508e5f3e3259bb5927e5b5ca04a565d0894311698c70aa201c6192ea';

// Create a payload for an admin user (you'll need to replace the id with an actual admin user ID)
const payload = {
  id: 'admin_user_id_here', // Replace with actual admin user ID
  role: 'ADMIN'
};

// Generate the token
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

console.log('Generated JWT token:');
console.log(token);
console.log('\nUse this token in Authorization header: Bearer ' + token);
