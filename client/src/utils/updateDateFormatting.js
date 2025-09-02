// Script to update date formatting across the frontend
// This script will be run manually to update all date formatting

const fs = require('fs');
const path = require('path');

// List of files that need date formatting updates
const filesToUpdate = [
  'src/pages/protected/PaymentsPage.tsx',
  'src/pages/public/RequestDetailPage.tsx', 
  'src/pages/protected/PaymentDetailPage.tsx',
  'src/pages/protected/FinanceDashboard.tsx',
  'src/pages/protected/UserManagementPage.tsx',
  'src/pages/protected/NotificationCenter.tsx',
  'src/pages/public/RequestsPage.tsx',
  'src/components/ApprovalModal.tsx',
  'src/pages/protected/ApprovalsPage.tsx',
  'src/pages/protected/InvoiceDetailPageNew.tsx',
  'src/pages/protected/PaymentDetailPageNew.tsx'
];

// Function to update imports
function addDateFormatImport(content, filePath) {
  const relativePath = filePath.includes('components/') ? '../utils/dateFormat' : 
                      filePath.includes('pages/protected/') ? '../../utils/dateFormat' :
                      filePath.includes('pages/public/') ? '../../utils/dateFormat' : 
                      '../utils/dateFormat';
  
  if (!content.includes('formatGhanaDate')) {
    // Find the last import statement
    const importLines = content.split('\n');
    let lastImportIndex = -1;
    for (let i = 0; i < importLines.length; i++) {
      if (importLines[i].startsWith('import ')) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex !== -1) {
      importLines.splice(lastImportIndex + 1, 0, `import { formatGhanaDate } from '${relativePath}';`);
      return importLines.join('\n');
    }
  }
  
  return content;
}

// Function to replace date formatting
function updateDateFormatting(content) {
  // Replace common patterns
  content = content.replace(/new Date\(([^)]+)\)\.toLocaleDateString\(\)/g, 'formatGhanaDate($1)');
  content = content.replace(/new Date\(([^)]+)\)\.toLocaleDateString\('en-GB'\)/g, 'formatGhanaDate($1)');
  
  return content;
}

console.log('Updating date formatting across frontend files...');

filesToUpdate.forEach(file => {
  const fullPath = path.join(__dirname, '..', file.replace('src/', ''));
  
  if (fs.existsSync(fullPath)) {
    try {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Add import if needed
      content = addDateFormatImport(content, file);
      
      // Update date formatting
      content = updateDateFormatting(content);
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Updated: ${file}`);
    } catch (error) {
      console.log(`❌ Error updating ${file}:`, error.message);
    }
  } else {
    console.log(`⚠️ File not found: ${file}`);
  }
});

console.log('Date formatting update complete!');
