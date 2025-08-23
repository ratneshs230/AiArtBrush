import Queue from 'bull'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Replicate from 'replicate'

let imageQueue: Queue.Queue
let genAI: GoogleGenerativeAI
let replicate: Replicate

interface AIConfig {
  strength: number
  guidanceScale: number
  inferenceSteps: number
  scheduler: string
  negativePrompt: string
  imageSize: number
}

function getAIConfig(): AIConfig {
  // Parse environment variables with defaults and validation
  const strength = Math.max(0.1, Math.min(1.0, parseFloat(process.env.AI_STRENGTH || '0.25')))
  const guidanceScale = Math.max(1, Math.min(20, parseFloat(process.env.AI_GUIDANCE_SCALE || '7.5')))
  const inferenceSteps = Math.max(10, Math.min(50, parseInt(process.env.AI_INFERENCE_STEPS || '30')))
  const scheduler = process.env.AI_SCHEDULER || 'K_EULER'
  const negativePrompt = process.env.AI_NEGATIVE_PROMPT || 'blurry, bad quality, distorted, ugly'
  
  // Validate image size (must be 512, 768, or 1024)
  const sizeInput = parseInt(process.env.AI_IMAGE_SIZE || '1024')
  const imageSize = [512, 768, 1024].includes(sizeInput) ? sizeInput : 1024
  
  return {
    strength,
    guidanceScale,
    inferenceSteps,
    scheduler,
    negativePrompt,
    imageSize
  }
}

export async function initializeAIQueue() {
  imageQueue = new Queue('image-generation', process.env.REDIS_URL || 'redis://localhost:6379')
  
  console.log('🔧 AI Service: Checking API keys...')
  console.log('🔧 AI Service: Gemini API key exists:', !!process.env.GEMINI_API_KEY)
  console.log('🔧 AI Service: Replicate API token exists:', !!process.env.REPLICATE_API_TOKEN)
  
  // Initialize Gemini for prompt enhancement
  if (process.env.GEMINI_API_KEY) {
    try {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      console.log('✅ AI Service: Google Gemini client initialized')
    } catch (error) {
      console.error('❌ AI Service: Failed to initialize Gemini client:', error)
    }
  } else {
    console.log('❌ AI Service: No GEMINI_API_KEY found')
  }
  
  // Initialize Replicate for image generation (img2img)
  if (process.env.REPLICATE_API_TOKEN) {
    try {
      replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN
      })
      console.log('✅ AI Service: Replicate client initialized for img2img')
    } catch (error) {
      console.error('❌ AI Service: Failed to initialize Replicate client:', error)
    }
  } else {
    console.log('❌ AI Service: No REPLICATE_API_TOKEN found')
  }
  
  imageQueue.process(async (job) => {
    const { prompt, previousImage, currentArtworkDescription, styleSelection, styleHistory } = job.data
    return await generateImageWithAI(prompt, previousImage, currentArtworkDescription, styleSelection, styleHistory)
  })
  
  console.log('AI queue initialized')
}

export async function generateImage(
  prompt: string, 
  previousImage?: string, 
  currentArtworkDescription?: string,
  styleSelection?: any,
  styleHistory?: any[]
): Promise<{imageUrl: string, newArtworkDescription: string}> {
  console.log('🎨 AI Service: generateImage called with prompt:', prompt)
  console.log('🎨 AI Service: Has previous image:', !!previousImage)
  console.log('🎨 AI Service: Current artwork description:', currentArtworkDescription)
  console.log('🎨 AI Service: Style selection:', styleSelection)
  console.log('🎨 AI Service: Style history:', styleHistory)
  
  if (!process.env.REPLICATE_API_TOKEN || !replicate) {
    console.log('❌ AI Service: Using placeholder image - Replicate API not configured')
    const newDescription = currentArtworkDescription 
      ? `${currentArtworkDescription}, ${prompt}`
      : prompt
    return {
      imageUrl: `https://via.placeholder.com/512x512.png?text=${encodeURIComponent(prompt.slice(0, 30))}`,
      newArtworkDescription: newDescription
    }
  }
  
  console.log('✅ AI Service: Using Replicate for image generation')
  
  const job = await imageQueue.add({
    prompt,
    previousImage,
    currentArtworkDescription,
    styleSelection,
    styleHistory
  })
  
  const result = await job.finished()
  return result
}

