import classNames from "classnames/bind";
import styles from "./HeaderBar.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis, faFolderMinus, faMinus, faPen, faPlus } from "@fortawesome/free-solid-svg-icons";
import { PiArrowArcLeftFill, PiArrowArcRightFill } from "react-icons/pi";

const cx = classNames.bind(styles);

const HeaderBar = () => {
    return (
        <header className={cx("header")}>
            <div className={cx("header_wrapper")}>
                <div className={cx("breadcrumb_group")}>
                    <div className={cx("breadcrumb_group-slash")}>Dashboard</div>
                    <div className={cx("breadcrumb_group-slash")}>Contracts</div>
                    <div className={cx("breadcrumb_group-slash")}>
                        <div className={cx("active")}>
                            <div>New draft</div>
                            <FontAwesomeIcon className={cx("active_icon")} icon={faPen} />
                        </div>
                    </div>
                </div>
                <div className={cx("save_group")}>
                    <FontAwesomeIcon icon={faEllipsis} />
                    <div className={cx("save_group-main")}>
                        <FontAwesomeIcon icon={faFolderMinus} />
                        Saved
                    </div>
                </div>
            </div>
            <div className={cx("resize_group")}>
                <div className={cx("back_group")}>
                    <PiArrowArcLeftFill className={cx("back_group-ic")} />
                    <PiArrowArcRightFill className={cx("back_group-ic")} />
                </div>
                <div className={cx("resize_main")}>
                    <div className={cx("resize_main-left")}>
                        <FontAwesomeIcon className={cx("resize_main-ic")} icon={faMinus} />
                    </div>
                    <div className={cx("resize_main-middle")}>80%</div>
                    <div className={cx("resize_main-right")}>
                        <FontAwesomeIcon className={cx("resize_main-ic")} icon={faPlus} />
                    </div>
                </div>
            </div>
            <div className={cx("actions")}>
                <button className={cx("action-btn")}>Download</button>
                <button className={cx("action-btn")}>Share</button>
            </div>
        </header>
    );
};

export default HeaderBar;
