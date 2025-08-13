// // strategy/s3.strategy.ts
// import { Injectable } from '@nestjs/common';
// import { UploadStrategy } from './upload.strategy';
// import * as AWS from 'aws-sdk';

// @Injectable()
// export class S3UploadStrategy implements UploadStrategy {
//     private s3 = new AWS.S3({
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//         region: process.env.AWS_REGION,
//     });

//     async upload(file: Express.Multer.File) {
//         const uploadResult = await this.s3
//             .upload({
//                 Bucket: process.env.AWS_S3_BUCKET_NAME,
//                 Key: `${Date.now()}-${file.originalname}`,
//                 Body: file.buffer,
//                 ContentType: file.mimetype,
//                 ACL: 'public-read',
//             })
//             .promise();

//         return {
//             provider: 's3',
//             originalname: file.originalname,
//             filename: uploadResult.Key,
//             mimetype: file.mimetype,
//             url: uploadResult.Location,
//             size: file.size,
//         };
//     }
// }