async function generateImageWithAI(
  prompt: string, 
  previousImage?: string, 
  currentArtworkDescription?: string,
  styleSelection?: any,
  styleHistory?: any[]
): Promise<{imageUrl: string, newArtworkDescription: string}> {
  try {
    console.log('🎨 AI Service: Starting AI image generation...')
    
    // Get current AI configuration with dynamic style-based adjustments
    const config = getAIConfig()
    
    // Adjust strength based on style selection and preservation settings
    let dynamicStrength = config.strength
    if (styleSelection) {
      if (styleSelection.preserveExisting && previousImage) {
        // Lower strength when preserving existing styles
        dynamicStrength = Math.min(config.strength, styleSelection.blendStrength || 0.3)
      } else if (styleSelection.blendStrength) {
        // Use custom blend strength
        dynamicStrength = styleSelection.blendStrength
      }
    }
    
    // Adjust guidance scale for style mixing
    let dynamicGuidanceScale = config.guidanceScale
    if (styleSelection?.accentStyle) {
      // Slightly higher guidance for style mixing
      dynamicGuidanceScale = Math.min(config.guidanceScale + 1.0, 10.0)
    }
    
    console.log('🎨 AI Service: Using dynamic configuration:', {
      originalStrength: config.strength,
      dynamicStrength: dynamicStrength,
      guidanceScale: dynamicGuidanceScale,
      inferenceSteps: config.inferenceSteps,
      scheduler: config.scheduler,
      imageSize: `${config.imageSize}x${config.imageSize}`,
      stylePreservation: styleSelection?.preserveExisting
    })
    
    // Step 1: Enhance the prompt with Gemini
    let enhancedPrompt = prompt
    let newArtworkDescription = currentArtworkDescription || ''
    
    if (genAI && process.env.GEMINI_API_KEY) {
      const result = await enhancePromptWithGemini(prompt, currentArtworkDescription, styleSelection, styleHistory)
      enhancedPrompt = result.enhancedPrompt
      newArtworkDescription = result.newArtworkDescription
    } else {
      // Use smart fallback when Gemini is not available
      console.log('🎨 AI Service: No Gemini API key, using smart fallback enhancement')
      const fallbackResult = buildSmartFallbackPrompt(prompt, currentArtworkDescription, styleSelection, styleHistory)
      enhancedPrompt = fallbackResult.enhancedPrompt
      newArtworkDescription = fallbackResult.newArtworkDescription
    }
    
    console.log('🎨 AI Service: Enhanced prompt:', enhancedPrompt)
    console.log('🎨 AI Service: Updated artwork description:', newArtworkDescription)
    
    // Step 2: Generate image with Replicate
    if (!replicate || !process.env.REPLICATE_API_TOKEN) {
      throw new Error('Replicate not configured')
    }
    
    let output: any
    
    if (previousImage) {
      // Use img2img for building on existing image
      console.log('🎨 AI Service: Using img2img with Stable Diffusion XL...')
      
      output = await replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
          input: {
            image: previousImage,
            prompt: enhancedPrompt,
            negative_prompt: config.negativePrompt,
            strength: dynamicStrength,
            num_outputs: 1,
            scheduler: config.scheduler,
            guidance_scale: dynamicGuidanceScale,
            num_inference_steps: config.inferenceSteps,
            width: config.imageSize,
            height: config.imageSize
          }
        }
      )
    } else {
      // Use text2img for first image
      console.log('🎨 AI Service: Using text2img for first image...')
      
      output = await replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
          input: {
            prompt: enhancedPrompt,
            negative_prompt: config.negativePrompt,
            num_outputs: 1,
            scheduler: config.scheduler,
            guidance_scale: dynamicGuidanceScale,
            num_inference_steps: config.inferenceSteps,
            width: config.imageSize,
            height: config.imageSize
          }
        }
      )
    }
    
    if (output && output.length > 0) {
      const imageUrl = output[0]
      console.log('✅ AI Service: Replicate image generation successful')
      console.log('🎨 AI Service: Image URL:', imageUrl)
      return {
        imageUrl,
        newArtworkDescription
      }
    }
    
    throw new Error('No image generated from Replicate')
    
  } catch (error) {
    console.error('❌ AI Service: Image generation error:', error)
    throw new Error('Failed to generate image')
  }
}

/**
 * Build a smart fallback prompt using all available context data
 */
