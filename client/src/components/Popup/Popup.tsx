import {
    useFloating,
    offset,
    flip,
    shift,
    arrow,
    autoUpdate,
    useInteractions,
    useHover,
    useClick,
    useDismiss,
    useRole,
} from "@floating-ui/react";
import { useState, useRef, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./Popup.module.scss";
import type { Placement } from "@floating-ui/react-dom";
import type { ReactNode } from "react";

const cx = classNames.bind(styles);

interface PopupProps {
    content: ReactNode;
    children: ReactNode;
    placement?: Placement;
    trigger?: "hover" | "click";
    popupType?: "info" | "warning" | "success" | "error";
    offsetValue?: number | { mainAxis?: number; crossAxis?: number };
    withArrow?: boolean;
}

export default function Popup({
    content,
    children,
    placement = "top",
    trigger = "hover",
    popupType = "info",
    offsetValue = 8,
    withArrow = true,
}: PopupProps) {
    const [open, setOpen] = useState(false);
    const [visible, setVisible] = useState(false);
    const arrowRef = useRef<HTMLDivElement | null>(null);

    const {
        refs,
        floatingStyles,
        context,
        middlewareData,
        placement: actualPlacement,
    } = useFloating({
        open,
        onOpenChange: setOpen,
        placement,
        whileElementsMounted: autoUpdate,
        middleware: [offset(offsetValue ?? 8), flip(), shift({ padding: 5 }), withArrow ? arrow({ element: arrowRef }) : undefined].filter(
            Boolean,
        ),
    });

    const hover = useHover(context, {
        enabled: trigger === "hover",
        move: false,
        delay: { open: 100, close: 100 },
    });

    const click = useClick(context, {
        enabled: trigger === "click",
    });

    const dismiss = useDismiss(context, { outsidePress: true });
    const role = useRole(context, { role: "tooltip" });

    const { getReferenceProps, getFloatingProps } = useInteractions([hover, click, dismiss, role]);

    const staticSide = {
        top: "bottom",
        right: "left",
        bottom: "top",
        left: "right",
    }[actualPlacement.split("-")[0]];

    useEffect(() => {
        if (open) {
            setVisible(true);
        } else {
            const timeout = setTimeout(() => setVisible(false), 250); // match CSS transition duration
            return () => clearTimeout(timeout);
        }
    }, [open]);

    return (
        <>
            <div ref={refs.setReference} {...getReferenceProps()} className={cx("popup-trigger")}>
                {children}
            </div>

            {visible && (
                <div
                    ref={refs.setFloating}
                    style={floatingStyles}
                    {...getFloatingProps()}
                    className={cx("popup", popupType, {
                        "popup-open": open,
                        "popup-close": !open,
                    })}
                >
                    {withArrow && (
                        <div
                            ref={arrowRef}
                            className={cx("popup-arrow")}
                            style={{
                                left: middlewareData.arrow?.x != null ? `${middlewareData.arrow.x}px` : "",
                                top: middlewareData.arrow?.y != null ? `${middlewareData.arrow.y}px` : "",
                                [staticSide as string]: "-6px",
                            }}
                        />
                    )}
                    {content}
                </div>
            )}
        </>
    );
}
