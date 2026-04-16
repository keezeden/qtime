# Design System Strategy: Kinetic Midnight

## 1. Overview & Creative North Star: "The Electric Blueprint"
This design system is a high-octane evolution of Neobrutalism, refined through a lens of premium editorial craft. Our Creative North Star is **"The Electric Blueprint"**—an aesthetic that balances the structural rigidity of architectural drafts with the chaotic energy of underground neon culture.

By replacing the previous purple bias with a soul-crushing midnight blue (`#0b0e14`), we create a vacuum of space that allows our accent colors to vibrate with higher perceived intensity. We reject the "safe" layouts of modern SaaS; instead, we embrace intentional asymmetry, heavy-weighted 3D extrusions, and a "Scrabble-tile" modularity that feels both tactile and digital.

## 2. Colors: High-Voltage Contrast
The palette is built on a foundation of "Void" tones, punctuated by "Glow" accents.

*   **The Foundation:** Use `background` (`#0b0e14`) for the primary canvas. The "midnight" depth is critical—it ensures that the `primary` (Neon Pink) and `secondary` (Teal) don't just sit on the page, but appear to emit light.
*   **The "No-Line" Exception:** While traditional Neobrutalism relies on thick black borders, this system uses **Tonal Boundaries** for internal nesting. Use `surface_container_high` (`#1c2028`) to define internal modules against the `surface` background.
*   **Surface Hierarchy:**
    *   **Lowest Layer:** `surface_container_lowest` (#000000) for deep inset areas or "wells."
    *   **Main Canvas:** `surface` (#0b0e14).
    *   **Elevated Modules:** `surface_container_highest` (#22262f) for primary interaction cards.
*   **The Glass & Gradient Rule:** For hero elements, do not use flat fills. Use a linear gradient from `primary` (#ff89ab) to `primary_dim` (#e30071) at a 135-degree angle. For floating overlays, use `surface_bright` at 60% opacity with a `20px` backdrop-blur to create "Neon Frosted Glass."

## 3. Typography: The Kinetic Scale
We utilize a high-contrast pairing to reinforce the "Scrabble" aesthetic.

*   **The Structural Voice (Space Grotesk):** This is our "Kinetic" engine. Used for `display` and `headline` tiers. It should be tracked tightly (-0.02em) to feel like a solid block of wood-pressed type. 
    *   *Editorial Note:* Use `display-lg` (3.5rem) with `on_surface` text against `secondary_container` backgrounds to create massive, unmissable focal points.
*   **The Functional Voice (Be Vietnam Pro):** Our "Slime" is the fluid, readable counterpoint. Used for `body` and `title` scales. It provides the necessary breathability amidst the brutalist structure.
*   **Hierarchy as Brand:** Use `label-md` in all-caps with `1.5pt` letter spacing for all metadata. This mimics the "technical specs" found on blueprints.

## 4. Elevation & Depth: 3D Kineticism
In this system, depth is not "faked" with soft shadows; it is "built" with geometry.

*   **The Layering Principle:** Avoid standard drop shadows. Instead, use **Hard-Edge Extrusions**. A card sitting on `surface` should have a 4px or 8px "shadow" created by a solid offset block of `surface_container_highest` or `outline`.
*   **Ambient Shadows:** If a floating state is required (e.g., a dragged tile), use a massive, ultra-low opacity glow rather than a shadow. Use `secondary` at 10% opacity with a 64px blur.
*   **The "Ghost Border" Fallback:** While Neobrutalism loves borders, use `outline_variant` (#45484f) at 30% opacity for secondary UI elements to keep the interface from feeling "jittery."
*   **Tactile 3D:** Buttons and Cards must feel like physical tiles. Use a `1px` top-border of `surface_bright` to simulate a "beveled edge" catching a neon light source.

## 5. Components: The Modular Tile Set

*   **Buttons:**
    *   **Primary:** Solid `secondary` (#26fedc) fill with a 4px hard offset "shadow" in `on_secondary_fixed_variant`. No rounded corners (`0px`). Text is `spaceGrotesk` Bold.
    *   **State Change:** On hover, the button should "sink"—reduce the 4px offset to 0px and shift the X/Y position to simulate a physical press.
*   **Cards:** Forbid the use of divider lines. Separate content using the `Spacing Scale`. A `12` (4rem) gap is the standard for major section breaks. Cards should use `surface_container_low` with a thick `2px` border of `outline`.
*   **Inputs:** Use `surface_container_highest` for the field fill. When focused, the border should jump to `tertiary` (#ffe96c) with a `4px` hard-edge extrusion.
*   **Chips:** These are our "Scrabble Tiles." Square corners, `spaceGrotesk` typography, and high-contrast fills (`tertiary_container`).
*   **Kinetic Sliders:** Use a thick `secondary` track with a square, oversized thumb. The thumb should have a "ghost" trail (a lower opacity gradient) to emphasize motion.

## 6. Do's and Don'ts

### Do:
*   **Do** embrace extreme scale. If a headline is big, make it uncomfortably big (`display-lg`).
*   **Do** use "Slime" accents. Use the `secondary` (Teal) for success states and `primary` (Pink) for interactive energy.
*   **Do** treat white space as a structural element. Use the `24` (8.5rem) spacing token to separate unrelated conceptual blocks.

### Don't:
*   **Don't** use border-radius. Ever. The `0px` constraint is absolute to maintain the "Scrabble Tile" rigidity.
*   **Don't** use "Standard" Grey. Every neutral must be pulled from the Midnight Blue (`#0b0e14`) or Charcoal palette to maintain the "Electric" atmosphere.
*   **Don't** use 1px dividers. If you need to separate content, use a background color shift to `surface_container_low` or a massive vertical gap.