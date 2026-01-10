import Hero from './Hero'
import Features from './Features'
import Testimonials from './Testimonials'
import Membership from './Membership'
import FAQ from './FAQ'
import './Home.css'

function Home() {
  return (
    <div className="home-page">
      <Hero />
      <Features />
      <Testimonials />
      <Membership />
      <FAQ />
    </div>
  )
}

export default Home

