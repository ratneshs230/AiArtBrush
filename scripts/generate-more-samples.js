#!/usr/bin/env node

/**
 * Generate sample images for more popular styles
 */

require('dotenv').config({ path: './backend/.env' })
const fs = require('fs')
const path = require('path')
const https = require('https')

const Replicate = require('replicate')

// Additional popular styles to generate
const MORE_STYLES = [
  {
    id: 'studio_ghibli',
    name: 'Studio Ghibli',
    prompt: 'peaceful countryside with rolling hills and clouds',
    template: '{prompt}, Studio Ghibli style, anime, hand-drawn, whimsical, detailed background, soft colors'
  },
  {
    id: 'pop_art',
    name: 'Pop Art',
    prompt: 'colorful portrait with bold patterns',
    template: '{prompt}, pop art style, Andy Warhol inspired, bold colors, high contrast, comic book style'
  },
  {
    id: 'art_nouveau_mucha',
    name: 'Art Nouveau (Mucha)',
    prompt: 'elegant woman with flowing hair and flowers',
    template: '{prompt}, Art Nouveau style, Alphonse Mucha inspired, decorative, ornate borders, flowing lines'
  },
  {
    id: 'surrealism_dali',
    name: 'Surrealism (Dali)',
    prompt: 'melting clocks in desert landscape',
    template: '{prompt}, surrealism, Salvador Dali style, dreamlike, bizarre, detailed, impossible geometry'
  },
  {
    id: 'low_poly',
    name: 'Low Poly 3D',
    prompt: 'geometric mountain landscape with trees',
    template: '{prompt}, low poly 3D art, geometric shapes, flat shading, minimalist 3D, angular design'
  },
  {
    id: 'stained_glass',
    name: 'Stained Glass',
    prompt: 'colorful phoenix with spread wings',
    template: '{prompt}, stained glass window, cathedral glass art, translucent, colored glass pieces, lead lines'
  },
  {
    id: 'ukiyo_e',
    name: 'Ukiyo-e (Japanese Woodblock)',
    prompt: 'great wave with mount fuji',
    template: '{prompt}, ukiyo-e style, Japanese woodblock print, Hokusai inspired, traditional Japanese art'
  },
  {
    id: 'psychedelic',
    name: 'Psychedelic',
    prompt: 'cosmic spiral with rainbow colors',
    template: '{prompt}, psychedelic art, trippy, vibrant colors, swirling patterns, 1960s style, fractal-like'
  },
  {
    id: 'miniature_worlds',
    name: 'Miniature Worlds',
    prompt: 'tiny village inside a teacup',
    template: '{prompt}, miniature world, diorama, tiny detailed scene, macro photography style, intricate details'
  },
  {
    id: 'synthwave_80s_retro',
    name: 'Synthwave/80s Retro',
    prompt: 'neon city with palm trees and sunset',
    template: '{prompt}, synthwave, vaporwave, 80s aesthetic, neon colors, retro-futuristic, Miami Vice style'
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
          prompt: `${finalPrompt}, masterpiece, best quality, highly detailed, professional artwork`,
          negative_prompt: "blurry, bad quality, distorted, ugly, nsfw, text, watermark, signature",
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
  console.log('🎨 Additional Style Sample Generator')
  console.log('=====================================')
  
  if (!process.env.REPLICATE_API_TOKEN) {
    console.error('\n❌ Missing REPLICATE_API_TOKEN')
    console.error('Add it to backend/.env file')
    process.exit(1)
  }
  
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
  })
  
  console.log(`\nGenerating ${MORE_STYLES.length} additional sample images...`)
  
  const results = []
  
  // Generate one at a time to avoid rate limits
  for (const style of MORE_STYLES) {
    const result = await generateSample(style, replicate)
    if (result) {
      results.push(result)
    }
    
    // Wait 3 seconds between requests
    if (MORE_STYLES.indexOf(style) < MORE_STYLES.length - 1) {
      console.log('   ⏳ Waiting 3 seconds...')
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }
  
  // Load existing samples
  const tsPath = path.join(__dirname, '../shared/src/styleSamples.ts')
  const existingContent = fs.readFileSync(tsPath, 'utf8')
  const existingMatch = existingContent.match(/export const STYLE_SAMPLES[^{]*{([^}]*)}/s)
  
  let existingSamples = {}
  if (existingMatch) {
    try {
      // Parse existing samples
      eval(`existingSamples = {${existingMatch[1]}}`)
    } catch (e) {
      console.error('Could not parse existing samples')
    }
  }
  
  // Merge with new samples
  const allSamples = { ...existingSamples }
  results.forEach(r => {
    allSamples[r.id] = r.samplePath
  })
  
  // Write updated TypeScript file
  const tsContent = `// Generated style samples
export const STYLE_SAMPLES: Record<string, string> = ${JSON.stringify(allSamples, null, 2)};

export default STYLE_SAMPLES;
`
  
  fs.writeFileSync(tsPath, tsContent)
  
  console.log('\n=====================================')
  console.log(`✅ Generated ${results.length}/${MORE_STYLES.length} additional samples`)
  console.log(`📁 Total samples now: ${Object.keys(allSamples).length}`)
  console.log('📝 Updated: shared/src/styleSamples.ts')
  console.log('\n✨ Rebuild shared package with: npm run build:shared')
}

main().catch(console.error)