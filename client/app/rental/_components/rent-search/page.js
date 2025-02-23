// rent-search

'use client'

export default function RentSearch({ searchQuery, setSearchQuery }) {
  const handleClearSearch = () => {
    setSearchQuery('') // 清空搜尋內容
  }

  return (
    <div className="input-group position-relative">
      <input
        type="text"
        className="form-control"
        placeholder="搜尋關鍵字"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="搜尋"
      />
      {searchQuery.length > 0 && (
        <span
          className="position-absolute top-50 end-0 translate-middle-y p-2 text-muted"
          style={{ cursor: 'pointer', marginRight: '3.1rem', zIndex: 9 }}
          onClick={handleClearSearch}
        >
          ✕
        </span>
      )}
      <span className="input-group-text border-0 k-main-bg">
        <img src="/images/icon/search.svg" alt="搜尋" style={{ pointerEvents: 'none' }} />
      </span>

    </div>
  )
}
