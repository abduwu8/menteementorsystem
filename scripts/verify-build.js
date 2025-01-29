const fs = require('fs');
const path = require('path');

function verifyBuild() {
  console.log('Verifying build output...');
  
  const rootDir = path.resolve(__dirname, '..');
  const distDir = path.join(rootDir, 'frontend', 'dist');
  const indexPath = path.join(distDir, 'index.html');
  
  console.log('Checking paths:');
  console.log('- Root directory:', rootDir);
  console.log('- Build directory:', distDir);
  console.log('- Index file:', indexPath);
  
  // Check if dist directory exists
  if (!fs.existsSync(distDir)) {
    console.error('❌ Build directory not found:', distDir);
    process.exit(1);
  }
  console.log('✓ Build directory exists');
  
  // Check if index.html exists
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html not found:', indexPath);
    process.exit(1);
  }
  console.log('✓ index.html exists');
  
  // Try to read index.html
  try {
    const content = fs.readFileSync(indexPath, 'utf8');
    if (!content || content.length < 100) {
      console.error('❌ index.html appears to be empty or too small');
      process.exit(1);
    }
    console.log('✓ index.html is readable and contains content');
    
    // List all files in dist directory
    const files = fs.readdirSync(distDir);
    console.log('\nFiles in build directory:');
    files.forEach(file => console.log(`- ${file}`));
    
  } catch (error) {
    console.error('❌ Error reading index.html:', error.message);
    process.exit(1);
  }
  
  console.log('\n✅ Build verification completed successfully');
}

verifyBuild(); 