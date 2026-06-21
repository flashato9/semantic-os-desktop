# EntryPage Learning Log

**Date:** 2026-06-21

## React

### 1. What is Router, Routes, and Route in React?

**Route** is a mapping between a path and a component. It tells React which component to display for a given path.
- `<Route path="/" element={<EntryPage />} />` means: when at path "/", show EntryPage
- `<Route path="/main" element={<CNet />} />` means: when at path "/main", show CNet

**Routes** is a container that holds all your Route definitions.

**Router** (MemoryRouter in our Electron app) wraps Routes and enables navigation between routes. MemoryRouter keeps the route state purely in memory—no real URLs, just virtual paths.

### 1b. How does routing work in an Electron context?

In Electron, there's no web server or URL bar. MemoryRouter handles this by:
- Keeping route state **in memory only**
- No real URLs get created (stays at `file://...`)
- Routes are just identifiers for which component to show
- Switching routes means re-rendering a different component

### 1c. How do I route to a different component?

Use the `useNavigate()` hook:
```jsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/main');  // Switch to the /main route
  };
  
  return <button onClick={handleClick}>Go</button>;
}
```

Or use the `<Link>` component:
```jsx
import { Link } from 'react-router-dom';

function MyComponent() {
  return <Link to="/main">Go to Main</Link>;
}
```

## CSS

### 2. What does `background: linear-gradient(135deg, #e3f2fd 0%, #e0f7fa 100%);` do?

Creates a **gradient background** that blends two colors.
- `135deg` - the angle of the gradient (135 degrees = diagonal from top-left to bottom-right)
- `#e3f2fd 0%` - starting color (light blue) at 0% (top-left)
- `#e0f7fa 100%` - ending color (cyan) at 100% (bottom-right)

Result: a smooth color fade from light blue to cyan across the background.

### 3. Is `max-width: 600px;` not responsive? Does it matter? Why do many people use `px` if it's not responsive?

`max-width: 600px` **is responsive**, but in a different way:
- It limits the container to **never exceed 600px width**
- Combined with responsive widths (like `width: 90%`), it works great
- On small screens, the element shrinks below 600px; on large screens, it stops at 600px
- This prevents awkward layouts on huge monitors while still adapting to smaller screens

People use `px` because:
- It's precise and predictable
- Works well when combined with other responsive units
- Most layouts mix `px` (for fixed sizes) with percentages/viewport units (for flexibility)
- Pure pixel-based design is not responsive; it's **pixel-based + responsive sizing together** that works

**Important nuance: CSS pixels ≠ physical pixels**
- CSS pixels are a **logical unit**, not actual hardware pixels
- On standard displays (96 DPI): 1 CSS pixel = 1 physical pixel
- On Retina/high-density displays: 1 CSS pixel = 2+ physical pixels
- The browser automatically handles scaling, so you don't need to worry about it
- In practice, just write `16px` and it works correctly on all devices

### 4. What does `.input-wrapper:focus-within` do?

**Selects an element when any of its children has focus.**
- When the user clicks inside the input field (child element gains focus), the `input-wrapper` (parent) applies the `:focus-within` styles
- In our app: when you click in the text input, the box-shadow glows brighter
- Useful for styling a container based on what's happening inside it

**Important nuance: `:focus` vs `:focus-within`**

`:focus` - applies when **that specific element itself** has focus
- `input-wrapper:focus` only triggers if the wrapper itself is focused
- Since you're clicking the input (child), the wrapper never gets focus directly

`:focus-within` - applies when **the element itself OR any child** has focus
- `input-wrapper:focus-within` triggers when the input (child) is focused
- Perfect for styling the entire container based on child interaction

Example:
```html
<div class="input-wrapper">
  <button>+</button>
  <input type="text" />
</div>
```

When you click the `<input>`:
- `:focus` on `.input-wrapper` = **does NOT trigger** (wrapper itself isn't focused)
- `:focus-within` on `.input-wrapper` = **DOES trigger** (a child has focus)

### 5. What does `@media (max-width: 600px)` do?

**A media query that applies styles only on screens 600px wide or smaller.**
- `@media` - "apply these styles when certain conditions are met"
- `(max-width: 600px)` - the condition: screen width is 600px or less
- Any CSS inside this block only applies to mobile/tablet screens, not desktops

Example:
```css
.greeting {
  font-size: 3rem;  /* applies to all screens */
}

@media (max-width: 600px) {
  .greeting {
    font-size: 2rem;  /* on small screens, use smaller font */
  }
}
```

This is the core of **responsive design** - different styles for different screen sizes.

## HTML
