import Image from 'next/image'
import Link from "next/link";
import { Inter } from 'next/font/google'
import { JSXElementConstructor, PromiseLikeOfReactNode, ReactElement, ReactFragment, ReactPortal, useEffect, useState } from "react";

const inter = Inter({ subsets: ['latin'] })

import { supabase } from "../utils/supabase";

import Header from "../components/header";
import OAuth from "../components/oauth";

export default function Home() {
  const onTwitterRegister = async () => {
    supabase.auth.signInWithOAuth({ provider: "twitter" });
  }
  const onDiscordRegister = async () => {
    supabase.auth.signInWithOAuth({ provider: "discord" });
  }

  const [currentUser, setcurrentUser] = useState({ email: '' });
  const [watchHistories, setWatchHistories]: any = useState([{ id: "", video: { thumbnails: { default: { url: "" } }, title: "" } }]);

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
  return (
    <>
      <Header />
      {currentUser.email == '' ?
        <>
          <OAuth />
          <h1 className='text-center'>もしくはログインせずに使う</h1>
          <p className='flex place-content-center'><Link href="/play" className='bg-black my-4 text-xl p-4 rounded-lg text-white' >Let&apos;s Play</Link></p>
        </>
        :
        <>
          <div className=''>
            <div className='p-4 max-w-screen-lg m-auto'>
              <p className='mb-12'>{currentUser.email}でログイン中</p>
              <p className='flex place-content-center'><Link href="/play" className='bg-black my-4 text-xl p-4 rounded-lg text-white' >Let&apos;s Play</Link></p>
              <div className='mt-12 mb-4'>
                <h1 className='text-xl border-b-4 w-fit'>プレイリスト</h1>
              </div>
              <div className='my-4'>
                <h1 className='text-xl border-b-4 w-fit'>視聴履歴</h1>
                <div className='grid grid-rows-4 gap-4 my-4'>
                  {
                    reverse.map((history: any) => {
                      return <>
                        <Link href={`/play?watch=${history.id}`}>
                          <div className='flex gap-x-4'>
                            <img src={history.video.thumbnails.default.url} alt="" className='inline' />
                            <p className='text-sm inline'>{history.video.title}</p>
                          </div>
                        </Link>
                      </>
                    })}
                </div>
              </div>
            </div>
          </div>
        </>
      }
    </>
  )
}
