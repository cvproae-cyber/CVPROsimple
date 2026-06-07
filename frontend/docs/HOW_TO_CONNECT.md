# How to Connect Frontend, Supabase, and n8n

This document explains how the React frontend connects to your Supabase database and triggers n8n workflows.

## 1. The Architecture

*   **Frontend (React):** Displays data to the user. It reads directly from Supabase for fast UI updates (like viewing the Pipeline or Inbox).
*   **Database (Supabase/PostgreSQL):** The central source of truth. It stores Customers, Conversations, and Messages.
*   **Backend/Automation (n8n):** Handles the heavy lifting. It listens to Webhooks from Meta (WhatsApp/Instagram), talks to Gemini AI, and updates the Supabase database.

## 2. Connecting the Frontend to Supabase

We have created `services/supabaseClient.ts` and `services/api.ts`.

1.  **Set your Credentials:**
    Open your browser's Developer Console (F12) and run:
    ```javascript
    localStorage.setItem('SUPABASE_URL', 'https://your-project-id.supabase.co');
    localStorage.setItem('SUPABASE_ANON_KEY', 'your-anon-key');
    ```
    *(In a real production app, you would put these in a `.env` file).*

2.  **How it works in the code:**
    *   In `views/Pipeline.tsx`, the `useEffect` hook calls `fetchCustomers()` from `api.ts`.
    *   `fetchCustomers()` queries the `customers` table in Supabase.
    *   If you drag a lead to a new stage, it calls `updateCustomerStage()`, which runs an `UPDATE` query on Supabase.

## 3. Connecting the Frontend to n8n

While the frontend talks to Supabase for data, it needs to talk to **n8n** to trigger actions (like sending a mass broadcast or forcing an AI analysis).

1.  **Create a Webhook in n8n:**
    In n8n, create a workflow starting with a "Webhook" node. Set it to `POST` and copy the Test URL.
2.  **Trigger from Frontend:**
    In `services/api.ts`, there is a function `triggerN8nWebhook(url, payload)`.
    You can use this in your components. For example, in `views/Broadcasts.tsx`:
    ```typescript
    import { triggerN8nWebhook } from '../services/api';
    
    const handleCreate = async () => {
      await triggerN8nWebhook('https://your-n8n-url.com/webhook/broadcast', {
        campaignName: form.name,
        message: form.message
      });
    };
    ```

## 4. The Chat Flow (Inbox)

1.  **Receiving Messages:** 
    When a customer sends a WhatsApp message, Meta sends it to your **n8n Webhook**. n8n saves it to the `messages` table in Supabase.
2.  **Viewing Messages:**
    The `Inbox.tsx` component fetches from the `messages` table. (To make it update instantly without refreshing, you can enable Supabase Realtime subscriptions in the future).
3.  **Sending Messages (Human Takeover):**
    When you type a message in `Inbox.tsx` and hit send, the frontend inserts a row into the `messages` table with `direction: 'outbound'`.
    **To actually send it to WhatsApp:** You should set up an n8n workflow with a "Supabase Trigger" node that listens for new rows in the `messages` table where `direction = 'outbound'`. When triggered, n8n takes the content and sends it via the Meta API node.
