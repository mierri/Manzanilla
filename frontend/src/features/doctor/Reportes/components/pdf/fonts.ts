import { Font } from '@react-pdf/renderer';

// fontsource v4 via jsDelivr — WOFF format for broadest fontkit compatibility
Font.register({
  family: 'Poppins',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/poppins@4/files/poppins-latin-400-normal.woff' },
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/poppins@4/files/poppins-latin-700-normal.woff', fontWeight: 700 },
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/poppins@4/files/poppins-latin-400-italic.woff', fontStyle: 'italic' },
  ],
});

Font.register({
  family: 'Playfair Display',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/playfair-display@4/files/playfair-display-latin-400-normal.woff' },
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/playfair-display@4/files/playfair-display-latin-700-normal.woff', fontWeight: 700 },
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/playfair-display@4/files/playfair-display-latin-400-italic.woff', fontStyle: 'italic' },
  ],
});

export const FONT         = 'Poppins';
export const FONT_HEADING = 'Playfair Display';
