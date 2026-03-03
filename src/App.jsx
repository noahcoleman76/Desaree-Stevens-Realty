import { useEffect, useState } from 'react'
import './App.css'

const listings = [
  {
    id: 1,
    title: 'Foothills View Retreat',
    price: '$845,000',
    location: 'Golden, CO',
    beds: 4,
    baths: 3,
    sqft: '2,980',
    status: 'New',
    description:
      'Sunlit living spaces, updated kitchen finishes, and a covered patio with Front Range views.',
  },
  {
    id: 2,
    title: 'City Park Townhome',
    price: '$615,000',
    location: 'Denver, CO',
    beds: 3,
    baths: 2.5,
    sqft: '1,860',
    status: 'Featured',
    description:
      'Walkable location with modern interiors, rooftop entertaining space, and oversized windows.',
  },
  {
    id: 3,
    title: 'Maple Grove Estate',
    price: '$1,275,000',
    location: 'Littleton, CO',
    beds: 5,
    baths: 4,
    sqft: '4,420',
    status: 'Open House',
    description:
      'Generous floor plan, finished basement, and private backyard designed for family gatherings.',
  },
]

const pageLabels = {
  home: 'Home',
  listings: 'Listings',
  upload: 'Add Listing',
}

function getPageFromHash() {
  const hash = window.location.hash.replace('#', '')
  return pageLabels[hash] ? hash : 'home'
}

