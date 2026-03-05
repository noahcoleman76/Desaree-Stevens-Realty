import { useEffect, useState } from 'react'
import './App.css'

const WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbzLvlnMFkkzPviQyafW2L1xeF6s7C6N92ByXUuPLsAJ99XWpKRLt_6YC_ohIHOtxS1S/exec'

const pageLabels = {
  home: 'Home',
  listings: 'Listings',
  contact: 'Contact',
}

const initialFormData = {
  title: '',
  address: '',
  city: '',
  state: 'NV',
  zip: '',
  price: '',
  bedrooms: '',
  bathrooms: '',
  squareFeet: '',
  propertyType: 'Single Family',
  mlsNumber: '',
  description: '',
}

const imageFieldConfig = [
  { key: 'mainImage', label: 'Main image' },
  { key: 'image2', label: 'Image 2' },
  { key: 'image3', label: 'Image 3' },
  { key: 'image4', label: 'Image 4' },
  { key: 'image5', label: 'Image 5' },
  { key: 'image6', label: 'Image 6' },
  { key: 'image7', label: 'Image 7' },
  { key: 'image8', label: 'Image 8' },
  { key: 'image9', label: 'Image 9' },
  { key: 'image10', label: 'Image 10' },
]

function getPathForPage(page) {
  if (page === 'listings') return '/listings'
  if (page === 'contact') return '/contact'
  if (page === 'manage') return '/manage'
  return '/home'
}

function getRouteFromLocation() {
  const searchParams = new URLSearchParams(window.location.search)
  const redirectedPath = searchParams.get('p')

  if (redirectedPath) {
    const decodedPath = decodeURIComponent(redirectedPath)
    const redirectedQuery = searchParams.get('q')
    const redirectedSearch = redirectedQuery ? `?${redirectedQuery}` : ''
    window.history.replaceState(null, '', `${decodedPath}${redirectedSearch}`)
  }

  const pathname = window.location.pathname.replace(/\/+$/, '') || '/'

  if (pathname.startsWith('/listing/')) {
    return {
      page: 'listing',
      listingId: decodeURIComponent(pathname.slice('/listing/'.length)),
    }
  }

  if (pathname === '/listings') {
    return { page: 'listings', listingId: '' }
  }

  if (pathname === '/contact') {
    return { page: 'contact', listingId: '' }
  }

  if (pathname === '/manage') {
    return { page: 'manage', listingId: '' }
  }

  return { page: 'home', listingId: '' }
}