function buildSmartFallbackPrompt(
  prompt: string,
  currentArtworkDescription?: string,
  styleSelection?: any,
  styleHistory?: any[]
): {enhancedPrompt: string, newArtworkDescription: string} {
  
  const promptParts: string[] = []
  const descriptionParts: string[] = []
  
  // Extract style information
  const currentStyleName = styleSelection?.primaryStyle?.name || ''
  const currentStyleDescription = styleSelection?.primaryStyle?.description || ''
  const styleTemplate = styleSelection?.primaryStyle?.promptTemplate || ''
  const styleTags = styleSelection?.primaryStyle?.tags || []
  const accentStyleName = styleSelection?.accentStyle?.name
  const preserveExisting = styleSelection?.preserveExisting !== false
  const blendStrength = styleSelection?.blendStrength || 0.3
  
  // Process style template if available
  const processedTemplate = styleTemplate 
    ? styleTemplate.replace('{prompt}', prompt)
    : ''
  
  // Build style history context
  const previousStyles = styleHistory?.map(s => s.primaryStyle?.name).filter(Boolean) || []
  const hasHistory = previousStyles.length > 0
  
  if (!currentArtworkDescription) {
    // First image - establish foundation
    if (processedTemplate) {
      // Use the full style template as base
      promptParts.push(processedTemplate)
    } else {
      // Build from components
      promptParts.push(prompt)
      if (currentStyleName) {
        promptParts.push(currentStyleName.toLowerCase())
      }
      if (styleTags.length > 0) {
        promptParts.push(styleTags.slice(0, 3).join(', '))
      }
    }
    
    // Add quality and composition modifiers
    promptParts.push('artistic composition')
    promptParts.push('detailed')
    promptParts.push('high quality')
    promptParts.push('collaborative art foundation')
    
    // Add style-specific descriptors
    if (currentStyleDescription) {
      const keywords = extractKeywordsFromDescription(currentStyleDescription)
      if (keywords.length > 0) {
        promptParts.push(keywords.join(', '))
      }
    }
    
    // Build description
    descriptionParts.push(currentStyleName ? `${currentStyleName}:` : '')
    descriptionParts.push(prompt)
    
  } else {
    // Building on existing artwork
    const preservationLevel = preserveExisting ? 'high' : 'medium'
    const strengthDescription = blendStrength < 0.3 ? 'subtle' : blendStrength > 0.6 ? 'prominent' : 'balanced'
    
    // Start with action verb
    promptParts.push(`Add ${prompt}`)
    
    // Add context about existing artwork
    promptParts.push(`to ${currentArtworkDescription}`)
    
    // Apply style with template or components
    if (processedTemplate) {
      // Extract style-specific parts from template (remove the {prompt} part)
      const styleSpecificParts = styleTemplate
        .replace('{prompt}', '')
        .split(',')
        .filter(part => part.trim().length > 0)
        .slice(0, 3)
        .join(',')
      
      if (styleSpecificParts) {
        promptParts.push(`with ${styleSpecificParts}`)
      }
    } else if (currentStyleName) {
      promptParts.push(`in ${currentStyleName} style`)
    }
    
    // Add style mixing context
    if (hasHistory) {
      promptParts.push(`blending with existing ${previousStyles.slice(-2).join(' and ')} elements`)
    }
    
    // Add preservation instructions
    if (preserveExisting) {
      promptParts.push('preserving all existing textures and elements')
      promptParts.push('maintaining visual continuity')
    }
    
    // Add blend strength guidance
    promptParts.push(`${strengthDescription} style application`)
    
    // Add accent style if present
    if (accentStyleName) {
      promptParts.push(`with ${accentStyleName} accents`)
    }
    
    // Add evolution concept
    promptParts.push('collaborative art evolution')
    
    // Quality modifiers
    if (styleTags.length > 0) {
      promptParts.push(styleTags.slice(0, 2).join(', '))
    }
    
    // Build updated description
    descriptionParts.push(currentArtworkDescription)
    descriptionParts.push(',')
    descriptionParts.push(currentStyleName ? `${currentStyleName}:` : '')
    descriptionParts.push(prompt)
  }
  
  return {
    enhancedPrompt: promptParts.filter(p => p.length > 0).join(', '),
    newArtworkDescription: descriptionParts.filter(p => p.length > 0).join(' ').replace(/\s+,/g, ',').trim()
  }
}

/**
 * Extract keywords from style description
 */
function extractKeywordsFromDescription(description: string): string[] {
  // Common art descriptor words to extract
  const descriptorPatterns = [
    'realistic', 'stylized', 'detailed', 'vibrant', 'dark', 'bright',
    'atmospheric', 'dramatic', 'soft', 'bold', 'intricate', 'minimal',
    'textured', 'smooth', 'rough', 'glossy', 'matte', 'luminous'
  ]
  
  const keywords: string[] = []
  const lowerDesc = description.toLowerCase()
  
  for (const pattern of descriptorPatterns) {
    if (lowerDesc.includes(pattern)) {
      keywords.push(pattern)
    }
  }
  
  // Extract technique-related words
  if (lowerDesc.includes('paint')) keywords.push('painted')
  if (lowerDesc.includes('sketch')) keywords.push('sketched')
  if (lowerDesc.includes('digital')) keywords.push('digital art')
  if (lowerDesc.includes('photo')) keywords.push('photographic')
  if (lowerDesc.includes('3d') || lowerDesc.includes('render')) keywords.push('3D rendered')
  
  return keywords.slice(0, 4) // Limit to avoid prompt bloat
}

