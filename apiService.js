const API_URL = 'http://localhost:5000/api';

export const getConversations = async () => {
    try {
        const response = await fetch(`${API_URL}/conversations`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return [];
    }
};