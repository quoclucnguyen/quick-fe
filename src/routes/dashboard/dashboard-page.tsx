import {useAuth} from "../../App";

export default function DashboardPage() {
    const appAuth = useAuth();

    return <>Welcome {appAuth.user?.displayName}</>
}