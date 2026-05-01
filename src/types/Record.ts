export type Attachment = {
    id: string;
    type: string;
    description: string;
    url: string;
};

export type Record = {
    [key: string]: unknown;
    __id: string;
    attachments: Attachment[];
};

export type InputAttachment = {
    file: File,
    description: string;
    type: string;
}

export type UploadedAttachment = {
    id: string;
    type: string;
    description: string;
    filename: string;
    filesize: number;
    url: string;
    uploadedAt: string;
};

export type SaveFileResponse = {
    message: string;
    attachment: UploadedAttachment;
    instance: Record;
};