const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUsers() {
  try {
    // Create admin user
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@test.com',
      password: 'password123',
      email_confirm: true
    });

    if (adminError) {
      console.error('Error creating admin user:', adminError);
    } else {
      console.log('Admin user created:', adminData.user.email);
      
      // Update admin role
      const { error: updateError } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', adminData.user.id);
        
      if (updateError) {
        console.error('Error updating admin role:', updateError);
      } else {
        console.log('Admin role updated successfully');
      }
    }

    // Create regular user
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'user@test.com',
      password: 'password123',
      email_confirm: true
    });

    if (userError) {
      console.error('Error creating regular user:', userError);
    } else {
      console.log('Regular user created:', userData.user.email);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTestUsers();