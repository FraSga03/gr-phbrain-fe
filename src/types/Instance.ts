type Attachment = {
    id: string;
    type: 'document' | 'image' | 'video' | string;
    description: string;
    url: string;
};

export type Instance = {
    __id: string;
    class: string;
    attachments?: Attachment[];
    [key: string]: unknown;
};