import { supabase } from "../utils/supabase";

export default function Main() {
    const onTwitterRegister = async () => {
        supabase.auth.signInWithOAuth({ provider: "twitter" });
    }
    const onDiscordRegister = async () => {
        supabase.auth.signInWithOAuth({ provider: "discord" });
    }

    return <>
        <div className='flex place-content-center py-6 gap-x-12'>
            <button className='bg-black p-4 rounded-lg text-white' onClick={() => { onTwitterRegister(); }}>Twitterでログイン</button>
            <button className='bg-black p-4 rounded-lg text-white' onClick={() => { onDiscordRegister(); }}>Discordでログイン</button>
        </div>
    </>
}