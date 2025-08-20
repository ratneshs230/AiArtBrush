import type { ArtCategory, ArtStyle } from './types'

// Art Categories
export const ART_CATEGORIES: ArtCategory[] = [
  {
    id: 'illustration',
    name: 'Illustration & Digital Art',
    description: 'Character design, fantasy art, and digital illustrations',
    icon: '🎨',
    subcategories: ['Character & Creature Design', 'Fantasy & Sci-Fi', 'General Illustration']
  },
  {
    id: 'anime',
    name: 'Anime & Manga',
    description: 'Japanese animation and manga art styles',
    icon: '🗾',
    subcategories: ['General Anime', 'Studio Ghibli', 'Cute & Kawaii', 'Horror', 'Sci-Fi']
  },
  {
    id: 'comics',
    name: 'Comics & Cartoons',
    description: 'Comic book styles and cartoon aesthetics',
    icon: '💭',
    subcategories: ['Comic Book Styles', 'Cartoon Styles', 'Pop Culture Parody']
  },
  {
    id: 'traditional',
    name: 'Art Media & Techniques',
    description: 'Traditional art mediums and techniques',
    icon: '🖌️',
    subcategories: ['Painting & Drawing', 'Printmaking & Papercraft', 'Sculpture & Crafts']
  },
  {
    id: 'movements',
    name: 'Art Styles & Movements',
    description: 'Historical art movements and styles',
    icon: '🏛️',
    subcategories: ['Pre-Modern', 'Modern (19th-20th Century)', 'Global & Folk Styles', 'Contemporary']
  },
  {
    id: 'photography',
    name: 'Photography',
    description: 'Photographic styles and techniques',
    icon: '📷',
    subcategories: ['Portraits & Subjects', 'Techniques & Effects', 'Aesthetics & Moods', 'Formats & Emulation']
  },
  {
    id: 'gaming',
    name: 'Gaming & Commercial Art',
    description: 'Video game art and commercial design',
    icon: '🎮',
    subcategories: ['Video Game Art', 'Commercial & Graphic Design']
  }
]

