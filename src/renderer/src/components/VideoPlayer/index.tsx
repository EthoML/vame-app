import React, { memo } from "react";
import { API_BASE } from "@renderer/utils/requests";

// Streams an mp4 from the backend's /files static route. The clip is fetched
// lazily by the <video> element (range requests), so the grid stays light and
// each clip loads/seeks independently. `url` is the backend-relative path
// (e.g. "/files/<project>/results/.../clip.mp4").
const VideoPlayer = memo(({ url, filename }: { url: string; filename: string }) => {
    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <video
                controls
                preload="metadata"
                src={`${API_BASE}${url}`}
                style={{ width: "100%", borderRadius: 4 }}
            />
            <label style={{ marginTop: 4, fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--color-text-secondary)" }}>
                {filename}
            </label>
        </div>
    );
});

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
