import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FileInput from "./FileInput";
import InputField from "./InputField";
import Button from "./Button";
import toast from "react-hot-toast";

const attachmentSchema = z.object({
    files: z.instanceof(FileList).refine((files) => files.length > 0, "At least one file is required"),
    description: z.string().optional(),
});

type AttachmentFormData = z.infer<typeof attachmentSchema>;

type AttachmentFormProps = {
    onSubmit?: (data: AttachmentFormData) => Promise<void>;
};

export default function AttachmentForm({ onSubmit }: AttachmentFormProps) {
    const {
        register,
        reset,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = useForm<AttachmentFormData>({
        resolver: zodResolver(attachmentSchema),
        mode: "onBlur",
    });

    const handleFormSubmit = async (data: AttachmentFormData) => {
        try {
            if (onSubmit) {
                await onSubmit(data);
            } else {
                toast.success("Files uploaded successfully");
            }
            reset();
        } catch (error) {
            toast.error("Failed to upload files");
        }
    };

    return (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
            <FileInput
                label="Select files"
                registration={register("files")}
                error={errors.files}
                multiple
                accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.png,.jpg,.jpeg,.gif"
            />

            <InputField
                label="Description (optional)"
                type="text"
                registration={register("description")}
                placeholder="Add a description for these attachments"
                size="sm"
            />

            <div className="flex justify-end gap-2">
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
    );
}
