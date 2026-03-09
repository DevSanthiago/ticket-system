import { useEffect } from "react";
import { useAnimation } from "framer-motion";
import type { UseIconAnimationOptions } from "../types";

export function useIconAnimation(isHovered?: boolean, options?: UseIconAnimationOptions) {
    const controls = useAnimation();
    const shouldLoop = options?.loop || false;
    const intervalTime = options?.loopInterval || 5000;

    useEffect(() => {
        if (shouldLoop) {
            controls.start("animate");

            const interval = setInterval(() => {
                controls.set("normal");
                controls.start("animate");
            }, intervalTime);

            return () => clearInterval(interval);
        }

        if (isHovered === true) {
            controls.start("animate");
        } else if (isHovered === false) {
            controls.start("normal");
        }
    }, [isHovered, shouldLoop, intervalTime, controls]);

    return controls;
}