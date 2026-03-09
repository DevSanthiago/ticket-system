"use client";

import { motion, type TargetAndTransition } from "framer-motion";
import { useIconAnimation } from "../../hooks/useIconAnimation";
import type { AnimatedIconProps, IconWrapperProps } from "../../types";

const IconWrapper = ({
    children,
    controls,
    size = 28,
    color = "currentColor",
    strokeWidth = 1.5,
    variants,
    className,
    style
}: IconWrapperProps) => (
    <div
        className={className}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", ...style }}
        onMouseEnter={() => controls.start("animate")}
        onMouseLeave={() => controls.start("normal")}
    >
        <motion.svg
            animate={controls}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial="normal"
            variants={variants}
            style={style}
        >
            {children}
        </motion.svg>
    </div>
);

const SPRING_TRANS = { type: "spring", stiffness: 50, damping: 10 } as const;
const SLIDER_SPRING = { type: "spring", stiffness: 100, damping: 12, mass: 0.4 } as const;

export const AnimatedBotMessageSquare = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    return (
        <IconWrapper
            controls={controls} {...props}
            variants={{
                normal: { rotate: 0, y: 0, scale: 1 },
                animate: { rotate: [0, -3, 3, 0], y: [0, 1.5, -1.5, 0], scale: [1, 1.03, 1], transition: { duration: 1 } }
            }}
        >
            <path d="M12 6V2H8" /><path d="M2 12h2" /><path d="M20 12h2" />
            <motion.path
                d="M20 16a2 2 0 0 1-2 2H8.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 4 20.286V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"
                variants={{ normal: { scale: 1 }, animate: { scale: [1, 1.04, 1], transition: { duration: 0.6, repeat: 1 } } }}
            />
            <motion.path d="M9 11v2" variants={{ normal: { scaleY: 1 }, animate: { scaleY: [1, 0.1, 1], transition: { duration: 0.4, delay: 0.1 } } }} />
            <motion.path d="M15 11v2" variants={{ normal: { scaleY: 1 }, animate: { scaleY: [1, 0.1, 1], transition: { duration: 0.4, delay: 0.2 } } }} />
        </IconWrapper>
    );
};

export const AnimatedWrench = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    return (
        <IconWrapper
            controls={controls} {...props}
            style={{ transformOrigin: "90% 10%" }}
            variants={{
                normal: { rotate: 0 },
                animate: { rotate: [0, 12, -14, 4, 0], transition: { duration: 1.05 } }
            }}
        >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" />
        </IconWrapper>
    );
};

export const AnimatedFileCog = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    return (
        <IconWrapper controls={controls} {...props}>
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M4.677 21.5a2 2 0 0 0 1.313.5H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v2.5" />
            <motion.g
                variants={{ normal: { rotate: 0 }, animate: { rotate: 180 } }}
                transition={SPRING_TRANS}
                style={{ transformOrigin: "6px 14px" }}
            >
                <path d="m3.2 12.9-.9-.4" /><path d="m3.2 15.1-.9.4" /><path d="m4.9 11.2-.4-.9" />
                <path d="m4.9 16.8-.4.9" /><path d="m7.5 10.3-.4.9" /><path d="m7.5 17.7-.4-.9" />
                <path d="m9.7 12.5-.9.4" /><path d="m9.7 15.5-.9-.4" /><circle cx="6" cy="14" r="3" />
            </motion.g>
        </IconWrapper>
    );
};

export const AnimatedFolderCog = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    return (
        <IconWrapper controls={controls} {...props}>
            <path d="M10.3 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.98a2 2 0 0 1 1.69.9l.66 1.2A2 2 0 0 0 12 6h8a2 2 0 0 1 2 2v3.3" />
            <motion.g
                variants={{ normal: { rotate: 0 }, animate: { rotate: 180 } }}
                transition={SPRING_TRANS}
                style={{ transformOrigin: "18px 18px" }}
            >
                <path d="m14.305 19.53.923-.382" /><path d="m15.228 16.852-.923-.383" />
                <path d="m16.852 15.228-.383-.923" /><path d="m16.852 20.772-.383.924" />
                <path d="m19.148 15.228.383-.923" /><path d="m19.53 21.696-.382-.924" />
                <path d="m20.772 16.852.924-.383" /><path d="m20.772 19.148.924.383" /><circle cx="18" cy="18" r="3" />
            </motion.g>
        </IconWrapper>
    );
};

