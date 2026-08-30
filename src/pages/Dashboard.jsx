import { useAuthStore } from "../store/authStore";

export default function Dashboard() {
    const user = useAuthStore((state) => state.user);

    return (
        <>
            <h1>Dashboard</h1>

            <h3>
                Welcome {user.firstName} {user.lastName}
            </h3>

            <button onClick={logout}>
                Logout
            </button>
        </>
    );
}