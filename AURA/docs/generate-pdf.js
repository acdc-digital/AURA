// PDF GENERATOR - Creates PDF from onboarding workflow HTML
// /Users/matthewsimon/Projects/AURA/AURA/docs/generate-pdf.js

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePDF() {
    console.log('🚀 Starting PDF generation...');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Load the HTML file
    const htmlPath = path.join(__dirname, 'onboarding-workflow-compact-pdf.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
    });
    
    // Wait for Mermaid to render
    await page.waitForFunction(() => {
        const mermaidElement = document.querySelector('.mermaid');
        return mermaidElement && mermaidElement.innerHTML.includes('svg');
    }, { timeout: 30000 });
    
    // Additional wait to ensure complete rendering
    await page.waitForTimeout(2000);
    
    console.log('📊 Mermaid diagram rendered, generating PDF...');
    
    // Generate PDF with precise A4 dimensions
    const pdfBuffer = await page.pdf({
        format: 'A4',
        width: '210mm',
        height: '297mm',
        margin: {
            top: '10mm',
            right: '10mm',
            bottom: '10mm',
            left: '10mm'
        },
        printBackground: true,
        preferCSSPageSize: false,
        displayHeaderFooter: false
    });
    
    await browser.close();
    
    // Save the PDF
    const outputPath = path.join(__dirname, 'AURA-Onboarding-Workflow.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log('✅ PDF generated successfully!');
    console.log(`📁 Saved to: ${outputPath}`);
    
    return outputPath;
}

// Run the generator
generatePDF().catch(error => {
    console.error('❌ Error generating PDF:', error);
    process.exit(1);
});
