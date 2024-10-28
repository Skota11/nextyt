import { supabase } from "../utils/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faDiscord, faTwitter } from "@fortawesome/free-brands-svg-icons";

export default function Main() {
    const onTwitterRegister = async () => {
        supabase.auth.signInWithOAuth({ provider: "twitter" });
    }
    const onDiscordRegister = async () => {
        supabase.auth.signInWithOAuth({ provider: "discord" });
    }

    return <>
        <div className='flex place-content-center py-6 gap-x-12'>
            <button className=' rounded-full border-2 p-4 text-lg border-current' onClick={() => { onTwitterRegister(); }}><FontAwesomeIcon icon={faTwitter} className='mr-2' /> Twitterでログイン</button>
            <button className=' rounded-full border-2 p-4 text-lg border-current' onClick={() => { onDiscordRegister(); }}><FontAwesomeIcon icon={faDiscord} className='mr-2' /> Discordでログイン</button>
        </div>
    </>
}