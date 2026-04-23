import Card from "../../components/Card.tsx";
import { useDomain } from "../../context/DomainContext.tsx";
import { useSelection } from "../../context/SelectionContext.tsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Option } from "../../types/Select.ts";
import type { ClassNode } from "../../types/ClassNode.ts";
import { getInstanceByIdAndDomain, getSubclasses } from "../../service/DomainService.ts";
import EvaluationForm from "../../components/EvaluationForm.tsx";
import RecordForm from "../../components/RecordForm.tsx";
import type { Record } from "../../types/Record.ts";
import AttachmentsForm from "../../components/AttachmentsForm.tsx";
import ClassSelector from "../../components/ClassSelector.tsx";
import InstanceSelector from "../../components/InstanceSelector.tsx";
import type { InstanceButton } from "../../components/InstanceSelector.tsx";
import { buildRelationshipParams } from "../../context/RelationshipContext.tsx";

export default function Entity() {
    const navigate = useNavigate();
    const { selectedDomain } = useDomain();
    const {
        selectedClasses,
        selectedInstanceId,
        setSelectedClasses,
        setSelectedInstanceId,
    } = useSelection();
    const [options, setOptions] = useState<Option[]>([]);
    const [currentClass, setCurrentClass] = useState<ClassNode | undefined>(undefined);
    const [instancesOptions, setInstancesOptions] = useState<Option[]>([]);
    const [selectedInstance, setSelectedInstance] = useState<Record | null>(null);

    const clearPath = () => {
        setSelectedClasses([]);
    }

    const rewindPath = (key: string) => {
        const index = selectedClasses.indexOf(key);
        if (index === -1) return;

        setSelectedClasses(selectedClasses.slice(0, index + 1));
    };

    const onSubclassSelect = (value: string) => {
        setSelectedClasses([...selectedClasses, value]);
    };

    const onInstanceSelect = (id: string) => {
        setSelectedInstanceId(id);
    };

    const resetInstanceForm = () => {
        setSelectedInstanceId(null);
    };

    const navigateToRelationship = (isSubject: boolean) => {
        if (!selectedInstanceId) return;

        const subject = isSubject ? { classes: selectedClasses, instanceId: selectedInstanceId } : { classes: [], instanceId: null };
        const object = isSubject ? { classes: [], instanceId: null } : { classes: selectedClasses, instanceId: selectedInstanceId };

        const params = buildRelationshipParams(location.search, subject, object);
        navigate(`/admin/relationships?${params}`);
    };

    const instanceButtons: InstanceButton[] = [
        {
            label: "Subject",
            onClick: () => navigateToRelationship(true)
        },
        {
            label: "Object",
            onClick: () => navigateToRelationship(false)
        }
    ];

    useEffect(() => {
        if (!selectedDomain) {
            return
        }

        getSubclasses(selectedDomain, selectedClasses.at(-1))
            .then((s) => {
                setCurrentClass(s);
                setOptions(s.children.map(c => ({ label: c, value: c })));
                setInstancesOptions(s.instances.map(i => ({ label: i.name, value: i.__id })));
            });
    }, [selectedDomain, selectedClasses]);

    useEffect(() => {
        if (!selectedInstanceId || !selectedDomain || !selectedClasses.length) {
            setSelectedInstance(null);
            return;
        }
        getInstanceByIdAndDomain(selectedDomain, selectedInstanceId)
            .then((instance) => {
                setSelectedInstance(instance);
            })
    }, [selectedInstanceId]);

    return (
        <div className="grid grid-cols-2 gap-4">
            <Card title="Select class">
                <ClassSelector
                    selectedPath={selectedClasses}
                    domainName={selectedDomain ?? ''}
                    subclassOptions={options}
                    onClearPath={clearPath}
                    onRewindPath={rewindPath}
                    onSelectSubclass={onSubclassSelect}
                />
            </Card>

            <Card title="Select instance">
                <InstanceSelector
                    instanceOptions={instancesOptions}
                    selectedInstanceId={selectedInstanceId}
                    onSelectInstance={onInstanceSelect}
                    buttons={instanceButtons}
                />
            </Card>

            <Card title="Instance">
                <RecordForm currentDomain={selectedDomain ?? ''} selectedInstance={selectedInstance} currentClass={currentClass} onReset={resetInstanceForm} />
            </Card>
            <Card title="Attachments">
                {
                    selectedInstance ?
                        <AttachmentsForm attachments={selectedInstance.attachments ?? []} domain={selectedDomain ?? ''} instanceId={selectedInstance.__id} /> :
                        <div>Select an instance to add its attachments</div>
                }
            </Card>

            <Card title="Evaluation">
                {
                    currentClass && selectedDomain && selectedInstance ?
                        <EvaluationForm domainClass={currentClass} instanceId={selectedInstance.__id} domain={selectedDomain} /> :
                        <div>Select an instance to evaluate it</div>
                }
            </Card>
        </div>
    );
}