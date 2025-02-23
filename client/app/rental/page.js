import RentBreadcrumb from './_components/rent-breadcrumb/page'
import RentList from './_components/rent-list/page'

import './rent-list.scss'

export default function RentalPage() {
  return (
    <div className="container k-body" style={{ paddingTop: '120px' }}>
      <RentBreadcrumb />
      <div className="mb-4" >
        <RentList />
      </div>
    </div>
  )
}
