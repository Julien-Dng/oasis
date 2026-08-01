# Prompts Gemini — images maîtresses Oasis

Ces deux prompts sont envoyés dans cet ordre. L’image A est générée depuis le texte. L’image B est une édition de l’image A fournie comme entrée binaire à la seconde requête.

## Image A — Désert de nuit

<!-- master: master-a-desert-night -->
```prompt
Use case: photorealistic-natural
Asset type: 4K cinematic master plate for a premium scroll-driven website hero.

Primary request:
Create an ultra-photorealistic cinematic photograph of a vast real desert at advanced twilight, almost night. The result must look like a frame from a high-budget feature film or luxury commercial shot on location, never like digital artwork.

Camera and geometry:
Panoramic 16:9 composition. Full-frame camera with a natural 35 mm lens. Camera positioned approximately 1.35 metres above the sand, level and facing forward, with no dutch angle and no exaggerated wide-angle distortion. Centered vanishing point. Place the horizon at exactly 57% of the image height.

Composition:
Natural wind-shaped dunes occupy the foreground, middle distance and background. A foreground ridge enters organically from both lower corners and forms a shallow central passage toward the horizon. Preserve clear separation between a distant dune ridge, a central dune field and the foreground sand so they can later be isolated as photographic depth layers. Keep usable negative space in the upper central area for website typography.

Environment and realism:
Real sand grains, wind ripples, fine erosion patterns, irregular edges, small natural imperfections and physically credible dune shadows. Subtle atmospheric perspective progressively softens the distant dunes. A thin layer of natural ground haze is visible near the horizon. Very light cinematic depth of field while keeping the landscape readable.

Sky:
A realistic near-black midnight-blue sky with a natural tonal falloff and only a few faint, discreet stars. No Milky Way, no oversized stars and no fantasy nebulae.

Lighting:
A mysterious but physically believable diffused light source sits at the central horizon. It is not a graphic circle or digital orb. Its light scatters through the atmosphere, produces a restrained volumetric glow and creates subtle grazing illumination on selected sand ridges. Deep midnight blue shadows, muted mineral sand, very restrained turquoise atmospheric scattering and a trace of distant warm gold.

Color and finish:
Premium cinematic color grading in midnight blue, mineral sand, restrained turquoise and faint gold. Natural highlight roll-off, realistic dynamic range, subtle filmic contrast and refined low-light detail. No plastic textures, excessive clarity, oversaturation or artificial HDR.

Constraints:
A true photographic desert with no water and no vegetation. No text, letters, logo, watermark, interface, border, people, animals, vehicles, roads, buildings or ruins.

Avoid:
Illustration, concept art, matte painting, vector art, SVG aesthetics, 3D render, CGI landscape, video-game environment, low-poly geometry, cartoon style, surrealism, fantasy landscape, smooth synthetic dunes, flat silhouettes and decorative digital sun.
```

## Image B — Oasis lumineuse

<!-- master: master-b-oasis-light -->
```prompt
Use case: lighting-weather and precise environmental transformation
Asset type: 4K cinematic oasis master plate registered pixel-for-pixel with Image 1.

Input image:
Image 1 is the edit target and the authoritative reference for composition, camera geometry, terrain layout and perspective.

Primary request:
Transform the desert in Image 1 into an ultra-photorealistic luminous oasis in the exact same physical location. This must look like a later shot captured by the same locked camera after a believable environmental transformation, not like a newly generated landscape.

Absolute camera and registration lock:
Do not crop, resize, rotate, reframe or move the camera. Preserve the exact 16:9 canvas, 35 mm lens perspective, camera height, vanishing point and horizon at 57% of image height. Preserve the pixel positions, contours, scale and perspective of every existing foreground, middle-distance and background dune ridge. Keep all stable terrain features aligned with Image 1.

Water:
Reveal a physically plausible body of water inside the existing low central basin between the dunes. The shoreline must follow the real terrain and recede naturally toward the horizon. It must not be oval, circular, symmetrical or graphic. Render realistic dark turquoise water with small natural surface movement, Fresnel reflections, appropriate roughness and reflections aligned with the horizon light, sky and surrounding vegetation.

Vegetation:
Add restrained, botanically believable oasis vegetation growing naturally along the shoreline and moist ground: distant date palms, tamarisk-like shrubs, reeds and low desert grasses. Divide it naturally between background and foreground depth. Keep individual plants irregular, detailed and photographically lit. Avoid large black silhouettes, decorative framing, mirrored placement and sudden isolated palm trees.

Lighting and atmosphere:
Brighten the existing horizon source while keeping it physically integrated into the atmosphere rather than turning it into a graphic orb. Its turquoise and warm golden light must illuminate the sand, water, mist and vegetation consistently, casting coherent reflections and soft physical shadows. Add subtle low turquoise mist close to the water and a few extremely discreet airborne dust or moisture particles visible only inside the volumetric light.

Sky and grade:
Evolve the near-night sky into a brighter predawn atmosphere while preserving its original structure and horizon. Use deep blue above, restrained turquoise near the horizon and natural warm gold around the light source. Maintain premium cinematic contrast, natural highlight roll-off, realistic materials and a very light depth of field.

Change only:
The environmental state, illumination, water, mist and vegetation.

Keep unchanged:
The complete camera geometry, crop, lens, horizon, vanishing point, dune silhouettes, terrain perspective, overall spatial layout and photographic realism of Image 1.

Constraints:
No text, letters, logo, watermark, interface, people, animals, vehicles, roads, buildings or ruins.

Avoid:
A different landscape, changed dune geometry, moved horizon, changed focal length, artificial oval pool, tropical resort, dense jungle, palm silhouettes, symmetrical vegetation, illustration, concept art, matte painting, vector art, CGI, game environment, low-poly geometry, fantasy glow, plastic foliage, synthetic water and abrupt scene replacement.
```
