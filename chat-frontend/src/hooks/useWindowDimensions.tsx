import { useState, useEffect } from 'react';

/** Hook to get the current window dimensions
 *  @returns windowDimensions - Object containing the current window dimensions (width, height)
*/
export function useWindowDimensions(): { width: number, height: number } {
    const [windowDimensions, setWindowDimensions] = 
        useState<{width: number, height: number}>({width: window.innerWidth, height: window.innerHeight});

    useEffect(() => {
        const handleResize = () => {
            setWindowDimensions({width: window.innerWidth, height: window.innerHeight});
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions;
}