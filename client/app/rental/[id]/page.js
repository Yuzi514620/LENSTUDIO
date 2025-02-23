import RentBreadcrumb from './_components/rent-breadcrumb/page'
import RentDetail from './_components/rent-detail/page'

import './rent-detail.scss'

export default function RentalPage() {
  return (
    <div className="container k-body" style={{ paddingTop: '120px' }}>
      {/* Breadcrumb */}
      <RentBreadcrumb />
      <div className="pt-4">
        <RentDetail />
      </div>
    </div>
  )
}
