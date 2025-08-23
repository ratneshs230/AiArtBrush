#!/usr/bin/env node

/**
 * Generate sample images for a subset of popular styles to test the feature
 */

require('dotenv').config({ path: './backend/.env' })
const fs = require('fs')
const path = require('path')
const https = require('https')

const Replicate = require('replicate')

// Generate samples for popular styles first
const POPULAR_STYLES = [
  {
    id: 'vibrant_fantasy',
    name: 'Vibrant Fantasy',
    prompt: 'magical floating castle with dragons in sunset sky',
    template: '{prompt}, vibrant fantasy art, magical, enchanted, bright colors, fantasy landscape, mystical atmosphere'
  },
  {
    id: 'hyper_realistic_characters',
    name: 'Hyper-realistic Characters',
    prompt: 'wise wizard with glowing staff and flowing robes',
    template: '{prompt}, hyper-realistic character portrait, photorealistic, extremely detailed, studio lighting, professional photography quality'
  },
  {
    id: 'general_anime',
    name: 'General Anime Style',
    prompt: 'anime hero standing on cliff overlooking city',
    template: '{prompt}, anime art style, manga style, cell shading, anime character, Japanese animation'
  },
  {
    id: 'oil_paint_impasto',
    name: 'Oil Paint - Impasto',
    prompt: 'sunflower field with mountains in background',
    template: '{prompt}, oil painting, impasto technique, thick brushstrokes, textured paint, traditional art'
  },
  {
    id: 'pixel_art',
    name: 'Pixel Art',
    prompt: 'retro game castle with knight character',
    template: '{prompt}, pixel art, 16-bit style, retro gaming, pixelated, sprite art'
  },
  {
    id: 'dreamy_pastel',
    name: 'Dreamy Pastel Fantasy',
    prompt: 'fairy garden with glowing mushrooms and butterflies',
    template: '{prompt}, dreamy pastel colors, soft lighting, ethereal, magical atmosphere, fantasy, pastel color palette'
  },
  {
    id: 'cyberpunk_anime',
    name: 'Cyberpunk Anime',
    prompt: 'neon city street with futuristic buildings',
    template: '{prompt}, cyberpunk anime style, neon lights, futuristic, high-tech, Japanese cyberpunk'
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    prompt: 'peaceful lake with mountains and trees',
    template: '{prompt}, watercolor painting, soft washes, fluid paint, traditional watercolor technique'
  }
]

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath)
    
    https.get(url, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve(filepath)
      })
    }).on('error', (err) => {
      fs.unlink(filepath, () => {})
      reject(err)
    })
  })
}

async function generateSample(style, replicate) {
  try {
    console.log(`\n🎨 Generating: ${style.name}`)
    
    const finalPrompt = style.template.replace('{prompt}', style.prompt)
    console.log(`   Prompt: ${finalPrompt.substring(0, 80)}...`)
    
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: `${finalPrompt}, masterpiece, best quality, highly detailed`,
          negative_prompt: "blurry, bad quality, distorted, ugly, nsfw, text, watermark",
          width: 768,
          height: 768,
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 30,
          scheduler: "K_EULER"
        }
      }
    )
    
    if (output && output[0]) {
      const imageUrl = output[0]
      console.log(`   ✅ Generated successfully`)
      
      // Create directories
      const publicDir = path.join(__dirname, '../frontend/public/style-samples')
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true })
      }
      
      // Download image
      const filename = `${style.id}.jpg`
      const filepath = path.join(publicDir, filename)
      
      await downloadImage(imageUrl, filepath)
      console.log(`   💾 Saved to: frontend/public/style-samples/${filename}`)
      
      return {
        id: style.id,
        name: style.name,
        samplePath: `/style-samples/${filename}`,
        url: imageUrl
      }
    }
    
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`)
    return null
  }
}

async function main() {
  console.log('🎨 Style Sample Generator (Subset)')
  console.log('====================================')
  
  if (!process.env.REPLICATE_API_TOKEN) {
    console.error('\n❌ Missing REPLICATE_API_TOKEN')
    console.error('Add it to backend/.env file')
    process.exit(1)
  }
  
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
  })
  
  console.log(`\nGenerating ${POPULAR_STYLES.length} sample images...`)
  
  const results = []
  
  // Generate one at a time to avoid rate limits
  for (const style of POPULAR_STYLES) {
    const result = await generateSample(style, replicate)
    if (result) {
      results.push(result)
    }
    
    // Wait 3 seconds between requests
    if (POPULAR_STYLES.indexOf(style) < POPULAR_STYLES.length - 1) {
      console.log('   ⏳ Waiting 3 seconds...')
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }
  
  // Create TypeScript file with mappings
  const samples = results.reduce((acc, r) => {
    acc[r.id] = r.samplePath
    return acc
  }, {})
  
  const tsContent = `// Generated style samples
export const STYLE_SAMPLES: Record<string, string> = ${JSON.stringify(samples, null, 2)};

export default STYLE_SAMPLES;
`
  
  const tsPath = path.join(__dirname, '../shared/src/styleSamples.ts')
  fs.writeFileSync(tsPath, tsContent)
  
  console.log('\n====================================')
  console.log(`✅ Generated ${results.length}/${POPULAR_STYLES.length} samples`)
  console.log('📁 Images: frontend/public/style-samples/')
  console.log('📝 Mappings: shared/src/styleSamples.ts')
  console.log('\n✨ Done! Now update StyleSelector component.')
}

main().catch(console.error)