function App() {
  const [page, setPage] = useState(getPageFromHash)
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zip: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    propertyType: 'Single Family',
    description: '',
  })
  const [photos, setPhotos] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleHashChange = () => setPage(getPageFromHash())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  function navigate(nextPage) {
    window.location.hash = nextPage
  }

  function handleInputChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handlePhotoChange(event) {
    const files = Array.from(event.target.files || [])
    if (files.length > 10) {
      setMessage('Please select 10 photos or fewer for a single listing.')
      setPhotos(files.slice(0, 10))
      return
    }

    setPhotos(files)
    setMessage(
      files.length
        ? `${files.length} photo${files.length === 1 ? '' : 's'} selected.`
        : '',
    )
  }

  function handleSubmit(event) {
    event.preventDefault()
    setMessage(
      `Listing draft saved for ${formData.address || 'the property'}. Connect this form to your backend when you are ready to store submissions.`,
    )
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <div>
          <p className="brand-kicker">Desaree Stevens Realty</p>
          <a className="brand" href="#home" onClick={() => navigate('home')}>
            Elevated guidance for Colorado buyers and sellers
          </a>
        </div>
        <nav className="nav">
          {Object.entries(pageLabels).map(([key, label]) => (
            <a
              key={key}
              className={page === key ? 'nav-link active' : 'nav-link'}
              href={`#${key}`}
              onClick={() => navigate(key)}
            >
              {label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        {page === 'home' && <HomePage navigate={navigate} />}
        {page === 'listings' && <ListingsPage />}
        {page === 'upload' && (
          <UploadPage
            formData={formData}
            photos={photos}
            message={message}
            onInputChange={handleInputChange}
            onPhotoChange={handlePhotoChange}
            onSubmit={handleSubmit}
          />
        )}
      </main>
    </div>
  )
}

function HomePage({ navigate }) {
  return (
    <div className="page-stack">
      <section className="hero">
        <div className="hero-copy">
          <p className="section-label">United Realty Group</p>
          <h1>Las Vegas real estate guidance built on local roots and steady support.</h1>
          <p className="hero-text">
            Desaree Stevens has called Las Vegas home since 1987 and has been
            helping clients navigate the local real estate market since 1999.
            Her process is practical, attentive, and shaped around real client
            needs from first conversation to closing day.
          </p>
          <div className="hero-actions">
            <button type="button" className="primary-button" onClick={() => navigate('listings')}>
              Browse current listings
            </button>
            <button type="button" className="secondary-button" onClick={() => navigate('upload')}>
              Add a new listing
            </button>
          </div>
        </div>

        <div className="hero-panel">
          <div className="metric">
            <span className="metric-value">Since 1999</span>
            <span className="metric-label">Serving buyers and sellers across Las Vegas</span>
          </div>
          <div className="metric">
            <span className="metric-value">Las Vegas</span>
            <span className="metric-label">Deep neighborhood knowledge built from decades in the city</span>
          </div>
          <div className="metric">
            <span className="metric-value">Family-first</span>
            <span className="metric-label">Professional service with the care and consistency clients remember</span>
          </div>
        </div>
      </section>

      <section className="info-grid">
        <article className="info-card">
          <p className="section-label">About Desaree</p>
          <h2>A trusted Las Vegas advocate with deep community ties.</h2>
          <p>
            As the spouse of an Army veteran, Desaree served as a dedicated
            family support coordinator during her husband&apos;s military service.
            That commitment to service carries into her work today, alongside
            the perspective that comes from raising a son and daughter and
            building long-standing roots in Las Vegas.
          </p>
        </article>
        <article className="info-card accent-card">
          <p className="section-label">How she works</p>
          <h2>Experienced guidance without pressure or confusion.</h2>
          <p>
            Desaree helps clients move through the buying and selling process
            with patience, professionalism, and clear communication. Her goal
            is not just to close a transaction, but to make the experience feel
            manageable, informed, and personal.
          </p>
        </article>
      </section>

      <section className="education-section">
        <div>
          <p className="section-label">Why clients choose Desaree</p>
          <h2>Knowledgeable, caring, and committed at every step of the process.</h2>
        </div>
        <div className="education-grid">
          <article className="education-card">
            <h3>First-time buyers</h3>
            <p>
              Clients consistently describe Desaree as patient and supportive,
              especially when guiding them through their first home purchase.
            </p>
          </article>
          <article className="education-card">
            <h3>Search strategy</h3>
            <p>
              She works hard to present a strong selection of homes and keep
              the search focused until the right property is found.
            </p>
          </article>
          <article className="education-card">
            <h3>Client care</h3>
            <p>
              Buyers describe the experience as professional, knowledgeable,
              caring, and personal from start to finish.
            </p>
          </article>
        </div>
      </section>

      <section className="education-section">
        <div>
          <p className="section-label">Customer testimonials</p>
          <h2>What clients say about working with Desaree.</h2>
        </div>
        <div className="education-grid testimonials-grid">
          <article className="education-card">
            <p>
              &quot;Desaree sold me my first home and I feel lucky because she
              helped me at every turn.&quot;
            </p>
            <h3>Joel J.</h3>
          </article>
          <article className="education-card">
            <p>
              &quot;Desaree was very patient and helped me through everything.&quot;
            </p>
            <h3>Andrea P.</h3>
          </article>
          <article className="education-card">
            <p>
              &quot;It was a great experience Desaree helped in every way with
              every step of the process. She was professional and I was treated
              like family.&quot;
            </p>
            <h3>Alex V.</h3>
          </article>
          <article className="education-card">
            <p>
              &quot;Desaree was able to help make buying a home a pleasant
              experience, she is knowledgeable and caring.&quot;
            </p>
            <h3>George and Deb S.</h3>
          </article>
          <article className="education-card">
            <p>
              &quot;We had a great experience. Desaree was professional and hard
              working. She gave us a great selection of homes to see until we
              found the perfect one for us!&quot;
            </p>
            <h3>Victoria P.</h3>
          </article>
        </div>
      </section>
    </div>
  )
}

function ListingsPage() {
  return (
    <div className="page-stack">
      <section className="section-heading">
        <p className="section-label">Current portfolio</p>
        <h1>Available listings</h1>
        <p className="section-copy">
          Showcase active properties here. Right now the page uses sample data,
          so it is ready for backend integration or a CMS connection later.
        </p>
      </section>

      <section className="listing-grid">
        {listings.map((listing) => (
          <article key={listing.id} className="listing-card">
            <div className="listing-image">
              <span>{listing.status}</span>
            </div>
            <div className="listing-content">
              <div className="listing-header">
                <div>
                  <h2>{listing.title}</h2>
                  <p>{listing.location}</p>
                </div>
                <strong>{listing.price}</strong>
              </div>
              <div className="listing-meta">
                <span>{listing.beds} bd</span>
                <span>{listing.baths} ba</span>
                <span>{listing.sqft} sq ft</span>
              </div>
              <p className="listing-description">{listing.description}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

function UploadPage({
  formData,
  photos,
  message,
  onInputChange,
  onPhotoChange,
  onSubmit,
}) {
  return (
    <div className="page-stack">
      <section className="section-heading">
        <p className="section-label">Listing management</p>
        <h1>Upload a new property</h1>
        <p className="section-copy">
          Capture the core details for a home listing and attach up to 10
          photos. This form currently handles the client-side experience and is
          ready to connect to storage or a backend endpoint.
        </p>
      </section>

      <form className="listing-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label>
            Street address
            <input
              name="address"
              value={formData.address}
              onChange={onInputChange}
              placeholder="1234 Elm Street"
              required
            />
          </label>
          <label>
            City
            <input
              name="city"
              value={formData.city}
              onChange={onInputChange}
              placeholder="Denver"
              required
            />
          </label>
          <label>
            State
            <input
              name="state"
              value={formData.state}
              onChange={onInputChange}
              placeholder="CO"
              required
            />
          </label>
          <label>
            ZIP code
            <input
              name="zip"
              value={formData.zip}
              onChange={onInputChange}
              placeholder="80206"
              required
            />
          </label>
          <label>
            List price
            <input
              name="price"
              value={formData.price}
              onChange={onInputChange}
              placeholder="$650,000"
              required
            />
          </label>
          <label>
            Bedrooms
            <input
              name="bedrooms"
              type="number"
              min="0"
              value={formData.bedrooms}
              onChange={onInputChange}
              required
            />
          </label>
          <label>
            Bathrooms
            <input
              name="bathrooms"
              type="number"
              min="0"
              step="0.5"
              value={formData.bathrooms}
              onChange={onInputChange}
              required
            />
          </label>
          <label>
            Square feet
            <input
              name="squareFeet"
              type="number"
              min="0"
              value={formData.squareFeet}
              onChange={onInputChange}
              required
            />
          </label>
          <label className="full-width">
            Property type
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={onInputChange}
            >
              <option>Single Family</option>
              <option>Townhome</option>
              <option>Condo</option>
              <option>Multi-Family</option>
              <option>Land</option>
            </select>
          </label>
          <label className="full-width">
            Property description
            <textarea
              name="description"
              value={formData.description}
              onChange={onInputChange}
              rows="6"
              placeholder="Highlight condition, layout, updates, neighborhood benefits, and standout features."
              required
            />
          </label>
          <label className="full-width upload-field">
            Listing photos
            <input type="file" accept="image/*" multiple onChange={onPhotoChange} />
            <small>Upload up to 10 images.</small>
          </label>
        </div>

        {photos.length > 0 && (
          <div className="photo-list">
            {photos.map((photo) => (
              <span key={`${photo.name}-${photo.lastModified}`} className="photo-pill">
                {photo.name}
              </span>
            ))}
          </div>
        )}

        {message && <p className="form-message">{message}</p>}

        <button type="submit" className="primary-button">
          Save listing draft
        </button>
      </form>
    </div>
  )
}

export default App
