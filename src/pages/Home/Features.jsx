import FeatureItem from './FeatureItem'
import { features } from './data'

function Features() {
  return (
    <>
      {features.map((feature) => (
        <FeatureItem key={feature.id} feature={feature} />
      ))}
    </>
  )
}

export default Features

