import { post } from "@renderer/utils/requests";

/**
 * Fetches model result images from the backend /model-images endpoint.
 * Returns an object with image URLs (base64-encoded PNGs).
 *
 * @param {Object} params
 * @param {string} params.project - The project path
 * @returns {Promise<{ mse_and_kl_loss: string | null, future_reconstruction: string | null }>}
 */
export async function getModelVisualization({
    project,
}: {
    project: string;
}): Promise<{ mse_and_kl_loss: string | null; future_reconstruction: string | null }> {
    const result = await post("/model-images", { project });

    if (result.success) {
        // result.data is expected to be an object with keys: mse_and_kl_loss, future_reconstruction
        // Each value is either a base64 string (without data URL prefix) or null
        const data = result.data as Record<string, string | null>;
        return {
            mse_and_kl_loss: data.mse_and_kl_loss
                ? data.mse_and_kl_loss.startsWith("data:image/png;base64,")
                    ? data.mse_and_kl_loss
                    : `data:image/png;base64,${data.mse_and_kl_loss}`
                : null,
            future_reconstruction: data.future_reconstruction
                ? data.future_reconstruction.startsWith("data:image/png;base64,")
                    ? data.future_reconstruction
                    : `data:image/png;base64,${data.future_reconstruction}`
                : null,
        };
    } else {
        throw new Error(result.error);
    }
}
