#!/usr/bin/env node

/**
 * Generate sample images for ALL styles that don't have samples yet
 */

require('dotenv').config({ path: './backend/.env' })
const fs = require('fs')
const path = require('path')
const https = require('https')

const Replicate = require('replicate')

// Import the actual styles from compiled shared package
const { ART_STYLES } = require('../shared/dist/artStyles.js')
const { STYLE_SAMPLES } = require('../shared/dist/styleSamples.js')

// Sample prompts optimized for each category
const CATEGORY_PROMPTS = {
  illustration: "magical forest with glowing trees and fireflies",
  anime: "hero character standing on cliff at sunset",
  comics: "superhero in action pose with cape flowing",
  traditional: "majestic mountain landscape with lake",
  movements: "abstract composition with bold shapes",
  photography: "portrait of person in dramatic lighting",
  gaming: "fantasy castle with floating islands",
  character: "warrior with magical sword and armor",
  fantasy: "dragon flying over enchanted kingdom",
  scene: "bustling medieval marketplace",
  
  // Default fallback
  DEFAULT: "beautiful landscape with mountains, lake and sunset sky"
}

// Specific prompts for unique styles
const STYLE_SPECIFIC_PROMPTS = {
  dnd_characters: "brave paladin knight with glowing sword and shield",
  hyper_realistic_characters: "wise elderly wizard with crystal staff",
  '3d_rendered_characters': "futuristic robot warrior",
  pixar_style: "friendly dragon with big eyes",
  character_design_sheet: "adventurer character turnaround",
  
  vibrant_fantasy: "floating castle in colorful clouds",
  dreamy_pastel: "fairy garden with soft flowers",
  fantasy_settlement: "cozy village with windmill",
  tarot_card_art: "mystical moon goddess card",
  miniature_worlds: "tiny city inside a bottle",
  
  semi_photorealistic_scenes: "misty forest path at dawn",
  battle_maps: "dungeon entrance with torches",
  soviet_retro_futurism: "retro space station",
  synthwave_80s_retro: "neon city with palm trees",
  psychedelic: "swirling rainbow fractals",
  
  studio_ghibli: "peaceful countryside hills",
  '1990s_anime': "mecha robot pilot",
  cute_kawaii_anime: "adorable cat cafe",
  horror_manga: "dark forest shrine",
  
  oil_paint_impasto: "sunflower field painting",
  watercolor: "cherry blossoms by river",
  pencil_sketch: "lion portrait sketch",
  ink_wash: "mountains in mist",
  gouache: "tropical birds",
  
  line_art_simple: "cat by window outline",
  line_art_detailed: "clockwork mechanism",
  flat_illustration: "modern city park",
  vintage_drawing: "steam locomotive",
  light_drawings: "glowing butterfly",
  childrens_book: "animals having tea party",
  coloring_book: "mandala pattern",
  
  american_comic_sketch: "superhero sketch",
  retro_vintage_comic: "space explorer",
  clean_comic: "detective character",
  jack_kirby_style: "cosmic energy burst",
  
  early_1930s_cartoon: "cheerful character",
  upa_style: "mid-century house",
  world_of_tintin: "explorer in temple",
  caricatures: "exaggerated scientist",
  simpsonized: "family at park",
  shrek_omatic: "ogre in swamp",
  smurfed: "mushroom village",
  lego_style: "pirate ship blocks",
  
  claymation: "clay monster character",
  paper_toys: "origami dragon",
  stained_glass: "phoenix window",
  glass_sculptures: "glass flower art",
  
  medieval: "illuminated manuscript",
  botticelli: "graceful figure",
  northern_renaissance: "still life fruits",
  rococo: "ornate palace",
  baroque_rembrandt: "dramatic portrait",
  
  impressionism: "water lilies pond",
  palette_knife: "thick paint landscape",
  heavy_impasto: "textured mountain",
  pointillism: "park scene dots",
  expressionism: "emotional landscape",
  fauvism: "wild color landscape",
  surrealism_dali: "melting clocks",
  art_nouveau_mucha: "woman with flowers",
  pop_art: "colorful soup can",
  
  ukiyo_e: "wave with mountain",
  european_naive_folk: "village celebration",
  traditional_chinese_painting: "bamboo and birds",
  minimalism: "geometric shapes",
  graffiti: "street art mural",
  neon_rhythms: "neon light patterns",
  abstract_glass: "colored glass abstract",
  
  photorealistic_portraits: "detailed face portrait",
  glamour_photography: "fashion model",
  silhouettes: "person at sunset",
  bokeh: "city lights blur",
  long_exposure: "light trails",
  macro_photography: "dewdrop on petal",
  backlit_photography: "figure in doorway",
  dramatic_black_white: "storm clouds",
  film_noir: "detective in rain",
  infrared_photography: "white trees",
  analog_photography: "vintage camera",
  polaroid: "instant photo",
  holga: "dreamy exposure",
  very_old_photos: "sepia portrait",
  
  pixel_art: "retro game castle",
  voxel_art: "blocky landscape",
  low_poly: "geometric mountains",
  gta_cover_art: "action scene",
  '80s_game_box': "sci-fi game cover",
  game_screens: "platformer level",
  
  minimalist_logos: "simple logo design",
  mascot_logos: "friendly mascot",
  chinese_vintage_posters: "traditional poster",
  soviet_vintage_posters: "propaganda poster",
  tshirt_designs: "cool graphic",
  die_cut_stickers: "cute sticker",
  pulp_covers: "action book cover",
  
  toonyou: "cartoon version portrait",
  
  // Add more specific prompts as needed
}

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
    // Skip if already has sample
    if (STYLE_SAMPLES[style.id]) {
      console.log(`   ⏭️  Skipping ${style.name} (already has sample)`)
      return null
    }
    
    console.log(`\n🎨 Generating: ${style.name} (${style.id})`)
    
    // Get appropriate prompt
    let basePrompt = STYLE_SPECIFIC_PROMPTS[style.id]
    if (!basePrompt) {
      // Try to match by category
      const categoryId = style.category?.id
      basePrompt = CATEGORY_PROMPTS[categoryId] || CATEGORY_PROMPTS.DEFAULT
    }
    
    // Apply style template
    const styledPrompt = style.promptTemplate
      ? style.promptTemplate.replace('{prompt}', basePrompt)
      : `${basePrompt}, ${style.name} style, ${style.description || ''}`
    
    // Add quality modifiers
    const finalPrompt = `${styledPrompt}, masterpiece, best quality, highly detailed, professional artwork`
    
    console.log(`   Prompt: ${finalPrompt.substring(0, 80)}...`)
    
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: finalPrompt,
          negative_prompt: "blurry, bad quality, distorted, ugly, nsfw, text, watermark, signature, amateur",
          width: 768,
          height: 768,
          num_outputs: 1,
          guidance_scale: style.parameters?.guidanceScale || 7.5,
          num_inference_steps: 25,
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
      console.log(`   💾 Saved to: ${filename}`)
      
      return {
        id: style.id,
        name: style.name,
        samplePath: `/style-samples/${filename}`
      }
    }
    
  } catch (error) {
    console.error(`   ❌ Failed for ${style.name}: ${error.message}`)
    return null
  }
}

