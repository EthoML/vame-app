import React, { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinner } from "@fortawesome/free-solid-svg-icons"
import { getModelVisualization } from "../../../context/Projects/api/getModelVisualization"
import { ErrorNote } from "@renderer/components/StepStatus"
import SegmentedControl from "@renderer/components/SegmentedControl"
import ZoomableImage from "@renderer/components/ZoomableImage"

type ModelVisualizationSectionProps = {
    project: any
    /** Only fetch once the model is evaluated (otherwise the images 404). */
    enabled?: boolean
}

const IMAGE_TABS = [
    { value: "mse_and_kl_loss", label: "MSE & KL Loss" },
    { value: "future_reconstruction", label: "Future Reconstruction" },
] as const

type ImageTab = (typeof IMAGE_TABS)[number]["value"]

export const ModelVisualizationSection: React.FC<ModelVisualizationSectionProps> = ({ project, enabled = true }) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [images, setImages] = useState<{ mse_and_kl_loss: string | null; future_reconstruction: string | null } | null>(null)
    const [activeTab, setActiveTab] = useState<ImageTab>("mse_and_kl_loss")

    // Auto-load the figures (no button). Race-safe; gated on `enabled`.
    useEffect(() => {
        if (!enabled) return
        let cancelled = false
        ;(async () => {
            setLoading(true)
            setError(null)
            try {
                const result = await getModelVisualization({ project: project.config.project_path })
                if (cancelled) return
                setImages({
                    mse_and_kl_loss: result.mse_and_kl_loss ?? null,
                    future_reconstruction: result.future_reconstruction ?? null,
                })
            } catch (err: any) {
                if (!cancelled) {
                    setError(err.message || "Failed to fetch images.")
                    setImages(null)
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [enabled, project.config.project_path])

    return (
        <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 16 }}>
                <SegmentedControl<ImageTab>
                    options={IMAGE_TABS as unknown as { value: ImageTab; label: string }[]}
                    value={activeTab}
                    onChange={setActiveTab}
                    ariaLabel="Visualization type"
                />
            </div>

            {error && <ErrorNote>{error}</ErrorNote>}

            <div
                style={{
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
                }}
            >
                {loading ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                        <FontAwesomeIcon icon={faSpinner} spin style={{ color: "var(--color-accent)" }} />
                        Loading…
                    </span>
                ) : images?.[activeTab] ? (
                    <ZoomableImage
                        src={images[activeTab]!}
                        alt={`${IMAGE_TABS.find((t) => t.value === activeTab)?.label} visualization`}
                    />
                ) : (
                    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                        No {IMAGE_TABS.find((t) => t.value === activeTab)?.label} image available.
                    </span>
                )}
            </div>
        </div>
    )
}

export default ModelVisualizationSection
