
import jsPDF from 'jspdf';
import { type Deal, STAGE_LABELS } from '../types/deals';
import { type Lease } from '../types/tenants';

export interface DeckOptions {
    includeCover: boolean;
    includeFinancials: boolean;
    includeLeasing: boolean;
    includePhotos: boolean;
    includeMap: boolean;
    includeAgentMemo: boolean;
}

export const exportToPDF = (deal: Deal, options?: DeckOptions, leases: Lease[] = []) => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (margin * 2);

    const addHeader = (title: string) => {
        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text(title, margin, 25);
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.line(margin, 30, pageWidth - margin, 30);
    };

    const addFooter = (pageNum: number) => {
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(`AXIOM Private Equity | Confidential | Page ${pageNum}`, margin, pageHeight - 10);
        doc.text(new Date().toLocaleDateString(), pageWidth - margin - 20, pageHeight - 10);
    };

    let pageCount = 0;

    // --- Slide 1: Cover ---
    if (options?.includeCover) {
        pageCount++;
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageWidth, 60, 'F');

        doc.setFontSize(32);
        doc.setTextColor(255, 255, 255);
        doc.text("INVESTOR DECK", margin, 35);

        doc.setFontSize(14);
        doc.setTextColor(148, 163, 184);
        doc.text("Confidential Investment Summary", margin, 45);

        // Feature Image on Cover
        if (deal.image_urls && deal.image_urls[0]) {
            try {
                // Large feature image
                const imgHeight = 100;
                doc.addImage(deal.image_urls[0], 'JPEG', margin, 70, contentWidth, imgHeight);
                doc.setTextColor(15, 23, 42);
                doc.setFontSize(24);
                doc.text(deal.project_name, margin, 70 + imgHeight + 15);
                doc.setFontSize(14);
                doc.setTextColor(100, 116, 139);
                doc.text(`${deal.location} | ${deal.asset_type}`, margin, 70 + imgHeight + 25);
            } catch (error) {
                console.error("Failed to add cover image:", error);
                doc.setTextColor(15, 23, 42);
                doc.setFontSize(24);
                doc.text(deal.project_name, margin, 80);
                doc.setFontSize(14);
                doc.setTextColor(100, 116, 139);
                doc.text(`${deal.location} | ${deal.asset_type}`, margin, 90);
            }
        } else {
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(24);
            doc.text(deal.project_name, margin, 110);
            doc.setFontSize(14);
            doc.setTextColor(100, 116, 139);
            doc.text(`${deal.location} | ${deal.asset_type}`, margin, 120);
        }

        doc.setDrawColor(226, 232, 240);
        doc.line(margin, pageHeight - 60, margin + 40, pageHeight - 60);
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text("PREPARED BY", margin, pageHeight - 40);
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("AXIOM AI Engine v1.0", margin, pageHeight - 33);

        addFooter(pageCount);
    }

    // --- Slide 2: Financials ---
    if (options?.includeFinancials) {
        if (pageCount > 0) doc.addPage();
        pageCount++;
        addHeader("Executive Summary");
        let y = 45;
        const metrics = [
            ['Acquisition Price', deal.acquisition_price],
            ['Renovation Cost', deal.renovation_cost],
            ['Projected Value', deal.projected_value],
            ['Equity Required', deal.capital_required],
        ];
        doc.setFontSize(11);
        metrics.forEach(([label, value], i) => {
            const isLeft = i % 2 === 0;
            const curX = isLeft ? margin : margin + (contentWidth / 2);
            const curY = y + (Math.floor(i / 2) * 25);
            doc.setTextColor(100, 116, 139);
            doc.text(label as string, curX, curY);
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(14);
            const valStr = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value as number);
            doc.text(valStr, curX, curY + 7);
            doc.setFontSize(11);
        });
        y += 60;
        doc.setFontSize(14);
        doc.text("Capital Raising Progress", margin, y);
        y += 10;
        const fundedPct = Math.round((deal.capital_raised / (deal.capital_required || 1)) * 100);
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(margin, y, contentWidth, 6, 3, 3, 'F');
        doc.setFillColor(79, 70, 229);
        doc.roundedRect(margin, y, contentWidth * (fundedPct / 100), 6, 3, 3, 'F');
        y += 12;
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.capital_raised)} Raised`, margin, y);
        doc.text(`${fundedPct}% Funded`, pageWidth - margin - 30, y);
        addFooter(pageCount);
    }

    // --- Slide 3+: Agent Memo ---
    if (options?.includeAgentMemo && deal.notes) {
        const sections = deal.notes.split('## ').filter(s => s.trim().length > 0);
        sections.forEach(section => {
            if (pageCount > 0) doc.addPage();
            pageCount++;
            const lines = section.split('\n');
            const title = lines[0].trim().replace(/\*\*/g, '');
            const body = lines.slice(1).join('\n').trim();
            addHeader(title || "Investment Analysis");
            doc.setFontSize(11);
            doc.setTextColor(71, 85, 105);
            const splitContent = doc.splitTextToSize(body, contentWidth);
            doc.text(splitContent, margin, 45);
            addFooter(pageCount);
        });
    }

    // --- Slide 3: Leasing Summary (Rent Roll) ---
    if (options?.includeLeasing && leases && leases.length > 0) {
        if (pageCount > 0) doc.addPage();
        pageCount++;
        addHeader("Leasing Summary");

        let y = 45;
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text("TENANT", margin, y);
        doc.text("SQFT", margin + 60, y);
        doc.text("RENT (ANNUAL)", margin + 90, y);
        doc.text("EXPIRY", margin + 140, y);

        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y + 2, pageWidth - margin, y + 2);
        y += 8;

        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);

        leases.forEach((lease) => {
            if (y > pageHeight - 30) {
                doc.addPage();
                pageCount++;
                addHeader("Leasing Summary (Cont.)");
                y = 45;
            }
            const tenantName = lease.tenant?.name || 'Unknown';
            doc.text(tenantName, margin, y);
            doc.text(lease.sqft?.toLocaleString() || '0', margin + 60, y);
            const rentStr = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(lease.annual_rent || 0);
            doc.text(rentStr, margin + 90, y);
            doc.text(lease.end_date || 'N/A', margin + 140, y);
            y += 7;
        });

        addFooter(pageCount);
    }

    // --- Slide 4: Photo Gallery ---
    if (options?.includePhotos && deal.image_urls && deal.image_urls.length > 0) {
        if (pageCount > 0) doc.addPage();
        pageCount++;
        addHeader("Property Gallery");

        const imgs = deal.image_urls.slice(0, 4);
        const imgSize = (contentWidth / 2) - 5;

        imgs.forEach((url, i) => {
            const ix = i % 2;
            const iy = Math.floor(i / 2);
            const x = margin + (ix * (imgSize + 10));
            const y = 45 + (iy * (imgSize + 10));

            // Placeholder for image
            doc.setFillColor(241, 245, 249);
            doc.roundedRect(x, y, imgSize, imgSize, 2, 2, 'F');

            try {
                // In a production app, we'd ensure images are loaded or pre-fetched.
                // jsPDF.addImage can take a URL if it's CORS-enabled.
                doc.addImage(url, 'JPEG', x + 2, y + 2, imgSize - 4, imgSize - 4);
            } catch (error) {
                console.error("Failed to add gallery image:", error);
                doc.setFontSize(8);
                doc.setTextColor(148, 163, 184);
                doc.text("Image Load Failed", x + (imgSize / 2) - 10, y + (imgSize / 2));
            }
        });

        addFooter(pageCount);
    }

    // Save
    const fileName = `${deal.project_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_deck.pdf`;
    doc.save(fileName);
};

export const exportToCSV = (deals: Deal[]) => {
    const headers = [
        'Project Name',
        'Location',
        'Asset Type',
        'Stage',
        'Acquisition Price',
        'Renovation Cost',
        'Total Cost',
        'Projected Value',
        'Projected Profit',
        'Capital Raised',
        'Capital Required',
        'Created At'
    ];

    const rows = deals.map(deal => [
        deal.project_name,
        deal.location,
        deal.asset_type,
        STAGE_LABELS[deal.stage],
        deal.acquisition_price,
        deal.renovation_cost,
        deal.acquisition_price + deal.renovation_cost,
        deal.projected_value,
        deal.projected_profit || 0,
        deal.capital_raised,
        deal.capital_required,
        new Date(deal.created_at).toLocaleDateString()
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'axiom_deals_pipeline.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
