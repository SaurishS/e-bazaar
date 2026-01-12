import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateReceipt = (
    orderId: string, 
    date: Date | string, 
    items: any[], 
    total: number, 
    formatPrice: (price: number) => string
) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("ValueKart Receipt", 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Order ID: ${orderId}`, 14, 30);
    const dateStr = typeof date === 'string' ? new Date(date).toLocaleDateString() : date.toLocaleDateString();
    doc.text(`Date: ${dateStr}`, 14, 35);
    
    const cleanPrice = (priceStr: string) => priceStr.replace('₹', 'Rs. ');

    const tableData = items.map(item => [
        item.title, 
        item.quantity.toString(), 
        cleanPrice(formatPrice(item.price * item.quantity))
    ]);
    
    autoTable(doc, {
        head: [['Item', 'Qty', 'Price']],
        body: tableData,
        startY: 45,
        theme: 'striped',
        headStyles: { fillColor: [76, 175, 80] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Paid: ${cleanPrice(formatPrice(total))}`, 14, finalY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100);
    const terms = [
        "Terms and Conditions:",
        "1. This is a computer-generated receipt and does not require a signature.",
        "2. Items purchased can be returned within 15 days of delivery per our Return Policy.",
        "3. Warranty is provided by the manufacturer where applicable.",
        "4. For support, please contact support@valuekart.com"
    ];
    
    doc.text(terms, 14, finalY + 20);

    doc.save(`Receipt-${orderId}.pdf`);
};
