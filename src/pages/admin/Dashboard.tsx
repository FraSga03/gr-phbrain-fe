import Table from "../../components/Table";
import Card from "../../components/Card";
import type { Statistic, UserRank } from "../../types/Dashboard";
import type { Column } from "../../types/Table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { withSubmitLock } from "../../utils/withSubmitLock";
import { type SuggestionForm, suggestionSchema } from "../../schemas/Suggestion";
import Button from "../../components/Button";
import TextArea from "../../components/TextArea";

export default function Dashboard() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SuggestionForm>({
        resolver: zodResolver(suggestionSchema),
        mode: "onSubmit",
    });

    const onSubmit = withSubmitLock(async () => {
        console.log("Done");
    });

    const statistic: Statistic[] = [
        { contribution: "Entities", total: 10, active: 5 },
        { contribution: "Entity attributes", total: 10, active: 5 },
        { contribution: "Relationships", total: 10, active: 5 },
        { contribution: "Relationships attributes", total: 10, active: 5 },
    ];

    const statisticsColumns: Column<Statistic>[] = [
        { key: "contribution", header: "Contributions" },
        { key: "total", header: "Total" },
        { key: "active", header: "Active" },
    ];

    const userRank: UserRank[] = [
        { rank: 1, username: "mario", usage: 120, trust: 95 },
        { rank: 2, username: "luigi", usage: 80, trust: 88 },
    ];

    const userRankColumns: Column<UserRank>[] = [
        { key: "rank", header: "Rank" },
        { key: "username", header: "Username" },
        { key: "usage", header: "Usage" },
        { key: "trust", header: "Trust" },
    ];

    return (
        <div className="flex flex-col gap-6">

            {/* HEADER */}
            <div className="text-2xl font-semibold text-accent leading-none">
                Welcome FraSga
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Suggestion" className="h-min">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col gap-3"
                    >
                        <TextArea
                            placeholder="Enter here your suggestion to the Administrator"
                            error={errors.suggestion}
                            registration={register("suggestion")}
                        />

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Loading..." : "Send"}
                            </Button>
                        </div>
                    </form>
                </Card>

                <Card title="Statistics">
                    <Table data={statistic} columns={statisticsColumns} />

                    <div className="mt-4 flex flex-col gap-2 text-sm">
                        <div className="flex justify-between">
                            <span>Credit</span>
                            <span className="font-medium">XX</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Bonus</span>
                            <span className="font-medium">XX</span>
                        </div>
                    </div>
                </Card>


                <Card title="Hall of Fame" className="col-span-2">
                    <Table
                        pageSize={2}
                        pagination
                        data={userRank}
                        columns={userRankColumns}
                    />
                </Card>
            </div>
        </div>
    );
}