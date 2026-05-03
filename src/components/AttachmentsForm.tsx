import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { Attachment, InputAttachment, SaveFileResponse } from "../types/Record.ts";
import Table from "./Table.tsx";
import type { Column } from "../types/Table.ts";
import { FaDownload } from "react-icons/fa";
import toast from "react-hot-toast";
import FileInput from "./FileInput.tsx";
import InputField from "./InputField.tsx";
import Button from "./Button.tsx";
import { saveFile } from "../services/DomainService.ts";

type AttachmentsFormProps = {
    attachments: Attachment[];
    domain: string;
    instanceId: string;
};

export default function AttachmentsForm({ attachments, domain, instanceId }: AttachmentsFormProps) {
    const [items, setItems] = useState<Attachment[]>(attachments);

    useEffect(() => {
        setItems(attachments);
    }, [attachments]);

    const {
        register,
        reset,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = useForm<InputAttachment>({
        mode: "onBlur",
    });

    const download = (url: string) => {
        toast.success(`Download Attachment ${url}`);
    }

    const onSubmit = async (data: InputAttachment) => {
        const file = (data as never)["file"][0] as File;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", data.type);
        formData.append("description", data.description);

        await saveFile(domain, instanceId, formData)
            .then((res: SaveFileResponse) => {
                const { attachment } = res;

                const newAttachment: Attachment = {
                    id: attachment.id,
                    type: attachment.type,
                    description: attachment.description,
                    url: attachment.url,
                };
                setItems((prev) => [...prev, newAttachment]);
                toast.success("Attachment uploaded successfully");
                reset();
            });
    }

    const attachmentColumn: Column<Attachment>[] = [
        { key: "index", header: "#" },
        { key: "description", header: "Description" },
        { key: "type", header: "Type" },
        {
            key: "url", header: "Download", render: (value) => (
                <div className="hover:text-blue-500 duration-200 flex justify-center cursor-pointer" onClick={() => download(value)}>
                    <FaDownload />
                </div>
            )
        },
    ]

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3">
                <div className="text-accent text-base">New attachment</div>

                <form className="grid grid-cols-2 gap-3" onSubmit={handleSubmit(onSubmit)}>
                    <FileInput
                        label="Select files"
                        registration={register("file")}
                        error={errors.file}
                        accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.png,.jpg,.jpeg,.gif"
                    />

                    <InputField
                        label="Type"
                        type="text"
                        registration={register("type")}
                        placeholder="Add a type"
                        size="md"
                    />

                    <div className="col-span-2">
                        <InputField
                            label="Description"
                            type="text"
                            registration={register("description")}
                            placeholder="Add a description"
                            size="md"
                        />
                    </div>

                    <div className="col-span-2 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => reset()}
                            disabled={isSubmitting}
                        >
                            Clear
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Uploading..." : "Upload"}
                        </Button>
                    </div>
                </form>
            </div>

            {items.length > 0 && (
                <div className="flex flex-col gap-3">
                    <div className="text-accent text-base">Current attachments</div>
                    <Table
                        shrink={true}
                        data={items}
                        columns={attachmentColumn}
                    />
                </div>
            )}
        </div>
    );
}
