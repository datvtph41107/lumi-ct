# LoadingSpinner Component

A flexible and accessible loading spinner component with multiple size options, color variants, and overlay modes.

## Features

- **Multiple sizes**: xs, small, medium, large, xl
- **Color variants**: primary, secondary, success, warning, error
- **Overlay modes**: overlay and fullscreen options
- **Accessibility**: ARIA labels and screen reader support
- **Dark mode**: Automatic dark mode support
- **Customizable**: Custom messages and styling

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'small' \| 'medium' \| 'large' \| 'xl'` | `'medium'` | Size of the spinner |
| `message` | `string` | `undefined` | Optional message to display below the spinner |
| `className` | `string` | `''` | Additional CSS classes |
| `overlay` | `boolean` | `false` | Whether to show as an overlay |
| `fullScreen` | `boolean` | `false` | Whether to show as a fullscreen overlay |
| `color` | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error'` | `'primary'` | Color variant of the spinner |

## Usage

### Basic Usage

```tsx
import LoadingSpinner from '~/components/LoadingSpinner';

<LoadingSpinner />
```

### With Message

```tsx
<LoadingSpinner 
    message="Loading your data..." 
    size="large" 
/>
```

### Different Sizes

```tsx
<LoadingSpinner size="xs" />      // 16px
<LoadingSpinner size="small" />   // 20px
<LoadingSpinner size="medium" />  // 40px (default)
<LoadingSpinner size="large" />   // 60px
<LoadingSpinner size="xl" />      // 80px
```

### Color Variants

```tsx
<LoadingSpinner color="primary" />   // Blue (default)
<LoadingSpinner color="secondary" /> // Gray
<LoadingSpinner color="success" />   // Green
<LoadingSpinner color="warning" />   // Yellow
<LoadingSpinner color="error" />     // Red
```

### Overlay Mode

```tsx
// Overlay on parent container
<LoadingSpinner 
    overlay={true}
    message="Saving changes..."
/>

// Fullscreen overlay
<LoadingSpinner 
    fullScreen={true}
    message="Loading application..."
/>
```

### Custom Styling

```tsx
<LoadingSpinner 
    className="my-custom-class"
    message="Custom styled spinner"
/>
```

## Examples

### In a Button

```tsx
const [isLoading, setIsLoading] = useState(false);

<button 
    onClick={handleSubmit}
    disabled={isLoading}
    className="btn btn-primary"
>
    {isLoading ? (
        <LoadingSpinner size="xs" color="primary" />
    ) : (
        'Submit'
    )}
</button>
```

### In a Form

```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

{isSubmitting && (
    <LoadingSpinner 
        overlay={true}
        message="Submitting form..."
        color="success"
    />
)}
```

### In a Data Table

```tsx
const [isLoading, setIsLoading] = useState(true);

{isLoading ? (
    <LoadingSpinner 
        size="large"
        message="Loading contracts..."
        color="primary"
    />
) : (
    <DataTable data={contracts} />
)}
```

### Fullscreen Loading

```tsx
const [isAppLoading, setIsAppLoading] = useState(true);

{isAppLoading && (
    <LoadingSpinner 
        fullScreen={true}
        message="Initializing application..."
        color="primary"
    />
)}
```

## Accessibility

The component includes proper accessibility features:

- `role="status"` - Indicates this is a status indicator
- `aria-live="polite"` - Announces changes to screen readers
- `aria-label` - Provides a label for screen readers

## Dark Mode Support

The component automatically adapts to dark mode preferences:

- Background colors adjust for dark themes
- Text colors change for better contrast
- Spinner colors remain consistent

## CSS Classes

The component uses CSS modules with the following classes:

- `.loading-spinner-container` - Main container
- `.loading-spinner-container--overlay` - Overlay variant
- `.loading-spinner-container--fullscreen` - Fullscreen variant
- `.loading-spinner` - Spinner wrapper
- `.loading-spinner--{size}` - Size variants
- `.loading-spinner--{color}` - Color variants
- `.spinner` - The actual spinning element
- `.message` - Message text styling

## Best Practices

1. **Use appropriate sizes**: xs for buttons, medium for content areas, large for full pages
2. **Provide meaningful messages**: Help users understand what's happening
3. **Choose appropriate colors**: Use success for positive actions, warning for cautions, error for problems
4. **Consider overlay mode**: Use overlay when you want to prevent user interaction
5. **Handle loading states properly**: Always provide fallback content for loading failures