/**
 * AI-Powered PDF Report Generator
 *
 * Uses Gemini API to generate intelligent, tailored reports with insights
 * Converts AI-generated markdown content to formatted PDF
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { geminiApi } from '../../api/geminiApi';

const PRIMARY_COLOR = [79, 70, 229]; // Indigo
const HEADER_COLOR = [31, 41, 55]; // Gray-800
const TEXT_COLOR = [55, 65, 81]; // Gray-700
const SUCCESS_COLOR = [34, 197, 94]; // Green-500
const WARNING_COLOR = [251, 191, 36]; // Amber-400
const DANGER_COLOR = [239, 68, 68]; // Red-500

/**
 * Parse markdown content into structured sections
 */
const parseMarkdown = (content) => {
  const lines = content.split('\n');
  const sections = [];
  let currentSection = null;

  lines.forEach(line => {
    // H1 headers (#)
    if (line.startsWith('# ')) {
      if (currentSection) sections.push(currentSection);
      currentSection = {
        type: 'h1',
        title: line.replace('# ', '').trim(),
        content: []
      };
    }
    // H2 headers (##)
    else if (line.startsWith('## ')) {
      if (currentSection) sections.push(currentSection);
      currentSection = {
        type: 'h2',
        title: line.replace('## ', '').trim(),
        content: []
      };
    }
    // H3 headers (###)
    else if (line.startsWith('### ')) {
      if (currentSection) {
        currentSection.content.push({
          type: 'h3',
          text: line.replace('### ', '').trim()
        });
      }
    }
    // Bullet points
    else if (line.trim().startsWith('• ') || line.trim().startsWith('- ')) {
      if (currentSection) {
        currentSection.content.push({
          type: 'bullet',
          text: line.trim().replace(/^[•\-]\s+/, '')
        });
      }
    }
    // Numbered lists
    else if (/^\d+\.\s/.test(line.trim())) {
      if (currentSection) {
        currentSection.content.push({
          type: 'numbered',
          text: line.trim()
        });
      }
    }
    // Bold text (**text**)
    else if (line.includes('**')) {
      if (currentSection) {
        currentSection.content.push({
          type: 'paragraph',
          text: line.trim(),
          bold: true
        });
      }
    }
    // Regular paragraphs
    else if (line.trim()) {
      if (currentSection) {
        currentSection.content.push({
          type: 'paragraph',
          text: line.trim()
        });
      }
    }
    // Empty lines
    else {
      if (currentSection && currentSection.content.length > 0) {
        currentSection.content.push({ type: 'spacing' });
      }
    }
  });

  if (currentSection) sections.push(currentSection);
  return sections;
};

/**
 * Render section to PDF
 */
const renderSection = (doc, section, yPos) => {
  const pageHeight = doc.internal.pageSize.height;
  const maxY = pageHeight - 20; // Leave 20px margin at bottom
  const leftMargin = 14;
  const rightMargin = 14;
  const maxWidth = doc.internal.pageSize.width - leftMargin - rightMargin;

  // Check if we need a new page
  if (yPos > maxY - 20) {
    doc.addPage();
    yPos = 20;
  }

  // Render section title
  if (section.type === 'h1') {
    doc.setFontSize(18);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.setFont(undefined, 'bold');
    doc.text(section.title, leftMargin, yPos);
    yPos += 10;

    // Underline
    doc.setDrawColor(...PRIMARY_COLOR);
    doc.setLineWidth(0.5);
    doc.line(leftMargin, yPos, leftMargin + 60, yPos);
    yPos += 8;
  } else if (section.type === 'h2') {
    doc.setFontSize(14);
    doc.setTextColor(...HEADER_COLOR);
    doc.setFont(undefined, 'bold');
    doc.text(section.title, leftMargin, yPos);
    yPos += 8;
  }

  doc.setFont(undefined, 'normal');

  // Render section content
  section.content.forEach(item => {
    // Check if we need a new page
    if (yPos > maxY) {
      doc.addPage();
      yPos = 20;
    }

    switch (item.type) {
      case 'h3':
        doc.setFontSize(12);
        doc.setTextColor(...HEADER_COLOR);
        doc.setFont(undefined, 'bold');
        doc.text(item.text, leftMargin, yPos);
        doc.setFont(undefined, 'normal');
        yPos += 7;
        break;

      case 'bullet':
        doc.setFontSize(10);
        doc.setTextColor(...TEXT_COLOR);

        // Clean up bold markers
        let bulletText = item.text.replace(/\*\*/g, '');

        // Split long text
        const bulletLines = doc.splitTextToSize(bulletText, maxWidth - 10);

        // Draw bullet point
        doc.circle(leftMargin + 2, yPos - 2, 1, 'F');

        // Draw text
        bulletLines.forEach((line, idx) => {
          if (yPos > maxY) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, leftMargin + 6, yPos);
          yPos += 5;
        });
        yPos += 1;
        break;

      case 'numbered':
        doc.setFontSize(10);
        doc.setTextColor(...TEXT_COLOR);

        const numText = item.text.replace(/\*\*/g, '');
        const numLines = doc.splitTextToSize(numText, maxWidth - 10);

        numLines.forEach((line, idx) => {
          if (yPos > maxY) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, leftMargin + (idx === 0 ? 0 : 6), yPos);
          yPos += 5;
        });
        yPos += 1;
        break;

      case 'paragraph':
        doc.setFontSize(10);
        doc.setTextColor(...TEXT_COLOR);

        // Handle bold text
        if (item.bold || item.text.includes('**')) {
          doc.setFont(undefined, 'bold');
        }

        const paraText = item.text.replace(/\*\*/g, '');
        const paraLines = doc.splitTextToSize(paraText, maxWidth);

        paraLines.forEach(line => {
          if (yPos > maxY) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, leftMargin, yPos);
          yPos += 5;
        });

        doc.setFont(undefined, 'normal');
        yPos += 1;
        break;

      case 'spacing':
        yPos += 3;
        break;
    }
  });

  return yPos + 5; // Add spacing after section
};

