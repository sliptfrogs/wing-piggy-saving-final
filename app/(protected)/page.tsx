export default function ProtectedIndex() {
  return (
    <main>
      <h1>Protected Area</h1>
      <p>
        This route group is for authenticated pages. Navigate to{' '}
        <a href="/dashboard">Dashboard</a>.
      </p>
    </main>
  );
}
