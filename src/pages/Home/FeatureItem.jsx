import './FeatureItem.css'

function FeatureItem({ feature }) {
  const { title, description, image, imageAlt, imagePosition } = feature

  return (
    <section className="feature-item">
      <div className="container mx-auto px-6">
        <div className={`feature-content ${imagePosition === 'right' ? 'feature-reverse' : ''}`}>
          <div className="feature-image-container">
            <img 
              src={image} 
              alt={imageAlt} 
              className="feature-image"
            />
          </div>
          <div className="feature-text-container">
            <div className="feature-text-content">
              <h3 className="feature-title">
                {title}
              </h3>
              <p className="feature-description">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeatureItem

