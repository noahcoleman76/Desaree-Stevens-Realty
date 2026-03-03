const featuredListings = [
  {
    title: 'Modern Summerlin View Home',
    price: '$1,150,000',
    details: '4 bed · 3 bath · 3,020 sq ft',
  },
  {
    title: 'Luxury Henderson Retreat',
    price: '$879,000',
    details: '3 bed · 2.5 bath · 2,640 sq ft',
  },
  {
    title: 'Downtown High-Rise Residence',
    price: '$645,000',
    details: '2 bed · 2 bath · 1,480 sq ft',
  },
];

const services = [
  'Buyer Representation',
  'Seller Strategy & Marketing',
  'Relocation to Las Vegas',
  'Luxury Property Consulting',
];

export default function App() {
  return (
    <div className="page">
      <header className="hero">
        <nav className="nav">
          <div className="brand">Desaree Stevens Realty</div>
          <button className="cta-button">Book a Consultation</button>
        </nav>

        <div className="hero-content">
          <p className="eyebrow">Las Vegas Real Estate Specialist</p>
          <h1>Elevated service for buying and selling in Las Vegas.</h1>
          <p className="subtext">
            Helping clients move confidently with market expertise, sharp negotiation, and a
            polished experience from first showing to closing day.
          </p>
          <div className="hero-actions">
            <button className="primary">View Featured Homes</button>
            <button className="secondary">Contact Desaree</button>
          </div>
        </div>
      </header>

      <main>
        <section className="section about">
          <h2>Why work with Desaree?</h2>
          <p>
            Desaree Stevens Realty combines local insight, premium marketing, and white-glove
            communication to create a streamlined real estate journey tailored to your goals.
          </p>
        </section>

        <section className="section">
          <h2>Featured Listings</h2>
          <div className="grid">
            {featuredListings.map((listing) => (
              <article className="card" key={listing.title}>
                <h3>{listing.title}</h3>
                <p className="price">{listing.price}</p>
                <p>{listing.details}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section services">
          <h2>Services</h2>
          <ul>
            {services.map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Desaree Stevens Realty · Las Vegas, NV</p>
      </footer>
    </div>
  );
}