async function enhancePromptWithGemini(
  prompt: string, 
  currentArtworkDescription?: string,
  styleSelection?: any,
  styleHistory?: any[]
): Promise<{enhancedPrompt: string, newArtworkDescription: string}> {
  try {
    console.log('🎨 AI Service: Enhancing prompt with Gemini for collaborative art with style mixing...')
    
    // Build style context
    const currentStyleName = styleSelection?.primaryStyle?.name || 'default style'
    const currentStyleDescription = styleSelection?.primaryStyle?.description || ''
    const currentStyleTemplate = styleSelection?.primaryStyle?.promptTemplate || ''
    const accentStyleName = styleSelection?.accentStyle?.name
    const preserveExisting = styleSelection?.preserveExisting !== false
    const blendStrength = styleSelection?.blendStrength || 0.3
    
    // Build style history context
    const previousStyles = styleHistory?.map(style => style.primaryStyle?.name).filter(Boolean) || []
    const styleHistoryText = previousStyles.length > 0 
      ? `Previous styles used: ${previousStyles.join(', ')}`
      : 'This is the first style application'
    
    if (!currentArtworkDescription) {
      // First image - create a base with style
      const detailedPrompt = `Create a Stable Diffusion prompt for the FIRST image in a collaborative art game.

REQUIREMENTS:
- User request: "${prompt}"
- Art style: ${currentStyleName} - ${currentStyleDescription}
- Style template guidance: ${currentStyleTemplate}
${accentStyleName ? `- Accent style: ${accentStyleName}` : ''}

COLLABORATIVE CONTEXT:
- This is a multiplayer art creation game
- Multiple players will add to this artwork in sequence
- Each addition should build on previous elements
- The composition should leave room for future additions

Create a prompt that establishes a strong foundation for collaborative building.

Respond with ONLY a JSON object:
{
  "enhancedPrompt": "detailed Stable Diffusion prompt with style, composition, and collaborative considerations",
  "artworkDescription": "concise description of main visual elements for future reference"
}`

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      const result = await model.generateContent(detailedPrompt)
      const response = result.response.text().trim()
      
      try {
        const parsed = JSON.parse(response)
        return {
          enhancedPrompt: parsed.enhancedPrompt,
          newArtworkDescription: parsed.artworkDescription
        }
      } catch {
        // Use smart fallback for JSON parse error
        return buildSmartFallbackPrompt(prompt, currentArtworkDescription, styleSelection, styleHistory)
      }
    } else {
      // Building on existing - advanced style mixing and preservation
      const detailedPrompt = `COLLABORATIVE ART CONTINUATION with STYLE MIXING

CURRENT ARTWORK STATE:
- Existing elements: "${currentArtworkDescription}"
- ${styleHistoryText}

NEW ADDITION REQUEST:
- User wants to add: "${prompt}"
- New style: ${currentStyleName} - ${currentStyleDescription}
${accentStyleName ? `- Accent style for mixing: ${accentStyleName}` : ''}
- Preserve existing textures: ${preserveExisting}
- Style blend strength: ${Math.round(blendStrength * 100)}% (lower = subtle, higher = prominent)

CRITICAL STYLE MIXING INSTRUCTIONS:
${preserveExisting ? 
  `- PRESERVE all existing visual textures, colors, and style elements from previous rounds
  - The new "${currentStyleName}" should BLEND with existing styles, not replace them
  - Think "adding a new layer" rather than "changing the style"
  - Example: If there's oil painting texture, keep it visible while adding new elements in ${currentStyleName}` 
  : 
  `- The new style can be more transformative but should still respect existing composition
  - Blend new ${currentStyleName} elements with previous work`}

- Use img2img strength of ${blendStrength.toFixed(1)} to control the transformation
- Add "${prompt}" while maintaining visual continuity
- Think of this as COLLABORATIVE EVOLUTION, not replacement

Create a prompt that adds the new element in the requested style while preserving the collaborative artwork's integrity.

Respond with ONLY a JSON object:
{
  "enhancedPrompt": "detailed prompt for adding ${prompt} in ${currentStyleName} while preserving existing artwork",
  "artworkDescription": "updated description including both preserved and new elements"
}`

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      const result = await model.generateContent(detailedPrompt)
      const response = result.response.text().trim()
      
      try {
        const parsed = JSON.parse(response)
        return {
          enhancedPrompt: parsed.enhancedPrompt,
          newArtworkDescription: parsed.artworkDescription
        }
      } catch {
        // Use smart fallback for JSON parse error
        return buildSmartFallbackPrompt(prompt, currentArtworkDescription, styleSelection, styleHistory)
      }
    }
    
  } catch (error) {
    console.warn('🎨 AI Service: Gemini enhancement failed, using smart fallback:', error)
    // Use smart fallback for complete Gemini failure
    return buildSmartFallbackPrompt(prompt, currentArtworkDescription, styleSelection, styleHistory)
  }
}