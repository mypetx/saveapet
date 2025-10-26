// Test basic syntax of app.js
const fs = require('fs');

try {
  const code = fs.readFileSync('./priv/static/js/app.js', 'utf8');
  new Function(code);
  console.log('✓ JavaScript syntax is valid');
} catch (e) {
  console.error('✗ JavaScript syntax error:', e.message);
  process.exit(1);
}