// Comprehensive Art Styles Database
export const ART_STYLES: ArtStyle[] = [
  // Illustration & Digital Art - Character & Creature Design
  {
    id: 'dnd_characters',
    name: 'D&D Characters',
    category: ART_CATEGORIES[0],
    subcategory: 'Character & Creature Design',
    description: 'Fantasy character designs inspired by Dungeons & Dragons',
    promptTemplate: '{prompt}, fantasy character design, D&D style, detailed armor and weapons, medieval fantasy aesthetic, character portrait',
    parameters: { strength: 0.3, guidanceScale: 8.0 },
    tags: ['fantasy', 'character', 'medieval', 'rpg'],
    isPopular: true
  },
  {
    id: 'hyper_realistic_characters',
    name: 'Hyper-realistic Characters',
    category: ART_CATEGORIES[0],
    subcategory: 'Character & Creature Design',
    description: 'Ultra-realistic character portraits with lifelike details',
    promptTemplate: '{prompt}, hyper-realistic character portrait, photorealistic, extremely detailed, studio lighting, professional photography quality',
    parameters: { strength: 0.4, guidanceScale: 9.0 },
    tags: ['realistic', 'portrait', 'detailed', 'photography'],
    isPopular: true
  },
  {
    id: '3d_rendered_characters',
    name: '3D Rendered Characters',
    category: ART_CATEGORIES[0],
    subcategory: 'Character & Creature Design',
    description: 'Modern 3D rendered character designs',
    promptTemplate: '{prompt}, 3D rendered character, octane render, unreal engine, subsurface scattering, volumetric lighting, high quality 3D model',
    parameters: { strength: 0.35 },
    tags: ['3d', 'render', 'modern', 'digital']
  },
  {
    id: 'pixar_style',
    name: 'Pixar Style',
    category: ART_CATEGORIES[0],
    subcategory: 'Character & Creature Design',
    description: 'Animated characters in Pixar animation style',
    promptTemplate: '{prompt}, Pixar animation style, 3D animated character, colorful, wholesome, family-friendly, smooth shading',
    parameters: { strength: 0.4, guidanceScale: 7.5 },
    tags: ['pixar', 'animation', '3d', 'family-friendly'],
    isPopular: true
  },
  {
    id: 'character_design_sheet',
    name: 'Character Design Sheet',
    category: ART_CATEGORIES[0],
    subcategory: 'Character & Creature Design',
    description: 'Technical character reference sheets with multiple views',
    promptTemplate: '{prompt}, character design sheet, turnaround, front view, side view, back view, character reference, concept art, white background',
    parameters: { strength: 0.3 },
    tags: ['reference', 'turnaround', 'concept', 'design']
  },

  // Illustration & Digital Art - Fantasy & Sci-Fi
  {
    id: 'vibrant_fantasy',
    name: 'Vibrant Fantasy',
    category: ART_CATEGORIES[0],
    subcategory: 'Fantasy & Sci-Fi',
    description: 'Colorful and magical fantasy artwork',
    promptTemplate: '{prompt}, vibrant fantasy art, magical, enchanted, bright colors, fantasy landscape, mystical atmosphere',
    parameters: { strength: 0.3, guidanceScale: 7.5 },
    tags: ['fantasy', 'magical', 'colorful', 'vibrant'],
    isPopular: true
  },
  {
    id: 'dreamy_pastel',
    name: 'Dreamy Pastel',
    category: ART_CATEGORIES[0],
    subcategory: 'Fantasy & Sci-Fi',
    description: 'Soft, dreamy artwork with pastel colors',
    promptTemplate: '{prompt}, dreamy pastel colors, soft lighting, ethereal, magical atmosphere, fantasy, pastel color palette',
    parameters: { strength: 0.25, guidanceScale: 6.5 },
    tags: ['pastel', 'dreamy', 'soft', 'ethereal']
  },
  {
    id: 'fantasy_settlement',
    name: 'Fantasy Settlement',
    category: ART_CATEGORIES[0],
    subcategory: 'Fantasy & Sci-Fi',
    description: 'Medieval fantasy towns and settlements',
    promptTemplate: '{prompt}, fantasy settlement, medieval town, fantasy architecture, detailed buildings, atmospheric perspective',
    parameters: { strength: 0.35 },
    tags: ['settlement', 'medieval', 'architecture', 'town']
  },
  {
    id: 'tarot_card_art',
    name: 'Tarot Card Art',
    category: ART_CATEGORIES[0],
    subcategory: 'Fantasy & Sci-Fi',
    description: 'Mystical tarot card artwork with symbolic elements',
    promptTemplate: '{prompt}, tarot card art, mystical, symbolic, ornate border, esoteric, spiritual, detailed illustration',
    parameters: { strength: 0.3, guidanceScale: 8.0 },
    tags: ['tarot', 'mystical', 'symbolic', 'spiritual']
  },
  {
    id: 'miniature_worlds',
    name: 'Miniature Worlds',
    category: ART_CATEGORIES[0],
    subcategory: 'Fantasy & Sci-Fi',
    description: 'Tiny detailed worlds and dioramas',
    promptTemplate: '{prompt}, miniature world, diorama, tiny detailed scene, macro photography style, intricate details',
    parameters: { strength: 0.3 },
    tags: ['miniature', 'diorama', 'detailed', 'tiny']
  },
  {
    id: 'semi_photorealistic_scenes',
    name: 'Semi-photorealistic Scenes',
    category: ART_CATEGORIES[0],
    subcategory: 'Fantasy & Sci-Fi',
    description: 'Realistic fantasy scenes with cinematic quality',
    promptTemplate: '{prompt}, semi-photorealistic, cinematic lighting, detailed environment, fantasy realism, movie quality',
    parameters: { strength: 0.4, guidanceScale: 8.5 },
    tags: ['photorealistic', 'cinematic', 'detailed', 'movie']
  },
  {
    id: 'battle_maps',
    name: 'Battle Maps',
    category: ART_CATEGORIES[0],
    subcategory: 'Fantasy & Sci-Fi',
    description: 'Top-down tactical battle maps for gaming',
    promptTemplate: '{prompt}, battle map, top-down view, tactical map, grid overlay, fantasy terrain, detailed battleground',
    parameters: { strength: 0.35 },
    tags: ['battle', 'map', 'tactical', 'gaming']
  },
  {
    id: 'soviet_retro_futurism',
    name: 'Soviet Retro-futurism',
    category: ART_CATEGORIES[0],
    subcategory: 'Fantasy & Sci-Fi',
    description: 'Retro-futuristic art inspired by Soviet space age design',
    promptTemplate: '{prompt}, Soviet retro-futurism, space age design, brutalist architecture, red and orange color scheme, vintage sci-fi',
    parameters: { strength: 0.35 },
    tags: ['soviet', 'retro', 'futurism', 'space-age']
  },
  {
    id: 'synthwave_80s_retro',
    name: 'Synthwave & 80s Retro',
    category: ART_CATEGORIES[0],
    subcategory: 'Fantasy & Sci-Fi',
    description: 'Neon-soaked 80s synthwave aesthetic',
    promptTemplate: '{prompt}, synthwave, 80s retro, neon colors, grid patterns, sunset gradient, cyberpunk aesthetic, retrowave',
    parameters: { strength: 0.4, guidanceScale: 7.5 },
    tags: ['synthwave', '80s', 'neon', 'retro'],
    isPopular: true
  },
  {
    id: 'psychedelic',
    name: 'Psychedelic',
    category: ART_CATEGORIES[0],
    subcategory: 'Fantasy & Sci-Fi',
    description: 'Trippy psychedelic art with surreal elements',
    promptTemplate: '{prompt}, psychedelic art, surreal, trippy, kaleidoscope patterns, vibrant swirling colors, mind-bending',
    parameters: { strength: 0.4 },
    tags: ['psychedelic', 'surreal', 'trippy', 'colorful']
  },

  // Anime & Manga
  {
    id: 'general_anime',
    name: 'General Anime Style',
    category: ART_CATEGORIES[1],
    subcategory: 'General Anime',
    description: 'Classic anime art style',
    promptTemplate: '{prompt}, anime art style, manga style, cell shading, anime character, Japanese animation',
    parameters: { strength: 0.35, guidanceScale: 7.0 },
    tags: ['anime', 'manga', 'japanese', 'cell-shading'],
    isPopular: true
  },
  {
    id: 'studio_ghibli',
    name: 'Studio Ghibli Style',
    category: ART_CATEGORIES[1],
    subcategory: 'Studio Ghibli',
    description: 'Magical Studio Ghibli animation style',
    promptTemplate: '{prompt}, Studio Ghibli style, Miyazaki art, whimsical, magical, detailed background, soft colors',
    parameters: { strength: 0.4, guidanceScale: 7.5 },
    tags: ['ghibli', 'miyazaki', 'whimsical', 'magical'],
    isPopular: true
  },
  {
    id: '1990s_anime',
    name: '1990s Anime',
    category: ART_CATEGORIES[1],
    subcategory: 'General Anime',
    description: 'Classic 90s anime aesthetic',
    promptTemplate: '{prompt}, 1990s anime style, retro anime, vintage animation, classic anime aesthetic, 90s art style',
    parameters: { strength: 0.35 },
    tags: ['90s', 'retro', 'vintage', 'classic']
  },
  {
    id: 'cute_kawaii_anime',
    name: 'Cute & Kawaii Anime (Chibi)',
    category: ART_CATEGORIES[1],
    subcategory: 'Cute & Kawaii',
    description: 'Adorable chibi and kawaii style characters',
    promptTemplate: '{prompt}, kawaii style, chibi character, cute anime, adorable, big eyes, pastel colors, super deformed',
    parameters: { strength: 0.3, guidanceScale: 6.5 },
    tags: ['kawaii', 'chibi', 'cute', 'adorable'],
    isPopular: true
  },
  {
    id: 'horror_manga',
    name: 'Horror (J-Horror, Horror Manga)',
    category: ART_CATEGORIES[1],
    subcategory: 'Horror',
    description: 'Dark and atmospheric Japanese horror manga style',
    promptTemplate: '{prompt}, horror manga style, J-horror, dark atmosphere, detailed line work, creepy, unsettling',
    parameters: { strength: 0.4, negativePrompt: 'cute, colorful, happy, bright' },
    tags: ['horror', 'dark', 'creepy', 'manga']
  },
  {
    id: 'cyberpunk_anime',
    name: 'Sci-Fi (Cyberpunk Anime, Mecha)',
    category: ART_CATEGORIES[1],
    subcategory: 'Sci-Fi',
    description: 'Futuristic cyberpunk and mecha anime style',
    promptTemplate: '{prompt}, cyberpunk anime, mecha style, futuristic, sci-fi anime, detailed mechanical, neon accents',
    parameters: { strength: 0.35, guidanceScale: 8.0 },
    tags: ['cyberpunk', 'mecha', 'sci-fi', 'futuristic']
  },

  // Traditional Art Media & Techniques
  {
    id: 'oil_paint_impasto',
    name: 'Oil Paint (Impasto)',
    category: ART_CATEGORIES[3],
    subcategory: 'Painting & Drawing',
    description: 'Thick oil paint with visible brushstrokes',
    promptTemplate: '{prompt}, oil painting, impasto technique, thick paint, visible brushstrokes, traditional painting',
    parameters: { strength: 0.3, guidanceScale: 7.0 },
    tags: ['oil', 'painting', 'impasto', 'traditional'],
    isPopular: true
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    category: ART_CATEGORIES[3],
    subcategory: 'Painting & Drawing',
    description: 'Flowing watercolor painting technique',
    promptTemplate: '{prompt}, watercolor painting, soft washes, transparent colors, flowing paint, paper texture',
    parameters: { strength: 0.25, guidanceScale: 6.5 },
    tags: ['watercolor', 'soft', 'flowing', 'transparent'],
    isPopular: true
  },
  {
    id: 'pencil_sketch',
    name: 'Pencil Sketch',
    category: ART_CATEGORIES[3],
    subcategory: 'Painting & Drawing',
    description: 'Traditional pencil drawing and sketching',
    promptTemplate: '{prompt}, pencil sketch, graphite drawing, detailed line work, shading, traditional drawing',
    parameters: { strength: 0.3 },
    tags: ['pencil', 'sketch', 'drawing', 'traditional']
  },
  {
    id: 'ink_wash',
    name: 'Ink and Wash',
    category: ART_CATEGORIES[3],
    subcategory: 'Painting & Drawing',
    description: 'Traditional Chinese ink painting technique',
    promptTemplate: '{prompt}, ink and wash painting, Chinese ink painting, sumi-e, monochrome, flowing brushstrokes',
    parameters: { strength: 0.3, guidanceScale: 7.0 },
    tags: ['ink', 'wash', 'chinese', 'monochrome']
  },

  // Illustration & Digital Art - General Illustration
  {
    id: 'line_art_simple',
    name: 'Line Art (Simple)',
    category: ART_CATEGORIES[0],
    subcategory: 'General Illustration',
    description: 'Clean, simple line drawings with minimal detail',
    promptTemplate: '{prompt}, simple line art, clean lines, minimal detail, black and white line drawing',
    parameters: { strength: 0.3 },
    tags: ['line-art', 'simple', 'clean', 'minimal']
  },
  {
    id: 'line_art_detailed',
    name: 'Line Art (Detailed)',
    category: ART_CATEGORIES[0],
    subcategory: 'General Illustration',
    description: 'Intricate line drawings with complex details',
    promptTemplate: '{prompt}, detailed line art, intricate lines, complex illustration, fine line work',
    parameters: { strength: 0.35 },
    tags: ['line-art', 'detailed', 'intricate', 'complex']
  },
  {
    id: 'flat_illustration',
    name: 'Flat Illustration (Vector)',
    category: ART_CATEGORIES[0],
    subcategory: 'General Illustration',
    description: 'Modern flat design with solid colors and geometric shapes',
    promptTemplate: '{prompt}, flat illustration, vector art, solid colors, geometric shapes, modern design',
    parameters: { strength: 0.35, guidanceScale: 7.0 },
    tags: ['flat', 'vector', 'modern', 'geometric'],
    isPopular: true
  },
  {
    id: 'vintage_drawing',
    name: 'Vintage Drawing',
    category: ART_CATEGORIES[0],
    subcategory: 'General Illustration',
    description: 'Classic vintage illustration style',
    promptTemplate: '{prompt}, vintage illustration, retro drawing, classic art style, aged paper texture',
    parameters: { strength: 0.3 },
    tags: ['vintage', 'retro', 'classic', 'aged']
  },
  {
    id: 'light_drawings',
    name: 'Light Drawings',
    category: ART_CATEGORIES[0],
    subcategory: 'General Illustration',
    description: 'Ethereal drawings with light effects and glowing elements',
    promptTemplate: '{prompt}, light drawing, ethereal, glowing effects, luminous, bright highlights',
    parameters: { strength: 0.3, guidanceScale: 6.5 },
    tags: ['light', 'ethereal', 'glowing', 'luminous']
  },
  {
    id: 'childrens_book',
    name: "Children's Book Illustration",
    category: ART_CATEGORIES[0],
    subcategory: 'General Illustration',
    description: 'Whimsical illustrations perfect for children\'s books',
    promptTemplate: '{prompt}, children\'s book illustration, whimsical, colorful, friendly, storybook art',
    parameters: { strength: 0.3, guidanceScale: 6.5 },
    tags: ['children', 'whimsical', 'storybook', 'friendly'],
    isPopular: true
  },
  {
    id: 'coloring_book',
    name: 'Coloring Book Pages',
    category: ART_CATEGORIES[0],
    subcategory: 'General Illustration',
    description: 'Black and white line art designed for coloring',
    promptTemplate: '{prompt}, coloring book page, black and white line art, outlined, no color fill',
    parameters: { strength: 0.35 },
    tags: ['coloring', 'outline', 'black-white', 'lineart']
  },

  // Comics & Cartoons - Comic Book Styles
  {
    id: 'american_comic_sketch',
    name: 'American Comic Sketch',
    category: ART_CATEGORIES[2],
    subcategory: 'Comic Book Styles',
    description: 'Classic American comic book style with bold lines',
    promptTemplate: '{prompt}, American comic book style, bold lines, dynamic poses, superhero art style',
    parameters: { strength: 0.4, guidanceScale: 8.0 },
    tags: ['comic', 'american', 'superhero', 'bold'],
    isPopular: true
  },
  {
    id: 'retro_vintage_comic',
    name: 'Retro & Vintage Comic',
    category: ART_CATEGORIES[2],
    subcategory: 'Comic Book Styles',
    description: 'Classic vintage comic book aesthetic',
    promptTemplate: '{prompt}, vintage comic book, retro comic style, halftone dots, classic comic art',
    parameters: { strength: 0.35 },
    tags: ['vintage', 'retro', 'comic', 'halftone']
  },
  {
    id: 'clean_comic',
    name: 'Clean Comic',
    category: ART_CATEGORIES[2],
    subcategory: 'Comic Book Styles',
    description: 'Modern clean comic book style with crisp lines',
    promptTemplate: '{prompt}, clean comic book style, crisp lines, modern comic art, clear illustration',
    parameters: { strength: 0.35, guidanceScale: 7.5 },
    tags: ['clean', 'modern', 'comic', 'crisp']
  },
  {
    id: 'jack_kirby_style',
    name: 'Jack Kirby Style',
    category: ART_CATEGORIES[2],
    subcategory: 'Comic Book Styles',
    description: 'Dynamic comic style inspired by Jack Kirby\'s artwork',
    promptTemplate: '{prompt}, Jack Kirby style, dynamic comic art, cosmic energy, bold dramatic poses',
    parameters: { strength: 0.4, guidanceScale: 8.5 },
    tags: ['kirby', 'dynamic', 'cosmic', 'dramatic']
  },

  // Comics & Cartoons - Cartoon Styles
  {
    id: 'early_1930s_cartoon',
    name: 'Early 1930s Cartoon',
    category: ART_CATEGORIES[2],
    subcategory: 'Cartoon Styles',
    description: 'Classic 1930s animation style like early Disney',
    promptTemplate: '{prompt}, 1930s cartoon style, rubber hose animation, classic Disney style, vintage animation',
    parameters: { strength: 0.4 },
    tags: ['1930s', 'vintage', 'disney', 'animation']
  },
  {
    id: 'upa_style',
    name: 'UPA Style',
    category: ART_CATEGORIES[2],
    subcategory: 'Cartoon Styles',
    description: 'Mid-century modern animation style',
    promptTemplate: '{prompt}, UPA animation style, mid-century modern, geometric shapes, limited animation',
    parameters: { strength: 0.35 },
    tags: ['upa', 'mid-century', 'geometric', 'modern']
  },
  {
    id: 'world_of_tintin',
    name: 'World of Tintin',
    category: ART_CATEGORIES[2],
    subcategory: 'Cartoon Styles',
    description: 'European comic style inspired by Tintin',
    promptTemplate: '{prompt}, Tintin comic style, European comic art, ligne claire style, clean line art',
    parameters: { strength: 0.35 },
    tags: ['tintin', 'european', 'ligne-claire', 'clean']
  },
  {
    id: 'caricatures',
    name: 'Caricatures',
    category: ART_CATEGORIES[2],
    subcategory: 'Cartoon Styles',
    description: 'Exaggerated cartoon portraits emphasizing features',
    promptTemplate: '{prompt}, caricature style, exaggerated features, cartoon portrait, humorous illustration',
    parameters: { strength: 0.4 },
    tags: ['caricature', 'exaggerated', 'portrait', 'humorous']
  },

  // Comics & Cartoons - Pop Culture Parody
  {
    id: 'simpsonized',
    name: 'Simpsonized',
    category: ART_CATEGORIES[2],
    subcategory: 'Pop Culture Parody',
    description: 'Characters in The Simpsons animation style',
    promptTemplate: '{prompt}, Simpsons animation style, yellow skin, cartoon character, Springfield style',
    parameters: { strength: 0.4, guidanceScale: 7.5 },
    tags: ['simpsons', 'yellow', 'cartoon', 'animated'],
    isPopular: true
  },
  {
    id: 'shrek_omatic',
    name: 'Shrek-o-matic',
    category: ART_CATEGORIES[2],
    subcategory: 'Pop Culture Parody',
    description: 'Characters in Shrek movie animation style',
    promptTemplate: '{prompt}, Shrek animation style, DreamWorks style, 3D animated character, fairy tale style',
    parameters: { strength: 0.4 },
    tags: ['shrek', 'dreamworks', '3d', 'fairy-tale']
  },
  {
    id: 'smurfed',
    name: 'Smurfed',
    category: ART_CATEGORIES[2],
    subcategory: 'Pop Culture Parody',
    description: 'Characters transformed into Smurf style',
    promptTemplate: '{prompt}, Smurf style, blue skin, small character, cartoon mushroom village',
    parameters: { strength: 0.4 },
    tags: ['smurf', 'blue', 'small', 'cartoon']
  },
  {
    id: 'lego_style',
    name: 'Lego',
    category: ART_CATEGORIES[2],
    subcategory: 'Pop Culture Parody',
    description: 'Everything rendered as LEGO blocks and minifigures',
    promptTemplate: '{prompt}, LEGO style, plastic blocks, minifigure style, brick construction',
    parameters: { strength: 0.4, guidanceScale: 8.0 },
    tags: ['lego', 'blocks', 'plastic', 'minifigure'],
    isPopular: true
  },

  // Traditional Art Media & Techniques - More Drawing Styles
  {
    id: 'gouache',
    name: 'Gouache',
    category: ART_CATEGORIES[3],
    subcategory: 'Painting & Drawing',
    description: 'Opaque watercolor painting technique',
    promptTemplate: '{prompt}, gouache painting, opaque watercolor, matte finish, poster paint technique',
    parameters: { strength: 0.3 },
    tags: ['gouache', 'opaque', 'watercolor', 'matte']
  },
  {
    id: 'nozen_ink',
    name: 'Nozen Ink',
    category: ART_CATEGORIES[3],
    subcategory: 'Painting & Drawing',
    description: 'Japanese ink wash painting style',
    promptTemplate: '{prompt}, Nozen ink painting, Japanese ink wash, sumi-e style, flowing brushstrokes',
    parameters: { strength: 0.3 },
    tags: ['nozen', 'japanese', 'ink', 'sumi-e']
  },
  {
    id: 'charcoal_drawing',
    name: 'Charcoal Drawing',
    category: ART_CATEGORIES[3],
    subcategory: 'Painting & Drawing',
    description: 'Rich charcoal drawing with deep blacks and soft grays',
    promptTemplate: '{prompt}, charcoal drawing, soft shading, deep blacks, smudged texture',
    parameters: { strength: 0.3 },
    tags: ['charcoal', 'soft', 'shading', 'texture']
  },
  {
    id: 'pastel_drawing',
    name: 'Pastel Drawing',
    category: ART_CATEGORIES[3],
    subcategory: 'Painting & Drawing',
    description: 'Soft pastel drawing with blended colors',
    promptTemplate: '{prompt}, pastel drawing, soft colors, blended texture, chalk pastel technique',
    parameters: { strength: 0.25, guidanceScale: 6.5 },
    tags: ['pastel', 'soft', 'blended', 'chalk']
  },
  {
    id: 'ballpoint_pen',
    name: 'Ballpoint Pen Drawing',
    category: ART_CATEGORIES[3],
    subcategory: 'Painting & Drawing',
    description: 'Detailed drawings made with ballpoint pen',
    promptTemplate: '{prompt}, ballpoint pen drawing, crosshatching, detailed line work, pen sketch',
    parameters: { strength: 0.35 },
    tags: ['ballpoint', 'pen', 'crosshatch', 'detailed']
  },
  {
    id: 'sharpie_art',
    name: 'Sharpie Art',
    category: ART_CATEGORIES[3],
    subcategory: 'Painting & Drawing',
    description: 'Bold artwork created with permanent markers',
    promptTemplate: '{prompt}, Sharpie marker art, bold lines, permanent marker, high contrast',
    parameters: { strength: 0.35 },
    tags: ['sharpie', 'marker', 'bold', 'permanent']
  },
  {
    id: 'crayon_drawing',
    name: 'Crayon Drawing',
    category: ART_CATEGORIES[3],
    subcategory: 'Painting & Drawing',
    description: 'Childlike crayon drawings with waxy texture',
    promptTemplate: '{prompt}, crayon drawing, waxy texture, childlike art, colorful crayons',
    parameters: { strength: 0.3 },
    tags: ['crayon', 'waxy', 'childlike', 'colorful']
  },
  {
    id: 'fresco_painting',
    name: 'Fresco Painting',
    category: ART_CATEGORIES[3],
    subcategory: 'Painting & Drawing',
    description: 'Classical fresco painting on wet plaster',
    promptTemplate: '{prompt}, fresco painting, wet plaster, classical art, Renaissance style',
    parameters: { strength: 0.35, guidanceScale: 8.0 },
    tags: ['fresco', 'classical', 'plaster', 'renaissance']
  },

  // Traditional Art Media & Techniques - Printmaking & Papercraft
  {
    id: 'woodcut',
    name: 'Woodcut & Linocut',
    category: ART_CATEGORIES[3],
    subcategory: 'Printmaking & Papercraft',
    description: 'Bold relief prints with carved block aesthetic',
    promptTemplate: '{prompt}, woodcut print, linocut style, bold relief printing, carved block aesthetic',
    parameters: { strength: 0.35 },
    tags: ['woodcut', 'linocut', 'print', 'carved']
  },
  {
    id: 'etching',
    name: 'Etching',
    category: ART_CATEGORIES[3],
    subcategory: 'Printmaking & Papercraft',
    description: 'Fine line etching and engraving style',
    promptTemplate: '{prompt}, etching, engraving style, fine line work, cross-hatching technique',
    parameters: { strength: 0.3 },
    tags: ['etching', 'engraving', 'fine-line', 'crosshatch']
  },
  {
    id: 'stencil_art',
    name: 'Stencil Art & Risograph',
    category: ART_CATEGORIES[3],
    subcategory: 'Printmaking & Papercraft',
    description: 'Stencil art with limited color palette',
    promptTemplate: '{prompt}, stencil art, risograph print, limited colors, screen print style',
    parameters: { strength: 0.35 },
    tags: ['stencil', 'risograph', 'screen-print', 'limited-color']
  },
  {
    id: 'papercraft',
    name: 'Papercraft',
    category: ART_CATEGORIES[3],
    subcategory: 'Printmaking & Papercraft',
    description: 'Paper cut and layered paper art',
    promptTemplate: '{prompt}, papercraft, paper cut art, layered paper, dimensional paper sculpture',
    parameters: { strength: 0.35 },
    tags: ['papercraft', 'paper-cut', 'layered', 'dimensional']
  },
  {
    id: 'paper_toys',
    name: 'Paper Toys',
    category: ART_CATEGORIES[3],
    subcategory: 'Printmaking & Papercraft',
    description: 'Flat paper designs that fold into 3D toys',
    promptTemplate: '{prompt}, paper toy design, fold lines, flat pattern, 3D paper craft',
    parameters: { strength: 0.35 },
    tags: ['paper-toy', 'fold', 'pattern', 'craft']
  },
  {
    id: 'collage',
    name: 'Collage',
    category: ART_CATEGORIES[3],
    subcategory: 'Printmaking & Papercraft',
    description: 'Mixed media collage with cut paper elements',
    promptTemplate: '{prompt}, collage art, mixed media, cut paper, layered composition',
    parameters: { strength: 0.35, guidanceScale: 7.0 },
    tags: ['collage', 'mixed-media', 'layered', 'composition'],
    isPopular: true
  },

  // Traditional Art Media & Techniques - Sculpture & Crafts
  {
    id: 'claymation',
    name: 'Claymation',
    category: ART_CATEGORIES[3],
    subcategory: 'Sculpture & Crafts',
    description: 'Clay animation style characters and scenes',
    promptTemplate: '{prompt}, claymation style, clay animation, stop motion, plasticine characters',
    parameters: { strength: 0.4 },
    tags: ['claymation', 'clay', 'stop-motion', 'plasticine'],
    isPopular: true
  },
  {
    id: 'stained_glass',
    name: 'Stained Glass',
    category: ART_CATEGORIES[3],
    subcategory: 'Sculpture & Crafts',
    description: 'Colorful stained glass window art',
    promptTemplate: '{prompt}, stained glass art, colorful glass panels, lead lines, church window style',
    parameters: { strength: 0.35, guidanceScale: 7.5 },
    tags: ['stained-glass', 'colorful', 'lead-lines', 'window']
  },
  {
    id: 'glass_sculptures',
    name: 'Glass Sculptures',
    category: ART_CATEGORIES[3],
    subcategory: 'Sculpture & Crafts',
    description: 'Translucent glass art sculptures',
    promptTemplate: '{prompt}, glass sculpture, translucent, blown glass, crystalline structure',
    parameters: { strength: 0.35 },
    tags: ['glass', 'sculpture', 'translucent', 'crystalline']
  },
  {
    id: 'roman_sculpture',
    name: 'Roman Sculpture',
    category: ART_CATEGORIES[3],
    subcategory: 'Sculpture & Crafts',
    description: 'Classical Roman marble sculpture style',
    promptTemplate: '{prompt}, Roman sculpture, classical marble, realistic proportions, ancient style',
    parameters: { strength: 0.35, guidanceScale: 8.0 },
    tags: ['roman', 'marble', 'classical', 'ancient']
  },
  {
    id: 'rodin_bronze',
    name: 'Rodin Bronze',
    category: ART_CATEGORIES[3],
    subcategory: 'Sculpture & Crafts',
    description: 'Expressive bronze sculpture in Rodin\'s style',
    promptTemplate: '{prompt}, Rodin bronze sculpture, expressive form, bronze patina, dramatic pose',
    parameters: { strength: 0.35 },
    tags: ['rodin', 'bronze', 'expressive', 'patina']
  },
  {
    id: 'porcelain',
    name: 'Porcelain',
    category: ART_CATEGORIES[3],
    subcategory: 'Sculpture & Crafts',
    description: 'Delicate porcelain ceramic art',
    promptTemplate: '{prompt}, porcelain ceramic, delicate details, glazed finish, fine china style',
    parameters: { strength: 0.3 },
    tags: ['porcelain', 'ceramic', 'delicate', 'glazed']
  },
  {
    id: 'wool_felt',
    name: 'Wool Felt',
    category: ART_CATEGORIES[3],
    subcategory: 'Sculpture & Crafts',
    description: 'Soft wool felt crafts and sculptures',
    promptTemplate: '{prompt}, wool felt craft, soft texture, needle felting, fiber art',
    parameters: { strength: 0.3 },
    tags: ['wool', 'felt', 'soft', 'fiber-art']
  },
  {
    id: 'vintage_dolls',
    name: 'Vintage Dolls',
    category: ART_CATEGORIES[3],
    subcategory: 'Sculpture & Crafts',
    description: 'Antique porcelain doll aesthetic',
    promptTemplate: '{prompt}, vintage doll, porcelain face, antique clothing, doll-like features',
    parameters: { strength: 0.35 },
    tags: ['vintage', 'doll', 'porcelain', 'antique']
  },

  // Art Styles & Movements - Pre-Modern
  {
    id: 'medieval',
    name: 'Medieval',
    category: ART_CATEGORIES[4],
    subcategory: 'Pre-Modern',
    description: 'Medieval illuminated manuscript style',
    promptTemplate: '{prompt}, medieval art, illuminated manuscript, gold leaf, religious iconography',
    parameters: { strength: 0.35, guidanceScale: 8.0 },
    tags: ['medieval', 'manuscript', 'gold-leaf', 'religious']
  },
  {
    id: 'botticelli',
    name: 'Renaissance (Botticelli)',
    category: ART_CATEGORIES[4],
    subcategory: 'Pre-Modern',
    description: 'Renaissance painting in Botticelli\'s style',
    promptTemplate: '{prompt}, Botticelli style, Renaissance painting, classical beauty, flowing drapery',
    parameters: { strength: 0.35, guidanceScale: 8.5 },
    tags: ['botticelli', 'renaissance', 'classical', 'flowing']
  },
  {
    id: 'piero_della_francesca',
    name: 'Piero della Francesca',
    category: ART_CATEGORIES[4],
    subcategory: 'Pre-Modern',
    description: 'Geometric Renaissance composition style',
    promptTemplate: '{prompt}, Piero della Francesca style, geometric composition, Renaissance perspective, mathematical precision',
    parameters: { strength: 0.35 },
    tags: ['piero', 'geometric', 'renaissance', 'mathematical']
  },
  {
    id: 'northern_renaissance',
    name: 'Northern Renaissance',
    category: ART_CATEGORIES[4],
    subcategory: 'Pre-Modern',
    description: 'Detailed Northern European Renaissance style',
    promptTemplate: '{prompt}, Northern Renaissance, detailed realism, oil painting technique, Flemish style',
    parameters: { strength: 0.35 },
    tags: ['northern', 'renaissance', 'detailed', 'flemish']
  },
  {
    id: 'rococo',
    name: 'Rococo',
    category: ART_CATEGORIES[4],
    subcategory: 'Pre-Modern',
    description: 'Ornate Rococo decorative style',
    promptTemplate: '{prompt}, Rococo style, ornate decoration, pastel colors, curved forms, elaborate details',
    parameters: { strength: 0.35 },
    tags: ['rococo', 'ornate', 'pastel', 'elaborate']
  },
  {
    id: 'baroque_rembrandt',
    name: 'Baroque (Rembrandt)',
    category: ART_CATEGORIES[4],
    subcategory: 'Pre-Modern',
    description: 'Dramatic Baroque lighting like Rembrandt',
    promptTemplate: '{prompt}, Rembrandt style, Baroque painting, dramatic lighting, chiaroscuro technique',
    parameters: { strength: 0.35, guidanceScale: 8.5 },
    tags: ['rembrandt', 'baroque', 'dramatic', 'chiaroscuro']
  },

  // Art Styles & Movements - Modern (19th-20th Century)
  {
    id: 'mary_cassatt',
    name: 'Impressionism (Mary Cassatt)',
    category: ART_CATEGORIES[4],
    subcategory: 'Modern (19th-20th Century)',
    description: 'Impressionist style like Mary Cassatt',
    promptTemplate: '{prompt}, Mary Cassatt style, Impressionist painting, soft brushstrokes, intimate scenes',
    parameters: { strength: 0.3, guidanceScale: 7.0 },
    tags: ['cassatt', 'impressionist', 'soft', 'intimate']
  },
  {
    id: 'palette_knife',
    name: 'Palette Knife Painting',
    category: ART_CATEGORIES[4],
    subcategory: 'Modern (19th-20th Century)',
    description: 'Thick paint applied with palette knife',
    promptTemplate: '{prompt}, palette knife painting, thick paint texture, impasto technique, bold strokes',
    parameters: { strength: 0.35 },
    tags: ['palette-knife', 'thick', 'impasto', 'bold'],
    isPopular: true
  },
  {
    id: 'heavy_impasto',
    name: 'Heavy Impasto',
    category: ART_CATEGORIES[4],
    subcategory: 'Modern (19th-20th Century)',
    description: 'Very thick paint application with visible texture',
    promptTemplate: '{prompt}, heavy impasto, very thick paint, sculptural texture, visible brushstrokes',
    parameters: { strength: 0.35 },
    tags: ['impasto', 'thick', 'sculptural', 'texture']
  },
  {
    id: 'pointillism',
    name: 'Pointillism',
    category: ART_CATEGORIES[4],
    subcategory: 'Modern (19th-20th Century)',
    description: 'Painting technique using small dots of color',
    promptTemplate: '{prompt}, Pointillism, dots of color, Seurat style, divisionist technique',
    parameters: { strength: 0.35, guidanceScale: 7.5 },
    tags: ['pointillism', 'dots', 'seurat', 'divisionist'],
    isPopular: true
  },
  {
    id: 'expressionism',
    name: 'Expressionism',
    category: ART_CATEGORIES[4],
    subcategory: 'Modern (19th-20th Century)',
    description: 'Emotional expressionist painting style',
    promptTemplate: '{prompt}, Expressionist painting, emotional colors, distorted forms, raw emotion',
    parameters: { strength: 0.4, guidanceScale: 8.0 },
    tags: ['expressionism', 'emotional', 'distorted', 'raw']
  },
  {
    id: 'fauvism',
    name: 'Fauvism',
    category: ART_CATEGORIES[4],
    subcategory: 'Modern (19th-20th Century)',
    description: 'Bold, non-naturalistic colors of Fauvism',
    promptTemplate: '{prompt}, Fauvist style, bold unnatural colors, wild brushstrokes, Matisse influence',
    parameters: { strength: 0.4 },
    tags: ['fauvism', 'bold', 'unnatural', 'matisse']
  },
  {
    id: 'surrealism_dali',
    name: 'Surrealism (Dalí)',
    category: ART_CATEGORIES[4],
    subcategory: 'Modern (19th-20th Century)',
    description: 'Dreamlike surrealist imagery like Dalí',
    promptTemplate: '{prompt}, Salvador Dalí style, surrealist painting, dreamlike imagery, melting forms',
    parameters: { strength: 0.4, guidanceScale: 8.5 },
    tags: ['dali', 'surrealist', 'dreamlike', 'melting'],
    isPopular: true
  },
  {
    id: 'art_nouveau_mucha',
    name: 'Art Nouveau (Alphonse Mucha)',
    category: ART_CATEGORIES[4],
    subcategory: 'Modern (19th-20th Century)',
    description: 'Elegant Art Nouveau style like Mucha',
    promptTemplate: '{prompt}, Alphonse Mucha style, Art Nouveau, flowing lines, decorative borders, elegant figures',
    parameters: { strength: 0.35, guidanceScale: 8.0 },
    tags: ['mucha', 'art-nouveau', 'flowing', 'decorative'],
    isPopular: true
  },
  {
    id: 'pop_art',
    name: 'Pop Art',
    category: ART_CATEGORIES[4],
    subcategory: 'Modern (19th-20th Century)',
    description: 'Bold pop art style with bright colors',
    promptTemplate: '{prompt}, Pop Art style, bright colors, commercial imagery, Warhol influence, screen print aesthetic',
    parameters: { strength: 0.4, guidanceScale: 7.5 },
    tags: ['pop-art', 'bright', 'commercial', 'warhol'],
    isPopular: true
  },

  // Art Styles & Movements - Global & Folk Styles
  {
    id: 'ukiyo_e',
    name: 'Ukiyo-e',
    category: ART_CATEGORIES[4],
    subcategory: 'Global & Folk Styles',
    description: 'Japanese woodblock print style',
    promptTemplate: '{prompt}, Ukiyo-e style, Japanese woodblock print, flat colors, bold outlines, traditional composition',
    parameters: { strength: 0.35, guidanceScale: 8.0 },
    tags: ['ukiyo-e', 'japanese', 'woodblock', 'traditional'],
    isPopular: true
  },
  {
    id: 'european_naive_folk',
    name: 'European Naive Folk Art',
    category: ART_CATEGORIES[4],
    subcategory: 'Global & Folk Styles',
    description: 'Charming European folk art style',
    promptTemplate: '{prompt}, European folk art, naive style, traditional patterns, handcrafted aesthetic',
    parameters: { strength: 0.3 },
    tags: ['european', 'folk', 'naive', 'traditional']
  },
  {
    id: 'traditional_chinese_painting',
    name: 'Traditional Chinese Painting',
    category: ART_CATEGORIES[4],
    subcategory: 'Global & Folk Styles',
    description: 'Classical Chinese brush painting',
    promptTemplate: '{prompt}, traditional Chinese painting, brush painting, ink wash, classical composition',
    parameters: { strength: 0.3, guidanceScale: 7.5 },
    tags: ['chinese', 'brush', 'ink-wash', 'classical']
  },

  // Art Styles & Movements - Contemporary
  {
    id: 'minimalism',
    name: 'Minimalism',
    category: ART_CATEGORIES[4],
    subcategory: 'Contemporary',
    description: 'Clean minimalist aesthetic with simple forms',
    promptTemplate: '{prompt}, minimalist art, clean simple forms, limited color palette, geometric abstraction',
    parameters: { strength: 0.3, guidanceScale: 6.5 },
    tags: ['minimalism', 'clean', 'simple', 'geometric'],
    isPopular: true
  },
  {
    id: 'graffiti',
    name: 'Graffiti',
    category: ART_CATEGORIES[4],
    subcategory: 'Contemporary',
    description: 'Urban graffiti and street art style',
    promptTemplate: '{prompt}, graffiti art, street art style, spray paint, urban wall art, bold lettering',
    parameters: { strength: 0.4, guidanceScale: 7.5 },
    tags: ['graffiti', 'street-art', 'spray-paint', 'urban'],
    isPopular: true
  },
  {
    id: 'neon_rhythms',
    name: 'Neon Rhythms',
    category: ART_CATEGORIES[4],
    subcategory: 'Contemporary',
    description: 'Glowing neon light aesthetic',
    promptTemplate: '{prompt}, neon light art, glowing colors, electric aesthetic, night scene lighting',
    parameters: { strength: 0.35, guidanceScale: 7.0 },
    tags: ['neon', 'glowing', 'electric', 'night']
  },
  {
    id: 'abstract_glass',
    name: 'Abstract Glass',
    category: ART_CATEGORIES[4],
    subcategory: 'Contemporary',
    description: 'Abstract art with glass-like transparency effects',
    promptTemplate: '{prompt}, abstract glass art, transparent effects, reflections, crystalline forms',
    parameters: { strength: 0.35 },
    tags: ['abstract', 'glass', 'transparent', 'crystalline']
  },

  // Photography - Portraits & Subjects
  {
    id: 'photorealistic_portraits',
    name: 'Photorealistic Portraits',
    category: ART_CATEGORIES[5],
    subcategory: 'Portraits & Subjects',
    description: 'Ultra-realistic photographic portraits',
    promptTemplate: '{prompt}, photorealistic portrait, professional photography, studio lighting, high detail',
    parameters: { strength: 0.4, guidanceScale: 9.0 },
    tags: ['photorealistic', 'portrait', 'professional', 'detailed'],
    isPopular: true
  },
  {
    id: 'glamour_photography',
    name: 'Glamour Photography',
    category: ART_CATEGORIES[5],
    subcategory: 'Portraits & Subjects',
    description: 'Elegant glamour photography style',
    promptTemplate: '{prompt}, glamour photography, elegant lighting, fashion photography, sophisticated pose',
    parameters: { strength: 0.4 },
    tags: ['glamour', 'elegant', 'fashion', 'sophisticated']
  },
  {
    id: 'silhouettes',
    name: 'Silhouettes',
    category: ART_CATEGORIES[5],
    subcategory: 'Portraits & Subjects',
    description: 'Dramatic silhouette photography',
    promptTemplate: '{prompt}, silhouette photography, dramatic backlighting, dark outline, minimal detail',
    parameters: { strength: 0.35 },
    tags: ['silhouette', 'dramatic', 'backlit', 'outline']
  },

  // Photography - Techniques & Effects
  {
    id: 'bokeh',
    name: 'Bokeh',
    category: ART_CATEGORIES[5],
    subcategory: 'Techniques & Effects',
    description: 'Shallow depth of field with beautiful bokeh',
    promptTemplate: '{prompt}, bokeh photography, shallow depth of field, blurred background, sharp focus',
    parameters: { strength: 0.3 },
    tags: ['bokeh', 'shallow', 'blurred', 'focus'],
    isPopular: true
  },
  {
    id: 'long_exposure',
    name: 'Long Exposure',
    category: ART_CATEGORIES[5],
    subcategory: 'Techniques & Effects',
    description: 'Long exposure photography with motion blur',
    promptTemplate: '{prompt}, long exposure photography, motion blur, light trails, smooth water effect',
    parameters: { strength: 0.35 },
    tags: ['long-exposure', 'motion-blur', 'light-trails', 'smooth']
  },
  {
    id: 'macro_photography',
    name: 'Macro Photography',
    category: ART_CATEGORIES[5],
    subcategory: 'Techniques & Effects',
    description: 'Extreme close-up macro photography',
    promptTemplate: '{prompt}, macro photography, extreme close-up, intricate details, magnified view',
    parameters: { strength: 0.35 },
    tags: ['macro', 'close-up', 'detailed', 'magnified']
  },
  {
    id: 'backlit_photography',
    name: 'Backlit Photography',
    category: ART_CATEGORIES[5],
    subcategory: 'Techniques & Effects',
    description: 'Dramatic backlighting photography',
    promptTemplate: '{prompt}, backlit photography, rim lighting, dramatic silhouette, golden hour lighting',
    parameters: { strength: 0.35 },
    tags: ['backlit', 'rim-lighting', 'dramatic', 'golden-hour']
  },

  // Photography - Aesthetics & Moods
  {
    id: 'dramatic_black_white',
    name: 'Dramatic Black and White',
    category: ART_CATEGORIES[5],
    subcategory: 'Aesthetics & Moods',
    description: 'High contrast black and white photography',
    promptTemplate: '{prompt}, dramatic black and white photography, high contrast, monochrome, artistic lighting',
    parameters: { strength: 0.35, guidanceScale: 8.0 },
    tags: ['black-white', 'dramatic', 'contrast', 'monochrome'],
    isPopular: true
  },
  {
    id: 'film_noir',
    name: 'Film Noir',
    category: ART_CATEGORIES[5],
    subcategory: 'Aesthetics & Moods',
    description: 'Classic film noir cinematography style',
    promptTemplate: '{prompt}, film noir style, dramatic shadows, venetian blind lighting, classic cinema',
    parameters: { strength: 0.4, guidanceScale: 8.5 },
    tags: ['film-noir', 'dramatic', 'shadows', 'cinema'],
    isPopular: true
  },
  {
    id: 'infrared_photography',
    name: 'Infrared Photography',
    category: ART_CATEGORIES[5],
    subcategory: 'Aesthetics & Moods',
    description: 'Surreal infrared photography effect',
    promptTemplate: '{prompt}, infrared photography, false color, surreal landscape, IR filter effect',
    parameters: { strength: 0.4 },
    tags: ['infrared', 'false-color', 'surreal', 'filter']
  },

  // Photography - Formats & Emulation
  {
    id: 'analog_photography',
    name: 'Analog Photography',
    category: ART_CATEGORIES[5],
    subcategory: 'Formats & Emulation',
    description: 'Classic analog film photography aesthetic',
    promptTemplate: '{prompt}, analog photography, film grain, vintage colors, classic camera aesthetic',
    parameters: { strength: 0.3 },
    tags: ['analog', 'film-grain', 'vintage', 'classic']
  },
  {
    id: 'polaroid',
    name: 'Polaroid',
    category: ART_CATEGORIES[5],
    subcategory: 'Formats & Emulation',
    description: 'Instant Polaroid camera aesthetic',
    promptTemplate: '{prompt}, Polaroid instant photo, white border, vintage colors, retro aesthetic',
    parameters: { strength: 0.35 },
    tags: ['polaroid', 'instant', 'white-border', 'retro'],
    isPopular: true
  },
  {
    id: 'holga',
    name: 'Holga',
    category: ART_CATEGORIES[5],
    subcategory: 'Formats & Emulation',
    description: 'Lomography Holga camera aesthetic',
    promptTemplate: '{prompt}, Holga camera style, vignetting, light leaks, lomography aesthetic',
    parameters: { strength: 0.35 },
    tags: ['holga', 'vignetting', 'light-leaks', 'lomography']
  },
  {
    id: 'very_old_photos',
    name: 'Very Old Photos',
    category: ART_CATEGORIES[5],
    subcategory: 'Formats & Emulation',
    description: 'Antique daguerreotype and early photography style',
    promptTemplate: '{prompt}, antique photography, daguerreotype, sepia tone, aged and weathered',
    parameters: { strength: 0.35 },
    tags: ['antique', 'daguerreotype', 'sepia', 'aged']
  },

  // Gaming & Commercial Art - Video Game Art
  {
    id: 'pixel_art',
    name: 'Pixel Art',
    category: ART_CATEGORIES[6],
    subcategory: 'Video Game Art',
    description: 'Retro pixel art video game style',
    promptTemplate: '{prompt}, pixel art, 8-bit style, retro gaming, pixelated graphics',
    parameters: { strength: 0.4, guidanceScale: 8.0 },
    tags: ['pixel', '8-bit', 'retro', 'gaming'],
    isPopular: true
  },
  {
    id: 'voxel_art',
    name: 'Voxel Art',
    category: ART_CATEGORIES[6],
    subcategory: 'Video Game Art',
    description: '3D voxel-based blocky art style',
    promptTemplate: '{prompt}, voxel art, 3D blocks, Minecraft style, cubic aesthetic',
    parameters: { strength: 0.4 },
    tags: ['voxel', '3d', 'blocks', 'minecraft'],
    isPopular: true
  },
  {
    id: 'low_poly',
    name: 'Low Poly',
    category: ART_CATEGORIES[6],
    subcategory: 'Video Game Art',
    description: 'Low polygon 3D art style',
    promptTemplate: '{prompt}, low poly art, geometric shapes, minimal polygons, flat shading',
    parameters: { strength: 0.35, guidanceScale: 7.5 },
    tags: ['low-poly', 'geometric', 'minimal', 'flat'],
    isPopular: true
  },
  {
    id: 'gta_cover_art',
    name: 'GTA Cover Art',
    category: ART_CATEGORIES[6],
    subcategory: 'Video Game Art',
    description: 'Grand Theft Auto cover art style',
    promptTemplate: '{prompt}, GTA cover art style, urban crime aesthetic, dramatic composition, game cover design',
    parameters: { strength: 0.4 },
    tags: ['gta', 'urban', 'crime', 'dramatic']
  },
  {
    id: '80s_game_box',
    name: '80s Game Box Covers',
    category: ART_CATEGORIES[6],
    subcategory: 'Video Game Art',
    description: 'Retro 1980s video game box art',
    promptTemplate: '{prompt}, 1980s game box art, retro gaming, arcade aesthetic, vintage game cover',
    parameters: { strength: 0.4 },
    tags: ['80s', 'retro', 'arcade', 'vintage']
  },
  {
    id: 'game_screens',
    name: 'Game Screens',
    category: ART_CATEGORIES[6],
    subcategory: 'Video Game Art',
    description: 'In-game screenshot aesthetic',
    promptTemplate: '{prompt}, video game screenshot, in-game graphics, UI elements, gaming interface',
    parameters: { strength: 0.35 },
    tags: ['screenshot', 'in-game', 'ui', 'interface']
  },

  // Gaming & Commercial Art - Commercial & Graphic Design
  {
    id: 'minimalist_logos',
    name: 'Minimalist Logos',
    category: ART_CATEGORIES[6],
    subcategory: 'Commercial & Graphic Design',
    description: 'Clean minimalist logo design',
    promptTemplate: '{prompt}, minimalist logo design, clean typography, simple shapes, corporate identity',
    parameters: { strength: 0.35, guidanceScale: 7.0 },
    tags: ['logo', 'minimalist', 'typography', 'corporate']
  },
  {
    id: 'mascot_logos',
    name: 'Mascot Logos',
    category: ART_CATEGORIES[6],
    subcategory: 'Commercial & Graphic Design',
    description: 'Character mascot logo design',
    promptTemplate: '{prompt}, mascot logo, character design, brand mascot, cartoon logo',
    parameters: { strength: 0.4 },
    tags: ['mascot', 'character', 'brand', 'cartoon']
  },
  {
    id: 'chinese_vintage_posters',
    name: 'Chinese Vintage Posters',
    category: ART_CATEGORIES[6],
    subcategory: 'Commercial & Graphic Design',
    description: 'Vintage Chinese propaganda poster style',
    promptTemplate: '{prompt}, Chinese vintage poster, propaganda art style, bold colors, revolutionary aesthetic',
    parameters: { strength: 0.4 },
    tags: ['chinese', 'vintage', 'propaganda', 'bold']
  },
  {
    id: 'soviet_vintage_posters',
    name: 'Soviet Vintage Posters',
    category: ART_CATEGORIES[6],
    subcategory: 'Commercial & Graphic Design',
    description: 'Soviet constructivist poster design',
    promptTemplate: '{prompt}, Soviet vintage poster, constructivist design, propaganda style, red and black',
    parameters: { strength: 0.4 },
    tags: ['soviet', 'constructivist', 'propaganda', 'red']
  },
  {
    id: 'tshirt_designs',
    name: 'T-shirt Designs',
    category: ART_CATEGORIES[6],
    subcategory: 'Commercial & Graphic Design',
    description: 'Graphic t-shirt design artwork',
    promptTemplate: '{prompt}, t-shirt design, graphic tee, merchandise art, apparel design',
    parameters: { strength: 0.35 },
    tags: ['tshirt', 'graphic', 'merchandise', 'apparel']
  },
  {
    id: 'die_cut_stickers',
    name: 'Die-Cut Stickers',
    category: ART_CATEGORIES[6],
    subcategory: 'Commercial & Graphic Design',
    description: 'Colorful die-cut sticker designs',
    promptTemplate: '{prompt}, die-cut sticker design, colorful graphics, sticker art, vinyl cut design',
    parameters: { strength: 0.35 },
    tags: ['sticker', 'die-cut', 'colorful', 'vinyl']
  },
  {
    id: 'pulp_covers',
    name: 'Pulp Covers',
    category: ART_CATEGORIES[6],
    subcategory: 'Commercial & Graphic Design',
    description: 'Vintage pulp fiction book cover art',
    promptTemplate: '{prompt}, pulp fiction cover art, vintage book cover, dramatic illustration, retro typography',
    parameters: { strength: 0.4, guidanceScale: 8.0 },
    tags: ['pulp', 'vintage', 'dramatic', 'retro'],
    isPopular: true
  },

  // More Anime & Manga styles
  {
    id: 'toonyou',
    name: 'ToonYou',
    category: ART_CATEGORIES[1],
    subcategory: 'General Anime',
    description: 'Transform into cartoon/anime character style',
    promptTemplate: '{prompt}, ToonYou style, anime character transformation, cartoon avatar, stylized character',
    parameters: { strength: 0.4 },
    tags: ['toonyou', 'transformation', 'avatar', 'stylized']
  }
]

// Helper functions
export function getStyleById(id: string): ArtStyle | undefined {
  return ART_STYLES.find(style => style.id === id)
}

export function getStylesByCategory(categoryId: string): ArtStyle[] {
  return ART_STYLES.filter(style => style.category.id === categoryId)
}

export function getPopularStyles(): ArtStyle[] {
  return ART_STYLES.filter(style => style.isPopular)
}

export function searchStyles(query: string): ArtStyle[] {
  const lowercaseQuery = query.toLowerCase()
  return ART_STYLES.filter(style => 
    style.name.toLowerCase().includes(lowercaseQuery) ||
    style.description.toLowerCase().includes(lowercaseQuery) ||
    style.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}