import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type EvaluationForm, evaluationSchema } from "../schemas/EvaluationForm";
import Button from "./Button";
import Select from "./Select";
import TextArea from "./TextArea";
import toast from "react-hot-toast";
import { evaluateInstance } from "../services/DomainService.ts";
import type { ClassNode } from "../types/ClassNode.ts";

type EvaluationFormProps = {
    domainClass: ClassNode;
    domain: string;
    instanceId: string
};

export default function EvaluationFormComponent({ domainClass, domain, instanceId }: EvaluationFormProps) {
    const {
        register,
        handleSubmit,
        formState: {
            isSubmitting,
            errors
        },
        setError,
        reset
    } = useForm({
        resolver: zodResolver(evaluationSchema),
        defaultValues: {
            property: "GENERAL",
            evaluation: "",
        },
        mode: "onBlur",
    });

    const onEvaluationSubmit = async (data: EvaluationForm, e: never) => {
        const buttonName = (e["nativeEvent"]["submitter"] as HTMLButtonElement)?.name;

        if (buttonName === "comment" && !data.evaluation) {
            setError("evaluation", { message: "A comment needs a non-empty evaluation" });
            return;
        }

        evaluateInstance(domain, instanceId, { ...data, type: (buttonName ?? "approve") as "comment" | "approve" | "reject" })
            .then(() => {
                if (buttonName === "comment") {
                    toast.success("Comment sent");
                } else if (buttonName === "approve") {
                    toast.success("Instance approved");
                } else if (buttonName === "reject") {
                    toast.success("Instance rejected");
                }

                reset({ property: "GENERAL", evaluation: "" });
            })
    }

    return (
        <form className="flex flex-col gap-3" onSubmit={handleSubmit(onEvaluationSubmit as never)}>
            <Select
                options={[
                    { label: "Whole instance", value: "GENERAL" },
                    ...(Object.keys(domainClass.properties ?? {})).map(key => ({ label: key, value: key }))
                ]}
                placeholder="Select property to evaluate"
                registration={register("property", { required: "Property is required" })}
                className="h-10"
            />
            <TextArea
                placeholder="Enter your evaluation"
                registration={register("evaluation", { required: "Evaluation is required" })}
                error={errors.evaluation}
            />
            <div className="flex justify-end gap-3">
                <Button type="submit" name="reject" disabled={isSubmitting}>
                    {isSubmitting ? "Loading..." : "Reject"}
                </Button>
                <Button type="submit" name="approve" disabled={isSubmitting}>
                    {isSubmitting ? "Loading..." : "Approve"}
                </Button>
                <Button type="submit" name="comment" disabled={isSubmitting}>
                    {isSubmitting ? "Loading..." : "Comment"}
                </Button>
            </div>
        </form>
    );
}
