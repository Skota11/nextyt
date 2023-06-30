// 'use client'
import Image from 'next/image'
import YouTube from "react-youtube";
import Link from 'next/link';

import { JSXElementConstructor, PromiseLikeOfReactNode, ReactElement, ReactFragment, ReactPortal, useEffect, useState } from "react";
import { useRouter } from 'next/router'

import { supabase } from "../../utils/supabase";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faChevronDown, faChevronUp, faPlay, faSearch, faTrash } from "@fortawesome/free-solid-svg-icons";
import Swal from 'sweetalert2';

export default function Home() {
    const router = useRouter()
    const { id }: any = router.query

    const [about, setAbout] = useState({ title: "", channelId: "", channelTitle: "", description: "" });
    const [playlistData, setPlaylistData] = useState({ name: "", content: [] });
    const [ytid, setYtid] = useState();

    const opts = {
        width: "560",
        height: "315",
        playerVars: {
            autoplay: 1,
        },
        host: "https://www.youtube-nocookie.com"
    };

    const getVideo = async (id: any) => {
        const res = await (await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=AIzaSyC1KMsyjrnEfHJ3xnQtPX0DSxWHfyjUBeo`)).json();
        setAbout(res.items[0].snippet)
    }
    const Select = async (id: any) => {
        setYtid(id);
        getVideo(id);
    }

    const onTitleNameChange = async (value: any) => {
        let { error } = await supabase.from('playlists').upsert({
            id: id,
            name: value
        })
    }
    //Auth系の処理
    const [currentUser, setcurrentUser] = useState({ email: '', id: '' });

    // 現在ログインしているユーザーを取得する処理
    const getCurrentUser = async () => {
        // ログインのセッションを取得する処理
        const { data } = await supabase.auth.getSession()
        if (data.session !== null) {
            const { data: { user } }: { data: { user: any } } = await supabase.auth.getUser()
            setcurrentUser(user)
        }
    }

    const getPlaylist = async () => {
        if (id !== undefined) {
            let { data }: { data: any } = await supabase
                .from('playlists')
                .select()
                .eq('id', id);

            if (data !== null) {
                if (data[0].content.length == 0) {
                    router.push("/404");
                }
            } else {
                router.push("/404");
            }

            setPlaylistData(data[0]);
            setTitleName(data[0].name)
        }
    }

    const onClickDelete = async () => {
        Swal.fire({
            title: '本当に削除しますか？',
            text: "この操作は取り消せません",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '削除'
        }).then(async (result: any) => {
            if (result.isConfirmed) {
                const { error } = await supabase
                    .from('playlists')
                    .delete()
                    .eq('id', id)
                router.push("/");
            }
        })
    }

    const reverse = [...playlistData.content].reverse();
    useEffect(() => {
        getCurrentUser();
        getPlaylist();
    }, [id])

    //検索履歴
    const [searchHistories, setSearchHistories]: any = useState([]);

    const [TitleName, setTitleName] = useState(playlistData.name);
    const [InfoMenuOpened, setInfoMenuOpened] = useState(false);
    return (
        <>
            <main>
                <div className='flex place-content-center bg-black'>
                    <div className='wrap'>
                        <div className='video-container'>
                            <div className='video flex place-content-center rounded-lg'>
                                <YouTube videoId={ytid}
                                    opts={opts}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className='px-4 py-2 '>
                    <h1><a href={`https://www.youtube.com/watch?v=${ytid}`}>{about.title}</a></h1>
                    <a href={`https://www.youtube.com/channel/${about.channelId}`} target="_blank" className='text-sm text-slate-600' rel="noopener noreferrer">{about.channelTitle}</a>
                    <div>
                        {
                            ytid !== undefined ? <button className='border-2 p-2 rounded-lg text-xs border-current' onClick={async () => { setInfoMenuOpened(!InfoMenuOpened) }}>概要欄<span className='ml-2'>{InfoMenuOpened ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />}</span></button> : <></>
                        }
                    </div>
                    {
                        InfoMenuOpened ?
                            <>
                                <div className='mt-2 border-l-4 border-current pl-4'>
                                    <div className='text-sm'>{about.description.split(/(\n)/).map((v: any, i: any) => (i & 1 ? <br key={i} /> : v))}</div>
                                </div>
                            </> : <></>
                    }
                </div>
                <div className='flex place-content-center'>
                    <div className='lg:w-3/4 px-4'>
                        <input type="text" className='text-lg' value={TitleName} onChange={(e) => { setTitleName(e.target.value); onTitleNameChange(e.target.value) }} />
                        <button onClick={() => { onClickDelete(); }}><FontAwesomeIcon icon={faTrash} /></button>
                        <div className='grid gap-4 my-4'>
                            {
                                reverse.map((data: any) => {
                                    return <>
                                        <a href="#" onClick={() => { Select(data.id); }}>
                                            <div className='flex gap-x-4'>
                                                <img src={data.video.thumbnails.high.url} alt="" width="120px" className='inline' />
                                                <p className='text-sm inline'>{data.video.title}</p>
                                            </div>
                                        </a>
                                    </>
                                })}
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
