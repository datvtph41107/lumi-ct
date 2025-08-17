import classNames from 'classnames/bind';
import styles from './HeaderBar.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faFolderMinus, faMinus, faPen, faPlus } from '@fortawesome/free-solid-svg-icons';
import { PiArrowArcLeftFill, PiArrowArcRightFill } from 'react-icons/pi';
import { useCallback, useMemo } from 'react';
import { useContractStore } from '~/store/contract-store';
import { ApiClient } from '~/core/http/api/ApiClient';
import { useEditorStore } from '~/store/editor-store';
import { PermissionGuard } from '~/core/auth/PermissionGuard';

const cx = classNames.bind(styles);

const HeaderBar = () => {
    const { currentContract } = useContractStore();
    const api = useMemo(() => ApiClient.getInstance().private, []);
    const { editor } = useEditorStore();

    const triggerDownload = useCallback((filename: string, base64: string, contentType: string) => {
        const blob = new Blob([Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))], { type: contentType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }, []);

    const handleDownloadPdf = useCallback(async () => {
        if (!currentContract?.id) return;
        const res = await api.get<{ filename: string; contentBase64: string; contentType: string }>(
            `/contracts/${currentContract.id}/export/pdf`,
        );
        if (res.data) triggerDownload(res.data.filename, res.data.contentBase64, res.data.contentType);
    }, [api, currentContract?.id, triggerDownload]);

    const handleDownloadDocx = useCallback(async () => {
        if (!currentContract?.id) return;
        const res = await api.get<{ filename: string; contentBase64: string; contentType: string }>(
            `/contracts/${currentContract.id}/export/docx`,
        );
        if (res.data) triggerDownload(res.data.filename, res.data.contentBase64, res.data.contentType);
    }, [api, currentContract?.id, triggerDownload]);

    const handleShare = useCallback(() => {
        if (!currentContract?.id) return;
        const url = window.location.origin + `/contracts/${currentContract.id}`;
        navigator.clipboard?.writeText(url);
        alert('Đã sao chép liên kết chia sẻ vào clipboard');
    }, [currentContract?.id]);

    const handleExportHtml = useCallback(() => {
        const html = editor?.getHTML() || '<p></p>';
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${currentContract?.name || 'contract'}.html`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }, [editor, currentContract?.name]);

    return (
        <header className={cx('header')}>
            <div className={cx('header_wrapper')}>
                <div className={cx('breadcrumb_group')}>
                    <div className={cx('breadcrumb_group-slash')}>Dashboard</div>
                    <div className={cx('breadcrumb_group-slash')}>Contracts</div>
                    <div className={cx('breadcrumb_group-slash')}>
                        <div className={cx('active')}>
                            <div>New draft</div>
                            <FontAwesomeIcon className={cx('active_icon')} icon={faPen} />
                        </div>
                    </div>
                </div>
                <div className={cx('save_group')}>
                    <FontAwesomeIcon icon={faEllipsis} />
                    <div className={cx('save_group-main')}>
                        <FontAwesomeIcon icon={faFolderMinus} />
                        Saved
                    </div>
                </div>
            </div>
            <div className={cx('resize_group')}>
                <div className={cx('back_group')}>
                    <PiArrowArcLeftFill className={cx('back_group-ic')} />
                    <PiArrowArcRightFill className={cx('back_group-ic')} />
                </div>
                <div className={cx('resize_main')}>
                    <div className={cx('resize_main-left')}>
                        <FontAwesomeIcon className={cx('resize_main-ic')} icon={faMinus} />
                    </div>
                    <div className={cx('resize_main-middle')}>80%</div>
                    <div className={cx('resize_main-right')}>
                        <FontAwesomeIcon className={cx('resize_main-ic')} icon={faPlus} />
                    </div>
                </div>
            </div>
            <div className={cx('actions')}>
                <PermissionGuard resource="contract" action="export" context={{ contractId: currentContract?.id }} showFallback>
                    <div className={cx('action-btn')} onClick={handleDownloadPdf}>
                        Download PDF
                    </div>
                    <div className={cx('action-btn')} onClick={handleDownloadDocx}>
                        Download DOCX
                    </div>
                    <div className={cx('action-btn')} onClick={handleExportHtml}>
                        Export HTML
                    </div>
                    <button className={cx('action-btn')} onClick={() => window.print()}>
                        Print
                    </button>
                </PermissionGuard>
                <button className={cx('action-btn')} onClick={handleShare}>
                    Share
                </button>
            </div>
        </header>
    );
};

export default HeaderBar;
