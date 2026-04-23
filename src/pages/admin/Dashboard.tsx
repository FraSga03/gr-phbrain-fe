import Table from "../../components/Table";
import Card from "../../components/Card";
import type { Credit, Contribution, UserRank } from "../../types/Dashboard";
import type { Column } from "../../types/Table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { withSubmitLock } from "../../utils/withSubmitLock";
import { type SuggestionForm, suggestionSchema } from "../../schemas/SuggestionForm.ts";
import Button from "../../components/Button";
import TextArea from "../../components/TextArea";
import { useEffect, useState } from "react";
import { getUserCredit, getUserContributions, getUserRanking } from "../../service/RankService.ts";
import type { PaginatedResult } from "../../types/Paginate.ts";
import { saveSuggestion } from "../../service/HelpService.ts";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.tsx";

export default function Dashboard() {
    const [contributions, setContributions] = useState<Contribution[]>([]);
    const [credit, setCredit] = useState<Credit | undefined>(undefined);
    const [rankings, setRankings] = useState<PaginatedResult<UserRank> | undefined>(undefined);
    const { user } = useAuth();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<SuggestionForm>({
        resolver: zodResolver(suggestionSchema),
        mode: "onSubmit",
    });

    const onSubmit = withSubmitLock(async (data: SuggestionForm) => {
        await saveSuggestion(data.suggestion).then(() => {
            toast.success("Suggestion saved!");
            reset();
        });
    });

    useEffect(() => {
        getUserContributions().then(setContributions);
        getUserCredit().then(setCredit);
        getUserRanking().then(setRankings);
    }, []);

    function handleRankingPageChange(page: number) {
        getUserRanking(page).then(setRankings);
    }

    const contributionsColumns: Column<Contribution>[] = [
        { key: "contribution", header: "Contributions" },
        { key: "total", header: "Total" },
        { key: "active", header: "Active" },
    ];

    const userRankColumns: Column<UserRank>[] = [
        { key: "index", header: "Rank" },
        { key: "username", header: "Username" },
        { key: "usage", header: "Usage" },
        { key: "trust", header: "Trust" },
    ];

    return (
        <div className="flex flex-col gap-6 select-none">
            <div className="text-2xl font-semibold text-accent leading-none">
                Welcome {user?.username}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Hall of Fame" className="col-span-2">
                    {rankings && (
                        <Table
                            paginatedResult={rankings}
                            onPageChange={handleRankingPageChange}
                            columns={userRankColumns}
                        />
                    )}
                </Card>

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
                    <Table data={contributions} columns={contributionsColumns} />

                    <div className="mt-4 flex flex-col gap-2 text-sm">
                        <div className="flex justify-between">
                            <span>Credit</span>
                            <span className="font-medium">{credit?.credits}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Bonus</span>
                            <span className="font-medium">{credit?.bonus}</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}