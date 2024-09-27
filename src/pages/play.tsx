// 'use client'
import Image from 'next/image'
import YouTube from "react-youtube";
import { toast } from "react-toastify";
import Link from 'next/link';

import { JSXElementConstructor, Key, PromiseLikeOfReactNode, ReactElement, ReactFragment, ReactPortal, useEffect, useState } from "react";
import { useRouter } from 'next/router'

import { supabase } from "../utils/supabase";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faChevronDown, faChevronUp, faPlay, faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import { Drawer } from '@mui/material';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';

export default function Home() {
    const router = useRouter()
    const { watch }: any = router.query

    const [searchQ, setserachQ] = useState("")
    const [result, setResult]: any = useState();
    const [about, setAbout] = useState({ title: "", channelId: "", channelTitle: "", description: "" });
    const [statistics, setStatistic] = useState({ viewCount: "", likeCount: "", commentCount: "" });
    const [ytid, setYtid] = useState(watch);
    const [selectPlaylist, setSelectPlaylist] = useState();

    //player
    const [YTPlayer , setPlayer]:any = useState();
    const [YTspeed , setYTSpeed] = useState(1);

    const opts = {
        width: "560",
        height: "315",
        playerVars: {
            autoplay: 1,
        },
        host: "https://www.youtube-nocookie.com"
    };

    const getSearch = async () => {
        const res = await (await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQ}&key=AIzaSyC1KMsyjrnEfHJ3xnQtPX0DSxWHfyjUBeo&maxResults=50&type=video`)).json();
        setResult(res.items)
        if (currentUser.id !== '') {
            if (searchHistories.length < 6) {
                searchHistories.push(searchQ)
            } else {
                searchHistories.push(searchQ)
                searchHistories.shift();
            }
            let { error } = await supabase.from('searchHistory').upsert({
                uid: currentUser.id,
                content: searchHistories
            })
            getSearchHistory(currentUser.id)
        }
    }
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
    const Select = async (id: any) => {
        setYtid(id);
        getVideo(id);
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

            await getSearchHistory(user.id);
            await getWatchHistory(user.id);
            await getMyPlaylists(user.id);
        }
    }
    const getSearchHistory = async (id: any) => {
        let { data }: { data: any } = await supabase
            .from('searchHistory')
            .select("content")
            .eq('uid', id);

        if (data.length == 0) {
            let { error } = await supabase.from('searchHistory').upsert({
                uid: id,
                content: []
            })
        }
        setSearchHistories(data[0].content);
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
    }

    //検索履歴
    const [searchHistories, setSearchHistories]: any = useState([]);
    const [watchHistories, setWatchHistories]: any = useState([]);
    const [myPlaylists, setMyPlaylists]: any = useState();

    const [addPlaylistMenuOpened, setaddPlaylistMenuOpened] = useState(false);
    const [InfoMenuOpened, setInfoMenuOpened] = useState(false);

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
                                {ytid? <><YouTube videoId={ytid}
                                    opts={opts}
                                    onReady={_onReady}
                                /></> : <div className='place-content-center flex h-full'><p className='text-white text-2xl'>動画が選択されていません</p></div>}
                                
                            </div>
                        </div>
                    </div>
                </div>
                <div className='px-4 py-2 '>
                    <div>
                        <h1 className='my-2'><a onClick={() => { setOpenedDrawer(true) }} className='break-all text-lg ' href={'#'}>{about.title}</a></h1>
                        <Drawer
                            anchor={'right'}
                            open={openedDrawer}
                            onClose={toggleOnCloseDrawer}
                            PaperProps={{
                                sx: { width: "100%" , maxWidth: "512px" },
                              }}
                        >
                            <button className='mt-4' onClick={() => { setOpenedDrawer(false) }}>閉じる</button>
                            <div className='p-8'>
                                <h1 className='text-xl'>{about.title}</h1>
                                <p className='text-lg text-slate-600'>{about.channelTitle}</p>
                                <div className='my-2'>
                                    <p>視聴回数 : {statistics.viewCount}</p>
                                    <p>高評価数 : {statistics.likeCount}</p>
                                    <p>コメント数 : {statistics.commentCount}</p>
                                </div>
                                <div >
                                    <a className='' href={`https://youtu.be/${ytid}`} ><FontAwesomeIcon className='ml-2' icon={faYoutube} />  Youtubeで開く</a>
                                </div>
                                <div className='my-4'>
                                    {
                                        ytid !== undefined ? <button className='border-2 p-2 rounded-lg text-xs border-current' onClick={async () => { setInfoMenuOpened(!InfoMenuOpened) }}>概要欄<span className='ml-2'>{InfoMenuOpened ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />}</span></button> : <></>
                                    }
                                    {
                                        currentUser.email !== '' && ytid !== undefined ? <button className='border-2 p-2 rounded-lg text-xs border-current' onClick={async () => { setaddPlaylistMenuOpened(!addPlaylistMenuOpened) }}>プレイリスト<FontAwesomeIcon className='ml-2' icon={faPlus} /></button> : <></>
                                    }
                                </div>
                                {
                                    addPlaylistMenuOpened ?
                                        <>
                                            <div className='my-2'>
                                                プレイリスト:
                                                <select onChange={(e: any) => { setSelectPlaylist(e.target.value) }} name="playlist" id="playlistDom">
                                                    <option value="">選択していません</option>
                                                    {
                                                        myPlaylists.map((playlist: any) => {
                                                            return <option key={playlist.id} value={playlist.id}>{playlist.name}</option>
                                                        })
                                                    }
                                                </select>
                                                <p><button className='border-2 p-2 rounded-lg text-xs border-current mt-2' onClick={() => { addPlaylist(); }}>追加</button></p>
                                            </div>
                                        </> : <></>
                                }
                                {
                                    InfoMenuOpened ?
                                        <>
                                            <div className='p-4 rounded-lg bg-gray-100'>
                                                <div className='text-sm'>{about.description.split(/(\n)/).map((v: any, i: any) => (i & 1 ? <br key={i} /> : v))}</div>
                                            </div>
                                        </> : <></>
                                }
                            </div>
                        </Drawer>
                    </div>

                </div>
                <div className='flex place-content-center'>
                    <div className='lg:w-3/4' id="検索系">
                        <div className='mb-2 flex place-content-center'>
                            <div>
                                <div className='my-2 flex place-content-center gap-x-2'>
                                    <button className='border-2 p-2 rounded-lg text-xs border-current' onClick={async () => { YTPlayer.setPlaybackRate(1.5) }}>x1.5</button>
                                    <button className='border-2 p-2 rounded-lg text-xs border-current' onClick={async () => { YTPlayer.setPlaybackRate(1) }}>x1</button>
                                    <button className='border-2 p-2 rounded-lg text-xs border-current' onClick={async () => { YTPlayer.setPlaybackRate(2) }}>x2</button>
                                </div>
                                <input type="text" onKeyPress={(e) => {
                                    if (e.code == "Enter") {
                                        getSearch()
                                    }
                                }} className='mr-4 p-2 rounded-md border-2 outline-0' placeholder='検索するワードを入力' onChange={(e) => { setserachQ(e.target.value) }} value={searchQ} /><button onClick={() => { getSearch() }} className='p-2 rounded-lg bg-gray-100'><FontAwesomeIcon icon={faSearch} className='mr-2' /> 検索</button>
                            </div>
                        </div>
                        <div className='flex place-content-center gap-x-4'>
                            {searchHistories.map((history: any) => {
                                return <>
                                    {<button className='border-2 p-2 rounded-lg text-xs border-current' onClick={async () => { await setserachQ(history); }}>{history}</button>}
                                </>
                            })}
                        </div>
                        <div className='mb-4 mt-2 px-4'>
                            {
                                result ? result.map((item: { id: { videoId: any; }; snippet: { thumbnails: { high: { url: string | undefined; }; }; title: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | PromiseLikeOfReactNode | null | undefined; channelTitle: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | PromiseLikeOfReactNode | null | undefined; }; }) => {
                                    return (<>
                                        <hr />
                                        <a className='block my-4 break-all flex items-start gap-4' href='#' onClick={() => { Select(item.id.videoId); }}>
                                            <Image src={`https://i.ytimg.com/vi/${item.id.videoId}/mqdefault.jpg`} alt="" width={120} height={67.5} className='inline rounded-md' />
                                            <div className='inline'>
                                                <p>{item.snippet.title} </p>
                                                <p className='text-slate-600 text-sm'>{item.snippet.channelTitle} </p>
                                            </div>
                                        </a>
                                    </>)
                                })
                                    :
                                    <></>
                            }
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
