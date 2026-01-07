
// Fetch is global in Node 18+

async function trigger() {
    try {
        const response = await fetch('http://localhost:3000/api/seed-blog', {
            method: 'POST'
        });
        const data = await response.json();
        console.log('Seed result:', data);
    } catch (error) {
        console.error('Error triggering seed:', error);
    }
}

trigger();