export const AnimatedAirplay = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    return (
        <IconWrapper controls={controls} {...props}>
            <motion.path
                d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"
                variants={{ normal: { opacity: 1, pathLength: 1 }, animate: { opacity: [0, 1], pathLength: [0, 1], transition: { duration: 0.6 } } }}
            />
            <motion.path
                d="M12 15l5 6H7z"
                style={{ transformOrigin: "center" }}
                variants={{ normal: { scale: 1, opacity: 1 }, animate: { scale: [0.6, 1.1, 1], opacity: [0, 1], transition: { duration: 0.6 } } }}
            />
        </IconWrapper>
    );
};

export const AnimatedClipboardCheck = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    return (
        <IconWrapper controls={controls} {...props}>
            <rect height="4" rx="1" ry="1" width="8" x="8" y="2" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <motion.path
                d="m9 14 2 2 4-4"
                variants={{ normal: { pathLength: 1, opacity: 1 }, animate: { pathLength: [0, 1], opacity: [0, 1], transition: { duration: 0.3 } } }}
            />
        </IconWrapper>
    );
};

export const AnimatedCircleCheck = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered ?? true);
    return (
        <IconWrapper controls={controls} {...props}>
            <circle cx="12" cy="12" r="10" />
            <motion.path
                d="m9 12 2 2 4-4"
                variants={{ normal: { opacity: 1, pathLength: 1 }, animate: { opacity: [0, 1], pathLength: [0, 1], transition: { duration: 0.4 } } }}
            />
        </IconWrapper>
    );
};

export const AnimatedFeather = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    return (
        <IconWrapper
            controls={controls} {...props}
            variants={{
                normal: { rotate: 0, y: 0, x: 0 },
                animate: { rotate: [0, -8, 4, 0], y: [0, -4, 0], x: [0, 2, 0], transition: { duration: 1.6 } }
            }}
        >
            <path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z" />
            <path d="M16 8 2 22" /><path d="M17.5 15H9" />
        </IconWrapper>
    );
};

export const AnimatedArrowBigUpDash = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    return (
        <IconWrapper controls={controls} {...props}>
            <motion.path d="M9 19h6" variants={{ normal: { y: 0 }, animate: { y: [0, -1, 0], transition: { duration: 0.4 } } }} />
            <motion.path d="M9 15v-3H5l7-7 7 7h-4v3H9z" variants={{ normal: { y: 0 }, animate: { y: [0, -3, 0], transition: { duration: 0.4 } } }} />
        </IconWrapper>
    );
};

export const AnimatedFileCheck2 = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    return (
        <IconWrapper controls={controls} {...props}>
            <path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" />
            <motion.path
                d="m3 15 2 2 4-4"
                style={{ transformOrigin: "center" }}
                variants={{ normal: { pathLength: 1, opacity: 1 }, animate: { pathLength: [0, 1], opacity: [0, 1], transition: { duration: 0.4 } } }}
            />
        </IconWrapper>
    );
};

export const AnimatedSun = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    return (
        <IconWrapper controls={controls} {...props}>
            <circle cx="12" cy="12" r="4" />
            {["M12 2v2", "m19.07 4.93-1.41 1.41", "M20 12h2", "m17.66 17.66 1.41 1.41", "M12 20v2", "m6.34 17.66-1.41 1.41", "M2 12h2", "m4.93 4.93 1.41 1.41"].map((d, i) => (
                <motion.path key={d} d={d} variants={{ normal: { opacity: 1 }, animate: { opacity: [0, 1], transition: { delay: i * 0.1 } } }} />
            ))}
        </IconWrapper>
    );
};

