import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./CreateContractLayout.module.scss";
import classNames from "classnames/bind";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { routes } from "~/config/routes.config";

const cx = classNames.bind(styles);

interface CreateContractLayoutProps {
    children: ReactNode;
}

const CreateContractLayout: React.FC<CreateContractLayoutProps> = ({ children }) => {
    const navigate = useNavigate();

    return (
        <div className={cx("wrapper")}>
            <div className={cx("header", "print-area")}>
                <div className={cx("header", "print-area")}>
                    <button onClick={() => navigate(routes.dashboard)} className={cx("head-box")}>
                        <FontAwesomeIcon icon={faRightToBracket} />
                    </button>
                </div>
                <span className={cx("head-title")}>Quay lại trang chủ</span>
            </div>
            {children}
        </div>
    );
};

export default CreateContractLayout;
