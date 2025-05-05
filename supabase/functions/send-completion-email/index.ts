import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface EmailPayload {
  operationNumber: string;
  clientName: string;
  route: string;
  serviceValue: number;
  completionDate: string;
  serviceProvider: string;
  recipients: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: EmailPayload = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Send email to each recipient
    for (const recipient of payload.recipients) {
      await supabase.auth.admin.sendRawEmail({
        to: recipient,
        subject: `Operation ${payload.operationNumber} Completed`,
        html: `
          <h2>Operation Completed</h2>
          <p>The following operation has been completed:</p>
          <ul>
            <li><strong>Operation Number:</strong> ${payload.operationNumber}</li>
            <li><strong>Client:</strong> ${payload.clientName}</li>
            <li><strong>Route:</strong> ${payload.route}</li>
            <li><strong>Service Value:</strong> $${payload.serviceValue.toLocaleString()}</li>
            <li><strong>Completion Date:</strong> ${payload.completionDate}</li>
            <li><strong>Service Provider:</strong> ${payload.serviceProvider}</li>
          </ul>
          <p>Please review the operation details in the system.</p>
        `
      });
    }

    return new Response(
      JSON.stringify({ message: 'Completion emails sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});