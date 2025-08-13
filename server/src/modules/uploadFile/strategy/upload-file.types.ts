export interface UploadStrategy {
    upload(
        file: Express.Multer.File,
        dir?: string,
    ): Promise<{
        provider: string;
        originalname: string;
        filename: string;
        mimetype: string;
        url: string;
        size: number;
    }>;
}
