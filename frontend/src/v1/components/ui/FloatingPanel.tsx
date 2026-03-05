import { useState, useRef, useEffect } from "react";

interface FloatingPanelProps {
    id: string;
    title: string;
    children: React.ReactNode;
    onClose: () => void;
    initialX?: number;
    initialY?: number;
}

export function FloatingPanel({ title, children, onClose, initialX = 100, initialY = 100 }: FloatingPanelProps) {
    const [pos, setPos] = useState({ x: initialX, y: initialY });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            setPos({
                x: e.clientX - dragStart.current.x,
                y: e.clientY - dragStart.current.y
            });
        };
        const handleMouseUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div
            className="axiom-floating-panel"
            style={{
                left: pos.x,
                top: pos.y,
                zIndex: isDragging ? 2000 : 1900
            }}
        >
            <div className="axiom-floating-panel-header" onMouseDown={handleMouseDown}>
                <div className="axiom-flex-center-gap-8">
                    <span style={{ fontSize: 10 }}>⧉</span>
                    <span className="axiom-text-10-bold-gold">{title.toUpperCase()}</span>
                </div>
                <div className="axiom-flex-center-gap-4">
                    <button className="axiom-panel-btn" onClick={onClose}>✕</button>
                </div>
            </div>
            <div className="axiom-floating-panel-content">
                {children}
            </div>
        </div>
    );
}