function App() {
  const [page, setPage] = useState(() => getRouteFromLocation().page)
  const [activeListingId, setActiveListingId] = useState(() => getRouteFromLocation().listingId)
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState(initialFormData)
  const [imageFiles, setImageFiles] = useState({
    mainImage: null,
    galleryImages: [],
  })
  const [selectedListingId, setSelectedListingId] = useState('')
  const [manageMessage, setManageMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [removing, setRemoving] = useState(false)

  useEffect(() => {
    const handleLocationChange = () => {
      const nextRoute = getRouteFromLocation()
      setPage(nextRoute.page)
      setActiveListingId(nextRoute.listingId)
      setIsNavOpen(false)
    }
    handleLocationChange()
    window.addEventListener('popstate', handleLocationChange)
    return () => window.removeEventListener('popstate', handleLocationChange)
  }, [])

  useEffect(() => {
    fetchListings()
  }, [])

  async function fetchListings() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(WEB_APP_URL)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to load listings.')
      }

      const nextListings = Array.isArray(data.listings) ? data.listings : []
      setListings(nextListings)
      setSelectedListingId((current) => {
        if (nextListings.some((listing) => listing.listingId === current)) {
          return current
        }
        return nextListings[0]?.listingId || ''
      })
    } catch (fetchError) {
      setError(fetchError.message || 'Unable to load listings.')
    } finally {
      setLoading(false)
    }
  }

  function navigate(nextPage) {
    if (submitting) return
    setIsNavOpen(false)
    const nextPath = getPathForPage(nextPage)
    window.history.pushState(null, '', nextPath)
    const nextRoute = getRouteFromLocation()
    setPage(nextRoute.page)
    setActiveListingId(nextRoute.listingId)
    if (nextPage === 'listings') {
      fetchListings()
    }
  }

  function navigateToListing(listingId) {
    if (submitting) return
    const nextPath = `/listing/${encodeURIComponent(listingId)}`
    window.history.pushState(null, '', nextPath)
    const nextRoute = getRouteFromLocation()
    setPage(nextRoute.page)
    setActiveListingId(nextRoute.listingId)
  }

  const activeListing = listings.find((listing) => listing.listingId === activeListingId) || null

  function handleInputChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleMainImageChange(event) {
    const file = event.target.files?.[0] || null
    if (file && !isSupportedImageFile(file)) {
      setManageMessage('Main image must be JPG, PNG, or WebP.')
      event.target.value = ''
      return
    }

    setImageFiles((current) => ({
      ...current,
      mainImage: file,
    }))
    setManageMessage('')
  }

  function handleGalleryImagesChange(event) {
    const files = Array.from(event.target.files || []).slice(0, 9)
    const hasUnsupportedFile = files.some((file) => !isSupportedImageFile(file))

    if (hasUnsupportedFile) {
      setManageMessage('Additional images must be JPG, PNG, or WebP.')
      event.target.value = ''
      return
    }

    setImageFiles((current) => ({
      ...current,
      galleryImages: files,
    }))
    setManageMessage('')
  }

  async function handleCreateListing(event) {
    event.preventDefault()
    setSubmitting(true)
    setManageMessage('')

    try {
      const images = await buildImagePayload(imageFiles)
      const payload = {
        action: 'createListing',
        ...formData,
        images,
      }

      submitToWebApp(payload)
      setManageMessage('Listing request sent. Refreshing active listings...')
      setFormData(initialFormData)
      setImageFiles(createEmptyImageState())
      await wait(1200)
      await fetchListings()
    } catch (submitError) {
      setManageMessage(submitError.message || 'Unable to create listing.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRemoveListing() {
    if (!selectedListingId) {
      setManageMessage('Select a listing to remove.')
      return
    }

    setRemoving(true)
    setManageMessage('')

    try {
      submitToWebApp({
        action: 'unlistListing',
        listingId: selectedListingId,
      })
      setManageMessage(`Remove request sent for ${selectedListingId}. Refreshing active listings...`)
      await wait(1200)
      await fetchListings()
    } catch (removeError) {
      setManageMessage(removeError.message || 'Unable to remove listing.')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="site-shell">
      {submitting && (
        <div className="blocking-overlay" role="status" aria-live="polite">
          <div className="blocking-card">Creating listing... please wait.</div>
        </div>
      )}
      <header className="site-header">
        <div>
          <p className="brand-kicker">Desaree Stevens</p>
          <a
            className="brand"
            href="/home"
            onClick={(event) => {
              event.preventDefault()
              navigate('home')
            }}
          >
            United Realty Group
          </a>
        </div>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={isNavOpen}
          aria-label="Toggle navigation menu"
          onClick={() => setIsNavOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav className={isNavOpen ? 'nav nav-open' : 'nav'}>
          {Object.entries(pageLabels).map(([key, label]) => (
            <a
              key={key}
              className={page === key ? 'nav-link active' : 'nav-link'}
              href={getPathForPage(key)}
              onClick={(event) => {
                event.preventDefault()
                navigate(key)
              }}
            >
              {label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        {page === 'home' && (
          <HomePage
            navigate={navigate}
            listings={listings}
            onSelectListing={navigateToListing}
          />
        )}
        {page === 'listings' && (
          <ListingsPage
            listings={listings}
            loading={loading}
            error={error}
            onSelectListing={navigateToListing}
          />
        )}
        {page === 'listing' && (
          <ListingDetailPage
            listing={activeListing}
            loading={loading}
            error={error}
            onBack={() => navigate('listings')}
          />
        )}
        {page === 'manage' && (
          <ManageListingsPage
            formData={formData}
            imageFiles={imageFiles}
            listings={listings}
            loading={loading}
            error={error}
            manageMessage={manageMessage}
            removing={removing}
            selectedListingId={selectedListingId}
            submitting={submitting}
            onCreateListing={handleCreateListing}
            onGalleryImagesChange={handleGalleryImagesChange}
            onMainImageChange={handleMainImageChange}
            onInputChange={handleInputChange}
            onRefresh={fetchListings}
            onRemoveListing={handleRemoveListing}
            onSelectListing={setSelectedListingId}
          />
        )}
        {page === 'contact' && <ContactPage />}
      </main>
      <SiteFooter />
    </div>
  )
}

function HomePage({ navigate, listings, onSelectListing }) {
  return (
    <div className="page-stack">
      <section className="hero">
        <div className="hero-copy">
          <p className="section-label">Las Vegas Real Estate</p>
          <h1>Local guidance. Clear strategy. Real results.</h1>
          <p className="hero-text">
            Real estate support that stays practical, responsive, and focused
            on your goals from first tour to final close.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="primary-button hero-primary-button"
              onClick={() => navigate('listings')}
            >
              Browse current listings
            </button>
          </div>
        </div>
      </section>

      <MlsSearchSection navigate={navigate} />

      <section className="info-grid">
        <article className="info-card">
          <p className="section-label">About Desaree</p>
          <h2>A trusted Las Vegas advocate with deep community ties.</h2>
          <p>
            Desaree has been a resident since 1987 and has guided Las Vegas
            buyers and sellers since 1999 with local insight, clear
            communication, and steady support.
          </p>
        </article>
        <article className="info-card accent-card">
          <p className="section-label">How she works</p>
          <h2>Experienced guidance without pressure or confusion.</h2>
          <p>
            Her focus is simple: smart pricing, clear options, and a smoother
            process from first showing to closing.
          </p>
        </article>
      </section>

      <section className="education-section snapshot-section">
        <div className="snapshot-header">
          <p className="section-label">Listing Snapshot</p>
          <h2>See Current Listings</h2>
        </div>
        {listings.length === 0 ? (
          <p className="section-copy">No active listings available yet.</p>
        ) : (
          <div className="snapshot-row">
            {listings.map((listing) => (
              <button
                key={listing.listingId}
                type="button"
                className="snapshot-card"
                onClick={() => onSelectListing(listing.listingId)}
              >
                <div className="snapshot-image-wrap">
                  {normalizeImageUrl(listing.mainImage) && (
                    <img
                      src={normalizeImageUrl(listing.mainImage)}
                      alt={listing.title || listing.address || 'Listing snapshot'}
                      className="snapshot-image"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
                <div className="snapshot-content">
                  <strong>{listing.title || listing.address || listing.listingId}</strong>
                  <p>{formatPrice(listing.price)}</p>
                  <p>{formatLocation(listing)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        <div className="snapshot-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate('listings')}
          >
            See All
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate('contact')}
          >
            Contact Desaree
          </button>
        </div>
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

      <section className="education-section reviews-section">
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

function MlsSearchSection({ navigate }) {
  const [query, setQuery] = useState('Las Vegas, NV')

  function buildUrls(value) {
    const encoded = encodeURIComponent(value.trim() || 'Las Vegas, NV')
    return {
      zillow: `https://www.zillow.com/homes/${encoded}_rb/`,
      redfin: 'https://www.redfin.com/city/10201/NV/Las-Vegas',
      realtor: `https://www.realtor.com/realestateandhomes-search/${encoded}`,
    }
  }

  const urls = buildUrls(query)

  return (
    <section className="education-section mls-section">
      <div>
        <p className="section-label">MLS Search</p>
        <h2>Start browsing homes now.</h2>
      </div>
      <div className="mls-search-panel">
        <label className="mls-search-label">
          Area, city, or ZIP
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Las Vegas, NV"
          />
        </label>
        <div className="mls-actions">
          <a className="secondary-button mls-link" href={urls.zillow} target="_blank" rel="noreferrer">
            Search Zillow
          </a>
          <a className="secondary-button mls-link" href={urls.realtor} target="_blank" rel="noreferrer">
            Search Realtor.com
          </a>
          <a className="secondary-button mls-link" href={urls.redfin} target="_blank" rel="noreferrer">
            Search Redfin
          </a>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => navigate('contact')}
        >
          Contact Desaree
        </button>
      </div>
    </section>
  )
}

function ContactPage() {
  return (
    <div className="page-stack">
      <section className="section-heading">
        <p className="section-label">Contact</p>
        <h1>Contact Desaree</h1>
        <p className="section-copy">
          Reach out to discuss buying, selling, or your next steps in Las
          Vegas real estate.
        </p>
      </section>

      <section className="education-section contact-card">
        <h2>Get in touch</h2>
        <p>Cell: (702) 349-7123</p>
        <p>Office: (702) 331-7870</p>
        <p>Email: Dstevenshms@gmail.com</p>
        <p>Office: 2389 Renaissance Dr., Suite A, Las Vegas, NV 89119</p>
      </section>
    </div>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <a
          className="footer-photo-wrap"
          href="https://www.unitedrealtylv.com/"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="/urglogo.webp"
            alt="United Realty Group logo"
            className="footer-photo"
          />
        </a>
        <div className="footer-block">
          <h3>Contact</h3>
          <p>
            Cell:{' '}
            <a href="tel:+17023497123">
              (702) 349-7123
            </a>
          </p>
          <p>
            Office:{' '}
            <a href="tel:+17023317870">
              (702) 331-7870
            </a>
          </p>
          <p>
            Email:{' '}
            <a href="mailto:Dstevenshms@gmail.com">
              Dstevenshms@gmail.com
            </a>
          </p>
          <p>
            Office Address:{' '}
            <a
              href="https://maps.google.com/?q=2389+Renaissance+Dr,+Suite+A,+Las+Vegas,+NV+89119"
              target="_blank"
              rel="noreferrer"
            >
              2389 Renaissance Dr., Suite A, Las Vegas, NV 89119
            </a>
          </p>
        </div>
        <div className="footer-block">
          <h3>Follow</h3>
          <div className="footer-socials">
            <a
              className="footer-social-link"
              href="https://www.facebook.com/desareeunitedrealty"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <img src="/facebooklogo.png" alt="Facebook logo" className="footer-social-icon" />
            </a>
            <a
              className="footer-social-link"
              href="https://www.youtube.com/@UnitedRealtyGroupLasVegas"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
            >
              <img src="/youtubelogo.png" alt="YouTube logo" className="footer-social-icon" />
            </a>
            <a
              className="footer-social-link"
              href="https://www.linkedin.com/company/united-realty-group-las-vegas/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >
              <img src="/linkedinlogo.png" alt="LinkedIn logo" className="footer-social-icon" />
            </a>
          </div>
        </div>
      </div>
      <div className="footer-badges">
        <img src="/realtor.png" alt="Equal Housing Opportunity and Realtor logos" className="footer-badge" />
        <img src="/mls.png" alt="MLS logo" className="footer-badge" />
      </div>
    </footer>
  )
}

function ListingsPage({ listings, loading, error, onSelectListing }) {
  return (
    <div className="page-stack">
      <section className="section-heading">
        <p className="section-label">Current portfolio</p>
        <h1>Available listings</h1>
      </section>

      {loading && <section className="status-panel">Loading listings...</section>}
      {error && !loading && <section className="status-panel error-panel">{error}</section>}
      {!loading && !error && listings.length === 0 && (
        <section className="status-panel">No active listings are available yet.</section>
      )}

      {!loading && !error && listings.length > 0 && (
        <section className="listing-grid">
          {listings.map((listing) => {
            const descriptionPreview = buildDescriptionPreview(listing.description)

            return (
              <button
                key={listing.listingId}
                type="button"
                className="listing-card listing-card-button"
                onClick={() => onSelectListing(listing.listingId)}
              >
                <div className="listing-image">
                  {normalizeImageUrl(listing.mainImage) && (
                    <img
                      src={normalizeImageUrl(listing.mainImage)}
                      alt={listing.title || listing.address || 'Listing photo'}
                      className="listing-rendered-image listing-card-image"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <span>{listing.propertyType || 'Listing'}</span>
                </div>
                <div className="listing-content">
                  <div className="listing-header">
                    <div>
                      <h2>{listing.title || listing.address || listing.listingId}</h2>
                      <p>{formatLocation(listing)}</p>
                    </div>
                    <strong>{formatPrice(listing.price)}</strong>
                  </div>
                  <div className="listing-meta">
                    <span>{listing.bedrooms || '-'} bd</span>
                    <span>{listing.bathrooms || '-'} ba</span>
                    <span>{listing.squareFeet || '-'} sq ft</span>
                  </div>
                  <p className="listing-description">
                    {descriptionPreview.text}
                    {descriptionPreview.isTruncated && (
                      <span className="listing-read-more"> Read more</span>
                    )}
                  </p>
                  <p className="listing-id">Listing ID: {listing.listingId}</p>
                  {listing.mlsNumber && <p className="listing-id">MLS #: {listing.mlsNumber}</p>}
                  <span className="listing-link">View property details</span>
                </div>
              </button>
            )
          })}
        </section>
      )}
    </div>
  )
}

function ListingDetailPage({ listing, loading, error, onBack }) {
  const [activeImageIndex, setActiveImageIndex] = useState(-1)

  if (loading) {
    return (
      <div className="page-stack">
        <section className="status-panel">Loading property details...</section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-stack">
        <section className="status-panel error-panel">{error}</section>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="page-stack">
        <section className="status-panel">That listing could not be found.</section>
      </div>
    )
  }

  const mainImage = normalizeImageUrl(listing.mainImage)
  const otherImages = (listing.images || []).map(normalizeImageUrl).filter(Boolean)
  const galleryImages = Array.from(new Set([mainImage, ...otherImages].filter(Boolean)))
  const hasLightboxOpen = activeImageIndex >= 0 && !!galleryImages[activeImageIndex]

  useEffect(() => {
    if (!hasLightboxOpen) return undefined

    function handleKeydown(event) {
      if (event.key === 'Escape') {
        setActiveImageIndex(-1)
        return
      }

      if (event.key === 'ArrowRight') {
        setActiveImageIndex((current) => (current + 1) % galleryImages.length)
        return
      }

      if (event.key === 'ArrowLeft') {
        setActiveImageIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length)
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [galleryImages.length, hasLightboxOpen])

  return (
    <div className="page-stack">
      <section className="section-heading detail-heading">
        <button type="button" className="secondary-button" onClick={onBack}>
          Back to listings
        </button>
        <p className="section-label">Property spotlight</p>
        <h1>{listing.title || listing.address || listing.listingId}</h1>
        <p className="section-copy">
          {formatLocation(listing)}
          {listing.listingId ? ` | ${listing.listingId}` : ''}
        </p>
        {listing.mlsNumber && <p className="section-copy">MLS# {listing.mlsNumber}</p>}
      </section>

      <section className="detail-hero">
        <button
          type="button"
          className="detail-main-image image-click-target"
          onClick={() => setActiveImageIndex(0)}
        >
          {galleryImages[0] && (
            <img
              src={galleryImages[0]}
              alt={listing.title || listing.address || 'Property main image'}
              className="listing-rendered-image"
              referrerPolicy="no-referrer"
            />
          )}
        </button>
        <div className="detail-summary">
          <p className="section-label">Listing overview</p>
          <strong className="detail-price">{formatPrice(listing.price)}</strong>
          <div className="detail-stats">
            <span>{listing.bedrooms || '-'} Bedrooms</span>
            <span>{listing.bathrooms || '-'} Bathrooms</span>
            <span>{listing.squareFeet || '-'} Sq Ft</span>
            <span>{listing.propertyType || 'Property'}</span>
          </div>
          <p className="hero-text">
            {listing.description || 'No additional description has been provided for this property yet.'}
          </p>
        </div>
      </section>

      {galleryImages.length > 0 && (
        <section className="education-section">
          <div>
            <p className="section-label">Image gallery</p>
            <h2>More views of the property.</h2>
          </div>
          <div className="detail-gallery">
            {galleryImages.map((image, index) => (
              <button
                key={`${listing.listingId}-${index}`}
                type="button"
                className="detail-gallery-image image-click-target"
                onClick={() => setActiveImageIndex(index)}
              >
                {image && (
                  <img
                    src={image}
                    alt={`Property gallery image ${index + 1}`}
                    className="listing-rendered-image"
                    referrerPolicy="no-referrer"
                  />
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {hasLightboxOpen && (
        <div className="lightbox-overlay" onClick={() => setActiveImageIndex(-1)} role="presentation">
          <div
            className="lightbox-content"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setActiveImageIndex(-1)}
              aria-label="Close image viewer"
            >
              ×
            </button>
            <img
              src={galleryImages[activeImageIndex]}
              alt={`Property image ${activeImageIndex + 1}`}
              className="lightbox-image"
              referrerPolicy="no-referrer"
            />
            <div className="lightbox-controls">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setActiveImageIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length)
                }
              >
                Previous
              </button>
              <span className="lightbox-counter">
                {activeImageIndex + 1} / {galleryImages.length}
              </span>
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setActiveImageIndex((current) => (current + 1) % galleryImages.length)
                }
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ManageListingsPage({
  formData,
  imageFiles,
  listings,
  loading,
  error,
  manageMessage,
  removing,
  selectedListingId,
  submitting,
  onCreateListing,
  onGalleryImagesChange,
  onMainImageChange,
  onInputChange,
  onRefresh,
  onRemoveListing,
  onSelectListing,
}) {
  return (
    <div className="page-stack">
      <section className="section-heading">
        <p className="section-label">Listing management</p>
        <h1>Manage listings</h1>
      </section>

      <section className="manage-layout">
        <form className="listing-form" onSubmit={onCreateListing}>
          <div className="manage-header-row">
            <h2>Create a listing</h2>
          </div>
          <div className="form-grid">
            <label>
              Listing title
              <input
                name="title"
                value={formData.title}
                onChange={onInputChange}
                placeholder="Modern Summerlin Retreat"
                required
              />
            </label>
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
                placeholder="Las Vegas"
                required
              />
            </label>
            <label>
              State
              <input name="state" value={formData.state} onChange={onInputChange} required />
            </label>
            <label>
              ZIP code
              <input
                name="zip"
                value={formData.zip}
                onChange={onInputChange}
                placeholder="89101"
                required
              />
            </label>
            <label>
              List price
              <input
                name="price"
                value={formData.price}
                onChange={onInputChange}
                placeholder="525000"
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
            <label>
              MLS number
              <input
                name="mlsNumber"
                value={formData.mlsNumber}
                onChange={onInputChange}
                placeholder="e.g. 2578910"
              />
            </label>
            <label className="full-width">
              Property description
              <textarea
                name="description"
                value={formData.description}
                onChange={onInputChange}
                rows="6"
                placeholder="Highlight the layout, updates, lot features, and neighborhood benefits."
                required
              />
            </label>
          </div>

          <div className="image-upload-grid">
            <div className="upload-tile">
              <span>Main image</span>
              <input
                className="upload-native-input"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={onMainImageChange}
              />
              <small>{imageFiles.mainImage?.name || 'No main image selected'}</small>
            </div>

            <div className="upload-tile">
              <span>Additional images</span>
              <input
                className="upload-native-input"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                multiple
                onChange={onGalleryImagesChange}
              />
              <small>
                {imageFiles.galleryImages.length
                  ? `${imageFiles.galleryImages.length} additional image${
                      imageFiles.galleryImages.length === 1 ? '' : 's'
                    } selected`
                  : 'Select up to 9 additional images'}
              </small>
            </div>
          </div>

          {manageMessage && <p className="form-message">{manageMessage}</p>}

          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? 'Saving listing...' : 'Create listing'}
          </button>
        </form>

        <section className="listing-form manage-side-panel">
          <div className="manage-header-row">
            <h2>Active listings</h2>
            <button type="button" className="secondary-button" onClick={onRefresh}>
              Refresh
            </button>
          </div>

          {loading && <p className="form-message">Loading listings...</p>}
          {error && !loading && <p className="form-message">{error}</p>}
          {!loading && !error && listings.length === 0 && (
            <p className="form-message">No active listings to manage.</p>
          )}

          {!loading && !error && listings.length > 0 && (
            <div className="manage-list">
              {listings.map((listing) => (
                <label key={listing.listingId} className="manage-item">
                  <input
                    type="radio"
                    name="selectedListing"
                    checked={selectedListingId === listing.listingId}
                    onChange={() => onSelectListing(listing.listingId)}
                  />
                  <div>
                    <strong>{listing.title || listing.address || listing.listingId}</strong>
                    <p>{formatLocation(listing)}</p>
                    <small>{listing.listingId}</small>
                  </div>
                </label>
              ))}
            </div>
          )}

          <button
            type="button"
            className="danger-button"
            disabled={!selectedListingId || removing}
            onClick={onRemoveListing}
          >
            {removing ? 'Removing listing...' : 'Remove listing'}
          </button>
        </section>
      </section>
    </div>
  )
}

function createEmptyImageState() {
  return {
    mainImage: null,
    galleryImages: [],
  }
}

async function buildImagePayload(imageFiles) {
  const payload = {
    mainImage: imageFiles.mainImage
      ? await fileToDataUrl(imageFiles.mainImage)
      : '',
  }

  const galleryKeys = imageFieldConfig.slice(1).map((field) => field.key)

  for (let index = 0; index < galleryKeys.length; index += 1) {
    const key = galleryKeys[index]
    const file = imageFiles.galleryImages[index]
    payload[key] = file ? await fileToDataUrl(file) : ''
  }

  return payload
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`))
    reader.readAsDataURL(file)
  })
}

function isSupportedImageFile(file) {
  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (supportedTypes.includes(file.type)) return true

  return /\.(jpe?g|png|webp)$/i.test(file.name || '')
}

function submitToWebApp(payload) {
  const iframeName = 'apps-script-submit-target'
  let iframe = document.querySelector(`iframe[name="${iframeName}"]`)

  if (!iframe) {
    iframe = document.createElement('iframe')
    iframe.name = iframeName
    iframe.className = 'hidden-submit-frame'
    iframe.setAttribute('aria-hidden', 'true')
    iframe.tabIndex = -1
    document.body.appendChild(iframe)
  }

  const form = document.createElement('form')
  form.method = 'POST'
  form.action = WEB_APP_URL
  form.target = iframeName
  form.style.display = 'none'

  const input = document.createElement('input')
  input.type = 'hidden'
  input.name = 'payload'
  input.value = JSON.stringify(payload)
  form.appendChild(input)

  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function formatLocation(listing) {
  return [listing.address, listing.city, listing.state, listing.zip]
    .filter(Boolean)
    .join(', ')
}

function formatPrice(price) {
  if (!price) return 'Price on request'

  const numeric = Number(String(price).replace(/[^0-9.]/g, ''))
  if (Number.isNaN(numeric) || numeric === 0) {
    return price
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(numeric)
}

function buildDescriptionPreview(description) {
  const fallbackText = 'No description provided.'
  const source = String(description || '').trim() || fallbackText
  const maxLength = 170

  if (source.length <= maxLength) {
    return { text: source, isTruncated: false }
  }

  const shortened = source.slice(0, maxLength).replace(/\s+\S*$/, '').trim()
  return { text: `${shortened}...`, isTruncated: true }
}

function normalizeImageUrl(url) {
  if (!url) return ''

  const trimmed = String(url).trim()

  const fileIdFromPath = trimmed.match(/\/file\/d\/([^/?]+)/)?.[1]
  const fileIdFromQuery = trimmed.match(/[?&]id=([^&]+)/)?.[1]
  const fileId = fileIdFromPath || fileIdFromQuery

  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}=w2000`
  }

  return trimmed
}

export default App
