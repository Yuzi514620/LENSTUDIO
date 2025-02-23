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
      {searchQuery && (
        <span
          className="position-absolute top-50 end-0 translate-middle-y me-2 text-muted"
          style={{ cursor: 'pointer' }}
          onClick={handleClearSearch}
        >
          ✕
        </span>
      )}
      <span className="input-group-text border-0 k-tag-bg">
        <img src="/images/icon/search.svg" alt="搜尋" />
      </span>
    </div>
  )
}
