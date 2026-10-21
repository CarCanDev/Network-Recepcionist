import { useState } from "react";

function App() {
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleScan = async () => {
    setIsLoading(true);

    try {
      const results = await window.api.scanNetwork();

      if (results.error) {
        throw new Error(results.error);
      }
      setDevices(results);

    } catch (error) {
      console.error("Error al escanear: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', color: '#fff' }}>
      <h1>Network Recepcionist</h1>

      <button
        onClick={handleScan}
        disabled={isLoading}
        style={{ padding: '10px 20px', cursor: 'pointer', marginBottom: '20px' }}
      >
        {isLoading ? 'Escaneando red...' : 'Escanear Dispositivos'}
      </button>

      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #555' }}>
            <th style={{ padding: '10px' }}>Dirección IP</th>
            <th style={{ padding: '10px' }}>Dirección MAC</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '10px' }}>{device.ip}</td>
              <td style={{ padding: '10px', textTransform: 'uppercase' }}>{device.mac}</td>
            </tr>
          ))}

          {devices.length === 0 && !isLoading && (
            <tr>
              <td colSpan="2" style={{ padding: '10px', textAlign: 'center' }}>
                No hay dispositivos detectados. Presiona "Escanear".
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

}

export default App