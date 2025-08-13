import type { FileAttachment } from "~/types/contract/contract.types";

export const validateFile = (
    file: File,
    currentFiles: FileAttachment[],
    maxFiles: number,
    maxFileSize: number,
    acceptedTypes: string[],
): string | null => {
    const extension = "." + file.name.split(".").pop()?.toLowerCase();

    if (!acceptedTypes.includes(extension)) {
        return `File "${file.name}" không thuộc định dạng hợp lệ (${acceptedTypes.join(", ")})`;
    }

    if (file.size > maxFileSize * 1024 * 1024) {
        return `File "${file.name}" vượt quá giới hạn ${maxFileSize}MB`;
    }

    if (currentFiles.some((f) => f.name === file.name)) {
        return `File "${file.name}" đã được đính kèm trước đó`;
    }

    return null;
};
