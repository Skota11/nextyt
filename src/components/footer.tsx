import { faCopyright } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function Main() {
    return <>
        <div className="px-8 py-4 text-sm">
            <p><FontAwesomeIcon icon={faCopyright} className="mr-1" /> Skota11 2023</p>
            <p>このサイトのソースはGithubで公開されています。<a className="underline" href="https://github.com/Skota11/nextyt" target="_blank" rel="noopener noreferrer">Skota11/nextyt</a></p>
        </div>
    </>
}