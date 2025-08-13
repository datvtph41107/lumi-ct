import type React from "react";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "~/hooks/useAuth";
import { ROLE } from "~/types/auth.types";
import classNames from "classnames/bind";
import styles from "./Unauthorized.module.scss";

// Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

const cx = classNames.bind(styles);

const Unauthorized: React.FC = () => {
    // const navigate = useNavigate();
    // // const { user, isAuthenticated } = useAuth();

    // const handleGoBack = () => {
    //     navigate(-1);
    // };

    // const handleGoHome = () => {
    //     if (isAuthenticated && user) {
    //         switch (user.role) {
    //             case ROLE.ADMIN:
    //                 navigate("/admin");
    //                 break;
    //             case ROLE.MANAGER:
    //             case ROLE.STAFF:
    //             case ROLE.USER:
    //             default:
    //                 navigate("/dashboard");
    //                 break;
    //         }
    //     } else {
    //         navigate("/login");
    //     }
    // };

    return (
        <div className={cx("wrapper")}>
            {/* <div className={cx("container")}>
                <div>
                    <div className={cx("icon")}>
                        <FontAwesomeIcon icon={faTriangleExclamation} size="4x" />
                    </div>
                    <h2 className={cx("title")}>Không có quyền truy cập</h2>
                    <p className={cx("subtitle")}>
                        Xin lỗi, bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là lỗi.
                    </p>
                </div>

                {user && (
                    <div className={cx("infoBox")}>
                        <p>
                            <strong>Vai trò hiện tại:</strong> {user.role}
                        </p>
                        <p>
                            <strong>Tên đăng nhập:</strong> {user.username}
                        </p>
                    </div>
                )}

                <div className={cx("buttonGroup")}>
                    <button onClick={handleGoBack} className={cx("btn", "back")}>
                        Quay lại
                    </button>
                    <button onClick={handleGoHome} className={cx("btn", "home")}>
                        Về trang chủ
                    </button>
                </div>

                <div className={cx("support")}>
                    <p>
                        Cần hỗ trợ? <a href="mailto:support@example.com">Liên hệ quản trị viên</a>
                    </p>
                </div>
            </div> */}
        </div>
    );
};

export default Unauthorized;
