import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportToPDF(id: string) {
  const element = document.getElementById(id);
  if (!element) return;

  // 🔥 inject safe CSS override
  const style = document.createElement("style");
  style.innerHTML = `
    * {
      color: #000 !important;
      border-color: #ccc !important;
      background-image: none !important;
      box-shadow: none !important;
    }
    body, div, section {
      background: #fff !important;
    }
  `;
  document.head.appendChild(style);

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff", // 🔥 important
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      unit: "px",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const ratio = Math.min(
      pageWidth / canvas.width,
      pageHeight / canvas.height
    );

    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      canvas.width * ratio,
      canvas.height * ratio
    );

    pdf.save("report.pdf");
  } finally {
    // 🔥 cleanup
    document.head.removeChild(style);
  }
}