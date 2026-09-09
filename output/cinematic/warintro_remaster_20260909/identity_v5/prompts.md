# Built-in image_gen — protagonist identity correction

2026-09-09. Both images are narrow edits of supplied scene art. The user identified the protagonist as looking like a different person/game between the two scenes. The canonical body/costume/face reference is `assets/charselect/warrior_cut.png`, supported by `poster_idle_warrior_higgsfield.jpg`. `portrait_warrior.png` was inspected but was not used as a generation reference because the active full-body selection artwork defines this edit.

## W09

Inputs in order: `assets/cutscene/warintro/cin_bloodbath.jpg`, `assets/charselect/warrior_cut.png`, `assets/charselect/poster_idle_warrior_higgsfield.jpg`.

Prompt:

Use case: identity-preserve. Edit the FIRST supplied image, the existing W09 aftermath cinematic frame. Images 2 and 3 are the authoritative identity/costume/weapon reference for the SAME game protagonist. Output one 16:9 full-frame cinematic image, not a contact sheet. Change ONLY the standing central protagonist to match the reference warrior exactly: short messy jet-black hair and same head silhouette; broad, grounded athletic build; the same layered scratched black iron breastplate, overlapping angular shoulder plates, heavy segmented gauntlets and boots; a visibly deep weathered crimson torn cape/scarf, not a black or grey cape; and one exceptionally broad straight greatsword with the same plain crossguard and blade proportions from reference 2, held in the same lowered right-hand direction as image 1. Preserve the standing rear-facing pose and the original head/body position and camera framing. The back and armor must be physically consistent with the reference character, not a slimmer alternate knight. Match the muted, physically detailed dark-fantasy rendering of the reference character. Keep the existing cathedral, moonlight, braziers, camera, all other figures and the existing aftermath depiction unchanged as closely as possible. This is an identity/costume correction of a supplied image, not a new violence scene. Do not add, intensify, sharpen, or make any injury detail more graphic. Do not add action, people, weapons, wounds, or text. No new skull-shaped armor ornaments. Preserve the original background and composition.

Output: `w09_identity.png`, generated image `exec-8b7615d9-7c39-43e5-a17a-29f4eff8f262.png`.

## W10

Inputs in order: `assets/cutscene/warintro/cin_torture.jpg`, `assets/charselect/warrior_cut.png`, `assets/charselect/poster_idle_warrior_higgsfield.jpg`, corrected `w09_identity.png`.

Prompt:

Use case: identity-preserve. Perform a narrow identity and wardrobe correction to the FIRST existing fictional cinematic image. Output one landscape 16:9 frame. Edit only the adult armored protagonist occupying the right half; images 2 and 3 are his canonical game identity, and image 4 is his corrected adjacent cinematic shot. Replace his overly stylized anime face, hair silhouette and alternate skull-ornamented armor with the exact reference protagonist: short messy jet-black hair, mature angular male face with the same brow, nose, jaw and restrained facial proportions of image 2, identical black iron layered armor with broad segmented angular pauldrons, worn leather belts and rivets, and a deep weathered crimson scarf and torn cape clearly visible on his back. Keep the protagonist in exactly the same crouched pose, head angle, expression and position and preserve his existing hand/held-object geometry; do not change or advance any action. Remove the alternate skull-shaped knee/shoulder designs from his armor and use the same normal angular plate construction as the references. Match the physically textured, desaturated dark-fantasy game character look from images 2-4. Preserve the entire other character on the left, his pose and all existing injury depiction and background as closely to the first image as possible: do not add, intensify, sharpen, or make any injury detail more graphic or realistic. This is only a protagonist identity/costume correction of an existing supplied image, not a request for a new act of violence. No additional wounds, actions, weapons, people, text or captions. Preserve the camera composition and existing light direction; the red cape, armor and head must read as the same protagonist in image 4.

Output: `w10_identity.png`, generated image `exec-c5bf35b7-e9b7-4e1c-9703-a99b5d433383.png`.

## Motion implementation

These corrected images use native FFmpeg camera zoom and the four existing editorial cuts. They are not new generated character animations. The hero, held object, other characters and poses stay still. The total replacement is 14 seconds (46–60s); the 101-second v4 audio stream is copied without re-encoding.
