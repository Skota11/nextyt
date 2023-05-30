import Link from "next/link";

export default function Main() {
    return <>
        <div className="bg-black p-4 flex place-content-center">
            <h1 className="text-white"> <Link href="/">NextTube</Link></h1>
        </div>
    </>
}