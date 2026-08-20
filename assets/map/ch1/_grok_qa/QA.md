# CH1 Grok map-kit prototype QA

> DRAFT. Not production. Do not copy into `floor_objects/` or `collision/` without approval.
> 2026-08-20 | model `grok-imagine-image-2.0` | 8 images, 2 API calls | no key in this file

Reference: `assets/map/ch1/ground_dark_soil.png` (1024×1024). Outputs 2048×2048 PNG.

| id | verdict | note |
|---|---|---|
| crack_v01 | PASS | same soil family, hairline cracks, playable |
| crack_v02 | MAYBE | too close to original, cracks almost vanish |
| crack_v03 | PASS | organic network, still low contrast |
| crack_v04 | PASS | **BEST crack.** distinct fissures, not landmarky |
| root_edge_v01 | PASS | **BEST edge.** soil left, low roots right. kit-shaped |
| root_edge_v02 | FAIL | closed root ring / arena frame |
| root_edge_v03 | FAIL | ring + thicker trunk corners |
| root_edge_v04 | FAIL | ring + red glow veins too loud |

Not seamless (AI wrap not verified). No auto-regen. Contact: `qa_contact_sheet.jpg` (thumbs only).
