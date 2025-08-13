import classNames from "classnames/bind";
import styles from "./Button.module.scss";
import { Link } from "react-router-dom";
import type { MouseEventHandler, ReactNode } from "react";

const cx = classNames.bind(styles);

interface ButtonProps {
    to?: string;
    href?: string;
    primary?: boolean;
    gray?: boolean;
    outline?: boolean;
    rounded?: boolean;
    small?: boolean;
    semiLarge?: boolean;
    fullWidth?: boolean;
    medium?: boolean;
    large?: boolean;
    text?: boolean;
    bolder?: boolean;
    disabled?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    leftIconStyles?: string;
    className?: string;
    children: ReactNode;
    onClick?: MouseEventHandler<HTMLElement>;
    type?: "button" | "submit" | "reset";
}

function Button({
    to,
    href,
    primary,
    gray,
    outline,
    rounded,
    small,
    medium,
    semiLarge,
    large,
    text,
    disabled,
    children,
    bolder,
    onClick,
    leftIcon,
    rightIcon,
    leftIconStyles,
    className,
    fullWidth,
    type = "button",
    ...rest
}: ButtonProps) {
    let Comp: React.ElementType = "button";
    const props: Record<string, unknown> = {
        ...rest,
    };

    if (to) {
        Comp = Link;
        props.to = to;
    } else if (href) {
        Comp = "a";
        props.href = href;
    } else {
        props.type = type;
    }

    if (!disabled && onClick) {
        props.onClick = onClick;
    }

    if (disabled) {
        // Remove all event handlers starting with "on"
        Object.keys(props).forEach((key) => {
            if (key.startsWith("on") && typeof props[key] === "function") {
                delete props[key];
            }
        });
    }

    const classes = cx("wrapper", className, {
        primary,
        fullWidth,
        semiLarge,
        gray,
        outline,
        text,
        small,
        medium,
        large,
        disabled,
        bolder,
        rounded,
    });

    return (
        <Comp className={classes} {...props}>
            {leftIcon && <span className={cx("icon", "left", leftIconStyles)}>{leftIcon}</span>}
            <span className={cx("content")}>{children}</span>
            {rightIcon && <span className={cx("icon", "right")}>{rightIcon}</span>}
        </Comp>
    );
}

export default Button;