/**
 * Add PDF header with branding
 */
const addHeader = (doc, reportType, timestamp) => {
  // Logo area (using text for now)
  doc.setFontSize(16);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFont(undefined, 'bold');
  doc.text('GateGenius', 14, 15);

  doc.setFontSize(9);
  doc.setTextColor(...TEXT_COLOR);
  doc.setFont(undefined, 'normal');
  doc.text(`${reportType} | Generated: ${timestamp}`, 14, 20);

  // Top line
  doc.setDrawColor(...PRIMARY_COLOR);
  doc.setLineWidth(0.3);
  doc.line(14, 23, doc.internal.pageSize.width - 14, 23);

  return 30; // Return starting Y position for content
};

/**
 * Add page numbers and footer
 */
const addFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_COLOR);

    // Footer line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

    // Page number
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Branding
    doc.text('GateGenius - AI-Powered Catering Intelligence', 14, pageHeight - 10);
  }
};

/**
 * Generate AI-Powered PDF Report
 */
const generateAIPDF = async (reportType, data, flightId = null) => {
  console.log(`📄 Generating AI-powered ${reportType} PDF report...`);

  try {
    // Step 1: Get AI-generated report from Gemini
    const report = await geminiApi.generateReport(reportType, data, flightId);

    if (!report.success) {
      throw new Error('Failed to generate AI report');
    }

    console.log('✅ AI report generated, converting to PDF...');

    // Step 2: Parse markdown content
    const sections = parseMarkdown(report.content);

    // Step 3: Create PDF
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();

    // Add header
    let yPos = addHeader(doc, reportType.toUpperCase().replace('_', ' '), timestamp);

    // Render each section
    sections.forEach(section => {
      yPos = renderSection(doc, section, yPos);
    });

    // Add footer with page numbers
    addFooter(doc);

    console.log(`✅ PDF generated successfully (${doc.internal.getNumberOfPages()} pages)`);

    return {
      success: true,
      doc,
      mock: report.mock || false
    };
  } catch (error) {
    console.error('❌ Error generating AI PDF:', error);
    throw error;
  }
};

/**
 * Generate Expiration Intelligence Report PDF
 */
export const generateExpirationPDF = async (data) => {
  const result = await generateAIPDF('expiration', data);
  return result.doc;
};

/**
 * Generate Consumption Prediction Report PDF
 */
export const generateConsumptionPDF = async (data, flightId = null) => {
  const result = await generateAIPDF('consumption', data, flightId);
  return result.doc;
};

/**
 * Generate Productivity Planning Report PDF
 */
export const generateProductivityPDF = async (data) => {
  const result = await generateAIPDF('productivity', data);
  return result.doc;
};

/**
 * Generate Smart Assignment Report PDF
 */
export const generateSmartAssignmentPDF = async (data, flightId) => {
  const result = await generateAIPDF('smart_assignment', data, flightId);
  return result.doc;
};

/**
 * Download PDF file
 */
export const downloadPDF = (doc, filename) => {
  doc.save(filename);
};
