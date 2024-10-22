import Image from 'next/image'
import Link from "next/link";
import { Inter } from 'next/font/google'
import { JSXElementConstructor, PromiseLikeOfReactNode, ReactElement, ReactFragment, ReactPortal, useEffect, useState } from "react";

import { Skeleton } from '@mui/material';

import Swal from 'sweetalert2'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faArrowRightFromBracket, faClockRotateLeft, faList, faPlay, faSearch, faTrash, faUser } from "@fortawesome/free-solid-svg-icons";

const inter = Inter({ subsets: ['latin'] })

import { useRouter } from 'next/router'

import { supabase } from "../utils/supabase";

import OAuth from "../components/oauth";

import Footer from "../components/footer";
import { toast } from 'react-toastify';

export default function Home() {
  const router = useRouter()
  const [currentUser, setcurrentUser] = useState({ id: '', email: '' });
  const [watchHistories, setWatchHistories]: any = useState([{ id: "", video: { thumbnails: { high: { url: "" } }, title: "" } }]);
  const [myPlaylists, setMyPlaylists]: any = useState([{ id: "", name: "" }]);

  // 現在ログインしているユーザーを取得する処理
  const getCurrentUser = async () => {
    // ログインのセッションを取得する処理
    const { data } = await supabase.auth.getSession()
    // セッションがあるときだけ現在ログインしているユーザーを取得する
    if (data.session !== null) {
      // supabaseに用意されている現在ログインしているユーザーを取得する関数
      const { data: { user } }: { data: { user: any } } = await supabase.auth.getUser()
      // currentUserにユーザーのメールアドレスを格納
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

  // HeaderコンポーネントがレンダリングされたときにgetCurrentUser関数が実行される
  useEffect(() => {
    getCurrentUser()
  }, [])

  const reverse = [...watchHistories].reverse();

  const onNewPlaylist = () => {

    Swal.fire({
      title: '作成するプレイリストの名前を入力してください',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: '作成',
      showLoaderOnConfirm: true,
      preConfirm: async (value) => {
        const { error } = await supabase
          .from('playlists')
          .insert({ name: value, content: [], author: currentUser.id, public: true })
        return true;
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        if (result) {
          router.reload()
        }
      }
    })
  }

  const SearchDelete = async () => {
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
          .from('searchHistory')
          .delete()
          .eq('uid', currentUser.id);
        await supabase.from('searchHistory').upsert({
          uid: currentUser.id,
          content: []
        })
        router.reload()
      }
    })
  }
  async function WatchDelete() {
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
          .from('watchHistory')
          .delete()
          .eq('uid', currentUser.id);
        await supabase.from('watchHistory').upsert({
          uid: currentUser.id,
          content: []
        })
        router.reload()
      }
    })
  }

  const LogOut = async () => {

    const { error } = await supabase.auth.signOut()
    router.reload()

  }
  return (
    <>

      {currentUser.email == '' ?
        <>
          <OAuth />
          <h1 className='text-center'>もしくはログインせずに使う</h1>
          <div className='flex place-content-center'>
            <Link href="/play" className='my-8 rounded-full border-2 p-4 text-lg border-current' ><FontAwesomeIcon icon={faPlay} bounce className='mr-2' /> Play</Link>
          </div>
        </>
        :
        <>
          <div className=''>
            <div className='p-4 max-w-screen-xl m-auto'>
              <div className='max-w-screen-lg m-auto mt-8 mb-4'>
                <p className='mb-8 text-lg^'><FontAwesomeIcon icon={faSearch} className='mr-2' />検索して再生</p>
                <Link href="/play" className='my-8 rounded-full border-2 p-4 text-lg border-current' ><FontAwesomeIcon icon={faPlay} bounce className='mr-2' /> Play</Link>
              </div>
              <div className='mt-12 mb-4'>
                <h1 className='text-lg'><FontAwesomeIcon icon={faList} className='mr-2' />プレイリスト</h1>
                <button onClick={() => { onNewPlaylist(); }}>プレイリストを作成</button>
                <div className='mt-2 mb-6'>
                  {
                    myPlaylists.map((playlist: any) => {
                      return <p className='my-2 text-lg' key={playlist.id}>
                        <Link className='border-l-4 border-current pl-2' href={`/playlist/${playlist.id}`}>{playlist.name}</Link>
                      </p>
                    })
                  }
                </div>
                <h1 className='text-lg'><FontAwesomeIcon icon={faClockRotateLeft} className='mr-2' />再生履歴</h1>
                <div className='grid gap-4 my-4'>
                  {
                    reverse.length == 0 ? <>
                      <div className='flex items-start gap-x-4 break-all'>
                        <Skeleton width={120} height={67.5} className='inline rounded-md' />
                      </div>
                    </>
                      :
                      reverse.map((history: any) => {
                        return <>
                          <hr />
                          <Link href={`/play?watch=${history.id}`}>
                            <div className='flex items-start gap-x-4 break-all'>
                              <Image src={`https://i.ytimg.com/vi/${history.id}/mqdefault.jpg`} alt="" width={120} height={67.5} className='inline rounded-md' />
                              <div className='inline'>
                                <p className='inline'>{history.video.title}</p>
                                <p className='text-slate-600 text-sm'>{history.video.channelTitle}</p>
                              </div>
                            </div>
                          </Link>
                        </>
                      })}
                </div>
              </div>
              <div className='border-l-4 border-current pl-4 mt-8'>
                <h1 className='text-lg my-4'><FontAwesomeIcon icon={faUser} className='mr-2' />アカウント</h1>
                <p className='text-sm'>{currentUser.email}でログイン中</p>
                <div className='my-4 flex gap-x-4 mb-8 '>
                  <button onClick={() => { SearchDelete(); }} className='border-2 border-current p-4 rounded-full'><FontAwesomeIcon icon={faTrash} className='mr-2' />検索履歴を削除</button>
                  <button onClick={() => { WatchDelete(); }} className='border-2 border-current p-4 rounded-full'><FontAwesomeIcon icon={faTrash} className='mr-2' />再生履歴を削除</button>
                </div>
                <button onClick={() => { LogOut(); }} className='border-2 border-red-600 bg-red-100 p-4 rounded-full'><FontAwesomeIcon icon={faArrowRightFromBracket} className='mr-2' />ログアウト</button>
              </div>
            </div>
          </div>
        </>
      }
      <Footer />
    </>
  )
}
