import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileBarChart, ChevronDown, Loader2 } from 'lucide-react';
import {
  generateExpirationCSV,
  generateConsumptionCSV,
  generateProductivityCSV,
  generateSmartAssignmentCSV,
  downloadCSV,
  generateExpirationExcel,
  generateConsumptionExcel,
  generateProductivityExcel,
  generateSmartAssignmentExcel,
  downloadExcel,
  generateExpirationPDF,
  generateConsumptionPDF,
  generateProductivityPDF,
  generateSmartAssignmentPDF,
  downloadPDF
} from '../../utils/reportGenerators';

/**
 * Report Downloader Component
 * Provides download buttons for PDF, Excel, and CSV reports
 */
export default function ReportDownloader({ moduleName, data, reportType, flightId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingFormat, setGeneratingFormat] = useState(null);

  // Check if data is available
  const hasData = data && Object.keys(data).length > 0;

  /**
   * Generate filename with timestamp
   */
  const getFilename = (format) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const flightSuffix = flightId ? `_${flightId}` : '';
    const moduleSuffix = moduleName.replace(/\s+/g, '_');

    return `GateGenius_${moduleSuffix}${flightSuffix}_${timestamp}.${format}`;
  };

  /**
   * Handle CSV download
   */
  const handleCSVDownload = () => {
    if (!hasData) return;

    setGenerating(true);
    setGeneratingFormat('csv');

    try {
      let csvContent;

      switch (reportType) {
        case 'expiration':
          csvContent = generateExpirationCSV(data);
          break;
        case 'consumption':
          csvContent = generateConsumptionCSV(data);
          break;
        case 'productivity':
          csvContent = generateProductivityCSV(data);
          break;
        case 'smart_assignment':
          csvContent = generateSmartAssignmentCSV({ ...data, flightId });
          break;
        default:
          throw new Error('Invalid report type');
      }

      downloadCSV(csvContent, getFilename('csv'));
      setIsOpen(false);
    } catch (error) {
      console.error('CSV generation error:', error);
      alert('Failed to generate CSV report. Please try again.');
    } finally {
      setGenerating(false);
      setGeneratingFormat(null);
    }
  };

  /**
   * Handle Excel download
   */
  const handleExcelDownload = () => {
    if (!hasData) return;

    setGenerating(true);
    setGeneratingFormat('excel');

    try {
      let workbook;

      switch (reportType) {
        case 'expiration':
          workbook = generateExpirationExcel(data);
          break;
        case 'consumption':
          workbook = generateConsumptionExcel(data);
          break;
        case 'productivity':
          workbook = generateProductivityExcel(data);
          break;
        case 'smart_assignment':
          workbook = generateSmartAssignmentExcel({ ...data, flightId });
          break;
        default:
          throw new Error('Invalid report type');
      }

      downloadExcel(workbook, getFilename('xlsx'));
      setIsOpen(false);
    } catch (error) {
      console.error('Excel generation error:', error);
      alert('Failed to generate Excel report. Please try again.');
    } finally {
      setGenerating(false);
      setGeneratingFormat(null);
    }
  };

  /**
   * Handle PDF download (AI-Powered with Gemini)
   */
  const handlePDFDownload = async () => {
    if (!hasData) return;

    setGenerating(true);
    setGeneratingFormat('pdf');

    try {
      let pdfDoc;

      switch (reportType) {
        case 'expiration':
          pdfDoc = await generateExpirationPDF(data);
          break;
        case 'consumption':
          pdfDoc = await generateConsumptionPDF(data, flightId);
          break;
        case 'productivity':
          pdfDoc = await generateProductivityPDF(data);
          break;
        case 'smart_assignment':
          pdfDoc = await generateSmartAssignmentPDF(data, flightId);
          break;
        default:
          throw new Error('Invalid report type');
      }

      downloadPDF(pdfDoc, getFilename('pdf'));
      setIsOpen(false);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate AI-powered PDF report. Please try again.');
    } finally {
      setGenerating(false);
      setGeneratingFormat(null);
    }
  };

  return (
    <div className="relative inline-block">
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!hasData || generating}
        className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        title={!hasData ? 'No data available for report' : 'Download Report'}
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating {generatingFormat}...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Download Report</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && !generating && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown content */}
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="py-1">
              {/* PDF Option */}
              <button
                onClick={handlePDFDownload}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors"
              >
                <FileText className="w-5 h-5 text-red-500 dark:text-red-400" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">Download as PDF</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Best for presentations</div>
                </div>
              </button>

              {/* Excel Option */}
              <button
                onClick={handleExcelDownload}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors"
              >
                <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">Download as Excel</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Best for data analysis</div>
                </div>
              </button>

              {/* CSV Option */}
              <button
                onClick={handleCSVDownload}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors"
              >
                <FileBarChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">Download as CSV</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Universal format</div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