export const AnimatedSunMoon = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    return (
        <IconWrapper controls={controls} {...props}>
            <motion.g variants={{ normal: { rotate: 0 }, animate: { rotate: [0, -5, 5, 0], transition: { duration: 1.5 } } }}>
                <path d="M12 8a2.83 2.83 0 0 0 4 4 4 4 0 1 1-4-4" />
            </motion.g>
            {["M12 2v2", "M12 20v2", "m4.9 4.9 1.4 1.4", "m17.7 17.7 1.4 1.4", "M2 12h2", "M20 12h2", "m6.3 17.7-1.4 1.4", "m19.1 4.9-1.4 1.4"].map((d, i) => (
                <motion.path key={d} d={d} variants={{ normal: { opacity: 1 }, animate: { opacity: [0, 1], transition: { delay: i * 0.1 } } }} />
            ))}
        </IconWrapper>
    );
};

export const AnimatedUser = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    return (
        <IconWrapper controls={controls} {...props}>
            <motion.circle cx="12" cy="8" r="5" variants={{ normal: { pathLength: 1, scale: 1 }, animate: { pathLength: [0, 1], scale: [0.5, 1] } }} />
            <motion.path d="M20 21a8 8 0 0 0-16 0" variants={{ normal: { pathLength: 1, opacity: 1 }, animate: { pathLength: [0, 1], opacity: [0, 1], transition: { delay: 0.2 } } }} />
        </IconWrapper>
    );
};

export const AnimatedArrowBigLeftDash = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    return (
        <IconWrapper controls={controls} {...props}>
            <motion.path d="M19 15V9" variants={{ normal: { x: 0 }, animate: { x: [0, -1, 0], transition: { duration: 0.4 } } }} />
            <motion.path d="M15 15h-3v4l-7-7 7-7v4h3v6z" variants={{ normal: { x: 0 }, animate: { x: [0, -3, 0], transition: { duration: 0.4 } } }} />
        </IconWrapper>
    );
};

export const AnimatedEye = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    const eyeVar = { normal: { scaleY: 1, opacity: 1 }, animate: { scaleY: [1, 0.1, 1], opacity: [1, 0.3, 1], transition: { duration: 0.4 } } };
    return (
        <IconWrapper controls={controls} {...props}>
            <motion.path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" style={{ originY: "50%" }} variants={eyeVar} />
            <motion.circle cx="12" cy="12" r="3" variants={{ normal: { scale: 1 }, animate: { scale: [1, 0.3, 1], transition: { duration: 0.4 } } }} />
        </IconWrapper>
    );
};

export const AnimatedGalleryHorizontalEnd = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    const hVar = (i: number) => ({ normal: { x: 0, opacity: 1 }, animate: { x: [2 * i, 0], opacity: [0, 1], transition: { delay: 0.25 * (2 - i) } } });
    return (
        <IconWrapper controls={controls} {...props}>
            <motion.path d="M6 5v14" variants={hVar(2)} /><motion.path d="M2 7v10" variants={hVar(1)} /><rect height="18" rx="2" width="12" x="10" y="3" />
        </IconWrapper>
    );
};

export const AnimatedGalleryVerticalEnd = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    const vVar = (i: number) => ({ normal: { y: 0, opacity: 1 }, animate: { y: [2 * i, 0], opacity: [0, 1], transition: { delay: 0.25 * (2 - i) } } });
    return (
        <IconWrapper controls={controls} {...props}>
            <motion.path d="M7 2h10" variants={vVar(1)} /><motion.path d="M5 6h14" variants={vVar(2)} /><rect height="12" rx="2" width="18" x="3" y="10" />
        </IconWrapper>
    );
};

