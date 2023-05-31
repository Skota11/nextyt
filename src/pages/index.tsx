import Image from 'next/image'
import Link from "next/link";
import { Inter } from 'next/font/google'
import { JSXElementConstructor, PromiseLikeOfReactNode, ReactElement, ReactFragment, ReactPortal, useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faClockRotateLeft, faPlay, faSearch } from "@fortawesome/free-solid-svg-icons";

const inter = Inter({ subsets: ['latin'] })

import { useRouter } from 'next/router'

import { supabase } from "../utils/supabase";

import OAuth from "../components/oauth";

import Footer from "../components/footer";

export default function Home() {
  const router = useRouter()

  const onTwitterRegister = async () => {
    supabase.auth.signInWithOAuth({ provider: "twitter" });
  }
  const onDiscordRegister = async () => {
    supabase.auth.signInWithOAuth({ provider: "discord" });
  }

  const [currentUser, setcurrentUser] = useState({ id: '', email: '' });
  const [watchHistories, setWatchHistories]: any = useState([{ id: "", video: { thumbnails: { high: { url: "" } }, title: "" } }]);

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

  // HeaderコンポーネントがレンダリングされたときにgetCurrentUser関数が実行される
  useEffect(() => {
    getCurrentUser()
  }, [])

  const reverse = [...watchHistories].reverse();

  const SearchDelete = async () => {
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
  async function WatchDelete() {
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
                <h1 className='text-lg'><FontAwesomeIcon icon={faClockRotateLeft} className='mr-2' />再生履歴</h1>
                <div className='grid gap-4 my-4'>
                  {
                    reverse.map((history: any) => {
                      console.log(history)
                      return <>
                        <Link href={`/play?watch=${history.id}`}>
                          <div className='flex gap-x-4'>
                            <img src={history.video.thumbnails.high.url} alt="" width="120px" className='inline' />
                            <p className='text-sm inline'>{history.video.title}</p>
                          </div>
                        </Link>
                      </>
                    })}
                </div>
              </div>
              <div className='border-l-4 border-current pl-4 mt-8'>
                <p className='text-sm'>{currentUser.email}でログイン中</p>
                <div className='my-4 flex gap-x-4 mb-8 '>
                  <button onClick={() => { SearchDelete(); }} className='border-2 border-current p-4 rounded-full'>検索履歴を削除</button>
                  <button onClick={() => { WatchDelete(); }} className='border-2 border-current p-4 rounded-full'>再生履歴を削除</button>
                </div>
              </div>
            </div>
          </div>
        </>
      }
      <Footer />
    </>
  )
}
