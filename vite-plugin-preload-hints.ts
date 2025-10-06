import type { Plugin } from 'vite';

export function preloadHintsPlugin(): Plugin {
  return {
    name: 'preload-hints',
    apply: 'build',
    generateBundle(options, bundle) {
      // Find critical chunks that should be preloaded
      const criticalChunks: string[] = [];
      
      for (const fileName in bundle) {
        const file = bundle[fileName];
        if (file.type === 'chunk') {
          // Preload main entry and react vendor chunks
          if (file.isEntry || fileName.includes('react-vendor') || fileName.includes('index')) {
            criticalChunks.push(fileName);
          }
        }
      }

      // Generate preload links
      const preloadLinks = criticalChunks
        .map(chunk => `<link rel="modulepreload" href="/${chunk}" crossorigin>`)
        .join('\n    ');

      // Find the HTML file and inject preload hints
      for (const fileName in bundle) {
        const file = bundle[fileName];
        if (fileName.endsWith('.html') && file.type === 'asset' && typeof file.source === 'string') {
          file.source = file.source.replace(
            '<link rel="stylesheet" href="/src/index.css" />',
            `${preloadLinks}\n    <link rel="stylesheet" href="/src/index.css" />`
          );
        }
      }
    },
  };
}