import "./not-found-page.css";

function NotFoundPage() {
  return (
    <main className="not-found-page">
      <section className="not-found-hero">
        <div className="not-found-number-block">
          <span className="not-found-number">404</span>
          <p className="not-found-kicker">Pagina no encontrada</p>
        </div>

        <p className="not-found-text">
          La pagina que intentaste abrir no existe, cambio de direccion o ya no
          esta disponible dentro del sistema.
        </p>
      </section>
    </main>
  );
}

export default NotFoundPage;
