// checkAndFixAdmin.js - Comprehensive Admin Check & Fix
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkAndFixAdmin = async () => {
  try {
    console.log('🔍 Starting admin check...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Check if admin exists
    console.log('📋 Step 1: Looking for admin user...');
    let admin = await User.findOne({ email: '2wolf@gmail.com' });
    
    if (!admin) {
      console.log('❌ Admin user NOT FOUND!');
      console.log('🔧 Creating new admin user...\n');
      
      const hashedPassword = await bcrypt.hash('2Wolfdubai', 10);
      
      admin = new User({
        name: '2Wolf Admin',
        email: '2wolf@gmail.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      await admin.save();
      console.log('✅ Admin user created successfully!\n');
    } else {
      console.log('✅ Admin user found!\n');
    }

    // Step 2: Display admin details
    console.log('📊 Admin Details:');
    console.log('   Email:', admin.email);
    console.log('   Name:', admin.name);
    console.log('   Role:', admin.role);
    console.log('   Password Hash:', admin.password.substring(0, 40) + '...\n');

    // Step 3: Test password
    console.log('🔐 Step 2: Testing password...');
    const testPassword = '2Wolfdubai';
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    
    if (isMatch) {
      console.log('✅ Password is CORRECT!\n');
    } else {
      console.log('❌ Password does NOT match!');
      console.log('🔧 Fixing password...\n');
      
      const newHash = await bcrypt.hash(testPassword, 10);
      admin.password = newHash;
      await admin.save();
      
      console.log('✅ Password has been reset!\n');
      
      // Verify fix
      const recheckAdmin = await User.findOne({ email: '2wolf@gmail.com' });
      const recheckMatch = await bcrypt.compare(testPassword, recheckAdmin.password);
      
      if (recheckMatch) {
        console.log('✅ Verified: Password now works!\n');
      } else {
        console.log('❌ ERROR: Password still doesn\'t work!\n');
        process.exit(1);
      }
    }

    // Step 4: Test login endpoint
    console.log('🧪 Step 3: Testing login endpoint...');
    
    try {
      const response = await fetch('http://localhost:5000/api/users/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: '2wolf@gmail.com',
          password: '2Wolfdubai'
        })
      });

      console.log('   Status Code:', response.status);
      
      const result = await response.json();
      console.log('   Response:', JSON.stringify(result, null, 2));

      if (response.ok && result.token) {
        console.log('\n🎉 SUCCESS! Login endpoint works!');
        console.log('✅ You can now sign in with:');
        console.log('   📧 Email: 2wolf@gmail.com');
        console.log('   🔑 Password: 2Wolfdubai\n');
      } else {
        console.log('\n❌ Login endpoint returned an error:');
        console.log('   Message:', result.message || 'Unknown error');
        console.log('\n🔍 Possible issues:');
        console.log('   1. Check your authRoutes.js signin handler');
        console.log('   2. Check if bcrypt.compare is being used correctly');
        console.log('   3. Check backend logs for detailed errors\n');
      }
    } catch (fetchError) {
      console.log('❌ Failed to reach login endpoint:', fetchError.message);
      console.log('   Make sure backend is running on http://localhost:5000\n');
    }

    // Step 5: Raw password comparison test
    console.log('🔬 Step 4: Raw password comparison test...');
    const rawUser = await User.findOne({ email: '2wolf@gmail.com' }).lean();
    console.log('   Stored hash:', rawUser.password);
    
    const manualTest = await bcrypt.compare('2Wolfdubai', rawUser.password);
    console.log('   Manual bcrypt test:', manualTest ? '✅ PASS' : '❌ FAIL');
    
    if (!manualTest) {
      console.log('\n⚠️  WARNING: bcrypt comparison fails even with correct password!');
      console.log('   This might be a bcrypt version mismatch or corrupted hash.');
      console.log('   Regenerating hash with current bcrypt version...\n');
      
      const freshHash = await bcrypt.hash('2Wolfdubai', 10);
      await User.updateOne(
        { email: '2wolf@gmail.com' },
        { $set: { password: freshHash } }
      );
      
      console.log('✅ Hash regenerated with current bcrypt version');
      console.log('   New hash:', freshHash);
      console.log('\n   Testing new hash...');
      
      const finalTest = await bcrypt.compare('2Wolfdubai', freshHash);
      console.log('   Result:', finalTest ? '✅ WORKS!' : '❌ Still fails');
      
      if (finalTest) {
        console.log('\n🎉 Admin password is now fixed! Try logging in again.\n');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

checkAndFixAdmin();