export const AnimatedLayoutPanelTop = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered ?? true);
    return (
        <IconWrapper controls={controls} {...props}>
            <motion.rect height="7" rx="1" width="18" x="3" y="3" variants={{ normal: { opacity: 1, y: 0 }, animate: { opacity: [0, 1], y: [-5, 0], transition: { duration: 0.5 } } }} />
            <motion.rect height="7" rx="1" width="7" x="3" y="14" variants={{ normal: { opacity: 1, x: 0 }, animate: { opacity: [0, 1], x: [-10, 0], transition: { delay: 0.3 } } }} />
            <motion.rect height="7" rx="1" width="7" x="14" y="14" variants={{ normal: { opacity: 1, x: 0 }, animate: { opacity: [0, 1], x: [10, 0], transition: { delay: 0.4 } } }} />
        </IconWrapper>
    );
};

export const AnimatedEyeLogin = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    return (
        <IconWrapper controls={controls} {...props} size={20}>
            <motion.path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" style={{ originY: "50%" }} variants={{ normal: { scaleY: 1 }, animate: { scaleY: [1, 0.1, 1], transition: { duration: 0.4 } } }} />
            <motion.circle cx="12" cy="12" r="3" variants={{ normal: { scale: 1 }, animate: { scale: [1, 0.3, 1], transition: { duration: 0.4 } } }} />
        </IconWrapper>
    );
};

export const AnimatedEyeOff = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    return (
        <IconWrapper controls={controls} {...props} size={20}>
            <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
            <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
            <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
            <motion.path d="m2 2 20 20" variants={{ normal: { pathLength: 1, opacity: 1 }, animate: { pathLength: [0, 1.2], opacity: [0, 1], transition: { duration: 0.6 } } }} />
        </IconWrapper>
    );
};

export const AnimatedLockKeyholeOpen = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered ?? true);
    return (
        <IconWrapper
            controls={controls} {...props}
            variants={{ normal: { rotate: 0, scale: 1 }, animate: { rotate: [0, -5, 5, 0], scale: [1, 1.1, 1], transition: { duration: 1 } } }}
        >
            <circle cx="12" cy="16" r="1" /><rect height="12" rx="2" width="18" x="3" y="10" />
            <motion.path d="M7 10V7a5 5 0 0 1 10 0v3" variants={{ normal: { pathLength: 1 }, animate: { pathLength: [0, 1], transition: { duration: 0.8 } } }} />
        </IconWrapper>
    );
};

export const AnimatedUserRoundPlus = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered ?? true);
    return (
        <IconWrapper controls={controls} {...props}>
            <path d="M2 21a8 8 0 0 1 13.292-6" /><circle cx="10" cy="8" r="5" />
            <motion.path d="M19 16v6" variants={{ normal: { opacity: 1, pathLength: 1 }, animate: { opacity: [0, 1], pathLength: [0, 1], transition: { delay: 0.3 } } }} />
            <motion.path d="M22 19h-6" variants={{ normal: { opacity: 1, pathLength: 1 }, animate: { opacity: [0, 1], pathLength: [0, 1], transition: { delay: 0.6 } } }} />
        </IconWrapper>
    );
};

export const AnimatedCctv = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    return (
        <IconWrapper controls={controls} {...props}>
            <motion.g variants={{ normal: { rotate: 0 }, animate: { rotate: [0, -20, 15, 0], transition: { duration: 1.8 } } }}>
                <path d="M16.75 12h3.632a1 1 0 0 1 .894 1.447l-2.034 4.069a1 1 0 0 1-1.708.134l-2.124-2.97" />
                <path d="M17.106 9.053a1 1 0 0 1 .447 1.341l-3.106 6.211a1 1 0 0 1-1.342.447L3.61 12.3a2.92 2.92 0 0 1-1.3-3.91L3.69 5.6a2.92 2.92 0 0 1 3.92-1.3z" />
                <motion.path d="M7 9h.01" variants={{ normal: { opacity: 1 }, animate: { opacity: [1, 0, 1, 0, 1], transition: { duration: 1.8 } } }} />
            </motion.g>
            <path d="M2 19h3.76a2 2 0 0 0 1.8-1.1L9 15" /><path d="M2 21v-4" />
        </IconWrapper>
    );
};

