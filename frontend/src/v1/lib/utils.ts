/**
 * Unified Utility Functions for Axiom OS
 */

export const fmt = {
    usd: (n: any) => "$" + Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 }),
    pct: (n: any) => Number(n || 0).toFixed(1) + "%",
    num: (n: any) => Number(n || 0).toLocaleString(),
    sf: (n: any) => Number(n || 0).toLocaleString() + " SF",
    k: (n: any) => "$" + (Number(n || 0) / 1000).toFixed(0) + "K",
    M: (n: any) => "$" + (Number(n || 0) / 1e6).toFixed(2) + "M",
};

export const downloadCSV = (headers: string[], rows: any[][], filename: string) => {
    const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map(e => e.map(x => `"${(x || "").toString().replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const importCSV = (file: File, callback: (data: any[]) => void) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
        const text = e.target?.result as string;
        if (!text) return;
        const lines = text.split('\n').filter((l: string) => l.trim());
        if (lines.length < 2) return;
        const headers = lines[0].split(',').map((h: string) => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const obj: any = {};
            headers.forEach((h: string, i: number) => { obj[h] = values[i]; });
            return obj;
        });
        callback(data);
    };
    reader.readAsText(file);
};

export const RC = {
    Low: "var(--c-green)",
    Medium: "var(--c-amber)",
    High: "var(--c-red)",
    Critical: "var(--c-purple)"
};
