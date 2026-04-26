import { useForm } from "react-hook-form";
import type { Attachment, InputAttachment } from "../types/Record.ts";
import Table from "./Table.tsx";
import type { Column } from "../types/Table.ts";
import { FaDownload } from "react-icons/fa";
import toast from "react-hot-toast";
import FileInput from "./FileInput.tsx";
import InputField from "./InputField.tsx";
import Button from "./Button.tsx";
import { saveFile } from "../service/DomainService.ts";

type AttachmentsFormProps = {
    attachments: Attachment[];
    domain: string;
    instanceId: string;
};

export default function AttachmentsForm({ attachments, domain, instanceId }: AttachmentsFormProps) {
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
        const formData = new FormData();
        formData.append("file", (data as never)["file"][0] as File);
        formData.append("type", data.type);
        formData.append("description", data.description);

        await saveFile(domain, instanceId, formData as never);
        toast.success("Attachment uploaded successfully");
        reset();
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
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <div className="text-accent text-base">New attachment</div>

                <form className="grid grid-cols-2 gap-2" onSubmit={handleSubmit(onSubmit)}>
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

                    <div className="col-span-2 flex justify-end gap-2">
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

            {attachments.length > 0 && (
                <div className="flex flex-col gap-2">
                    <div className="text-accent text-base">Current attachments</div>
                    <Table
                        data={attachments}
                        columns={attachmentColumn}
                    />
                </div>
            )}
        </div>
    );
}
