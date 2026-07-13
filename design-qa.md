# RND Hero and Navbar Design QA

## Reference

- User-provided homepage screenshot in the current request
- Design requirements from `pasted-text.txt`

## Viewports checked

- 1920 x 1080
- 1440 x 900
- 1366 x 768
- 1024 x 900
- 390 x 844 via Chrome DevTools device metrics emulation

## Fidelity ledger

| Check | Reference requirement | Render evidence | Result |
| --- | --- | --- | --- |
| Navbar width | Shorter horizontally, unchanged practical height | Centered at max-width 1400px with 32px desktop gutters and restored 40px brand mark | Passed |
| Hero balance | Controlled 46/54 to 50/50 composition | 48/52 grid with 40-48px gap and aligned content/media bounds | Passed |
| Image treatment | Building must not dominate | Defined 4:3 media frame, 28px radius, subtle border and restrained shadow | Passed |
| Typography | Smaller editorial headline with intentional wrapping | Responsive 50-82px clamp and controlled 672px text column | Passed |
| Next section | 80-140px visible at laptop viewport | At 1366 x 768 the next section begins at y=660, leaving 108px visible | Passed |
| Mobile | No horizontal overflow or clipped controls | At 390px, document scroll width equals 390px; both CTAs end at x=374 | Passed |
| Motion | Subtle and reduced-motion safe | Existing Motion transitions retained with `useReducedMotion`; image hover limited to 1.2% scale | Passed |
| Copy and behavior | No wording, routes, or functionality changed | Existing headline, body, CTAs, navigation items and anchors preserved | Passed |

## Above-the-fold copy diff

No visible copy was added, removed, renamed, or reordered.

## Intentional deviations

None.

## Final result

Passed.
