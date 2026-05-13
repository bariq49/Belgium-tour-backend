import PDFDocument from "pdfkit";
import { format } from "date-fns";
import { IBooking } from "../../types/booking.types";
import { IPayment } from "../../types/payment.types";

const COMPANY = {
    name: "BELGIUM TOUR",
    tagline: "Unforgettable Experiences",
    email: "info@belgiumtour.com",
    phone: "+32 485 964 008",
    website: "www.belgiumtour.com",
};

const COLORS = {
    primary: "#0F172A",
    secondary: "#64748B",
    accent: "#B45309",
    border: "#E2E8F0",
    bg: "#F8FAFC",
};

const formatMoney = (n?: number | null) =>
    typeof n === "number" ? `$${n.toFixed(2)}` : "—";

export const generateReceiptPdf = (booking: IBooking, payment: IPayment | null): PDFKit.PDFDocument => {
    const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        info: {
            Title: `Receipt ${booking.orderNumber}`,
            Author: COMPANY.name,
        },
    });

    // ---------- Header ----------
    doc.rect(0, 0, doc.page.width, 120).fill("#F1F5F9");
    
    doc
        .fillColor(COLORS.primary)
        .fontSize(24)
        .font("Helvetica-Bold")
        .text(COMPANY.name, 40, 45);
    
    doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(COLORS.secondary)
        .text(COMPANY.tagline, 40, 75);

    doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fillColor(COLORS.primary)
        .text("RECEIPT", 40, 45, { align: "right" });

    doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor(COLORS.secondary)
        .text(`Order: ${booking.orderNumber}`, 40, 75, { align: "right" });

    doc.moveDown(4);

    // ---------- Info Grid ----------
    const startY = 140;
    const colWidth = (doc.page.width - 80) / 3;

    // Row 1: Meta
    doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.secondary).text("ORDER STATUS", 40, startY);
    const isPaid = payment?.status === "completed" || booking.paymentStatus === "paid";
    doc.font("Helvetica-Bold").fontSize(10).fillColor(isPaid ? "#059669" : COLORS.primary).text((payment?.status || booking.paymentStatus || booking.status).toUpperCase(), 40, startY + 15);

    doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.secondary).text("DATE ISSUED", 40 + colWidth, startY);
    doc.font("Helvetica").fontSize(10).fillColor(COLORS.primary).text(format(new Date(), "MMM dd, yyyy"), 40 + colWidth, startY + 15);

    doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.secondary).text("PAYMENT METHOD", 40 + colWidth * 2, startY);
    doc.font("Helvetica").fontSize(10).fillColor(COLORS.primary).text((payment?.paymentMethod || "Card").toUpperCase(), 40 + colWidth * 2, startY + 15);

    doc.moveDown(3);

    // ---------- Two Column Section (Customer vs Tour) ----------
    const sectionY = doc.y + 10;
    const halfWidth = (doc.page.width - 100) / 2;

    // Customer Box
    doc.rect(40, sectionY, halfWidth, 110).stroke(COLORS.border);
    doc.fillColor(COLORS.primary).font("Helvetica-Bold").fontSize(10).text("CUSTOMER", 50, sectionY + 10);
    doc.font("Helvetica").fontSize(9).fillColor(COLORS.primary)
        .text(booking.customer.fullName, 50, sectionY + 25)
        .fillColor(COLORS.secondary)
        .text(booking.customer.email, 50, sectionY + 38)
        .text(booking.customer.phone, 50, sectionY + 51);
    
    if (booking.customer.hotelName) {
        doc.fillColor(COLORS.primary).font("Helvetica-Bold").text("Hotel:", 50, sectionY + 68, { continued: true });
        doc.font("Helvetica").text(` ${booking.customer.hotelName}`, { continued: false });
        doc.fontSize(8).fillColor(COLORS.secondary).text(booking.customer.hotelAddress, 50, sectionY + 81, { width: halfWidth - 20 });
    }

    // Tour Box
    doc.rect(50 + halfWidth, sectionY, halfWidth, 110).stroke(COLORS.border);
    doc.fillColor(COLORS.primary).font("Helvetica-Bold").fontSize(10).text("TOUR DETAILS", 60 + halfWidth, sectionY + 10);
    doc.font("Helvetica").fontSize(9).fillColor(COLORS.primary)
        .text(booking.tourName, 60 + halfWidth, sectionY + 25)
        .fillColor(COLORS.secondary)
        .text(`Date: ${format(new Date(booking.date), "MMM dd, yyyy")}`, 60 + halfWidth, sectionY + 38)
        .text(`Pickup: ${booking.pickupTime}`, 60 + halfWidth, sectionY + 51)
        .text(`Travelers: ${booking.travelersCount}`, 60 + halfWidth, sectionY + 64)
        .text(`Language: ${booking.language}`, 60 + halfWidth, sectionY + 77);

    doc.y = sectionY + 130;

    // ---------- Items Table ----------
    const tableTop = doc.y;
    doc.rect(40, tableTop, doc.page.width - 80, 25).fill(COLORS.primary);
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(9);
    doc.text("DESCRIPTION", 50, tableTop + 8);
    doc.text("TOTAL", 50, tableTop + 8, { align: "right", width: doc.page.width - 100 });

    const rowY = tableTop + 35;
    doc.fillColor(COLORS.primary).font("Helvetica").fontSize(10);
    doc.text(`${booking.tourName} - ${booking.travelersCount} Travelers`, 50, rowY);
    doc.font("Helvetica-Bold").text(formatMoney(booking.priceBreakdown.totalPrice), 50, rowY, { align: "right", width: doc.page.width - 100 });

    doc.moveDown(2);
    doc.rect(40, doc.y, doc.page.width - 80, 1).fill(COLORS.border);
    doc.moveDown(1);

    // ---------- Summary ----------
    const summaryX = doc.page.width - 200;
    doc.fontSize(10).font("Helvetica").fillColor(COLORS.secondary).text("Subtotal", summaryX, doc.y);
    doc.font("Helvetica-Bold").fillColor(COLORS.primary).text(formatMoney(booking.priceBreakdown.basePrice), summaryX, doc.y, { align: "right", width: 160 });
    
    doc.moveDown(0.5);
    doc.fontSize(12).font("Helvetica-Bold").fillColor(COLORS.primary).text("Amount Paid", summaryX, doc.y);
    doc.fontSize(14).fillColor(COLORS.accent).text(formatMoney(booking.priceBreakdown.totalPrice), summaryX, doc.y, { align: "right", width: 160 });

    // ---------- Footer ----------
    const footerY = doc.page.height - 100;
    doc.rect(40, footerY, doc.page.width - 80, 1).fill(COLORS.border);
    
    doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor(COLORS.secondary)
        .text("Thank you for choosing Belgium Tour. We look forward to seeing you!", 40, footerY + 15, { align: "center", width: doc.page.width - 80 });

    doc
        .fontSize(7)
        .text(`${COMPANY.website}  |  ${COMPANY.email}  |  ${COMPANY.phone}`, 40, footerY + 30, { align: "center", width: doc.page.width - 80 });

    return doc;
};
