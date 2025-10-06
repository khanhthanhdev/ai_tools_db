import type { Plugin } from 'vite';

export function criticalCssPlugin(): Plugin {
  return {
    name: 'critical-css',
    apply: 'build',
    transformIndexHtml(html) {
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
        :root{--radius:0.5rem;--background:0 0% 100%;--foreground:222.2 84% 4.9%;--card:0 0% 100%;--card-foreground:222.2 84% 4.9%;--popover:0 0% 100%;--popover-foreground:222.2 84% 4.9%;--primary:221.2 83.2% 53.3%;--primary-foreground:210 40% 98%;--secondary:210 40% 96.1%;--secondary-foreground:222.2 47.4% 11.2%;--muted:210 40% 96.1%;--muted-foreground:215.4 16.3% 46.9%;--accent:210 40% 96.1%;--accent-foreground:222.2 47.4% 11.2%;--destructive:0 84.2% 60.2%;--destructive-foreground:210 40% 98%;--border:214.3 31.8% 91.4%;--input:214.3 31.8% 91.4%;--ring:221.2 83.2% 53.3%;--chart-1:12 76% 61%;--chart-2:173 58% 39%;--chart-3:197 37% 24%;--chart-4:43 74% 66%;--chart-5:27 87% 67%}
        .dark{--background:222.2 84% 4.9%;--foreground:210 40% 98%;--card:222.2 84% 4.9%;--card-foreground:210 40% 98%;--popover:222.2 84% 4.9%;--popover-foreground:210 40% 98%;--primary:217.2 91.2% 59.8%;--primary-foreground:222.2 47.4% 11.2%;--secondary:217.2 32.6% 17.5%;--secondary-foreground:210 40% 98%;--muted:217.2 32.6% 17.5%;--muted-foreground:215 20.2% 65.1%;--accent:217.2 32.6% 17.5%;--accent-foreground:210 40% 98%;--destructive:0 62.8% 30.6%;--destructive-foreground:210 40% 98%;--border:217.2 32.6% 17.5%;--input:217.2 32.6% 17.5%;--ring:224.3 76.3% 48%;--chart-1:220 70% 50%;--chart-2:160 60% 45%;--chart-3:30 80% 55%;--chart-4:280 65% 60%;--chart-5:340 75% 55%}
        .bg-primary{background-color:hsl(var(--primary))}
        .text-primary-foreground{color:hsl(var(--primary-foreground))}
      `;
      return html.replace(
        '<!-- Critical CSS will be inlined here by Vite -->',
        `<style>${criticalCss}</style>`
      );
    },
  };
}