import { fa1, fa2, faChevronDown, faChevronUp, faForward, faGripLinesVertical, faPlay, faPlus, faSearch, faVolumeHigh, faVolumeLow, faVolumeXmark, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import Image from 'next/image'

export default function Main(props: any) {
    const [searchQ, setserachQ] = useState("")
    const [result, setResult]: any = useState();
    const getSearch = async () => {
        const res = await (await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQ}&key=AIzaSyC1KMsyjrnEfHJ3xnQtPX0DSxWHfyjUBeo&maxResults=50&type=channel&type=video`)).json();
        setResult(res.items)
    }
    const Select = async (id: any) => {
        props.setYtid(id);
        props.getVideo(id);
    }
    return (
        <div className='mb-4 mt-2 px-4'>
            <div className="flex place-content-center my-4">
                <input type="text" onKeyPress={(e) => {
                    if (e.code == "Enter") {
                        getSearch()
                    }
                }} className='p-2 rounded-md border-2 outline-0' placeholder='検索するワードを入力' onChange={(e) => { setserachQ(e.target.value) }} value={searchQ} /><button onClick={() => { getSearch() }} className='p-2 rounded-lg bg-gray-100'><FontAwesomeIcon icon={faSearch} className='mr-2' /> 検索</button>
            </div>
            {
                result ? result.map((item: any) => {
                    if (item.id.kind == "youtube#video") {
                        return (<>
                            <hr />
                            <a className='block my-4 break-all flex items-start gap-4' href='#' onClick={() => { Select(item.id.videoId); }}>
                                <Image src={`https://i.ytimg.com/vi/${item.id.videoId}/mqdefault.jpg`} alt="" width={120 * 1.5} height={67.5 * 1.5} className='inline rounded-md' />
                                <div className='inline'>
                                    <p>{item.snippet.title} </p>
                                    <p className='text-slate-600 text-sm'>{item.snippet.channelTitle} </p>
                                </div>
                            </a>
                        </>)
                    } else {
                        return (<>
                            {/* <hr />
                                            <a className='block my-4 break-all flex items-start gap-4' href='#' onClick={() => { Select(item.id.videoId); }}>
                                                <Image src={item.snippet.thumbnails.high.url} alt="" width={120} height={120} className='inline rounded-full' />
                                                <div className='inline'>
                                                    <p>{item.snippet.title} </p>
                                                    <p className='text-slate-600 text-sm'>{item.snippet.channelTitle} </p>
                                                </div>
                                            </a> */}
                        </>)
                    }
                })
                    :
                    <></>
            }
        </div>
    )
}