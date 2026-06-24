export default function LoadingSpinner({ fullPage = false }) {
  if (fullPage) return (
    <div className="loading-page">
      <div className="spinner spinner-dark" style={{ width: 32, height: 32, borderWidth: 3 }} />
      <p>Loading...</p>
    </div>
  );
  return <div className="spinner spinner-dark" />;
}
