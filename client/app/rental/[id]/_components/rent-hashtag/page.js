// rent-hashtag

export default function RentHashtags({ hashtags = [] }) {
  return (
    <div className="mt-1 mb-2">
      {hashtags.length > 0 ? (
        hashtags.map((tag, index) => (
          <span key={index} className="badge k-tag-bg me-1">
            {tag}
          </span>
        ))
      ) : (
        <span className="text-muted">無標籤</span>
      )}
    </div>
  )
}
