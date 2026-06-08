import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { ErrorNote } from "../StepStatus";
import SelectField from "../SelectField";
import VideoPlayer from "../VideoPlayer";

// Video counterpart to ResultImageViewer: pick algorithm + session, the
// matching videos load automatically (no "Get" button) and render in a grid.

type Video = { filename: string; url: string };
type LoadParams = { segmentation_algorithm?: string; session?: string };

type Props = {
    open?: boolean;
    algoOptions?: string[];
    sessionOptions?: string[];
    load: (params: LoadParams) => Promise<Video[]>;
    emptyText?: string;
};

const ResultVideoViewer: React.FC<Props> = ({
    open = true,
    algoOptions,
    sessionOptions,
    load,
    emptyText,
}) => {
    const [algo, setAlgo] = useState<string>(algoOptions?.[0] ?? "");
    const [session, setSession] = useState<string>(sessionOptions?.[0] ?? "");
    const [videos, setVideos] = useState<Video[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadRef = useRef(load);
    loadRef.current = load;

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
                if (!cancelled) setVideos(res);
            } catch (err: any) {
                if (!cancelled) {
                    setError(err?.message || "Failed to fetch videos.");
                    setVideos(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [open, algo, session, ready]);

    return (
        <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                {algoOptions && <SelectField label="Algorithm" value={algo} onChange={setAlgo} options={algoOptions} />}
                {sessionOptions && <SelectField label="Session" value={session} onChange={setSession} options={sessionOptions} />}
            </div>

            {error && <ErrorNote>{error}</ErrorNote>}

            {loading ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                    <FontAwesomeIcon icon={faSpinner} spin style={{ color: "var(--color-accent)" }} />
                    Loading videos…
                </span>
            ) : videos && videos.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 240px)", gap: 12 }}>
                    {videos.map(({ filename, url }) => (
                        <VideoPlayer key={filename} filename={filename} url={url} />
                    ))}
                </div>
            ) : (
                <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                    {emptyText || "No videos available for this selection."}
                </span>
            )}
        </div>
    );
};

export default ResultVideoViewer;
