import "./JSONculateResults.scss";

function JSONculateResults({ result }) {
  return (
    <>
      {result && (
        <div className="jsonculate-results">
          <div className="header">
            <h3 className="title">Parse Sonuçları</h3>
            {result.scaled && (
              <div className="pill pill--amber">
                1000 tekrar üzerinden ölçeklendirildi
              </div>
            )}
            {result.from_cache && (
              <div className="pill pill--blue">Önbellekten alındı</div>
            )}
          </div>

          {/* Parser Results */}
          <div className="parsers">
            {/* JSON Parser */}
            <div className="parser-card">
              <div className="parser-head">
                <div className="avatar avatar--green">
                  <span className="emoji">📝</span>
                </div>
                <div>
                  <p className="parser-name">json</p>
                  <p className="parser-caption">Standart JSON Parser</p>
                </div>
              </div>
              <div className="stats">
                <div>
                  <p className="muted">Emisyon</p>
                  <p className="value">
                    {result.json.emissions.toFixed(6)} kg CO₂
                  </p>
                </div>
                <div>
                  <p className="muted">Süre</p>
                  <p className="value">
                    {result.json.duration.toFixed(2)} saniye
                  </p>
                </div>
              </div>
            </div>

            {/* orjson Parser */}
            <div className="parser-card">
              <div className="parser-head">
                <div className="avatar avatar--blue">
                  <span className="emoji">⚡</span>
                </div>
                <div>
                  <p className="parser-name">orjson</p>
                  <p className="parser-caption">
                    Rust-tabanlı Hızlı Parser
                  </p>
                </div>
              </div>
              <div className="stats">
                <div>
                  <p className="muted">Emisyon</p>
                  <p className="value">
                    {result.orjson.emissions.toFixed(6)} kg CO₂
                  </p>
                </div>
                <div>
                  <p className="muted">Süre</p>
                  <p className="value">
                    {result.orjson.duration.toFixed(2)} saniye
                  </p>
                </div>
              </div>
            </div>

            {/* ujson Parser */}
            <div className="parser-card">
              <div className="parser-head">
                <div className="avatar avatar--purple">
                  <span className="emoji">🚀</span>
                </div>
                <div>
                  <p className="parser-name">ujson</p>
                  <p className="parser-caption">Ultra Hızlı JSON Parser</p>
                </div>
              </div>
              <div className="stats">
                <div>
                  <p className="muted">Emisyon</p>
                  <p className="value">
                    {result.ujson.emissions.toFixed(6)} kg CO₂
                  </p>
                </div>
                <div>
                  <p className="muted">Süre</p>
                  <p className="value">
                    {result.ujson.duration.toFixed(2)} saniye
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default JSONculateResults;
