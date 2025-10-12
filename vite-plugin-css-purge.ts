import type { Plugin } from 'vite';

export function cssPurgePlugin(): Plugin {
  return {
    name: 'css-purge',
    apply: 'build',
    generateBundle(options, bundle) {
      // Find CSS files and add purge comments
      for (const fileName in bundle) {
        const file = bundle[fileName];
        if (fileName.endsWith('.css') && file.type === 'asset' && typeof file.source === 'string') {
          // Add CSS optimization hints
          let optimizedCss = file.source;
          
          // Remove unused CSS custom properties that aren't used
          const unusedVars = [
            '--tw-backdrop-blur',
            '--tw-backdrop-brightness', 
            '--tw-backdrop-contrast',
            '--tw-backdrop-grayscale',
            '--tw-backdrop-hue-rotate',
            '--tw-backdrop-invert',
            '--tw-backdrop-opacity',
            '--tw-backdrop-saturate',
            '--tw-backdrop-sepia',
          ];
          
          unusedVars.forEach(varName => {
            const regex = new RegExp(`${varName}:[^;]+;`, 'g');
            optimizedCss = optimizedCss.replace(regex, '');
          });
          
          // Remove empty CSS rules
          optimizedCss = optimizedCss.replace(/[^{}]+\{\s*\}/g, '');
          
          // Minify further by removing extra whitespace
          optimizedCss = optimizedCss.replace(/\s+/g, ' ').trim();
          
          file.source = optimizedCss;
        }
      }
    },
  };
}