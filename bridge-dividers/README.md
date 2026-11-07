# Bridge band dividers (experiments, Oct 29, 2026)

Four candidate films for the night "bridge" band on the helioflux.co home page,
the band right after the tumor story with the line "But there’s a signal before
there’s a tumor." None of them is on the site. The band still uses the 3D mitosis
wireframe (`assets/homepage-v2-20260917/bridge-mitosis-*`).

Kelly liked F (Horizon) and D (Point cloud) from `WEBSITE RECENT/hero-options`
"for like a divider, not the hero". No pick yet.

## What is here

- `review/`: the side-by-side review page (open `review/index.html`). Same page as
  https://claude.ai/artifact/VdF2iCEvUi3Jqx5z9q1pmU, with its web cuts and posters.
- `masters/`: full-size loops, 30 fps, no text baked in, each loops seamlessly.
  - `div-f.mp4`: A, F Horizon on navy, 1600x900, 27 s
  - `div-d.mp4`: B, D Point cloud on navy, 1600x900, 8 s
  - `div-nlm-sheet.mp4`: C, 1956 NLM film, a sheet of dividing cells (5:31 to 5:41), 9 s
  - `div-nlm-multi.mp4`: D, 1956 NLM film, one cell splitting four ways (5:44 to 6:20), 34 s
- `sources/hero-options-night/`: the F and D pages patched for a night ground, and
  `rend.js`, the frame renderer. Drop them into Kelly's `WEBSITE RECENT/hero-options`
  folder (they need its `shared/`, `data/`, `vendor/` and `fonts/`).
- `sources/bridge-wireframe-night/index.html`: the 3D mitosis wireframe page with the
  `?night=1&shift=&zoom=` HelioFlux cut that made the current bridge film. The
  original lives in `WEBSITE RECENT/cancer-wireframe/`.

## Rights

- C and D (NLM film): public domain (National Library of Medicine, hmdvid-7602221A,
  Pomerat). Credit NLM if used; name Henrietta Lacks respectfully if captioned.
- A and B: traced from `cancer.mov`, a screen recording whose source is unconfirmed.
  Confirm where it came from before using either.
- Do not use David Barlow's HeLa clips or the Tomocube clip (watermarked stock), or
  anything traced from them.

## Re-render

F and D (from `hero-options`, with Playwright and swiftshader WebGL):

```
node rend.js option-f-horizon.html "theme=night&cx=0.5&tz=0.06" 1600 900 video 30 0 end fr-f-night
node rend.js option-d-pointcloud.html "theme=night&tx=0&labels=0" 1600 900 video 30 0 end fr-d-night
ffmpeg -framerate 30 -i fr-f-night/f_%05d.png -c:v libx264 -crf 22 -pix_fmt yuv420p div-f.mp4
```

NLM (source: https://collections.nlm.nih.gov/ext/hmdvid/hmdvid-7602221A/hmdvid-7602221A.mp4):

```
D2="format=gray,format=rgb24,lutrgb=r='8+pow(val/255\,1.7)*(207-8)':g='36+pow(val/255\,1.7)*(229-36)':b='50+pow(val/255\,1.7)*(236-50)'"
# sheet, 1 s crossfade loop
ffmpeg -ss 331.2 -to 340.9 -i hmdvid-7602221A.mp4 -an -filter_complex "[0:v]crop=552:476:2:2,scale=1104:952:flags=lanczos,$D2,fps=30,split[a][b];[a]trim=1:9.7,setpts=PTS-STARTPTS[main];[b]trim=0:1,setpts=PTS-STARTPTS[head];[main][head]xfade=transition=fade:duration=1:offset=7.7,format=yuv420p" -c:v libx264 -crf 23 div-nlm-sheet.mp4
# multipolar close-up, 1.5 s crossfade loop
ffmpeg -ss 344.45 -to 380.2 -i hmdvid-7602221A.mp4 -an -filter_complex "[0:v]crop=520:476:2:2,scale=1040:952:flags=lanczos,$D2,fps=30,split[a][b];[a]trim=1.5:35.75,setpts=PTS-STARTPTS[main];[b]trim=0:1.5,setpts=PTS-STARTPTS[head];[main][head]xfade=transition=fade:duration=1.5:offset=32.75,format=yuv420p" -c:v libx264 -crf 24 div-nlm-multi.mp4
```

The crop drops the film's frame counter.

## To use one on the site

Make a desktop cut (1600 wide) and a phone cut (portrait; F would need its own
portrait render), plus posters. Swap the `bridge-mitosis-*` sources and posters in
`index.html`, then tighten the empty "Keep scrolling" strip at the end of the
tumor story.
