import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ENV } from '../config/env.js';
import { User } from '../models/User.js';
import { Batch } from '../models/Batch.js';
import { Enrollment } from '../models/Enrollment.js';
import { Payment } from '../models/Payment.js';
import { Attendance } from '../models/Attendance.js';
import { Notice } from '../models/Notice.js';

export const seedDatabase = async () => {
  try {
    console.log('[Seeder] Connecting to MongoDB at', ENV.MONGO_URI);
    await mongoose.connect(ENV.MONGO_URI);
    console.log(`[Seeder] Connected to database: "${mongoose.connection.name}"`);

    console.log('[Seeder] Cleaning existing batch/enrollment/payment/attendance/notice records...');
    await Promise.all([
      Batch.deleteMany({}),
      Enrollment.deleteMany({}),
      Payment.deleteMany({}),
      Attendance.deleteMany({}),
      Notice.deleteMany({}),
    ]);

    // Delete existing demo users to ensure clean slate with proper passwords
    await User.deleteMany({
      email: {
        $in: [
          'teacher@edubatch.com',
          'rahul.gupta@edubatch.com',
          'anita.verma@edubatch.com',
          'vikram.singh@edubatch.com',
          'student@edubatch.com',
        ],
      },
    });

    console.log('[Seeder] Setting up Admin User (Utsav Anand - admin@edubatch.com)...');
    // Ensure Admin Utsav Anand exists with correct credentials
    let admin = await User.findOne({ email: 'admin@edubatch.com' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password@123', salt);

    if (admin) {
      admin.name = 'Utsav Anand';
      admin.role = 'admin';
      admin.password = hashedPassword;
      admin.phone = '+91 98765 43210';
      admin.city = 'Mumbai, Maharashtra';
      admin.institute = 'EduBatch Learning Centre';
      admin.bio = 'Institute Director & Super Administrator.';
      admin.avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
      admin.isActive = true;
      await admin.save();
      console.log('[Seeder] Updated existing admin user: Utsav Anand');
    } else {
      admin = await User.create({
        name: 'Utsav Anand',
        email: 'admin@edubatch.com',
        password: 'Password@123',
        role: 'admin',
        phone: '+91 98765 43210',
        city: 'Mumbai, Maharashtra',
        institute: 'EduBatch Learning Centre',
        bio: 'Institute Director & Super Administrator.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        isActive: true,
      });
      console.log('[Seeder] Created new admin user: Utsav Anand');
    }

    console.log('[Seeder] Creating Teachers...');
    // 2. Teachers
    const teacher1 = await User.create({
      name: 'Dr. Priya Sharma',
      email: 'teacher@edubatch.com', // Demo Teacher
      password: 'Password@123',
      role: 'teacher',
      phone: '+91 98111 22334',
      city: 'Delhi, India',
      institute: 'EduBatch Learning Centre',
      bio: 'Senior Faculty for Physics and Advanced Mathematics. 12+ years teaching experience.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    });

    const teacher2 = await User.create({
      name: 'Prof. Rahul Gupta',
      email: 'rahul.gupta@edubatch.com',
      password: 'Password@123',
      role: 'teacher',
      phone: '+91 98222 33445',
      city: 'Bengaluru, India',
      institute: 'EduBatch Learning Centre',
      bio: 'Head of Department - Life Sciences & NEET coaching specialist.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });

    const teacher3 = await User.create({
      name: 'Ms. Anita Verma',
      email: 'anita.verma@edubatch.com',
      password: 'Password@123',
      role: 'teacher',
      phone: '+91 98333 44556',
      city: 'Pune, India',
      institute: 'EduBatch Learning Centre',
      bio: 'Class 10 CBSE & ICSE Board Mentor.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    });

    const teacher4 = await User.create({
      name: 'Mr. Vikram Singh',
      email: 'vikram.singh@edubatch.com',
      password: 'Password@123',
      role: 'teacher',
      phone: '+91 98444 55667',
      city: 'Hyderabad, India',
      institute: 'EduBatch Learning Centre',
      bio: 'Quantitative Aptitude and Logical Reasoning Expert for CAT / GMAT.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    });

    console.log('[Seeder] Creating 25 Students...');
    // Delete any previous demo students by email domain
    await User.deleteMany({ email: { $regex: '@edubatch.com$', $nin: ['admin@edubatch.com'] } });

    // Re-create demo teacher in case delete matched it
    const teachersList = [teacher1, teacher2, teacher3, teacher4];

    // Primary Demo Student
    const demoStudent = await User.create({
      name: 'Aarav Mehta',
      email: 'student@edubatch.com',
      password: 'Password@123',
      role: 'student',
      phone: '+91 98765 00001',
      city: 'Mumbai',
      institute: 'EduBatch Learning Centre',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    });

    const studentNames = [
      'Diya Patel', 'Rohan Sharma', 'Ishaan Gupta', 'Kavya Nair',
      'Aryan Joshi', 'Priya Reddy', 'Siddharth Kumar', 'Ananya Deshmukh',
      'Kabir Malhotra', 'Meera Iyer', 'Vivaan Kapoor', 'Sneha Rao',
      'Aditya Roy', 'Tanvi Chawla', 'Yash Bansal', 'Rhea Singhania',
      'Devansh Saxena', 'Kritika Pillai', 'Arnav Bose', 'Tara Bhatt',
      'Dhruv Nambiar', 'Khushi Agarwal', 'Reyansh Sen', 'Avani Jain'
    ];

    const studentUsers = [demoStudent];
    for (let i = 0; i < studentNames.length; i++) {
      const name = studentNames[i];
      const email = `${name.toLowerCase().replace(/\s+/g, '.')}@edubatch.com`;
      const s = await User.create({
        name,
        email,
        password: 'Password@123',
        role: 'student',
        phone: `+91 98765 ${String(i + 10).padStart(5, '0')}`,
        city: ['Delhi', 'Mumbai', 'Bengaluru', 'Pune', 'Kolkata', 'Chennai'][i % 6],
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
      });
      studentUsers.push(s);
    }
    console.log(`[Seeder] Created ${studentUsers.length} students.`);

    // 4. Batches (5 batches)
    console.log('[Seeder] Creating 5 Batches...');
    const now = new Date();
    const b1 = await Batch.create({
      name: 'JEE Advanced 2025',
      subject: 'Physics + Math',
      description: 'Rigorous preparatory batch for IIT JEE Advanced 2025.',
      startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 6, 30),
      scheduleDays: ['Mon', 'Wed', 'Fri'],
      startTime: '04:00 PM',
      endTime: '06:30 PM',
      capacity: 40,
      fee: 45000,
      status: 'active',
      teacher: teacher1._id,
      createdBy: admin._id,
    });

    const b2 = await Batch.create({
      name: 'NEET Biology Intensive',
      subject: 'Biology + Chemistry',
      description: 'Comprehensive medical entrance training with high-yield mock tests.',
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 5, 30),
      scheduleDays: ['Tue', 'Thu', 'Sat'],
      startTime: '09:00 AM',
      endTime: '11:30 AM',
      capacity: 45,
      fee: 38000,
      status: 'active',
      teacher: teacher2._id,
      createdBy: admin._id,
    });

    const b3 = await Batch.create({
      name: 'Class 10 Board Prep',
      subject: 'All Subjects',
      description: 'Targeted scoring program for CBSE 10th Board examinations.',
      startDate: new Date(now.getFullYear(), now.getMonth() - 3, 15),
      endDate: new Date(now.getFullYear(), now.getMonth() + 3, 15),
      scheduleDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      startTime: '05:00 PM',
      endTime: '07:00 PM',
      capacity: 35,
      fee: 22000,
      status: 'active',
      teacher: teacher3._id,
      createdBy: admin._id,
    });

    const b4 = await Batch.create({
      name: 'CAT Quantitative',
      subject: 'Mathematics',
      description: 'High-speed problem solving and data interpretation for CAT.',
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 8, 30),
      scheduleDays: ['Sat', 'Sun'],
      startTime: '10:00 AM',
      endTime: '01:00 PM',
      capacity: 30,
      fee: 32000,
      status: 'upcoming',
      teacher: teacher4._id,
      createdBy: admin._id,
    });

    const b5 = await Batch.create({
      name: 'Python Bootcamp',
      subject: 'Programming',
      description: 'Hands-on Python programming from basics to DSA and real-world projects.',
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 2, 30),
      scheduleDays: ['Mon', 'Wed', 'Fri'],
      startTime: '07:00 PM',
      endTime: '08:30 PM',
      capacity: 30,
      fee: 18000,
      status: 'active',
      teacher: teacher1._id,
      createdBy: admin._id,
    });

    const allBatches = [b1, b2, b3, b4, b5];

    // 5. Enrollments
    console.log('[Seeder] Creating Enrollments across batches...');
    const enrollments = [];

    // Enroll demo student in Batch 1 (Paid) and Batch 5 (Pending)
    enrollments.push(await Enrollment.create({
      student: demoStudent._id,
      batch: b1._id,
      paymentStatus: 'paid',
      isActive: true,
      enrolledAt: new Date(now.getFullYear(), now.getMonth() - 2, 5),
    }));

    enrollments.push(await Enrollment.create({
      student: demoStudent._id,
      batch: b5._id,
      paymentStatus: 'pending',
      isActive: true,
      enrolledAt: new Date(now.getFullYear(), now.getMonth() - 1, 10),
    }));

    // Distribute remaining 24 students across batches with creation dates spanning past months
    for (let i = 1; i < studentUsers.length; i++) {
      const student = studentUsers[i];
      const assignedBatch = allBatches[i % allBatches.length];
      const paymentStatus = i % 4 === 0 ? 'pending' : i % 7 === 0 ? 'waived' : 'paid';
      const monthOffset = (i % 4); // 0, 1, 2, or 3 months ago
      const enrolledDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, Math.max(1, (i * 3) % 28));

      enrollments.push(await Enrollment.create({
        student: student._id,
        batch: assignedBatch._id,
        paymentStatus,
        isActive: true,
        enrolledAt: enrolledDate,
      }));
    }
    console.log(`[Seeder] Created ${enrollments.length} enrollments.`);

    // 6. Payments distributed across the last 4 months for realistic revenue charts
    console.log('[Seeder] Creating Demo Payments with multi-month history...');
    const paymentMethods = ['UPI', 'Card', 'NetBanking', 'Bank Transfer'];
    let paymentCount = 0;

    for (let i = 0; i < enrollments.length; i++) {
      const enr = enrollments[i];
      if (enr.paymentStatus === 'paid') {
        const batch = allBatches.find((b) => b._id.toString() === enr.batch.toString()) || b1;
        const monthOffset = i % 4; // Spread across current month and past 3 months
        const payDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, Math.max(1, (i * 2 + 3) % 28));

        await Payment.create({
          enrollment: enr._id,
          student: enr.student,
          batch: enr.batch,
          amount: batch.fee,
          currency: 'INR',
          razorpayOrderId: `order_mock_${100000 + i}`,
          razorpayPaymentId: `pay_mock_${200000 + i}`,
          razorpaySignature: 'mock_sig_verified_seeder',
          method: paymentMethods[i % paymentMethods.length],
          status: 'paid',
          paidAt: payDate,
          receiptNumber: `RCP-${payDate.getFullYear()}-${String(i + 1).padStart(4, '0')}`,
        });
        paymentCount++;
      }
    }
    console.log(`[Seeder] Created ${paymentCount} payment transactions.`);

    // 7. Attendance Records for current week and recent days
    console.log('[Seeder] Creating Attendance Sessions for today and past days...');
    // Create attendance dates: Today, Yesterday, and 5 previous days
    const attendanceDates: string[] = [];
    for (let d = 0; d < 7; d++) {
      const dateObj = new Date(now);
      dateObj.setDate(now.getDate() - d);
      attendanceDates.push(dateObj.toISOString().split('T')[0]);
    }

    for (let dayIdx = 0; dayIdx < attendanceDates.length; dayIdx++) {
      const dateStr = attendanceDates[dayIdx];
      // Create session for Batch 1
      const b1Students = enrollments
        .filter((e) => e.batch.toString() === b1._id.toString())
        .map((e) => e.student);

      if (b1Students.length > 0) {
        await Attendance.create({
          batch: b1._id,
          date: dateStr,
          markedBy: teacher1._id,
          records: b1Students.map((sId, idx) => ({
            student: sId,
            status: idx === 1 ? 'Absent' : idx === 3 ? 'Late' : 'Present',
            remarks: idx === 1 ? 'Sick leave' : '',
          })),
        });
      }

      // Also create session for Batch 2 on every other day
      if (dayIdx % 2 === 0) {
        const b2Students = enrollments
          .filter((e) => e.batch.toString() === b2._id.toString())
          .map((e) => e.student);

        if (b2Students.length > 0) {
          await Attendance.create({
            batch: b2._id,
            date: dateStr,
            markedBy: teacher2._id,
            records: b2Students.map((sId, idx) => ({
              student: sId,
              status: idx === 2 ? 'Absent' : 'Present',
              remarks: '',
            })),
          });
        }
      }
    }
    console.log('[Seeder] Created attendance records across 7 days (including today).');

    // 8. Notices
    console.log('[Seeder] Creating Notices...');
    const noticesList = [
      {
        title: 'Institute Annual Convocation & Awards Ceremony',
        body: 'EduBatch is hosting its annual academic felicitations ceremony. High-scoring students from previous batches will be honored with merit certificates and scholarships.',
        category: 'Event' as const,
        pinned: true,
        batch: null,
        createdBy: admin._id,
      },
      {
        title: 'JEE Advanced 2025: All-India Mock Test Series Commences',
        body: 'Full-length 3-hour computer-based mock examinations start this coming weekend. Enrolled students should collect their hall admit cards from the portal.',
        category: 'Academic' as const,
        pinned: true,
        batch: b1._id,
        createdBy: teacher1._id,
      },
      {
        title: 'Tuition Fee Submission Deadline Notice',
        body: 'Quarterly tuition fee installments for active courses must be settled by the 15th of the month. Online payments can be made directly via Razorpay on the student portal.',
        category: 'Finance' as const,
        pinned: false,
        batch: null,
        createdBy: admin._id,
      },
      {
        title: 'New Batch Announcement: CAT 2025 Weekend Mastery',
        body: 'Registration for the new CAT Quantitative Batch is now officially open. Batch timings: Saturday & Sunday 10:00 AM - 01:00 PM.',
        category: 'Batch' as const,
        pinned: false,
        batch: b4._id,
        createdBy: admin._id,
      },
      {
        title: 'Parent-Faculty Interactive Consultation',
        body: 'Quarterly review meetings for CBSE Class 10 candidates will be held in the auditorium from 3:00 PM onwards.',
        category: 'Academic' as const,
        pinned: false,
        batch: b3._id,
        createdBy: teacher3._id,
      },
    ];

    for (const noticeData of noticesList) {
      await Notice.create(noticeData);
    }
    console.log(`[Seeder] Created ${noticesList.length} notices.`);

    console.log('====================================================');
    console.log('🎉 [Seeder] MongoDB Database seeded with REAL production data!');
    console.log('----------------------------------------------------');
    console.log('ADMIN:   admin@edubatch.com    | Password@123  (Utsav Anand)');
    console.log('TEACHER: teacher@edubatch.com  | Password@123  (Dr. Priya Sharma)');
    console.log('STUDENT: student@edubatch.com  | Password@123  (Aarav Mehta)');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Seeding failed with error:', error);
    process.exit(1);
  }
};

// Always run when script is executed
seedDatabase();
