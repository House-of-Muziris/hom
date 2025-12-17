// Museum of Flavor — Premium Theme Configuration
export const theme = {
  colors: {
    canvas: { primary: "#F0EFEA", secondary: "#EAE8E3", dark: "#E5E3DE" },
    ink: { primary: "#1A1A1A", secondary: "#2D2D2D", muted: "#6B6B6B" },
    gold: { primary: "#C5A059", light: "#D4B978", dark: "#A68942" },
  },
  motion: {
    ease: [0.22, 1, 0.36, 1],
    duration: { fast: 0.3, normal: 0.6, slow: 1.2 },
  },
} as const;

export const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: theme.motion.ease },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 1, ease: theme.motion.ease },
};

export const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export const parallax = (offset: number = 50) => ({
  initial: { y: 0 },
  animate: { y: offset },
});
