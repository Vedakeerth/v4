import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET } from "./client";

export async function uploadFileToR2(buffer: Buffer, key: string, contentType: string) {
    const command = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
    });
    await r2Client.send(command);
    return key;
}

export async function deleteFileFromR2(key: string) {
    const command = new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
    });
    await r2Client.send(command);
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600) {
    const command = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
    });
    return await getSignedUrl(r2Client, command, { expiresIn });
}

export async function getFileStreamFromR2(key: string) {
    const command = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
    });
    const response = await r2Client.send(command);
    return response.Body;
}
