import './Membership.css'

function Membership() {
  return (
    <section className="membership-section">
      <div className="container mx-auto px-6 py-12">
        <div className="membership-container">
          <div className="membership-content">
            <div className="membership-text">
              <h2 className="membership-title">
                immediately join our other members
              </h2>
              <p className="membership-description">
                Become a BEST Shoes member for exclusive discounts, early access to new styles, and personalized recommendations. Sign up today to step up your shoe game!
              </p>
            </div>
            <button className="membership-button">
              Get a Member
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Membership

