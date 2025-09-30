# 📸 Images Directory

## Folder Structure

```
public/images/
├── katleho/          ← Add Katleho Tutors photos here
│   ├── sports-day.jpg
│   ├── classroom.jpg
│   ├── science-lab.jpg
│   ├── parent-meeting.jpg
│   ├── cultural-day.jpg
│   └── awards-ceremony.jpg
├── events/           ← General event images
└── products/         ← Shop product images
```

## Quick Start

1. **Download images from Katleho Tutors website**
2. **Save them to `public/images/katleho/`**
3. **Update the code** (see ADDING_KATLEHO_PHOTOS.md)

## Image Guidelines

- **Format**: JPG or PNG
- **Size**: 800x400px recommended for event cards
- **File naming**: Use descriptive names (e.g., `sports-day-2024.jpg`)
- **Compression**: Keep under 500KB per image for fast loading

## Usage in Code

```typescript
// Relative path from public folder
image: '/images/katleho/sports-day.jpg'
```

That's it! The image will load from this directory.
