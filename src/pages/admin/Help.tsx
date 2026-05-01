import { useAuth } from "../../context/AuthContext.tsx";

export default function Help() {
    const { user } = useAuth();

    function goToDocs() {
        window.open("http://digitalmind.di.uniba.it:8088/GraphBRAIN/faces/GraphBRAIN_users_guide_v5.4.3_1.pdf", '_blank');
    }

    return (
        <div className="text-xl flex flex-col gap-6">
            <div className="text-2xl font-semibold text-accent leading-none">
                Welcome {user?.username}
            </div>

            <div>
                You can download a users' guide in Italian <a className="underline! cursor-pointer" onClick={goToDocs}>here</a>.
            </div>

            <div>
                <span className="font-semibold text-accent">Dashboard</span> your personal landing page. It shows the Hall of Fame ranking of the most active and trusted users, your contribution statistics together with credits and bonuses, and a form to send suggestions to the administrator.
            </div>

            <div>
                <span className="font-semibold text-accent">Entities</span> and <span className="font-semibold text-accent">Relationships</span> let you add, modify, delete, or search instances of entities and relationships. In the "Evaluation" area you can approve, disapprove, or comment on an instance as a whole or on its specific attributes, also leaving an optional message related to your evaluation.
            </div>

            <div>
                <span className="font-semibold text-accent">Graph</span> provides an interactive visualization of the knowledge graph, letting you explore how entities are connected through relationships and navigate the underlying structure of the selected domain.
            </div>

            <div>
                <span className="font-semibold text-accent">Schema</span> lets you inspect and manage the schema of the current domain, including the available classes, their attributes, and the relationships defined between them.
            </div>

            <div>
                <span className="font-semibold text-accent">Profile</span> shows your account details and lets you update your personal information and credentials.
            </div>

            Enjoy!
        </div>
    );
}