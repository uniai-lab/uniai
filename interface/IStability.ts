/** @format */

export interface StabilityImagineRequest {
    height: number // Height of the image to generate, in pixels
    width: number // Width of the image to generate, in pixels
    text_prompts: Array<{ text: string; weight: number }> // Array of text prompts to use for generation
    cfg_scale?: number // How strictly the diffusion process adheres to the prompt text
    clip_guidance_preset?: 'FAST_BLUE' | 'FAST_GREEN' | 'NONE' | 'SIMPLE' | 'SLOW' | 'SLOWER' | 'SLOWEST' // Clip guidance preset
    sampler?:
        | 'DDIM'
        | 'DDPM'
        | 'K_DPMPP_2M'
        | 'K_DPMPP_2S_ANCESTRAL'
        | 'K_DPM_2'
        | 'K_DPM_2_ANCESTRAL'
        | 'K_EULER'
        | 'K_EULER_ANCESTRAL'
        | 'K_HEUN'
        | 'K_LMS' // Sampler to use for diffusion process
    samples?: number // Number of images to generate
    seed?: number // Random noise seed
    steps?: number // Number of diffusion steps to run
    style_preset?:
        | '3d-model'
        | 'analog-film'
        | 'anime'
        | 'cinematic'
        | 'comic-book'
        | 'digital-art'
        | 'enhance'
        | 'fantasy-art'
        | 'isometric'
        | 'line-art'
        | 'low-poly'
        | 'modeling-compound'
        | 'neon-punk'
        | 'origami'
        | 'photographic'
        | 'pixel-art'
        | 'tile-texture' // Style preset
    extras?: object // Extra parameters for experimental features
}

export interface StabilityImagineResponse {
    artifacts: [
        {
            base64: string // Image encoded in base64
            finishReason: 'CONTENT_FILTERED' | 'ERROR' | 'SUCCESS' // Enum for finish reason
            seed: number // The seed associated with this image
        }
    ]
}
