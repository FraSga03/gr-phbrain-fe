import Card from "../../components/Card.tsx";
import { useDomain } from "../../context/DomainContext.tsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Option } from "../../types/Select.ts";
import { getSubclasses } from "../../service/DomainService.ts";
import ClassSelector from "../../components/ClassSelector.tsx";
import InstanceSelector from "../../components/InstanceSelector.tsx";
import { useRelationship, buildRelationshipParams } from "../../context/RelationshipContext.tsx";
import type { ClassNode } from "../../types/ClassNode.ts";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import RelationshipForm from "../../components/RelationshipForm.tsx";
import type { Relationship as RelationshipType } from "../../types/Relationship.ts";

export default function Relationship() {
    const navigate = useNavigate();
    const { selectedDomain } = useDomain();
    const {
        selectedSubjectClasses,
        selectedSubjectInstanceId,
        selectedObjectClasses,
        selectedObjectInstanceId,
        setSelectedSubjectClasses,
        setSelectedObjectInstanceId,
        setSelectedSubjectInstanceId,
        setSelectedObjectClasses,

        selectedRelationship,
        setSelectedRelationship,

        selectedRelationshipInstanceId,
        setSelectedRelationshipInstanceId
    } = useRelationship();

    const [currentSubjectClass, setCurrentSubjectClass] = useState<ClassNode | undefined>(undefined);
    const [currentObjectClass, setCurrentObjectClass] = useState<ClassNode | undefined>(undefined);

    const [subjectClassOptions, setSubjectClassOptions] = useState<Option[]>([]);
    const [objectClassOptions, setObjectClassOptions] = useState<Option[]>([]);

    const [subjectInstancesOptions, setSubjectInstancesOptions] = useState<Option[]>([]);
    const [objectInstancesOptions, setObjectInstancesOptions] = useState<Option[]>([]);

    const clearPath = (isSubject: boolean) => {
        return isSubject ? setSelectedSubjectClasses([]) : setSelectedObjectClasses([]);
    }

    const rewindPath = (key: string, isSubject: boolean) => {
        const classes = (isSubject ? selectedSubjectClasses :  selectedObjectClasses);
        const index = classes.indexOf(key);
        if (index === -1) return;

        return isSubject ? setSelectedSubjectClasses(classes.slice(0, index + 1)) : setSelectedObjectClasses(classes.slice(0, index + 1));
    };

    const onSubclassSelect = (value: string, isSubject: boolean) => {
        return isSubject ?
            setSelectedSubjectClasses([...selectedSubjectClasses, value]) :
            setSelectedObjectClasses([...selectedObjectClasses, value]);
    };

    const onInstanceSelect = (id: string, isSubject: boolean) => {
        return isSubject ? setSelectedSubjectInstanceId(id) : setSelectedObjectInstanceId(id);
    };

    function onDomainClassChanges(isSubject: boolean) {
        const classes = isSubject ? selectedSubjectClasses : selectedObjectClasses;

        if (!selectedDomain) {
            return
        }

        getSubclasses(selectedDomain, classes.length > 0 ? classes.at(-1) : undefined)
            .then((s) => {
                // Only set current class if at least one specific class is selected (not just root "general")
                if (classes.length > 0) {
                    (isSubject ? setCurrentSubjectClass : setCurrentObjectClass)(s);
                } else {
                    (isSubject ? setCurrentSubjectClass : setCurrentObjectClass)(undefined);
                }
                (isSubject ? setSubjectClassOptions : setObjectClassOptions)(s.children.map(c => ({ label: c, value: c })));
                (isSubject ? setSubjectInstancesOptions : setObjectInstancesOptions)(s.instances.map(i => ({ label: i.name, value: i.__id })));
            });
    }

    useEffect(() => {
        onDomainClassChanges(true);
    }, [selectedDomain, selectedSubjectClasses]);

    useEffect(() => {
        onDomainClassChanges(false);
    }, [selectedDomain, selectedObjectClasses]);


    const switchRoles = (isFromSubjectToObject: boolean) => {
        if (isFromSubjectToObject) {
            // Move subject to object, clear subject
            const subject = { classes: [], instanceId: null };
            const object = { classes: selectedSubjectClasses, instanceId: selectedSubjectInstanceId };
            navigate(`?${buildRelationshipParams(location.search, subject, object)}`);
        } else {
            // Move object to subject, clear object
            const subject = { classes: selectedObjectClasses, instanceId: selectedObjectInstanceId };
            const object = { classes: [], instanceId: null };
            navigate(`?${buildRelationshipParams(location.search, subject, object)}`);
        }
    };

    function onRelSelect(currRelationship: RelationshipType) {
        setSelectedRelationship(currRelationship.name);

        if (!currentObjectClass) {
            setSelectedObjectClasses(currRelationship.object.path ?? []);
        }
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex gap-3 items-center">

                <div className="flex-1">
                    <Card title="Select subject">
                        <div className="flex flex-col gap-2">
                            <ClassSelector
                                selectedPath={selectedSubjectClasses}
                                domainName={selectedDomain ?? ''}
                                subclassOptions={subjectClassOptions}
                                onClearPath={() => clearPath(true)}
                                onRewindPath={(key) => rewindPath(key, true)}
                                onSelectSubclass={(value) => onSubclassSelect(value, true)}
                            />

                            <InstanceSelector
                                instanceOptions={subjectInstancesOptions}
                                selectedInstanceId={selectedSubjectInstanceId}
                                onSelectInstance={(id) => onInstanceSelect(id, true)}
                                buttons={[
                                    { label: "Object", onClick: () => switchRoles(true) },
                                    { label: "Clear", onClick: () => setSelectedSubjectInstanceId(null) }
                                ]}
                            />
                        </div>
                    </Card>
                </div>


                <button
                    className="w-16 h-16 flex items-center justify-center bg-white! rounded border border-gray-300 hover:bg-gray-50 text-accent transition disabled:opacity-30"
                    disabled={!selectedSubjectInstanceId || !selectedObjectClasses}
                    onClick={() => {
                        const subject = { classes: selectedObjectClasses, instanceId: selectedObjectInstanceId };
                        const object = { classes: selectedSubjectClasses, instanceId: selectedSubjectInstanceId };
                        navigate(`?${buildRelationshipParams(location.search, subject, object)}`);
                    }}
                >
                    <FaArrowRightArrowLeft size={32} />
                </button>

                <div className="flex-1">
                    <Card title="Select object">
                        <div className="flex flex-col gap-2">
                            <ClassSelector
                                selectedPath={selectedObjectClasses}
                                domainName={selectedDomain ?? ''}
                                subclassOptions={objectClassOptions}
                                onClearPath={() => clearPath(false)}
                                onRewindPath={(key) => rewindPath(key, false)}
                                onSelectSubclass={(value) => onSubclassSelect(value, false)}
                            />

                            <InstanceSelector
                                instanceOptions={objectInstancesOptions}
                                selectedInstanceId={selectedObjectInstanceId}
                                onSelectInstance={(id) => onInstanceSelect(id, false)}
                                buttons={[
                                    { label: "Subject", onClick: () => switchRoles(false) },
                                    { label: "Clear", onClick: () => setSelectedObjectInstanceId(null) }
                                ]}
                            />
                        </div>
                    </Card>
                </div>
            </div>

            <div className="col-span-2">
                <Card>
                    {
                        (selectedSubjectClasses.length >= 1 && selectedDomain && currentSubjectClass) ?
                            <RelationshipForm
                                object={currentObjectClass}
                                subject={currentSubjectClass}
                                domain={selectedDomain}
                                onRelationshipSelect={onRelSelect}
                                relationshipId={selectedRelationship}
                                subjectId={selectedSubjectInstanceId}
                                objectId={selectedObjectInstanceId}
                                instanceId={selectedRelationshipInstanceId}
                                onInstanceSelect={(instance) => {
                                    setSelectedRelationshipInstanceId(instance)
                                }}
                            /> :
                            <div>Select both subject and object</div>
                    }
                </Card>
            </div>
        </div>

    );
}