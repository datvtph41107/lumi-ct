import classNames from "classnames/bind";
import styles from "./LoginLayout.module.scss";
import type { FC, ReactNode } from "react";

const cx = classNames.bind(styles);

const LoginLayout: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <div className={cx("wrapper")}>
            <div className={cx("content")} style={{ position: "relative", zIndex: "1" }}>
                {children}
            </div>
        </div>
    );
};

export default LoginLayout;
