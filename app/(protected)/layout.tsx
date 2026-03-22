import React from "react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    // TODO: implement auth + PIN check here
    return <section>{children}</section>;
}
