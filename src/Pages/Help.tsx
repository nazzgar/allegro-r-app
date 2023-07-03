function Help() {
  return (
    <div className="container help-container">
      <div className="row">
        <p>
          Program służy do generowania plików potrzebnych do rozliczenia
          sprzedaży z Allegro. Potrzebny jest identyfikator przelewu który
          chcemy rozliczyć (należy poprosić o niego dział księgowości) oraz plik
          z danymi z Allegro.
        </p>
      </div>
      <div className="row">
        <p>
          Plik z Allegro należy pobrać z menu TODO: sprawdzić w którym miejscu
          generuje sie pliki na Allegro.
        </p>
      </div>
      <div className="row">
        <p>
          Przy ustawianiu dat należy wybrać zakres o jeden dzień większy niż
          zakres którego dotyczy przelew. Na przykład jeżeli przelew dotyczy
          sprzedaży z dnia 4.07.2023, to zakres dat należy wybrać 3.07.2023 -
          5.07.2023.
        </p>
      </div>
    </div>
  );
}
export default Help;
