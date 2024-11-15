import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportToPDF(
  element: HTMLElement, 
  isCustomerReport: boolean = false,
  filename: string = 'report'
): Promise<void> {
  try {
    // Hide elements that shouldn't be in PDF for customer reports
    if (isCustomerReport) {
      const viewOnlyElements = element.querySelectorAll('.report-section-view-only');
      viewOnlyElements.forEach(el => (el as HTMLElement).style.display = 'none');
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    // Restore visibility for customer reports
    if (isCustomerReport) {
      const viewOnlyElements = element.querySelectorAll('.report-section-view-only');
      viewOnlyElements.forEach(el => (el as HTMLElement).style.display = '');
    }

    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
      unit: 'mm'
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}