import React, { useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faExpand } from "@fortawesome/free-solid-svg-icons";

// Image viewer for large result figures (matplotlib PNGs).
//   • Default: image fills the available WIDTH (zoom = 1 = fit-width).
//   • Zoom: 1× → 8×, never below fit-width (no shrinking past the image).
//   • Mouse wheel pans vertically (native scroll) — it does NOT zoom.
//   • Drag pans when zoomed; zoom in/out/reset via the toolbar.
// Native scroll keeps the wheel-pans / zoom-in-only behaviour simple and
// predictable, so no zoom-pan library is needed.

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const STEP = 1.25;

type Props = {
    src: string;
    alt: string;
};

const ZoomableImage: React.FC<Props> = ({ src, alt }) => {
    const boxRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    // Fractional viewport centre to preserve across a zoom change.
    const pendingCenter = useRef<{ fx: number; fy: number } | null>(null);
    const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);

    const zoomTo = (next: number) => {
        const clamped = Math.min(Math.max(next, MIN_ZOOM), MAX_ZOOM);
        const box = boxRef.current;
        if (box && clamped !== zoom) {
            pendingCenter.current = {
                fx: (box.scrollLeft + box.clientWidth / 2) / box.scrollWidth,
                fy: (box.scrollTop + box.clientHeight / 2) / box.scrollHeight,
            };
        }
        setZoom(clamped);
    };

    const reset = () => {
        pendingCenter.current = null;
        setZoom(1);
        requestAnimationFrame(() => {
            const box = boxRef.current;
            if (box) {
                box.scrollLeft = 0;
                box.scrollTop = 0;
            }
        });
    };

    // After a zoom re-render, restore the prior viewport centre so zooming
    // grows/shrinks around the middle instead of jumping to a corner.
    useLayoutEffect(() => {
        const box = boxRef.current;
        const pc = pendingCenter.current;
        if (box && pc) {
            box.scrollLeft = pc.fx * box.scrollWidth - box.clientWidth / 2;
            box.scrollTop = pc.fy * box.scrollHeight - box.clientHeight / 2;
            pendingCenter.current = null;
        }
    }, [zoom]);

    // Drag-to-pan complements native wheel scrolling.
    const onMouseDown = (e: React.MouseEvent) => {
        const box = boxRef.current;
        if (!box) return;
        drag.current = { x: e.clientX, y: e.clientY, left: box.scrollLeft, top: box.scrollTop };
    };
    const onMouseMove = (e: React.MouseEvent) => {
        const box = boxRef.current;
        if (!box || !drag.current) return;
        box.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
        box.scrollTop = drag.current.top - (e.clientY - drag.current.y);
    };
    const endDrag = () => {
        drag.current = null;
    };

    return (
        <Wrap>
            <Toolbar>
                <ToolButton type="button" onClick={() => zoomTo(zoom * STEP)} disabled={zoom >= MAX_ZOOM} title="Zoom in" aria-label="Zoom in">
                    <FontAwesomeIcon icon={faPlus} />
                </ToolButton>
                <ToolButton type="button" onClick={() => zoomTo(zoom / STEP)} disabled={zoom <= MIN_ZOOM} title="Zoom out" aria-label="Zoom out">
                    <FontAwesomeIcon icon={faMinus} />
                </ToolButton>
                <ToolButton type="button" onClick={reset} disabled={zoom === 1} title="Reset to fit width" aria-label="Reset to fit width">
                    <FontAwesomeIcon icon={faExpand} />
                </ToolButton>
            </Toolbar>
            <ScrollBox
                ref={boxRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={endDrag}
                onMouseLeave={endDrag}
                $grab={zoom > 1}
            >
                <img
                    src={src}
                    alt={alt}
                    draggable={false}
                    style={{ display: "block", width: `${zoom * 100}%`, height: "auto", userSelect: "none" }}
                />
            </ScrollBox>
        </Wrap>
    );
};

const Wrap = styled.div`
    position: absolute;
    inset: 0;
`;

const Toolbar = styled.div`
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 2;
    display: flex;
    gap: 4px;
`;

const ToolButton = styled.button`
    width: 30px;
    height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-border-strong);
    border-radius: 6px;
    background: var(--color-surface);
    color: var(--color-text-secondary);
    cursor: pointer;
    font-size: var(--text-sm);
    transition: background 0.12s, color 0.12s;

    &:hover:not(:disabled) {
        background: var(--color-surface-sunken);
        color: var(--color-text);
    }

    &:disabled {
        opacity: 0.4;
        cursor: default;
    }
`;

const ScrollBox = styled.div<{ $grab: boolean }>`
    width: 100%;
    height: 100%;
    overflow: auto;
    cursor: ${({ $grab }) => ($grab ? "grab" : "default")};

    &:active {
        cursor: ${({ $grab }) => ($grab ? "grabbing" : "default")};
    }
`;

export default ZoomableImage;
