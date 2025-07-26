import jsPDF from "jspdf";
import "jspdf-autotable";

const ExportPDF = (report) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Symptom Report", 14, 20);

  doc.setFontSize(12);
  doc.text(`Date: ${new Date(report.date).toLocaleString()}`, 14, 30);
  doc.text(`User: ${report.user_id}`, 14, 38);
  doc.text(`Symptoms: ${report.symptoms}`, 14, 46);
  doc.text(`AI Suggestion: ${report.ai_suggestion}`, 14, 54);
  doc.text(`Suggested Tests: ${report.suggested_tests?.join(", ") || "-"}`, 14, 62);
  doc.text(`Urgency: ${report.urgency}`, 14, 70);

  doc.autoTable({
    startY: 80,
    head: [["Role", "Message"]],
    body: report.full_conversation.map((msg) => [msg.role, msg.message]),
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [0, 123, 255] },
  });

  doc.save(`Symptom_Report_${new Date(report.date).toISOString().split("T")[0]}.pdf`);
};

export default ExportPDF;
