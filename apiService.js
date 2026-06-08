const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api'; // في السيرفر سيستخدم المسار النسبي تلقائياً

// وظيفة لتوحيد شكل البيانات (Normalization)
const normalizeConversation = (conv) => ({
    id: conv.id,
    customerName: conv.customer_name || 'عميل غير معروف',
    lastMessage: conv.last_message || 'لا توجد رسائل',
    status: conv.status,
    isHuman: !!conv.human_takeover, // التأكد من تحويلها لـ Boolean
    phoneNumber: conv.phone_number,
    updatedAt: conv.updated_at
});

export const getConversations = async () => {
    try {
        const response = await fetch(`${API_URL}/conversations`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.map(normalizeConversation); // تطبيق التوحيد على كل النتائج
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return [];
    }
};