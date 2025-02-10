// metadata 主要是用來設置 SEO 相關的標籤，這樣的設置能夠幫助搜尋引擎爬蟲抓取網頁的標題和描述，對網站的 SEO 有幫助。
// 但目前不知道怎麼引入才會出現，先放著

import Head from 'next/head'

export const Metadata = () => (
  <Head>
    <title>Lenstudio - 賣相機和攝影課程的平台</title>
    <meta
      name="description"
      content="Lenstudio 提供各種相機、鏡頭與專業攝影課程，讓你提升拍攝技巧。"
    />
  </Head>
)
