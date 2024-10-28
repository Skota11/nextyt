// 'use client'
import YouTube from "react-youtube";
import { toast } from "react-toastify";
import { JSXElementConstructor, Key, PromiseLikeOfReactNode, ReactElement, ReactFragment, ReactPortal, useEffect, useState } from "react";
import { useRouter } from 'next/router'
import { supabase } from "../utils/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fa1, fa2, faChevronDown, faChevronUp, faForward, faGripLinesVertical, faPlay, faPlus, faSearch, faThumbsUp, faVolumeHigh, faVolumeLow, faVolumeXmark, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Drawer } from '@mui/material';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import Search from '@/components/search';
import dayjs from 'dayjs'
import toJaNum from '@/utils/num2ja';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import { Select, Option } from "@material-tailwind/react";

export default function Home() {
    const router = useRouter()
    const { watch }: any = router.query

    const [about, setAbout] = useState({ title: "", channelId: "", channelTitle: "", description: "", publishedAt: "" });
    const [statistics, setStatistic] = useState({ viewCount: "", likeCount: "", commentCount: "" });
    const [ytid, setYtid] = useState(watch);
    const [selectPlaylist, setSelectPlaylist] = useState("");

    //player
    const [YTPlayer, setPlayer]: any = useState();
    const [muted, setMuted] = useState(false);

    const opts = {
        width: "560",
        height: "315",
        playerVars: {
            autoplay: 1,
        },
        host: "https://www.youtube-nocookie.com"
    };
    const getVideo = async (id: any) => {
        const res = await (await fetch(`https://www.googleapis.com/youtube/v3/videos?part=id,snippet,statistics&id=${id}&key=AIzaSyC1KMsyjrnEfHJ3xnQtPX0DSxWHfyjUBeo`)).json();
        setAbout(res.items[0].snippet)
        setStatistic(res.items[0].statistics);

        if (currentUser.id !== '') {
            if (watchHistories.length < 50) {
                const data: any = { id: id, video: res.items[0].snippet };
                watchHistories.push(data)
            } else {
                const data: any = { id: id, video: res.items[0].snippet };
                watchHistories.push(data)
                watchHistories.shift();
            }
            let { error } = await supabase.from('watchHistory').upsert({
                uid: currentUser.id,
                content: watchHistories
            })
        }
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

            await getWatchHistory(user.id);
            await getMyPlaylists(user.id);
        }
    }
    const getWatchHistory = async (id: any) => {
        let { data }: { data: any } = await supabase
            .from('watchHistory')
            .select("content")
            .eq('uid', id);

        if (data.length == 0) {
            let { error } = await supabase.from('watchHistory').upsert({
                uid: id,
                content: []
            })
        } else {
            setWatchHistories(data[0].content);
        }
    }

    const getMyPlaylists = async (id: any) => {
        let { data }: { data: any } = await supabase
            .from('playlists')
            .select()
            .eq('author', id);

        setMyPlaylists(data);
    }

    const addPlaylist = async () => {
        const res = await (await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ytid}&key=AIzaSyC1KMsyjrnEfHJ3xnQtPX0DSxWHfyjUBeo`)).json();
        if (selectPlaylist !== "") {
            let { data }: { data: any } = await supabase
                .from('playlists')
                .select("content")
                .eq('id', selectPlaylist);
            const jsondata: any = { id: ytid, video: res.items[0].snippet };
            data[0].content.push(jsondata)
            let { error } = await supabase.from('playlists').upsert({
                id: selectPlaylist,
                content: data[0].content
            })
            toast.success("プレイリストに追加しました。")
        }
    }

    useEffect(() => {
        getCurrentUser();
        if (watch !== undefined) {
            getVideo(watch);
        }
    }, [])

    //Player
    const _onReady = (event: { target: any }) => {
        setPlayer(event.target)
        event.target.playVideo()
    }
    useEffect(() => {
        if (YTPlayer) {
            if (muted) {
                YTPlayer.mute()
            } else {
                YTPlayer.unMute()
            }
        }
    }, [muted, YTPlayer])

    //検索履歴
    const [watchHistories, setWatchHistories]: any = useState([]);
    const [myPlaylists, setMyPlaylists]: any = useState([]);

    const [addPlaylistMenuOpened, setaddPlaylistMenuOpened] = useState(false);
    //drawer
    const [openedDrawer, setOpenedDrawer] = useState(false);

    const toggleOnCloseDrawer = () => {
        setOpenedDrawer(false);
    }
    return (
        <>
            <main>
                <div className='flex place-content-center bg-black'>
                    <div className='wrap'>
                        <div className='video-container'>
                            <div className='video flex place-content-center rounded-lg'>
                                {ytid ? <><YouTube videoId={ytid}
                                    opts={opts}
                                    onReady={_onReady}
                                /></> : <div className=''><p className='text-white text-2xl'>動画が選択されていません</p></div>}

                            </div>
                        </div>
                    </div>
                </div>
                <div className='px-4 py-2 '>
                    <div>
                        <h1 className='my-2'><button onClick={() => { setOpenedDrawer(true) }} className='break-all text-lg '>{about.title}</button></h1>
                        <Drawer
                            anchor={'left'}
                            open={openedDrawer}
                            onClose={toggleOnCloseDrawer}
                            PaperProps={{
                                sx: { width: "100%", maxWidth: "512px" },
                            }}
                        >
                            <button className='mt-4' onClick={() => { setOpenedDrawer(false) }}>閉じる</button>
                            <div className='p-8'>
                                <h1 className='text-xl'>{about.title}</h1>
                                <p className='text-lg text-slate-600'>{about.channelTitle}</p>
                                <div className='flex gap-x-4 my-4'>
                                    <div className='text-lg'>{dayjs(about.publishedAt).format('YYYY年MM月DD日')}</div>

                                    <div className='text-lg'><FontAwesomeIcon className='mr-2' icon={faEye} />{toJaNum(statistics.viewCount)}</div>
                                    <div className='text-lg'><FontAwesomeIcon className='mr-2' icon={faThumbsUp} /> {toJaNum(statistics.likeCount)}</div>
                                </div>
                                <div >
                                    <a className='' href={`https://youtu.be/${ytid}`} ><FontAwesomeIcon className='ml-2' icon={faYoutube} />  Youtubeで開く</a>
                                </div>
                                <div className='my-4'>
                                    {
                                        currentUser.email !== '' && ytid !== undefined ? <button className='border-2 p-2 rounded-lg text-xs border-current' onClick={async () => { setaddPlaylistMenuOpened(!addPlaylistMenuOpened) }}>プレイリスト<FontAwesomeIcon className='ml-2' icon={faPlus} /></button> : <></>
                                    }
                                </div>
                                {
                                    addPlaylistMenuOpened ?
                                        <>
                                            <div className='my-2'>
                                                <Select onChange={(e: any) => { setSelectPlaylist(e.target.value) }} name="playlist" id="playlistDom" label="プレイリストを選択...">
                                                    {
                                                        myPlaylists.map((playlist: any) => {
                                                            return <Option key={playlist.id} value={playlist.id}>{playlist.name}</Option>
                                                        })
                                                    }
                                                </Select>
                                                <p><button className='border-2 p-2 rounded-lg text-xs border-current mt-2' onClick={() => { addPlaylist(); }}>追加</button></p>
                                            </div>
                                        </> : <></>
                                }

                                <div className='p-4 rounded-lg bg-gray-100 '>
                                    <div className='text-sm break-all w-full'>{about.description.split(/(\n)/).map((v: any, i: any) => (i & 1 ? <br key={i} /> : v))}</div>
                                </div>

                            </div>
                        </Drawer>
                    </div>

                </div>
                <div className='flex place-content-center'>
                    <div className='lg:w-3/4' id="検索系">
                        <div className='mb-2 flex place-content-center'>
                            <div>
                                {ytid !== undefined ?
                                    <div className='my-2 flex place-content-center gap-x-2'>
                                        <FontAwesomeIcon className='py-2' icon={faForward} />
                                        <button className='border-2 p-2 rounded-lg text-xs border-current' onClick={async () => { YTPlayer.setPlaybackRate(1) }}><FontAwesomeIcon icon={faXmark} /><FontAwesomeIcon icon={fa1} /></button>
                                        <button className='border-2 p-2 rounded-lg text-xs border-current' onClick={async () => { YTPlayer.setPlaybackRate(2) }}><FontAwesomeIcon icon={faXmark} /><FontAwesomeIcon icon={fa2} /></button>
                                        <p className='py-2'><FontAwesomeIcon icon={faGripLinesVertical} /></p>
                                        {muted ?
                                            <button className='border-2 p-2 rounded-lg text-xs border-current' onClick={async () => { setMuted(false) }}><FontAwesomeIcon icon={faVolumeXmark} /></button>
                                            :
                                            <button className='border-2 p-2 rounded-lg text-xs border-current' onClick={async () => { setMuted(true) }}><FontAwesomeIcon icon={faVolumeHigh} /></button>
                                        }
                                    </div>
                                    : <></>}

                            </div>
                        </div>
                        <Search setYtid={setYtid} getVideo={getVideo} />
                    </div>
                </div>
            </main>
        </>
    )
}
