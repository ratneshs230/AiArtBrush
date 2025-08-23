'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Palette, Star, Sparkles, X, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import type { ArtStyle, ArtCategory, StyleSelection } from '@aiartbrush/shared'
import { ART_CATEGORIES, ART_STYLES, getStylesByCategory, getPopularStyles, searchStyles, STYLE_SAMPLES } from '@aiartbrush/shared'

interface StyleSelectorProps {
  isOpen: boolean
  onClose: () => void
  onStyleSelect: (styleSelection: StyleSelection) => void
  existingStyles?: ArtStyle[]
  showStyleMixing?: boolean
}

export function StyleSelector({ 
  isOpen, 
  onClose, 
  onStyleSelect, 
  existingStyles = [], 
  showStyleMixing = false 
}: StyleSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('popular')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPrimaryStyle, setSelectedPrimaryStyle] = useState<ArtStyle | null>(null)
  const [selectedAccentStyle, setSelectedAccentStyle] = useState<ArtStyle | null>(null)
  const [preserveExisting, setPreserveExisting] = useState(true)
  const [blendStrength, setBlendStrength] = useState([0.3])
  const [displayedStyles, setDisplayedStyles] = useState<ArtStyle[]>([])

  useEffect(() => {
    if (!isOpen) return

    let styles: ArtStyle[] = []
    
    if (searchQuery.trim()) {
      styles = searchStyles(searchQuery)
    } else if (selectedCategory === 'popular') {
      styles = getPopularStyles()
    } else {
      styles = getStylesByCategory(selectedCategory)
    }

    setDisplayedStyles(styles)
  }, [selectedCategory, searchQuery, isOpen])

  const handleStyleSelect = (style: ArtStyle, isAccent = false) => {
    if (isAccent) {
      setSelectedAccentStyle(selectedAccentStyle?.id === style.id ? null : style)
    } else {
      setSelectedPrimaryStyle(style)
    }
  }

  const handleConfirmSelection = () => {
    if (!selectedPrimaryStyle) return

    const styleSelection: StyleSelection = {
      primaryStyle: selectedPrimaryStyle,
      accentStyle: selectedAccentStyle || undefined,
      preserveExisting,
      blendStrength: blendStrength[0]
    }

    onStyleSelect(styleSelection)
    onClose()
  }

  const handleReset = () => {
    setSelectedPrimaryStyle(null)
    setSelectedAccentStyle(null)
    setPreserveExisting(true)
    setBlendStrength([0.3])
    setSearchQuery('')
    setSelectedCategory('popular')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Choose Art Style
            </CardTitle>
            <CardDescription>
              Select a style for your artwork{showStyleMixing && ' and optionally mix with existing styles'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search and Category Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Popular Styles
                  </div>
                </SelectItem>
                {ART_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Style Grid */}
          <ScrollArea className="h-[450px]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-1">
              {displayedStyles.map((style) => (
                <Card
                  key={style.id}
                  className={`cursor-pointer transition-all hover:shadow-md overflow-hidden ${
                    selectedPrimaryStyle?.id === style.id
                      ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : selectedAccentStyle?.id === style.id
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleStyleSelect(style, false)}
                >
                  {/* Sample Image */}
                  <div className="relative w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                    {STYLE_SAMPLES[style.id] ? (
                      <Image
                        src={STYLE_SAMPLES[style.id]}
                        alt={`${style.name} sample`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    {style.isPopular && (
                      <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1">
                        <Star className="w-3 h-3 text-white" fill="currentColor" />
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm line-clamp-1">{style.name}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {style.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {style.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {/* Style Mixing Options */}
          {showStyleMixing && existingStyles.length > 0 && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Style Mixing Options</Label>
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="preserve-existing"
                    checked={preserveExisting}
                    onCheckedChange={setPreserveExisting}
                  />
                  <Label htmlFor="preserve-existing" className="text-sm">
                    Preserve existing artwork texture
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Blend Strength: {Math.round(blendStrength[0] * 100)}%</Label>
                  <Slider
                    value={blendStrength}
                    onValueChange={setBlendStrength}
                    max={1}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtle</span>
                    <span>Strong</span>
                  </div>
                </div>
              </div>

              {existingStyles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Existing styles in this artwork:</Label>
                  <div className="flex flex-wrap gap-1">
                    {existingStyles.map((style) => (
                      <Badge key={style.id} variant="outline" className="text-xs">
                        {style.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Selection Summary */}
          {selectedPrimaryStyle && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-sm">Selected Style:</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedPrimaryStyle.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedPrimaryStyle.description}
                    </p>
                  </div>
                  {selectedPrimaryStyle.isPopular && (
                    <Badge variant="secondary" className="text-xs">
                      Popular
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleReset}>
              Reset Selection
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmSelection}
                disabled={!selectedPrimaryStyle}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Apply Style
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}