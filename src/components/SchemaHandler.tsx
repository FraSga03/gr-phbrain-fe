import Button from "./Button";
import Modal from "./Modal.tsx";
import InputField from "./InputField.tsx";
import Select from "./Select.tsx";
import FileInput from "./FileInput.tsx";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { downloadSchema, type DownloadForm } from "../schemas/DownloadForm.ts";
import { uploadSchema, type UploadForm } from "../schemas/UploadForm.ts";
import { extractGraphSchema, type ExtractGraphForm } from "../schemas/ExtractGraphForm.ts";
import type { SchemaEdit, UploadedFile } from "../types/Schema.ts";
import { downloadDomainSchema, upload } from "../services/DomainService.ts";
import { downloadGraph } from "../services/GraphService.ts";
import { useDomain } from "../contexts/DomainContext.tsx";
import { downloadFile } from "../utils/downloadFile.ts";
import toast from "react-hot-toast";

type SchemaHandlerProps = {
    schemaEdits?: SchemaEdit[];
    uploadedFile?: UploadedFile | null;
    setUploadedFile: (file: UploadedFile | null) => void;
};

export default function SchemaHandler({ schemaEdits, uploadedFile, setUploadedFile }: SchemaHandlerProps) {
    const { selectedDomain } = useDomain();
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isGraphOpen, setIsGraphOpen] = useState(false);

    const downloadForm = useForm<DownloadForm>({
        resolver: zodResolver(downloadSchema),
        defaultValues: { fileName: "", format: "gbs" },
        mode: "onBlur",
    });

    const uploadForm = useForm<UploadForm>({
        resolver: zodResolver(uploadSchema),
        defaultValues: { importOntology: false, importInstances: false },
        mode: "onBlur",
    });

    const extractForm = useForm<ExtractGraphForm>({
        resolver: zodResolver(extractGraphSchema),
        defaultValues: { prefix: "", nodeId: "", distance: 1, outputFile: "" },
        mode: "onBlur",
    });

    function closeDownloadModal() {
        downloadForm.reset({})
        setIsDownloadOpen(false);
    }

    function closeUploadModal() {
        uploadForm.reset({})
        setIsUploadOpen(false);
    }

    function closeGraphModal() {
        extractForm.reset({})
        setIsGraphOpen(false);
    }

    async function onSubmitDownload(data: DownloadForm) {
        const domainKey = uploadedFile?.id ?? selectedDomain;
        if (!domainKey) return;

        downloadDomainSchema(domainKey, schemaEdits ?? [], data.format, data.fileName)
            .then((blob: Blob) => {
                downloadFile(blob, `${data.fileName}.${data.format}`)
                toast.success(`${data.fileName}.${data.format} downloaded successfully.`);
                closeDownloadModal();
            })
    }

    async function onSubmitUpload(data: UploadForm) {
        if (!selectedDomain) return;
        const fd = new FormData();
        fd.append("file", data.file[0]);
        fd.append("importOntology", String(data.importOntology));
        fd.append("importInstances", String(data.importInstances));

        upload(fd)
            .then(res => {
                setUploadedFile({ id: res.id, filename: res.filename });

                toast.success("Upload successful");
                closeUploadModal();
            })
    }

    async function onSubmitExtract(data: ExtractGraphForm) {
        if (!selectedDomain) return;
        const fd = new FormData();
        fd.append("file", data.file[0]);
        fd.append("prefix", data.prefix);
        fd.append("nodeId", data.nodeId);
        fd.append("distance", String(data.distance));
        fd.append("outputFile", data.outputFile);

        await downloadGraph(fd)
            .then(blob => {
                downloadFile(blob, data.outputFile);
                toast.success(`${data.outputFile} downloaded successfully.`);
                closeGraphModal();
            });
    }

    return <>
        <Button size="sm" onClick={() => setIsDownloadOpen(true)}>
            Download
        </Button>
        <Button size="sm" onClick={() => setIsUploadOpen(true)}>
            Upload
        </Button>
        <Button size="sm" onClick={() => setIsGraphOpen(true)}>
            Extract graph
        </Button>

        <Modal width="32rem" title="Download" open={isDownloadOpen} onClose={closeDownloadModal}>
            <form className="flex flex-col gap-3" onSubmit={downloadForm.handleSubmit(onSubmitDownload)}>
                <InputField
                    label="File name *"
                    registration={downloadForm.register("fileName", { required: "File name is required" })}
                    error={downloadForm.formState.errors.fileName}
                    size="md"
                />

                <div className="flex flex-col gap-0.5">
                    <label className="label text-lg!">Format *</label>
                    <Select
                        options={[
                            { label: "GBS", value: "gbs" },
                            { label: "OWL", value: "owl" },
                            { label: "Prolog", value: "pl" },
                        ]}
                        placeholder="Select a format"
                        registration={downloadForm.register("format", { required: "Format is required" })}
                        className="h-10"
                        error={downloadForm.formState.errors.format}
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={closeDownloadModal}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={downloadForm.formState.isSubmitting}>
                        Download
                    </Button>
                </div>
            </form>
        </Modal>

        <Modal width="32rem" title="Upload" open={isUploadOpen} onClose={closeUploadModal}>
            <form className="flex flex-col gap-3" onSubmit={uploadForm.handleSubmit(onSubmitUpload)}>
                <FileInput
                    label="Ontology *"
                    accept=".gbs"
                    registration={uploadForm.register("file", { required: "File is required" })}
                    error={uploadForm.formState.errors.file as never}
                    size="md"
                />

                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...uploadForm.register("importOntology")} />
                    Import ontology
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...uploadForm.register("importInstances")} />
                    Import instances
                </label>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={closeUploadModal}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={uploadForm.formState.isSubmitting}>
                        Upload
                    </Button>
                </div>
            </form>
        </Modal>

        <Modal width="32rem" title="Extract subgraph" open={isGraphOpen} onClose={closeGraphModal}>
            <form className="flex flex-col gap-3" onSubmit={extractForm.handleSubmit(onSubmitExtract)}>
                <FileInput
                    label="Ontology *"
                    accept=".gbs"
                    registration={extractForm.register("file", { required: "File is required" })}
                    error={extractForm.formState.errors.file as never}
                    size="md"
                />

                <InputField
                    label="Prefix *"
                    placeholder="Insert prefix"
                    registration={extractForm.register("prefix", { required: "Prefix is required" })}
                    error={extractForm.formState.errors.prefix}
                    size="md"
                />

                <InputField
                    label="Node ID *"
                    placeholder="Insert ID of the node"
                    registration={extractForm.register("nodeId", { required: "Node ID is required" })}
                    error={extractForm.formState.errors.nodeId}
                    size="md"
                />

                <InputField
                    label="Distance *"
                    type="number"
                    placeholder="Insert distance"
                    registration={extractForm.register("distance", { required: "Distance is required", valueAsNumber: true, min: { value: 1, message: "Distance must be at least 1" } })}
                    error={extractForm.formState.errors.distance}
                    size="md"
                />

                <InputField
                    label="Output file *"
                    placeholder="Output file name"
                    registration={extractForm.register("outputFile", { required: "Output file is required" })}
                    error={extractForm.formState.errors.outputFile}
                    size="md"
                />

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={closeGraphModal}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={extractForm.formState.isSubmitting}>
                        Extract
                    </Button>
                </div>
            </form>
        </Modal>
    </>;
}