export const AnimatedLaptopCheck = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    return (
        <IconWrapper controls={controls} {...props}>
            <path d="M2 20h20" /><rect height="12" rx="2" width="18" x="3" y="4" />
            <motion.path d="m9 10 2 2 4-4" style={{ transformOrigin: "center" }} variants={{ normal: { pathLength: 1, opacity: 1 }, animate: { pathLength: [0, 1], opacity: [0, 1], transition: { duration: 0.4 } } }} />
        </IconWrapper>
    );
};

export const AnimatedChartSpline = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    return (
        <IconWrapper controls={controls} {...props}>
            <path d="M3 3v16a2 2 0 0 0 2 2h16" />
            <motion.path d="M7 16c.5-2 1.5-7 4-7 2 0 2 3 4 3 2.5 0 4.5-5 5-7" variants={{ normal: { pathLength: 1, opacity: 1 }, animate: { pathLength: [0, 1], opacity: [0, 1], transition: { delay: 0.15, duration: 0.3 } } }} />
        </IconWrapper>
    );
};

export const ArchiveIcon = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    return (
        <IconWrapper controls={controls} {...props}>
            <motion.rect height="5" width="20" x="2" y="3" rx="1" variants={{ normal: { y: 0 }, animate: { y: -1.5 } }} transition={{ type: "spring" }} />
            <motion.path variants={{ normal: { d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" }, animate: { d: "M4 11v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V11" } }} />
            <motion.path variants={{ normal: { d: "M10 12h4" }, animate: { d: "M10 15h4" } }} />
        </IconWrapper>
    );
};

export const AnimatedWifi = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    const levels = [{ d: "M12 20h.01", delay: 0 }, { d: "M8.5 16.429a5 5 0 0 1 7 0", delay: 0.1 }, { d: "M5 12.859a10 10 0 0 1 14 0", delay: 0.2 }, { d: "M2 8.82a15 15 0 0 1 20 0", delay: 0.3 }];
    return (
        <IconWrapper controls={controls} {...props}>
            {levels.map((l, i) => (
                <motion.path key={i} d={l.d} variants={{ normal: { opacity: 1 }, animate: { opacity: [0, 1], transition: { delay: l.delay, type: "spring" } } }} />
            ))}
        </IconWrapper>
    );
};

export const AnimatedFileStack = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    const v1 = { normal: { x: 0, y: 0 }, animate: { x: -4, y: 4 } };
    return (
        <IconWrapper controls={controls} {...props}>
            <motion.path d="M21 7h-3a2 2 0 0 1-2-2V2" variants={v1} /><motion.path d="M21 6v6.5c0 .8-.7 1.5-1.5 1.5h-7c-.8 0-1.5-.7-1.5-1.5v-9c0-.8.7-1.5 1.5-1.5H17Z" variants={v1} />
            <path d="M7 8v8.8c0 .3.2.6.4.8.2.2.5.4.8.4H15" />
            <motion.path d="M3 12v8.8c0 .3.2.6.4.8.2.2.5.4.8.4H11" variants={{ normal: { x: 0, y: 0 }, animate: { x: 4, y: -4 } }} />
        </IconWrapper>
    );
};

export const AnimatedRoute = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    const cVar = { normal: { pathLength: 1, opacity: 1 }, animate: { pathLength: [0, 1], opacity: [0, 1], transition: { duration: 0.3, delay: 0.1 } } };
    return (
        <IconWrapper controls={controls} {...props}>
            <motion.circle cx="6" cy="19" r="3" variants={cVar} />
            <motion.path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" variants={{ normal: { pathLength: 1, pathOffset: 0 }, animate: { pathLength: [0, 1], pathOffset: [1, 0], transition: { duration: 0.7, delay: 0.5 } } }} />
            <motion.circle cx="18" cy="5" r="3" variants={cVar} />
        </IconWrapper>
    );
};

export const AnimatedSettings = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    return (
        <IconWrapper controls={controls} {...props} variants={{ normal: { rotate: 0 }, animate: { rotate: 180, transition: SPRING_TRANS } }}>
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
        </IconWrapper>
    );
};

