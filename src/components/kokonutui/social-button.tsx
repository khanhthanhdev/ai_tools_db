"use client";

/**
 * @author: @dorian_baffier
 * @description: Social Button
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Globe,
  Instagram,
  Link,
  Linkedin,
  Mail,
  Twitter,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

type InteractionMode = "hover" | "click";

export type SocialOption = {
  icon: LucideIcon;
  label: string;
  href?: string;
  onSelect?: () => void;
};

interface SocialButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  className?: string;
  label?: string;
  options?: SocialOption[];
  interaction?: InteractionMode;
  onOptionSelect?: (option: SocialOption, index: number) => void;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const defaultOptions: SocialOption[] = [
  { icon: Twitter, label: "Share on Twitter" },
  { icon: Instagram, label: "Share on Instagram" },
  { icon: Linkedin, label: "Share on LinkedIn" },
  { icon: Link, label: "Copy link" },
];

export default function SocialButton({
  className,
  label = "Share",
  options,
  interaction = "hover",
  onOptionSelect,
  onClick,
  ...props
}: SocialButtonProps) {
  const isHoverInteraction = interaction === "hover";
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const shareButtons = useMemo(() => options ?? defaultOptions, [options]);

  useEffect(() => {
    if (isHoverInteraction || !isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isHoverInteraction, isVisible]);

  const handleButtonClick: React.MouseEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    if (isHoverInteraction) {
      onClick?.(event);
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setIsVisible((prev) => !prev);
    onClick?.(event);
  };

  const handleShare = (option: SocialOption, index: number) => {
    setActiveIndex(index);
    onOptionSelect?.(option, index);
    option.onSelect?.();

    if (option.href && typeof window !== "undefined") {
      if (option.href.startsWith("mailto:")) {
        window.location.href = option.href;
      } else {
        window.open(option.href, "_blank", "noopener,noreferrer");
      }
    }

    setTimeout(() => setActiveIndex(null), 300);

    if (!isHoverInteraction) {
      setIsVisible(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={isHoverInteraction ? () => setIsVisible(true) : undefined}
      onMouseLeave={isHoverInteraction ? () => setIsVisible(false) : undefined}
    >
      <motion.div
        animate={{
          opacity: isVisible ? 0 : 1,
        }}
        transition={{
          duration: 0.2,
          ease: "easeInOut",
        }}
      >
        <Button
          {...props}
          onClick={handleButtonClick}
          className={cn(
            "relative min-w-32",
            "bg-white text-black",
            "border border-black/10",
            "hover:bg-gray-50",
            "dark:bg-black dark:text-white",
            "dark:border-white/10 dark:hover:bg-gray-950",
            "transition-colors duration-200",
            className,
          )}
        >
          <span className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            {label}
          </span>
        </Button>
      </motion.div>

      <motion.div
        className="absolute left-0 top-0 flex h-10 overflow-hidden rounded-md"
        animate={{
          width: isVisible ? "auto" : 0,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: [0.23, 1, 0.32, 1],
        }}
      >
        {shareButtons.map((button, i) => (
          <motion.button
            type="button"
            key={`share-${button.label}`}
            aria-label={button.label}
            onClick={() => handleShare(button, i)}
            className={cn(
              "relative flex h-10 w-10 items-center justify-center",
              "bg-black text-white first:rounded-l-md last:rounded-r-md",
              "dark:bg-white dark:text-black",
              "border-r border-white/10 dark:border-black/10 last:border-r-0",
              "hover:bg-gray-900 dark:hover:bg-gray-100",
              "outline-none transition-colors duration-200",
            )}
            animate={{
              opacity: isVisible ? 1 : 0,
              x: isVisible ? 0 : -20,
            }}
            transition={{
              duration: 0.25,
              ease: [0.23, 1, 0.32, 1],
              delay: isVisible ? i * 0.05 : 0,
            }}
          >
            <motion.div
              className="relative z-10"
              animate={{
                scale: activeIndex === i ? 0.85 : 1,
              }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
            >
              <button.icon className="h-4 w-4" />
            </motion.div>
            <motion.div
              className="absolute inset-0 bg-white dark:bg-black"
              initial={{ opacity: 0 }}
              animate={{
                opacity: activeIndex === i ? 0.15 : 0,
              }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
            />
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

export const SocialIcons = {
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  email: Mail,
  website: Globe,
  default: Link,
};
