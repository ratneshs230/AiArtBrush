#!/usr/bin/env node

/**
 * Script to generate sample images for all art styles
 * This will create beautiful sample images showcasing each style
 */

require('dotenv').config({ path: './backend/.env' })
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

// Import Replicate
const Replicate = require('replicate').default

// Sample prompts that work well for showcasing different styles
const SAMPLE_PROMPTS = {
  // Character & Creature styles
  dnd_characters: "brave knight with glowing sword standing heroically",
  hyper_realistic_characters: "wise elderly wizard with flowing beard and crystal staff",
  '3d_rendered_characters': "futuristic robot warrior with sleek armor",
  pixar_style: "friendly dragon playing with butterflies in meadow",
  character_design_sheet: "adventurer character with backpack and tools",
  
  // Fantasy & Vibrant styles
  vibrant_fantasy: "magical floating castle in sunset clouds",
  dreamy_pastel: "peaceful fairy garden with glowing flowers",
  fantasy_settlement: "cozy medieval village with windmill",
  tarot_card_art: "mystical moon goddess with stars",
  miniature_worlds: "tiny forest village inside a teacup",
  
  // Scene styles
  semi_photorealistic_scenes: "misty mountain lake at dawn",
  battle_maps: "ancient dungeon entrance with torches",
  soviet_retro_futurism: "retro space station orbiting planet",
  synthwave_80s_retro: "neon city skyline with palm trees",
  psychedelic: "cosmic spiral of colors and patterns",
  
  // Anime styles
  general_anime: "anime hero with flowing cape on cliff",
  studio_ghibli: "peaceful countryside with rolling hills",
  '1990s_anime': "mecha pilot in cockpit preparing for battle",
  cute_kawaii_anime: "adorable cat café with pastries",
  horror_manga: "mysterious shrine in dark forest",
  cyberpunk_anime: "neon-lit street market in future Tokyo",
  
  // Traditional Art styles
  oil_paint_impasto: "sunflower field with thick brushstrokes",
  watercolor: "delicate cherry blossoms by river",
  pencil_sketch: "majestic lion portrait",
  ink_wash: "misty mountains with pine trees",
  gouache: "colorful tropical birds in jungle",
  
  // Line Art & Illustration
  line_art_simple: "minimalist cat sitting by window",
  line_art_detailed: "intricate clockwork mechanism",
  flat_illustration: "modern city park with people",
  vintage_drawing: "classic steam locomotive",
  light_drawings: "glowing butterfly made of light",
  childrens_book: "happy forest animals having tea party",
  coloring_book: "detailed mandala pattern",
  
  // Comic styles
  american_comic_sketch: "superhero in action pose",
  retro_vintage_comic: "space explorer on alien planet",
  clean_comic: "detective investigating mystery",
  jack_kirby_style: "cosmic energy explosion",
  
  // Cartoon styles
  early_1930s_cartoon: "cheerful character dancing",
  upa_style: "modern mid-century house",
  world_of_tintin: "adventurer exploring ancient temple",
  caricatures: "exaggerated portrait of scientist",
  simpsonized: "family at amusement park",
  
  // 3D & Toy styles
  lego_style: "pirate ship on ocean waves",
  claymation: "funny monster in kitchen",
  paper_toys: "origami dragon",
  
  // Traditional Media
  charcoal_drawing: "dramatic portrait in shadows",
  pastel_drawing: "soft sunset over meadow",
  ballpoint_pen: "detailed mechanical drawing",
  sharpie_art: "bold graffiti style design",
  crayon_drawing: "child-like drawing of house",
  fresco_painting: "classical mythology scene",
  
  // Print styles
  woodcut: "bold mountain landscape",
  etching: "detailed architectural view",
  stencil_art: "street art style portrait",
  papercraft: "layered paper forest scene",
  collage: "abstract composition with shapes",
  
  // Glass & Sculpture
  stained_glass: "colorful cathedral window design",
  glass_sculptures: "delicate glass flower",
  roman_sculpture: "classical marble bust",
  rodin_bronze: "thinking figure sculpture",
  porcelain: "delicate tea set with flowers",
  wool_felt: "cute felted woodland animals",
  vintage_dolls: "Victorian porcelain doll",
  
  // Art Movements
  medieval: "illuminated manuscript page",
  botticelli: "graceful figure in garden",
  northern_renaissance: "detailed still life with fruits",
  rococo: "ornate palace interior",
  baroque_rembrandt: "dramatic portrait with lighting",
  impressionism: "water lilies on pond",
  pointillism: "sunday afternoon in park",
  expressionism: "emotional abstract landscape",
  fauvism: "wild colors in landscape",
  surrealism_dali: "melting clocks in desert",
  art_nouveau_mucha: "elegant woman with flowers",
  pop_art: "colorful soup can",
  ukiyo_e: "wave with mount fuji",
  minimalism: "simple geometric shapes",
  graffiti: "urban street art mural",
  
  // Photography styles
  photorealistic_portraits: "detailed human face portrait",
  glamour_photography: "elegant fashion model",
  silhouettes: "person against sunset sky",
  bokeh: "city lights at night",
  long_exposure: "light trails on highway",
  macro_photography: "dewdrop on flower petal",
  backlit_photography: "figure in doorway",
  dramatic_black_white: "storm clouds over landscape",
  film_noir: "detective in rain",
  infrared_photography: "surreal white trees",
  analog_photography: "vintage camera and photos",
  polaroid: "instant photo memories",
  holga: "dreamy double exposure",
  very_old_photos: "sepia toned portrait",
  
  // Gaming styles
  pixel_art: "retro game character sprite",
  voxel_art: "blocky medieval castle",
  low_poly: "geometric mountain landscape",
  gta_cover_art: "action scene with vehicles",
  '80s_game_box': "retro sci-fi game cover",
  game_screens: "platformer game level",
  
  // Design styles
  minimalist_logos: "simple geometric logo",
  mascot_logos: "friendly character mascot",
  chinese_vintage_posters: "traditional Chinese art poster",
  soviet_vintage_posters: "worker propaganda poster",
  tshirt_designs: "cool graphic design",
  die_cut_stickers: "cute character sticker",
  pulp_covers: "dramatic action scene",
  
  // Default for any missing
  DEFAULT: "beautiful landscape with mountains and lake"
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath)
    const protocol = url.startsWith('https') ? https : http
    
    protocol.get(url, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close(resolve)
      })
    }).on('error', (err) => {
      fs.unlink(filepath, () => {})
      reject(err)
    })
  })
}

