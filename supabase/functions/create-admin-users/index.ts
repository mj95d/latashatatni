import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateAdminRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { email, password, fullName, phone }: CreateAdminRequest = await req.json();

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUser?.users.find(u => u.email === email);

    let userId: string;

    if (userExists) {
      // User exists, just assign admin role
      userId = userExists.id;
      console.log("User already exists, assigning admin role:", userId);
    } else {
      // Create new user in auth
      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          phone: phone || null,
        },
      });

      if (createError) {
        console.error("Error creating user:", createError);
        throw new Error(`فشل في إنشاء المستخدم: ${createError.message}`);
      }

      userId = userData.user.id;

      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({
          id: userId,
          full_name: fullName,
          phone: phone || null,
          is_merchant: false,
        });

      if (profileError) {
        console.error("Error creating profile:", profileError);
        throw new Error(`فشل في إنشاء الملف الشخصي: ${profileError.message}`);
      }
    }

    // Assign admin role (use upsert to avoid duplicates)
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert({
        user_id: userId,
        role: "admin",
      }, {
        onConflict: "user_id,role"
      });

    if (roleError) {
      console.error("Error assigning admin role:", roleError);
      throw new Error(`فشل في تعيين صلاحيات الأدمن: ${roleError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
          email: email,
        },
        message: userExists ? "تم تعيين صلاحيات الأدمن للمستخدم الموجود" : "تم إنشاء حساب الأدمن بنجاح"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error creating admin user:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "حدث خطأ غير متوقع",
        success: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
