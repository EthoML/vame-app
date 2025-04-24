import React, { useState } from 'react';
import { get } from '@renderer/utils/requests';

interface CheckRawDataProps {
    projectPath: string;
    sessionNames: string[];
}

const CheckRawData: React.FC<CheckRawDataProps> = ({ projectPath, sessionNames }) => {
    const [selectedSession, setSelectedSession] = useState<string>('');
    const [rawHtml, setRawHtml] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFetch = async () => {
        if (!selectedSession) {
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const url = '/project/raw-data?project=' +
                encodeURIComponent(projectPath) +
                '&session=' +
                encodeURIComponent(selectedSession);
            const resp = await get<{ html: string }>(url);
            if (!resp.success) {
                throw new Error(resp.error);
            }
            setRawHtml(resp.data.html);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch raw data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginBottom: 16 }}>
            <label>
                Session:
                <select
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                    style={{ marginLeft: 8 }}
                >
                    <option value="" disabled>
                        Select session
                    </option>
                    {sessionNames.map((session) => (
                        <option key={session} value={session}>
                            {session}
                        </option>
                    ))}
                </select>
            </label>
            <button
                onClick={handleFetch}
                disabled={!selectedSession || loading}
                style={{ marginLeft: 12, padding: '6px 16px' }}
            >
                {loading ? 'Loading...' : 'Check Input Data'}
            </button>
            {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
            {rawHtml && (
                <div
                    style={{ marginTop: 12 }}
                    dangerouslySetInnerHTML={{ __html: rawHtml }}
                />
            )}
        </div>
    );
};

export default CheckRawData;
