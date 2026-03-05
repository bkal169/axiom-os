import { useState, useEffect, useCallback } from "react";
import { useStorage } from "../../hooks/useStorage";
import { useAuth } from "../../context/AuthContext";
import { Button, Badge } from "./components";

interface FileAttachmentProps {
    context: string; // e.g. "notes/123"
    label?: string;
}

export function FileAttachment({ context, label = "Attachments" }: FileAttachmentProps) {
    const { user } = useAuth() as any;
    const { upload, getUrl, remove, list, mode } = useStorage(user?.id);
    const [files, setFiles] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const refresh = useCallback(async () => {
        const res = await list(context);
        setFiles(res);
    }, [list, context]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            await upload(file, context);
            await refresh();
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Upload failed. Check console for details.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (path: string) => {
        if (!confirm("Are you sure you want to delete this attachment?")) return;
        try {
            await remove(path);
            await refresh();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const getFilename = (path: string) => {
        const parts = path.split("/");
        return parts[parts.length - 1];
    };

    return (
        <div className="axiom-mt-14">
            <div className="axiom-flex-sb-center axiom-mb-8">
                <div className="axiom-text-9-dim-ls2-caps">{label}</div>
                <Badge label={mode.toUpperCase()} color={mode === "cloud" ? "var(--c-gold)" : "var(--c-dim)"} />
            </div>

            <div className="axiom-card-inner-10">
                {files.length === 0 ? (
                    <div className="axiom-text-10-dim axiom-py-10 axiom-text-center">No files attached</div>
                ) : (
                    <div className="axiom-stack-6">
                        {files.map(f => (
                            <div key={f} className="axiom-flex-sb-center axiom-p-6-10 axiom-bg-2 axiom-radius-4 axiom-border-1">
                                <div className="axiom-flex-center-gap-8">
                                    <span className="axiom-text-14">📄</span>
                                    <div className="axiom-text-12 axiom-text-truncate" style={{ maxWidth: 200 }}>
                                        {getFilename(f)}
                                    </div>
                                </div>
                                <div className="axiom-flex-gap-6">
                                    <Button
                                        label="View"
                                        variant="ghost"
                                        className="axiom-py-2 axiom-px-6 axiom-text-9"
                                        onClick={async () => {
                                            const url = await getUrl(f);
                                            if (url) window.open(url, "_blank");
                                        }}
                                    />
                                    <Button
                                        label="×"
                                        variant="ghost"
                                        className="axiom-py-2 axiom-px-6 axiom-text-9 axiom-text-red"
                                        onClick={() => handleDelete(f)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="axiom-mt-10">
                    <label className={`axiom-flex-center-col axiom-p-16 axiom-border-1-dashed axiom-radius-6 axiom-cursor-pointer premium-hover ${uploading ? 'axiom-opacity-50' : ''}`}>
                        <input type="file" className="axiom-hidden" onChange={onFileChange} disabled={uploading} />
                        <span className="axiom-text-18 axiom-mb-4">☁️</span>
                        <span className="axiom-text-10-dim-ls1-up">{uploading ? "UPLOADING..." : "UPLOAD FILE"}</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
