# StumbleClone Architectural Standards

## UI/UX Architecture

- **Philosophy:** Code Ownership — we own and customize our component source code, not just use external libraries as black boxes.
- **Design Tokens:** Always utilize a consistent design token system defined in CSS variables (colors, spacing, typography, shadows) to ensure harmony across the application.
- **Tech Stack:**
  - **Foundations:** Tailwind CSS (v4), TypeScript, clsx/twMerge.
  - **Component Library:** shadcn/ui (Radix UI primitives).
  - **Polished UI:** HeroUI (for polished, ready-to-use components).
  - **Animations:** Framer Motion (custom), Aceternity UI/Magic UI (animated components).
  - **Forms:** React Hook Form + Zod.
  - **Icons:** Lucide React.
- **Design Systems:** Reference Myna UI or Flowbite design systems for inspiration and consistency within the Tailwind/shadcn ecosystem.