async function main() {
  console.log('🎨 Complete Style Sample Generator')
  console.log('===================================')
  
  if (!process.env.REPLICATE_API_TOKEN) {
    console.error('\n❌ Missing REPLICATE_API_TOKEN')
    console.error('Add it to backend/.env file')
    process.exit(1)
  }
  
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
  })
  
  // Filter styles that need samples
  const stylesToGenerate = ART_STYLES.filter(style => !STYLE_SAMPLES[style.id])
  
  console.log(`\n📊 Status:`)
  console.log(`   Total styles: ${ART_STYLES.length}`)
  console.log(`   Have samples: ${Object.keys(STYLE_SAMPLES).length}`)
  console.log(`   Need samples: ${stylesToGenerate.length}`)
  
  if (stylesToGenerate.length === 0) {
    console.log('\n✅ All styles already have samples!')
    return
  }
  
  console.log(`\n🚀 Generating ${stylesToGenerate.length} missing samples...`)
  console.log('   This will take approximately', Math.ceil(stylesToGenerate.length * 4 / 60), 'minutes')
  
  const results = []
  const BATCH_SIZE = 3 // Process 3 at a time
  
  for (let i = 0; i < stylesToGenerate.length; i += BATCH_SIZE) {
    const batch = stylesToGenerate.slice(i, Math.min(i + BATCH_SIZE, stylesToGenerate.length))
    
    console.log(`\n📦 Batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(stylesToGenerate.length/BATCH_SIZE)}`)
    console.log('=' .repeat(40))
    
    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map(style => generateSample(style, replicate))
    )
    
    results.push(...batchResults.filter(r => r !== null))
    
    // Wait between batches to avoid rate limits
    if (i + BATCH_SIZE < stylesToGenerate.length) {
      console.log('\n⏳ Waiting 5 seconds before next batch...')
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
  
  // Merge with existing samples
  const allSamples = { ...STYLE_SAMPLES }
  results.forEach(r => {
    allSamples[r.id] = r.samplePath
  })
  
  // Sort alphabetically for cleaner file
  const sortedSamples = Object.keys(allSamples)
    .sort()
    .reduce((acc, key) => {
      acc[key] = allSamples[key]
      return acc
    }, {})
  
  // Write updated TypeScript file
  const tsContent = `// Generated style samples - Total: ${Object.keys(sortedSamples).length} styles
export const STYLE_SAMPLES: Record<string, string> = ${JSON.stringify(sortedSamples, null, 2)};

export default STYLE_SAMPLES;
`
  
  const tsPath = path.join(__dirname, '../shared/src/styleSamples.ts')
  fs.writeFileSync(tsPath, tsContent)
  
  console.log('\n' + '=' .repeat(40))
  console.log('📊 Final Results:')
  console.log(`   ✅ Generated: ${results.length}`)
  console.log(`   ⏭️  Skipped: ${stylesToGenerate.length - results.length}`)
  console.log(`   📁 Total samples: ${Object.keys(sortedSamples).length}/${ART_STYLES.length}`)
  console.log('\n📝 Updated: shared/src/styleSamples.ts')
  console.log('🔨 Next step: npm run build:shared')
  console.log('\n✨ Sample generation complete!')
}

main().catch(console.error)