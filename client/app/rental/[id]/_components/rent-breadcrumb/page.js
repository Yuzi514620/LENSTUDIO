// rent-breadcrumb

import Link from "next/link";

export default function RentBreadcrumb() {
  return (
    <nav aria-label="breadcrumb k-breadcrumb" className="breadcrumb-container">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link href="/">首頁</Link>
        </li>
        <li className="breadcrumb-item">
          <Link href="/rental">租借列表</Link>
        </li>
        <li className="breadcrumb-item active" aria-current="page">
          租借商品
        </li>
      </ol>
    </nav>
  );
}
