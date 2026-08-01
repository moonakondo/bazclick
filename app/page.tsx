export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>🚀 Welcome to Next.js</h1>

      <p>This is the Home Page.</p>

      <a
        href="/about"
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "6px",
        }}
      >
        Go to About Page- Md Mizanur Rahman
      </a>
    </main>
  );
}