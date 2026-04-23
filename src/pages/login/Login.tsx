import Card from "../../components/Card.tsx";
import { useForm } from "react-hook-form";
import InputField from "../../components/InputField.tsx";
import Button from "../../components/Button.tsx";
import { type LoginForm, loginSchema } from "../../schemas/LoginForm.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { withSubmitLock } from "../../utils/withSubmitLock.ts";
import { login } from "../../service/AuthService.ts";

export default function Login() {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        mode: "onSubmit"
    })

    const onSubmit = withSubmitLock(async (data: LoginForm) => {
        console.log(data);

        login(data.username, data.password)
            .then(() => navigate("/admin"))
            .catch(() => reset());
    });

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 md:p-0 relative">
            <div className="absolute text-accent top-6 left-6 text-4xl font-bold md:top-10 md:left-10">
                Gr@phBRAIN
            </div>

            <div className="text-4xl font-bold">Login</div>
            <Card className="w-full md:w-1/2 xl:w-1/3">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
                    <InputField
                        label="Username"
                        type="string"
                        placeholder="Enter username"
                        error={errors.username}
                        registration={register("username")}
                        size="lg"
                    />

                    <InputField
                        label="Password"
                        type="password"
                        placeholder="Enter password"
                        error={errors.password}
                        registration={register("password")}
                        size="lg"
                    />
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Loading..." : "Login"}
                    </Button>
                </form>
            </Card>
        </div>
    );
}