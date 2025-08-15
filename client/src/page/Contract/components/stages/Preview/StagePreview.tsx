import type React from "react";
import { useMemo } from "react";
import classNames from "classnames/bind";
import styles from "./StagePreview.module.scss";
import Button from "~/components/Button";
import { useEditorStore } from "~/store/editor-store";
import { useContractDraftStore } from "~/store/contract-draft-store";
import { ApiClient } from "~/core/http/api/ApiClient";

const cx = classNames.bind(styles);

const StagePreview: React.FC = () => {
	const { editor } = useEditorStore();
	const { currentDraft } = useContractDraftStore();
	const api = useMemo(() => ApiClient.getInstance().private, []);

	const title = currentDraft?.contractData?.name || "Xem trước hợp đồng";
	const contractId = (currentDraft as any)?.id || null;

	const handlePrint = () => window.print();

	const handleExportHtml = () => {
		const html = editor?.getHTML() || "<p></p>";
		const blob = new Blob([html], { type: "text/html;charset=utf-8" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = `${title}.html`;
		document.body.appendChild(link);
		link.click();
		link.remove();
	};

	return (
		<div className={cx("stage-preview-container")}> 
			<div className={cx("preview-header")}> 
				<h2>{title}</h2>
				<div className={cx("actions")}>
					<Button outline onClick={handleExportHtml}>Tải HTML</Button>
					<Button primary onClick={handlePrint}>In</Button>
				</div>
			</div>

			<div className={cx("preview-content")}> 
				<div className={cx("contract-preview", "editor-print")} dangerouslySetInnerHTML={{ __html: editor?.getHTML() || "" }} />
			</div>
		</div>
	);
};

export default StagePreview;
