import React from 'react';
import { IconTarget } from '@tabler/icons-react';
import logoImg from '../assets/logo.png';
import memberFarhat from '../assets/member_farhat.png';
import memberRohit from '../assets/member_rohit.jpeg';
import memberSandip from '../assets/member_sandip.jpeg';
import memberSakina from '../assets/member_sakina.jpeg';

export default function AboutUs() {
  const ownerImage = "https://neetband.com/wp-content/uploads/2021/02/Dr-Aarofil-Shaikh-682x1024.jpg";

  const teamMembers = [
    {
      name: "Dr Aarofil Shaikh",
      role: "Founder & CEO",
      degree: "MS DNB (Ophthal)",
      email: null,
      image: ownerImage,
      imageClass: "object-top scale-100"
    },
    {
      name: "Farhat Rahaman",
      role: "Technical Lead",
      degree: "BTech - Computer Science",
      email: null,
      image: memberFarhat,
      imageClass: "object-top scale-[1.15] translate-y-2"
    },
    {
      name: "Dr Rohit Kale",
      role: "Academic Advisor",
      degree: "MS (Ortho)",
      email: null,
      image: memberRohit,
      imageClass: "object-top scale-[1.15] translate-y-3"
    },
    {
      name: "Dr Sandip Patil",
      role: "Clinical Advisor – Child Health and Development",
      degree: "MD Paediatrics",
      email: null,
      image: memberSandip,
      imageClass: "object-[center_10%] scale-[1.25] translate-y-4"
    },
    {
      name: "Sakina Afroz",
      role: "Operations Coordinator",
      degree: "Bachelor of Business Administration",
      email: null,
      image: memberSakina,
      imageClass: "object-top scale-[1.2] translate-y-3"
    }
  ];

  return (
    <section className="py-32 px-gutter bg-transparent relative min-h-screen transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-outline),0.1)] to-transparent"></div>
      
      <div className="max-w-4xl mx-auto">
        {/* Simple Paragraphs Section */}
        <div className="mb-20 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-sm bg-primary/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-sm"></div>
              </div>
              <h3 className="font-bold text-xs tracking-[0.2em] uppercase text-on-surface-variant font-mono">
                About Us
              </h3>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-6 leading-tight">
              WisdomArrow Ventures & <span className="text-primary">NEET BAND</span>
            </h2>
            <div className="font-body-md text-base md:text-lg text-on-surface-variant/90 leading-relaxed space-y-4 max-w-3xl">
              <p>
                WisdomArrow Ventures develops screen-light educational solutions that support healthy vision, improve learning engagement, and strengthen memory and recall among school-going children.
              </p>
              <p>
                NEET BAND is a brand, product, and educational platform operated by the company. Three main priorities of our Company:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Reducing unnecessary screen exposure and supporting the prevention of digital eye strain among school-going children.</li>
                <li>Educating students, parents, and teachers about healthy eye-care, screen-use, and study practices.</li>
                <li>Improving learning engagement and retention through curriculum-aligned audio learning and educational study songs.</li>
              </ul>
              <p>
                NEET BAND is an innovative EdTech platform with preventive eye-health and social-impact benefits. It converts curriculum-based study material into structured educational audio and study songs. It is designed to reduce unnecessary screen dependence during revision, improve student engagement and recall, and promote healthy digital-study practices among students, parents and teachers.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-outline/10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-sm bg-primary/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-sm"></div>
              </div>
              <h3 className="font-bold text-xs tracking-[0.2em] uppercase text-on-surface-variant font-mono">
                Problem Statement
              </h3>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-6 leading-tight">
              The <span className="text-primary">Rising Burden</span> of Childhood Myopia.
            </h2>
            <div className="font-body-md text-base md:text-lg text-on-surface-variant/90 leading-relaxed space-y-4 max-w-3xl">
              <p>
                As a practising ophthalmologist, I am observing a concerning rise in the number of children developing refractive errors, particularly myopia, at an increasingly young age. Many children are presenting not only with the need for spectacles but also with higher refractive powers and progressive increases in spectacle power year after year.
              </p>
              <p>
                Modern children spend prolonged hours engaged in near-work activities, including reading, homework, online classes, smartphones, tablets and other digital screens. Academic demands make such activities difficult to avoid, leaving parents feeling helpless about how to balance their child’s education with the need to protect their vision.
              </p>
              <p>
                At the same time, awareness among parents, teachers and students regarding healthy eye practices remains limited. Many families are unaware of how prolonged near work, excessive screen exposure, inadequate viewing distance, poor lighting, lack of regular breaks and insufficient outdoor daylight exposure may affect a child’s visual comfort and increase the risk of myopia progression.
              </p>
              <p>
                Without timely awareness, regular eye examinations and healthier study practices, India may face a growing burden of childhood myopia and other vision-related problems. High and progressive myopia can increase the lifetime risk of serious eye complications, some of which may cause irreversible visual impairment.
              </p>
              <p>
                There is therefore an urgent need for a practical, scalable and child-friendly solution that supports academic learning while reducing unnecessary visual strain and educating families about preventive eye-care practices.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-outline/10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-sm bg-primary/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-sm"></div>
              </div>
              <h3 className="font-bold text-xs tracking-[0.2em] uppercase text-on-surface-variant font-mono">
                NEET BAND Solution
              </h3>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-6 leading-tight">
              Making Learning <span className="text-primary">Engaging</span> and Eyes-Rested.
            </h2>
            <div className="font-body-md text-base md:text-lg text-on-surface-variant/90 leading-relaxed space-y-4 max-w-3xl">
              <p>
                NEET BAND is an educational technology platform designed to make school and competitive-examination learning more engaging, memorable and supportive of healthier study habits.
              </p>
              <p>
                The platform converts curriculum-based educational content into study songs and audio lessons, allowing students to revise important concepts without continuously reading from books or digital screens. By providing audio-supported learning, NEET BAND offers students periodic opportunities for screen-free and eyes-rested revision while continuing their academic preparation.
              </p>
              <p>
                NEET BAND also includes a structured learning system containing chapter-wise quick notes, questions and answers, and quizzes. This combination of audio learning and conventional study resources enables students to choose suitable learning formats according to their needs.
              </p>
              <p>
                In addition, the platform will provide simple and medically reliable eye-health education for students, parents and teachers. This will include guidance on appropriate screen use, reading distance, lighting, regular visual breaks, outdoor daylight exposure and the importance of timely eye examinations.
              </p>
              <p>
                NEET BAND does not aim to replace textbooks, teachers or medical care. Instead, it acts as a complementary learning solution that reduces unnecessary dependence on continuous screen-based and near-work revision.
              </p>
              <p>
                By integrating education, audio learning and preventive eye-health awareness, NEET BAND aims to create a scalable learning ecosystem that supports academic performance while encouraging healthier and more sustainable study practices among children.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-outline/10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-sm bg-primary/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-sm"></div>
              </div>
              <h3 className="font-bold text-xs tracking-[0.2em] uppercase text-on-surface-variant font-mono">
                Student and Parent Benefits
              </h3>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-6 leading-tight">
              A Healthier <span className="text-primary">Study Routine</span>.
            </h2>
            <div className="font-body-md text-base md:text-lg text-on-surface-variant/90 leading-relaxed space-y-4 max-w-3xl">
              <p>
                NEET BAND is designed to benefit both students and parents by making learning more engaging, flexible and supportive of healthier study habits.
              </p>
              <p>
                For students, curriculum-based study songs and audio lessons provide an additional method of revising important concepts. Rhythmic and repeated presentation can make facts, definitions, sequences and key points easier to remember. Students can listen during travel, breaks or routine activities, creating more opportunities for revision without requiring continuous reading or screen use.
              </p>
              <p>
                The platform also offers chapter-wise quick notes, questions and answers, and quizzes, allowing students to combine audio learning with structured academic practice. This multimodal approach can support different learning preferences and help reduce monotony, distraction and study fatigue.
              </p>
              <p>
                For parents, NEET BAND provides a practical way to support their child’s education without encouraging unnecessary screen exposure. Parents can use the platform to understand what their child is studying, monitor learning progress and encourage a more balanced study routine.
              </p>
              <p>
                The platform will also provide medically guided information on healthy screen habits, proper reading distance, adequate lighting, regular visual breaks, outdoor activity and timely eye examinations. This can help parents identify unhealthy study practices and make better-informed decisions regarding their child’s eye health.
              </p>
              <p>
                Overall, NEET BAND aims to improve student engagement and revision consistency while giving parents greater awareness, reassurance and practical tools to support both learning and healthy study behaviour.
              </p>
            </div>
          </div>

        </div>

        {/* Team Section */}
        <div className="text-center pt-8 border-t border-outline/10">
          <h2 className="font-headline-lg text-3xl md:text-4xl font-bold text-on-surface mb-12">Team & Administration</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex flex-col items-center group">
                <div className="w-full aspect-[4/5] rounded-3xl bg-surface-container-low border border-[var(--border-floating-card)] mb-5 overflow-hidden relative shadow-sm">
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className={`w-full h-full object-cover ${member.imageClass || 'object-top scale-100'}`}
                      loading="lazy" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-container/50">
                      <span className="text-4xl font-bold text-primary/40 font-headline-md">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                
                <h4 className="font-extrabold text-on-surface text-xl mb-1">{member.name}</h4>
                <p className="text-primary font-bold text-sm mb-1.5 leading-snug">{member.role}</p>
                <p className="text-sm text-on-surface-variant/80 font-medium text-center">{member.degree}</p>
                
                {member.email && (
                  <a href={`mailto:${member.email}`} className="text-xs text-on-surface-variant/50 hover:text-blue-500 mt-2 transition-colors">
                    {member.email}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