export const AnimatedSlidersHorizontal = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);

    const lineVar = (
        n: TargetAndTransition,
        a: TargetAndTransition
    ) => ({
        normal: n,
        animate: a
    });

    return (
        <IconWrapper controls={controls} {...props}>
            <motion.line x1="21" y1="4" y2="4" transition={SLIDER_SPRING} variants={lineVar({ x2: 14 }, { x2: 10 })} />
            <motion.line x2="3" y1="4" y2="4" transition={SLIDER_SPRING} variants={lineVar({ x1: 10 }, { x1: 5 })} />
            <motion.line x1="21" y1="12" y2="12" transition={SLIDER_SPRING} variants={lineVar({ x2: 12 }, { x2: 18 })} />
            <motion.line x2="3" y1="12" y2="12" transition={SLIDER_SPRING} variants={lineVar({ x1: 8 }, { x1: 13 })} />
            <motion.line x1="3" y1="20" y2="20" transition={SLIDER_SPRING} variants={lineVar({ x2: 12 }, { x2: 4 })} />
            <motion.line x2="21" y1="20" y2="20" transition={SLIDER_SPRING} variants={lineVar({ x1: 16 }, { x1: 8 })} />
            <motion.line y1="2" y2="6" transition={SLIDER_SPRING} variants={lineVar({ x1: 14, x2: 14 }, { x1: 9, x2: 9 })} />
            <motion.line y1="10" y2="14" transition={SLIDER_SPRING} variants={lineVar({ x1: 8, x2: 8 }, { x1: 14, x2: 14 })} />
            <motion.line y1="18" y2="22" transition={SLIDER_SPRING} variants={lineVar({ x1: 16, x2: 16 }, { x1: 8, x2: 8 })} />
        </IconWrapper>
    );
};

export const AnimatedFileText = ({ isHovered, size, color, strokeWidth, className, style }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);
    return (
        <IconWrapper controls={controls} size={size} color={color} strokeWidth={strokeWidth} className={className} style={style}
            variants={{
                normal: { scale: 1 },
                animate: { scale: 1.05, transition: { duration: 0.3 } }
            }}
        >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <motion.path d="M10 9H8" variants={{ normal: { pathLength: 1, x: 0 }, animate: { pathLength: [1, 0, 1], x: [0, 2, 0], transition: { duration: 0.7, delay: 0.2 } } }} />
            <motion.path d="M16 13H8" variants={{ normal: { pathLength: 1, x: 0 }, animate: { pathLength: [1, 0, 1], x: [0, 4, 0], transition: { duration: 0.7, delay: 0.4 } } }} />
            <motion.path d="M16 17H8" variants={{ normal: { pathLength: 1, x: 0 }, animate: { pathLength: [1, 0, 1], x: [0, 4, 0], transition: { duration: 0.7, delay: 0.6 } } }} />
        </IconWrapper>
    );
};

export const AnimatedBadgeAlert = ({ isHovered, loop = false, ...props }: AnimatedIconProps & { loop?: boolean }) => {
    const controls = useIconAnimation(isHovered, { loop });

    return (
        <IconWrapper
            controls={controls}
            {...props}
            variants={{
                normal: { scale: 1, rotate: 0 },
                animate: {
                    scale: [1, 1.1, 1.1, 1.1, 1],
                    rotate: [0, -3, 3, -2, 2, 0],
                    transition: {
                        duration: 0.5,
                        times: [0, 0.2, 0.4, 0.6, 1],
                        ease: "easeInOut",
                    },
                },
            }}
        >
            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
        </IconWrapper>
    );
};

export const AnimatedPlus = ({ isHovered, ...props }: AnimatedIconProps) => {
    const controls = useIconAnimation(isHovered);

    return (
        <IconWrapper
            controls={controls}
            {...props}
            variants={{
                normal: {
                    rotate: 0
                },
                animate: {
                    rotate: 180,
                    transition: { type: "spring", stiffness: 100, damping: 15 }
                }
            }}
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </IconWrapper>
    );
};