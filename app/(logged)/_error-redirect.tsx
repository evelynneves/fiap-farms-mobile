import { Redirect, type Href } from "expo-router";

export default function _ErrorRedirect() {
    return <Redirect href={"/error/404" as Href} />;
}
