import React, { memo, useEffect, useMemo, useRef } from "react";

// Decodes a base64 mp4 into a blob URL and plays it, revoking the URL on
// unmount. Shared by the segmentation / community video result grids.
const VideoPlayer = memo(({ content, filename }: { content: string; filename: string }) => {
    const blobUrl = useMemo(() => {
        const binaryString = atob(content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return URL.createObjectURL(new Blob([bytes], { type: "video/mp4" }));
    }, [content]);

    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        return () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [blobUrl]);

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <video ref={videoRef} controls src={blobUrl} style={{ width: "100%", borderRadius: 4 }} />
            <label style={{ marginTop: 4, fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--color-text-secondary)" }}>
                {filename}
            </label>
        </div>
    );
});

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
