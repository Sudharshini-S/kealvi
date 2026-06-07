import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title:"Kealvi",
    description:"AI Q&A and polling system"
};

export default function RootLayout(
{
    children
}:
{
    children:React.ReactNode;
}
){
    return(
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}