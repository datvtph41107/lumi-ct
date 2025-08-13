import type React from "react";
import styles from "./Badge.module.scss";

interface BadgeProps {
    variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "outline";
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
    className?: string;
}

export default function Badge({ variant = "primary", size = "md", children, className = "" }: BadgeProps) {
    const badgeClass = `${styles.badge} ${styles[variant]} ${styles[size]} ${className}`;

    return <span className={badgeClass}>{children}</span>;
}
