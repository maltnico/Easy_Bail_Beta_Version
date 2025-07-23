import { createClient } from "npm:@supabase/supabase-js@2.50.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials");
    }

    // Create Supabase client with service role key (has admin privileges)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create the documents bucket if it doesn't exist
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket("documents", {
      public: false,
      allowedMimeTypes: ['application/json', 'text/html', 'application/pdf'],
      fileSizeLimit: 10485760 // 10MB
    });

    if (bucketError && !bucketError.message.includes("already exists")) {
      console.error("Error creating bucket:", bucketError);
      throw bucketError;
    }

    console.log("Bucket created or already exists");

    // Enable RLS on storage.objects table
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;'
    });

    if (rlsError && !rlsError.message.includes("already enabled")) {
      console.warn("Could not enable RLS (might already be enabled):", rlsError);
    }

    // Create storage policies using direct SQL execution
    const policies = [
      {
        name: "Allow authenticated users to upload their own documents",
        sql: `
          DROP POLICY IF EXISTS "Allow authenticated users to upload their own documents" ON storage.objects;
          CREATE POLICY "Allow authenticated users to upload their own documents"
          ON storage.objects FOR INSERT
          TO authenticated
          WITH CHECK (
            bucket_id = 'documents' 
            AND auth.uid()::text = (storage.foldername(name))[1]
          );
        `
      },
      {
        name: "Allow authenticated users to view their own documents",
        sql: `
          DROP POLICY IF EXISTS "Allow authenticated users to view their own documents" ON storage.objects;
          CREATE POLICY "Allow authenticated users to view their own documents"
          ON storage.objects FOR SELECT
          TO authenticated
          USING (
            bucket_id = 'documents' 
            AND auth.uid()::text = (storage.foldername(name))[1]
          );
        `
      },
      {
        name: "Allow authenticated users to update their own documents",
        sql: `
          DROP POLICY IF EXISTS "Allow authenticated users to update their own documents" ON storage.objects;
          CREATE POLICY "Allow authenticated users to update their own documents"
          ON storage.objects FOR UPDATE
          TO authenticated
          USING (
            bucket_id = 'documents' 
            AND auth.uid()::text = (storage.foldername(name))[1]
          );
        `
      },
      {
        name: "Allow authenticated users to delete their own documents",
        sql: `
          DROP POLICY IF EXISTS "Allow authenticated users to delete their own documents" ON storage.objects;
          CREATE POLICY "Allow authenticated users to delete their own documents"
          ON storage.objects FOR DELETE
          TO authenticated
          USING (
            bucket_id = 'documents' 
            AND auth.uid()::text = (storage.foldername(name))[1]
          );
        `
      }
    ];

    const policyResults = [];

    // Execute each policy creation
    for (const policy of policies) {
      try {
        const { error: policyError } = await supabase.rpc('exec_sql', {
          sql: policy.sql
        });
        
        if (policyError) {
          console.error(`Error creating policy "${policy.name}":`, policyError);
          policyResults.push({ name: policy.name, success: false, error: policyError.message });
        } else {
          console.log(`Policy "${policy.name}" created successfully`);
          policyResults.push({ name: policy.name, success: true });
        }
      } catch (policyError) {
        console.error(`Exception creating policy "${policy.name}":`, policyError);
        policyResults.push({ name: policy.name, success: false, error: policyError.message });
      }
    }

    // Verify that the bucket is accessible
    try {
      const { data: testData, error: testError } = await supabase.storage
        .from('documents')
        .list('', { limit: 1 });
      
      if (testError) {
        console.warn("Bucket access test failed:", testError);
      } else {
        console.log("Bucket access test successful");
      }
    } catch (testError) {
      console.warn("Bucket access test exception:", testError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Bucket and policies configured successfully",
        bucket: bucketData || "already exists",
        policies: policyResults
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in create-bucket function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: "Failed to create bucket or configure policies"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
