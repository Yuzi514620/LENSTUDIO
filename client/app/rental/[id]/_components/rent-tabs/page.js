// rent-tabs

'use client'

import { useState } from 'react'
import RentShopping from '../rent-shopping/page'

export default function RentTabs({ rental }) {
  const [activeTab, setActiveTab] = useState('rent')

  return (
    <div className="mt-1">
      {/* Tab 選單 */}
      <div className="d-flex k-tabs">
        <button
          className={`btn btn-primary tab-radius me-1 ${activeTab === 'rent' ? 'active' : ''
            }`}
          onClick={() => setActiveTab('rent')}
        >
          租借內容
        </button>
        <button
          className={`btn btn-primary tab-radius ${activeTab === 'spec' ? 'active' : ''
            }`}
          onClick={() => setActiveTab('spec')}
        >
          產品規格
        </button>
      </div>

      {/* Tab 內容 */}
      <div id="tabContent">
        {activeTab === 'rent' ? (
          <div className="card card-radius px-2">
            <div className="card-body">
              {/* 商品配件 (來自 API: rental.append) */}
              <h5 className="card-title k-main-text">商品配件</h5>
              <div className="k-append-grid">
                {rental.append
                  ? rental.append
                    .split('\n')
                    .reduce((acc, item, index, arr) => {
                      if (index % 2 === 0)
                        acc.push(arr.slice(index, index + 2))
                      return acc
                    }, [])
                    .map((pair, rowIndex) => (
                      <div key={rowIndex} className="k-append-row">
                        {pair.map((item, colIndex) => (
                          <span key={colIndex} className="k-append-item">
                            {item}
                          </span>
                        ))}
                      </div>
                    ))
                  : '無配件資訊'}
              </div>

              {/* 租借時段 */}
              <RentShopping rental={rental} />
            </div>
          </div>
        ) : (
          <div className="card card-radius p-3">
            {/* 產品規格 (根據類別不同顯示不同資訊) */}
            <table className="table">
              <tbody className='k-tbody'>
                <tr>
                  <th className="ps-3">尺寸</th>
                  <td>{rental.dimension || '無資料'}</td>
                </tr>
                <tr>
                  <th className="ps-3">重量</th>
                  <td>{rental.weight ? `${rental.weight} g` : '無資料'}</td>
                </tr>

                {/* 只有當 category 為 "相機" 時顯示 */}
                {rental.category === '相機' && (
                  <>
                    <tr>
                      <th className="ps-3">相機類型</th>
                      <td>
                        {rental.cam_sensor || '無資料'}{' '}
                        {rental.cam_kind || '無資料'}
                      </td>
                    </tr>
                    <tr>
                      <th className="ps-3">適用鏡頭</th>
                      <td>{rental.cam_with || '無資料'}</td>
                    </tr>
                  </>
                )}

                {/* 只有當 category 為 "鏡頭" 時顯示 */}
                {rental.category === '鏡頭' && (
                  <>
                    <tr>
                      <th className="ps-3">鏡頭類型</th>
                      <td>{rental.len_kind || '無資料'}</td>
                    </tr>
                    <tr>
                      <th className="ps-3">適用相機</th>
                      <td>{rental.len_with || '無資料'}</td>
                    </tr>
                  </>
                )}

                {/* 只有當 category 為 "配件" 時顯示 */}
                {rental.category === '配件' && (
                  <>
                    <tr>
                      <th className="ps-3">配件類型</th>
                      <td>{rental.acc_kind || '無資料'}</td>
                    </tr>
                    <tr>
                      <th className="ps-3">適用設備</th>
                      <td>{rental.acc_with || '無資料'}</td>
                    </tr>
                  </>
                )}

                <tr>
                  <th className="ps-3">產品特點</th>
                  <td>
                    {rental.summary
                      ? rental.summary.split('\n').map((feature, index) => (
                        <span key={index}>
                          {feature}
                          <br />
                        </span>
                      ))
                      : '無產品特點'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
