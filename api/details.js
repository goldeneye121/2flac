// File: api/details.js
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow GET requests for details
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { id, platform } = req.query;

        if (!id || !platform) {
            res.status(400).json({ error: 'ID and platform are required' });
            return;
        }

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock detailed response
        const mockDetails = {
            success: true,
            data: {
                id: id,
                title: `Detailed Music Info ${id}`,
                artist: 'Featured Artist',
                album: 'Special Edition Album',
                year: '2023',
                duration: '4:20',
                genre: ['Pop', 'Electronic', 'Alternative'],
                platform: platform,
                thumbnail: `https://via.placeholder.com/400x400/8a2be2/ffffff?text=Album+Art`,
                description: 'This is a detailed description of the music track with full metadata information.',
                bitrate: '1411 kbps',
                sampleRate: '44.1 kHz',
                bitDepth: '16-bit',
                channels: '2 (Stereo)',
                size: '25.4 MB',
                tracks: [
                    { title: 'Main Track', duration: '4:20' },
                    { title: 'Instrumental Version', duration: '4:20' },
                    { title: 'Acoustic Version', duration: '4:05' },
                    { title: 'Remix Version', duration: '5:10' }
                ],
                credits: {
                    producer: 'Professional Producer',
                    writer: 'Song Writer',
                    label: 'Record Label Inc.'
                },
                releaseDate: '2023-10-15',
                popularity: 85,
                availableQualities: ['16-bit/44.1kHz', '24-bit/96kHz', '24-bit/192kHz']
            }
        };

        res.status(200).json(mockDetails);
    } catch (error) {
        console.error('Details error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}