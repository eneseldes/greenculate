/**
 * SubmitButton Bileşeni
 * =================================================================
 * Form gönderimi için kullanılan, loading durumunu destekleyen 
 * buton bileşeni. Emisyon hesaplama işlemleri sırasında 
 * kullanıcıya görsel geri bildirim sağlar.
 */

import "./SubmitButton.scss";

/**
 * @param {boolean} loading - Butonun loading durumunda olup olmadığı
 */
function SubmitButton({ loading }) {
  return (
    <button 
      className="submit-button" 
      type="submit" 
      disabled={loading}  // Loading sırasında butonu devre dışı bırak
    >
      {loading ? "Hesaplanıyor..." : "Emisyon Hesapla"}
    </button>
  );
}

export default SubmitButton;
