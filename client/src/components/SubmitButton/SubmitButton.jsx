import "./SubmitButton.scss";


function SubmitButton({ loading }) {
  return (
    <button className="submit-button" type="submit" disabled={loading}>
      {loading ? "Hesaplanıyor..." : "Emisyon Hesapla"}
    </button>
  );
}

export default SubmitButton;
