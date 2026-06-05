import React, { useState } from "react"
import { getModelVisualization } from "../../../context/Projects/api/getModelVisualization"

type ModelVisualizationSectionProps = {
    project: any
}

const imageTabs = [
    { key: "mse_and_kl_loss", label: "MSE and KL Loss" },
    { key: "future_reconstruction", label: "Future Reconstruction" },
] as const

export const ModelVisualizationSection: React.FC<ModelVisualizationSectionProps> = ({ project }) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [images, setImages] = useState<{ mse_and_kl_loss: string | null, future_reconstruction: string | null } | null>(null)
    const [activeTab, setActiveTab] = useState<typeof imageTabs[number]["key"]>("mse_and_kl_loss")

    const handleGetImages = async () => {
        setLoading(true)
        setError(null)
        setImages(null)
        try {
            const result = await getModelVisualization({
                project: project.config.project_path,
            })
            setImages(result)
        } catch (err: any) {
            setError(err.message || "Failed to fetch images.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <button
                    onClick={handleGetImages}
                    disabled={loading}
                    style={{
                        padding: "4px 12px",
                        fontWeight: 500,
                        background: "#1976d2",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        cursor: loading ? "not-allowed" : "pointer"
                    }}
                >
                    {loading ? "Loading..." : "Get Images"}
                </button>
            </div>
            {error && (
                <div style={{ color: "red", marginBottom: 12 }}>{error}</div>
            )}
            {images && (
                <div>
                    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                        {imageTabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    padding: "6px 16px",
                                    borderBottom: activeTab === tab.key ? "2px solid #1976d2" : "2px solid transparent",
                                    background: "none",
                                    fontWeight: activeTab === tab.key ? 600 : 400,
                                    cursor: "pointer"
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div
                        style={{
                            minHeight: 220,
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#f8f9fa",
                            borderRadius: 6,
                            boxShadow: "0 2px 8px #0001",
                            overflow: "auto"
                        }}
                    >
                        {images[activeTab] ? (
                            <img
                                src={images[activeTab]!}
                                alt={`${activeTab} visualization`}
                                style={{
                                    width: "100%",
                                    height: "auto",
                                    objectFit: "contain",
                                    display: "block"
                                }}
                            />
                        ) : (
                            <span style={{ color: "#888" }}>No image available for {imageTabs.find(t => t.key === activeTab)?.label}.</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ModelVisualizationSection
