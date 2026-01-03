import { useEffect } from 'react';
import { useSpring, useMotionValue, useTransform, motion } from 'framer-motion';

interface AnimatedCounterProps {
    value: number;
}

export default function AnimatedCounter({ value }: AnimatedCounterProps) {
    // Initialize with the current value to avoid counting from 0 on load
    const motionValue = useMotionValue(value);
    const springValue = useSpring(motionValue, {
        damping: 30,
        stiffness: 100,
    });

    // Transform the spring value into a rounded string
    const displayValue = useTransform(springValue, (latest) => Math.round(latest).toLocaleString());

    useEffect(() => {
        // Update motion value when prop changes
        motionValue.set(value);
    }, [value, motionValue]);

    return <motion.span>{displayValue}</motion.span>;
}
