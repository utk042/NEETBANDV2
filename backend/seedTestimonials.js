import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Testimonial from './src/models/Testimonial.js';

dotenv.config();

const TEXT_TESTIMONIALS = [
  {
    type: 'text',
    name: 'Dr. Neha Sharma',
    role: 'Biology Faculty',
    location: 'Delhi',
    quote: 'The way NEET BAND simplifies complex biological processes into catchy tunes is brilliant. My students retain 10x more information.',
    rating: 5,
    avatar: '/uploads/others/member_sarah.png', // I'll use placeholders for now, the frontend uses local imports which will break if stored in db directly unless it's a URL. We will let the frontend handle fallback or replace it.
    category: 'teacher',
  },
  {
    type: 'text',
    name: 'Rahul Gupta',
    role: 'NEET 2024 Aspirant',
    location: 'Mumbai',
    quote: 'I used to struggle with Physics formulas. Listening to them on repeat while traveling helped me score 170+ in Physics alone!',
    rating: 5,
    avatar: '/uploads/others/member_aarofil.png',
    category: 'student',
  },
  {
    type: 'text',
    name: 'Prof. Ramesh Iyer',
    role: 'Chemistry HOD',
    location: 'Kota',
    quote: 'Organic chemistry reactions memorized through music! I highly recommend NEET BAND to every medical aspirant out there.',
    rating: 5,
    avatar: '/uploads/others/member_vikram.png',
    category: 'teacher',
  },
  {
    type: 'text',
    name: 'Simran Kaur',
    role: 'Medical Student',
    location: 'Chandigarh',
    quote: 'These audio tracks were my constant companion during the last month of revision. It’s a completely stress-free way to revise.',
    rating: 5,
    avatar: '/uploads/others/member_sarah.png',
    category: 'student',
  },
  {
    type: 'text',
    name: 'Aakash Desai',
    role: 'NEET AIR 89',
    location: 'Ahmedabad',
    quote: 'Active recall becomes so easy when it is paired with rhythm and beats. NEET BAND is a revolutionary tool for revision.',
    rating: 5,
    avatar: '/uploads/others/member_aarofil.png',
    category: 'student',
  },
  {
    type: 'text',
    name: 'Dr. Vivek Singh',
    role: 'Physics Educator',
    location: 'Lucknow',
    quote: 'I recommend NEET BAND to all my batches. The auditory memory hooks they create are simply unparalleled for competitive exams.',
    rating: 5,
    avatar: '/uploads/others/member_vikram.png',
    category: 'teacher',
  }
];

const VIDEO_REVIEWS = [
  {
    type: 'video',
    name: 'Dr. Rajeshwari Verma',
    role: 'Senior Biology Faculty & HOD',
    category: 'teachers',
    location: 'Kota, Rajasthan',
    rating: 5,
    quote: 'NEET BAND transformed my classroom experience! Students remember complex metabolic pathways and NCERT terminology effortlessly in minutes through these mnemonic songs.',
    badge: 'Senior Faculty',
    avatar: '/uploads/others/member_aarofil.png',
    videoUrl: '/uploads/others/vid1.mp4', 
    posterUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    tags: ['Genetics', 'Plant Physiology', 'Classroom Retain']
  },
  {
    type: 'video',
    name: 'Ananya Sharma',
    role: 'NEET 2025 Aspirant',
    category: 'students',
    location: 'Jaipur, Rajasthan',
    rating: 5,
    quote: 'I listened to the Genetics chapter songs daily during my commute and walks. It felt like magic because I could recall every single line of NCERT instantly during the exam!',
    badge: 'NEET AIR 42',
    avatar: '/uploads/others/member_sarah.png',
    videoUrl: '/uploads/others/vid1.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    tags: ['NEET 2025', 'Active Recall', 'Top Ranker']
  },
  {
    type: 'video',
    name: 'Prof. K. P. Singh',
    role: 'Inorganic Chemistry HOD',
    category: 'teachers',
    location: 'Delhi NCR',
    rating: 5,
    quote: 'Inorganic reactions used to be a major struggle point. The Periodic Anthem songs reduced exception error rates by over 60% in our weekly mock test series.',
    badge: 'Chemistry Expert',
    avatar: '/uploads/others/member_vikram.png',
    videoUrl: '/uploads/others/vid1.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    tags: ['Inorganic Chem', 'Mock Test Booster']
  },
  {
    type: 'video',
    name: 'Rahul Deshmukh',
    role: 'Medical Student & Top Ranker',
    category: 'students',
    location: 'Pune, Maharashtra',
    rating: 5,
    quote: 'When you get exhausted reading thick textbooks, these audio songs keep your prep active without any screen fatigue. Game changer for last month revisions!',
    badge: 'AIR 118',
    avatar: '/uploads/others/member_aarofil.png',
    videoUrl: '/uploads/others/vid1.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    tags: ['Zero Eye Strain', 'Revision Booster']
  },
  {
    type: 'video',
    name: 'Dr. Sunita Kulkarni',
    role: 'Physics Educator & Author',
    category: 'teachers',
    location: 'Bengaluru, Karnataka',
    rating: 5,
    quote: 'Auditory memory leverages the brain’s natural rhythm centers. My students listen to NEET BAND formulas between self-study sessions and score far higher.',
    badge: 'Physics Mentor',
    avatar: '/uploads/others/member_sarah.png',
    videoUrl: '/uploads/others/vid1.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=600&q=80',
    tags: ['Formula Memory', 'Auditory Learning']
  },
  {
    type: 'video',
    name: 'Priya Nair',
    role: 'Class 12 Board Topper & NEET Aspirant',
    category: 'students',
    location: 'Kochi, Kerala',
    rating: 5,
    quote: 'Organic reaction mechanisms used to mix up in my mind. The lyric sync player coupled with musical rhythms made organic chemistry stick forever!',
    badge: '98.6% Topper',
    avatar: '/uploads/others/member_sarah.png',
    videoUrl: '/uploads/others/vid1.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    tags: ['Organic Chem', 'Lyric Sync']
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    await Testimonial.deleteMany();
    console.log('Existing Testimonials removed');

    const createdText = await Testimonial.insertMany(TEXT_TESTIMONIALS);
    const createdVideo = await Testimonial.insertMany(VIDEO_REVIEWS);

    console.log(`Seeded ${createdText.length} text testimonials and ${createdVideo.length} video testimonials`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
