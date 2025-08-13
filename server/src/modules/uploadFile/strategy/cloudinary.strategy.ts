// // strategy/cloudinary.strategy.ts
// import { Injectable } from '@nestjs/common';
// import { UploadStrategy } from './upload.strategy';
// import { v2 as cloudinary } from 'cloudinary';
// import * as fs from 'fs/promises';

// @Injectable()
// export class CloudinaryUploadStrategy implements UploadStrategy {
//     constructor() {
//         cloudinary.config({
//             cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//             api_key: process.env.CLOUDINARY_API_KEY,
//             api_secret: process.env.CLOUDINARY_API_SECRET,
//         });
//     }

//     async upload(file: Express.Multer.File) {
//         const result = await cloudinary.uploader.upload(file.path, {
//             resource_type: 'auto',
//             folder: 'contracts',
//         });

//         await fs.unlink(file.path); // Xoá file local sau khi upload

//         return {
//             provider: 'cloudinary',
//             originalname: file.originalname,
//             filename: result.public_id,
//             mimetype: file.mimetype,
//             url: result.secure_url,
//             size: file.size,
//         };
//     }
// }
