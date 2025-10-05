/**
 * Performance monitoring utilities for tracking scroll and load performance
 */

export class PerformanceMonitor {
    private static marks: Map<string, number> = new Map();
    private static measures: Map<string, number> = new Map();

    /**
     * Mark the start of a performance measurement
     */
    static mark(name: string): void {
        if (typeof performance !== "undefined") {
            this.marks.set(name, performance.now());
        }
    }

    /**
     * Measure the time since a mark was set
     */
    static measure(name: string, startMark: string): number {
        if (typeof performance === "undefined") return 0;

        const startTime = this.marks.get(startMark);
        if (!startTime) {
            console.warn(`No mark found for: ${startMark}`);
            return 0;
        }

        const duration = performance.now() - startTime;
        this.measures.set(name, duration);

        if (process.env.NODE_ENV === "development") {
            console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
        }

        return duration;
    }

    /**
     * Get all measurements
     */
    static getMeasures(): Record<string, number> {
        return Object.fromEntries(this.measures);
    }

    /**
     * Clear all marks and measures
     */
    static clear(): void {
        this.marks.clear();
        this.measures.clear();
    }

    /**
     * Log performance metrics to console
     */
    static logMetrics(): void {
        if (process.env.NODE_ENV === "development") {
            console.table(this.getMeasures());
        }
    }
}

/**
 * Hook to measure component render time
 */
export function measureRenderTime(componentName: string) {
    if (typeof performance === "undefined") return;

    const startMark = `${componentName}-render-start`;
    const endMark = `${componentName}-render-end`;

    PerformanceMonitor.mark(startMark);

    return () => {
        PerformanceMonitor.measure(`${componentName} render`, startMark);
    };
}

/**
 * Measure time to first contentful paint
 */
export function measureFirstContentfulPaint(): void {
    if (typeof performance === "undefined" || typeof PerformanceObserver === "undefined") {
        return;
    }

    try {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === "first-contentful-paint") {
                    console.log(`🎨 First Contentful Paint: ${entry.startTime.toFixed(2)}ms`);
                }
            }
        });

        observer.observe({ entryTypes: ["paint"] });
    } catch (error) {
        console.warn("Performance Observer not supported");
    }
}

/**
 * Measure scroll performance
 */
export function measureScrollPerformance(callback: () => void): () => void {
    let frameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let totalTime = 0;

    const measureFrame = () => {
        const currentTime = performance.now();
        const delta = currentTime - lastTime;
        lastTime = currentTime;

        frameCount++;
        totalTime += delta;

        if (frameCount % 60 === 0) {
            const avgFrameTime = totalTime / frameCount;
            const fps = 1000 / avgFrameTime;

            if (process.env.NODE_ENV === "development") {
                console.log(`📊 Scroll FPS: ${fps.toFixed(1)}`);
            }
        }

        callback();
        frameId = requestAnimationFrame(measureFrame);
    };

    frameId = requestAnimationFrame(measureFrame);

    return () => {
        cancelAnimationFrame(frameId);
    };
}
