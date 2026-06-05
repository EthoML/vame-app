import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { ErrorNote } from "../StepStatus";
import SegmentedControl from "../SegmentedControl";
import SelectField from "../SelectField";
import ZoomableImage from "../ZoomableImage";

// Unified viewer for result figures across the pipeline tabs.
//
// Renders the optional controls (segmentation algorithm, session) and, when a
// result has several views (e.g. UMAP no-label / motif / community), a
// SegmentedControl to switch between them. Images load automatically whenever
// the section is open and a selector changes — no "Get" button — and show in a
// fit-to-width, zoom/pan ZoomableImage panel.
//
// `load` returns ready-to-use <img src> strings (the caller does any base64
// prefixing): a single string for single-image sections, or a { view: src }
// map when `views` is provided.

export type ImageView = { value: string; label: string };

type LoadParams = { segmentation_algorithm?: string; session?: string };
type LoadResult = Record<string, string | null> | string | null;

type Props = {
    /** Only fetch while the section is open (avoids eager loads when collapsed). */
    open?: boolean;
    algoOptions?: string[];
    sessionOptions?: string[];
    views?: ImageView[];
    load: (params: LoadParams) => Promise<LoadResult>;
    altPrefix?: string;
    emptyText?: string;
};

const ResultImageViewer: React.FC<Props> = ({
    open = true,
    algoOptions,
    sessionOptions,
    views,
    load,
    altPrefix = "Result",
    emptyText,
}) => {
    const [algo, setAlgo] = useState<string>(algoOptions?.[0] ?? "");
    const [session, setSession] = useState<string>(sessionOptions?.[0] ?? "");
    const [view, setView] = useState<string>(views?.[0]?.value ?? "");
    const [result, setResult] = useState<LoadResult>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Keep the latest loader without making it an effect dependency.
    const loadRef = useRef(load);
    loadRef.current = load;

    // Adopt the first session once the list arrives (it can be async).
    useEffect(() => {
        if (sessionOptions?.length && !session) setSession(sessionOptions[0]);
    }, [sessionOptions, session]);

    const ready = (!algoOptions || !!algo) && (!sessionOptions || !!session);

    useEffect(() => {
        if (!open || !ready) return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await loadRef.current({
                    segmentation_algorithm: algoOptions ? algo : undefined,
                    session: sessionOptions ? session : undefined,
                });
                if (!cancelled) setResult(res);
            } catch (err: any) {
                if (!cancelled) {
                    setError(err?.message || "Failed to fetch images.");
                    setResult(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [open, algo, session, ready]);

    const src = views
        ? result && typeof result === "object"
            ? result[view] ?? null
            : null
        : typeof result === "string"
        ? result
        : null;

    const activeLabel = views?.find((v) => v.value === view)?.label ?? "";

    return (
        <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                {algoOptions && <SelectField label="Algorithm" value={algo} onChange={setAlgo} options={algoOptions} />}
                {sessionOptions && <SelectField label="Session" value={session} onChange={setSession} options={sessionOptions} />}
                {views && <SegmentedControl options={views} value={view} onChange={setView} ariaLabel="View" />}
            </div>

            {error && <ErrorNote>{error}</ErrorNote>}

            <div style={PANEL}>
                {loading ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                        <FontAwesomeIcon icon={faSpinner} spin style={{ color: "var(--color-accent)" }} />
                        Loading…
                    </span>
                ) : src ? (
                    <ZoomableImage src={src} alt={`${altPrefix}${activeLabel ? ` — ${activeLabel}` : ""}`} />
                ) : (
                    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                        {emptyText || "No image available."}
                    </span>
                )}
            </div>
        </div>
    );
};

const PANEL: React.CSSProperties = {
    position: "relative",
    height: "60vh",
    width: "100%",
    background: "var(--color-surface-sunken)",
    border: "1px solid var(--color-border)",
    borderRadius: 6,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

export default ResultImageViewer;
