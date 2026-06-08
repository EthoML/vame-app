import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { ErrorNote } from "../StepStatus";
import SelectField from "../SelectField";
import { API_BASE } from "@renderer/utils/requests";

// Embeds a self-contained interactive HTML result (e.g. the Plotly UMAP figure) in an iframe. 
// `load` returns the backend-relative URL of the HTML (e.g. "/files/...html"),
// or null when it hasn't been generated yet.

type LoadParams = { segmentation_algorithm?: string };

type Props = {
    open?: boolean;
    algoOptions?: string[];
    load: (params: LoadParams) => Promise<string | null>;
    title?: string;
    emptyText?: string;
};

const ResultHtmlViewer: React.FC<Props> = ({ open = true, algoOptions, load, title = "Result", emptyText }) => {
    const [algo, setAlgo] = useState<string>(algoOptions?.[0] ?? "");
    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadRef = useRef(load);
    loadRef.current = load;

    const ready = !algoOptions || !!algo;

    useEffect(() => {
        if (!open || !ready) return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await loadRef.current({ segmentation_algorithm: algoOptions ? algo : undefined });
                if (!cancelled) setUrl(res);
            } catch (err: any) {
                if (!cancelled) {
                    setError(err?.message || "Failed to fetch result.");
                    setUrl(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [open, algo, ready]);

    return (
        <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                {algoOptions && <SelectField label="Algorithm" value={algo} onChange={setAlgo} options={algoOptions} />}
            </div>

            {error && <ErrorNote>{error}</ErrorNote>}

            <div style={PANEL}>
                {loading ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                        <FontAwesomeIcon icon={faSpinner} spin style={{ color: "var(--color-accent)" }} />
                        Loading…
                    </span>
                ) : url ? (
                    <iframe
                        title={title}
                        src={`${API_BASE}${url}`}
                        style={{ width: "100%", height: "100%", border: "none" }}
                    />
                ) : (
                    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                        {emptyText || "No result available."}
                    </span>
                )}
            </div>
        </div>
    );
};

const PANEL: React.CSSProperties = {
    position: "relative",
    height: "70vh",
    width: "100%",
    background: "var(--color-surface-sunken)",
    border: "1px solid var(--color-border)",
    borderRadius: 6,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

export default ResultHtmlViewer;