async function generateStyleSample(style, replicate) {
  try {
    console.log(`🎨 Generating sample for: ${style.name}`)
    
    // Get appropriate prompt for this style
    const basePrompt = SAMPLE_PROMPTS[style.id] || SAMPLE_PROMPTS.DEFAULT
    
    // Apply style template
    const styledPrompt = style.promptTemplate
      ? style.promptTemplate.replace('{prompt}', basePrompt)
      : `${basePrompt}, ${style.name} style`
    
    // Add quality modifiers
    const finalPrompt = `${styledPrompt}, masterpiece, best quality, highly detailed, professional`
    
    console.log(`   Prompt: ${finalPrompt.substring(0, 100)}...`)
    
    // Generate image using Stable Diffusion XL
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: finalPrompt,
          negative_prompt: "blurry, bad quality, distorted, ugly, nsfw",
          width: 512,
          height: 512,
          num_outputs: 1,
          guidance_scale: style.parameters?.guidanceScale || 7.5,
          num_inference_steps: 25,
          scheduler: "K_EULER"
        }
      }
    )
    
    if (output && output[0]) {
      const imageUrl = output[0]
      console.log(`   ✅ Generated: ${imageUrl}`)
      
      // Download and save the image
      const filename = `${style.id}.png`
      const filepath = path.join(__dirname, '../public/style-samples', filename)
      
      // Create directory if it doesn't exist
      const dir = path.dirname(filepath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      
      await downloadImage(imageUrl, filepath)
      console.log(`   💾 Saved as: ${filename}`)
      
      return {
        styleId: style.id,
        sampleImage: `/style-samples/${filename}`,
        generatedUrl: imageUrl
      }
    }
    
    throw new Error('No image generated')
    
  } catch (error) {
    console.error(`   ❌ Failed to generate sample for ${style.name}:`, error.message)
    return null
  }
}

async function main() {
  console.log('🎨 Art Style Sample Generator')
  console.log('================================\n')
  
  // Check for API token
  if (!process.env.REPLICATE_API_TOKEN) {
    console.error('❌ REPLICATE_API_TOKEN not found in environment')
    console.error('Please set it in backend/.env file')
    process.exit(1)
  }
  
  // Initialize Replicate
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
  })
  
  // Load art styles
  const artStylesPath = path.join(__dirname, '../shared/src/artStyles.ts')
  const artStylesContent = fs.readFileSync(artStylesPath, 'utf8')
  
  // Extract styles (simplified parsing)
  const styleMatches = artStylesContent.matchAll(/{\s*id:\s*['"]([^'"]+)['"]/g)
  const styleIds = Array.from(styleMatches).map(match => match[1])
  
  console.log(`Found ${styleIds.length} styles to generate samples for\n`)
  
  // Import the actual styles
  const { ART_STYLES } = require('../shared/dist/artStyles.js')
  
  const results = []
  const BATCH_SIZE = 5 // Process in batches to avoid rate limits
  
  for (let i = 0; i < ART_STYLES.length; i += BATCH_SIZE) {
    const batch = ART_STYLES.slice(i, Math.min(i + BATCH_SIZE, ART_STYLES.length))
    
    console.log(`\nProcessing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(ART_STYLES.length/BATCH_SIZE)}`)
    console.log('----------------------------------------')
    
    const batchResults = await Promise.all(
      batch.map(style => generateStyleSample(style, replicate))
    )
    
    results.push(...batchResults.filter(r => r !== null))
    
    // Wait between batches to avoid rate limits
    if (i + BATCH_SIZE < ART_STYLES.length) {
      console.log('\n⏳ Waiting 5 seconds before next batch...')
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
  
  // Save results mapping
  const outputPath = path.join(__dirname, '../shared/src/styleSamples.json')
  const mapping = results.reduce((acc, result) => {
    acc[result.styleId] = result.sampleImage
    return acc
  }, {})
  
  fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2))
  
  console.log('\n================================')
  console.log(`✅ Generated ${results.length}/${ART_STYLES.length} style samples`)
  console.log(`📁 Images saved to: public/style-samples/`)
  console.log(`📄 Mapping saved to: shared/src/styleSamples.json`)
  
  // Update TypeScript types
  const typesContent = `// Auto-generated style sample mappings
export const STYLE_SAMPLES: Record<string, string> = ${JSON.stringify(mapping, null, 2)};
`
  
  fs.writeFileSync(
    path.join(__dirname, '../shared/src/styleSamples.ts'),
    typesContent
  )
  
  console.log(`📝 TypeScript mappings saved to: shared/src/styleSamples.ts`)
  console.log('\n🎉 Style sample generation complete!')
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})