import type { Plugin } from 'vite';

export function criticalCssPlugin(): Plugin {
  return {
    name: 'critical-css',
    apply: 'build',
    generateBundle(options, bundle) {
      // Extract critical CSS for above-the-fold content
      const criticalCss = `
        /* Critical CSS for initial render */
        *,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}
        ::before,::after{--tw-content:''}
        html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal}
        body{margin:0;line-height:inherit}
        .bg-background{background-color:hsl(var(--background))}
        .text-foreground{color:hsl(var(--foreground))}
        .min-h-screen{min-height:100vh}
        .flex{display:flex}
        .flex-col{flex-direction:column}
        .items-center{align-items:center}
        .justify-center{justify-content:center}
        .p-4{padding:1rem}
        .text-center{text-align:center}
        .text-sm{font-size:0.875rem;line-height:1.25rem}
      `;

      // Find the HTML file and inject critical CSS
      for (const fileName in bundle) {
        const file = bundle[fileName];
        if (fileName.endsWith('.html') && file.type === 'asset' && typeof file.source === 'string') {
          file.source = file.source.replace(
            '<!-- Critical CSS will be inlined here by Vite -->',
            `<style>${criticalCss}</style>`
          );
        }
      }
    },
  };
}