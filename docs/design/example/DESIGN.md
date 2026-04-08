# Design System: The tuHerenciaFácil Hybrid (Stripe-Revolut-Wise)

## 1. Visual Theme & Atmosphere
The tuHerenciaFácil design system creates a **Premium Fintech-Legal** atmosphere. It balances the precision and trust of Stripe, the bold confidence of Revolut, and the approachable humanity of Wise.

- **Background:** A warm off-white surface (`#F9FAFB`) to avoid clinical coldness.
- **Depth:** Multi-layered shadows tinted with **Azul Corporativo (`#002845`)**.
- **Humanity:** Generous border radii (20px) and pill-shaped interactive elements.

## 2. Color Palette & Roles

### Primary (Brand)
- **Azul Corporativo (`#002845`)**: Primary headings, navigation backgrounds, and deep emphasis.
- **Azul Tecnológico (`#3A8DA8`)**: Primary CTAs, active states, and brand links.
- **Naranja Acento (`#FF8C3C`)**: Alerts, progress indicators, and attention-grabbing highlights.

### Neutrals
- **Surface (`#F9FAFB`)**: Page background.
- **Card (`#FFFFFF`)**: Component backgrounds.
- **Text Primary (`#002845`)**: Default text color.
- **Text Secondary (`#4B5563`)**: Body text and descriptions.
- **Border (`#E5E7EB`)**: Subtle dividers and input borders.

## 3. Typography (Revolut + Stripe)

| Role | Inspired By | Font | Size | Weight | Tracking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | Revolut | Inter | 64px | 500 | -2px |
| **Section Head** | Revolut | Inter | 32px | 500 | -1px |
| **Card Title** | Stripe | Inter | 20px | 600 | -0.5px |
| **Body** | Stripe | Inter | 16px | 400 | Normal |
| **Caption** | Stripe | Inter | 14px | 400 | Normal |

## 4. Components & Motion

### Buttons (Wise + Revolut)
- **Shape:** Full Pill (`9999px`).
- **Interaction:** Wise-style `scale(1.05)` on hover, `scale(0.95)` on click.
- **Shadow:** Stripe-style layered shadow when elevated.

### Cards (Hybrid)
- **Radius:** `20px`.
- **Shadow:** `0 10px 25px -5px rgba(0, 40, 69, 0.1), 0 8px 10px -6px rgba(0, 40, 69, 0.1)`. (Note the `#002845` blue tint in the shadow).

### Data Tables (Stripe)
- **Style:** Minimalist borders, generous horizontal padding, high vertical density.
- **Numbers:** Tabular figures (`tnum`) for all currency and dates.

## 5. Do's and Don'ts

### Do
- Use **Azul Tecnológico** for the main action on any screen.
- Apply the **1.05 scale** to all primary interactive elements.
- Use **Azul Corporativo** for all headings to establish authority.
- Maintain **generous whitespace** between sections (Revolut principle).

### Don't
- Don't use sharp corners (radius < 8px).
- Don't use pure black (`#000000`) for text; always use Azul Corporativo.
- Don't over-use the Naranja Acento; it's for attention, not decoration.
- Don't use aggressive "Sales" shadows; keep them soft and tinted blue.
