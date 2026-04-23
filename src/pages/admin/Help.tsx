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
                The menu on the top allows you to select the various functionality provided by the platform.
            </div>

            <div>
                The "Entities" and "Relationships" tabs allow you to add, modify, delete, or search instances of entities and relationships. <br/>
                In the "Evaluation" area you can approve, disapprove, or simply comment the entity or relationship instance instance as a whole or its specific attributes, also leaving an optional message related to your evaluation.
            </div>

            <div>
                The "Hall of Fame" tab allows you to see the ranking of most active and/or most trusted users.
            </div>

            Enjoy!
        </div>
    );
}