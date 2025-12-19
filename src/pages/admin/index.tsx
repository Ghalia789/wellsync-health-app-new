import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

type IALog = {
  _id: string;
  type: string;
  message: string;
  createdAt: string;
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<IALog[]>([]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const isAdmin = (session?.user as any)?.isAdmin;

    if (isAdmin === false) {
      router.replace("/dashboard");
      return;
    }

    fetch("/api/admin/logs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLogs(data);
        } else {
          setLogs([]);
        }
      });

  }, [status, session, router]);

  if (status !== "authenticated") {
    return <p>Loading...</p>;
  }

  return (
    
    <div style={{ padding: 30 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}>

  <button
    onClick={() =>
      signOut({
        callbackUrl: "/login",
      })
    }
    style={{
      padding: "10px 18px",
      borderRadius: 8,
      background: "#ef4444",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
    }}
  >
    Déconnexion
  </button>
</div>

      <h1>Admin – AI Logs</h1>

      {logs.length === 0 && <p>No logs found.</p>}

      {logs.map((log) => (
        <div key={log._id} style={{ marginBottom: 20 }}>
          <strong>{log.type}</strong>
          <p>{log.message}</p>
          <small>{new Date(log.createdAt).toLocaleString()}</small>
          <hr />
        </div>
      ))}
    </div>
  );
}
