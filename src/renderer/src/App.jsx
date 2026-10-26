import { useEffect, useState } from 'react'

function App() {
  const [devices, setDevices] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const [domains, setDomains] = useState([])
  const [newDomain, setNewDomain] = useState('')

  const loadDomains = async () => {
    const data = await window.api.getDomains()
    setDomains(data)
  }

  useEffect(() => {
    loadDomains()
  }, [])

  const handleAddDomain = async (e) => {
    e.preventDefault()

    if (!newDomain) return

    const result = await window.api.addDomain(newDomain)

    if (result.success) {
      setNewDomain('')
      loadDomains()
    } else {
      alert('Error: ' + result.message)
    }
  }

  const handleDeleteDomain = async (id) => {
    await window.api.deleteDomain(id)
    loadDomains()
  }

  const handleScan = async () => {
    setIsLoading(true)

    try {
      const results = await window.api.scanNetwork()

      if (results.error) {
        throw new Error(results.error)
      }
      setDevices(results)
    } catch (error) {
      console.error('Error al escanear:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'sans-serif',
        color: '#fff',
        display: 'flex',
        gap: '40px'
      }}
    >
      <div style={{ flex: 1 }}>
        <h1>Network Recepcionist</h1>
        <button
          onClick={handleScan}
          disabled={isLoading}
          style={{ padding: '10px 20px', cursor: 'pointer', marginBottom: '20px' }}
        >
          {isLoading ? 'Scanning...' : 'Scan Devices'}
        </button>

        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #555' }}>
              <th style={{ padding: '10px' }}>IP Address</th>
              <th style={{ padding: '10px' }}>MAC Address</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '10px' }}>{device.ip}</td>
                <td style={{ padding: '10px', textTransform: 'uppercase' }}>{device.mac}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ flex: 1, backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '8px' }}>
        <h2>Dominios Permitidos (Whitelist)</h2>

        <form
          onSubmit={handleAddDomain}
          style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}
        >
          <input
            type="text"
            placeholder="example.com"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            style={{ padding: '8px', flex: 1 }}
          />
          <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>
            Agregar
          </button>
        </form>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {domains.map((item) => (
            <li
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px',
                borderBottom: '1px solid #333'
              }}
            >
              <span>{item.domain}</span>
              <button
                onClick={() => handleDeleteDomain(item.id)}
                style={{
                  backgroundColor: 'red',
                  color: 'white',
                  border: 'none',
                  padding: '4px 8px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
